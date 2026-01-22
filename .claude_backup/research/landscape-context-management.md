# Claude Code Context Management and Token Optimization Research

## Overview

This document compiles research findings on context management strategies, token optimization techniques, and memory management patterns for Claude Code and Claude agents. The information was gathered from official Anthropic documentation, community best practices, and developer experiences.

---

## Table of Contents

1. [Context Engineering Fundamentals](#context-engineering-fundamentals)
2. [Memory Architecture](#memory-architecture)
3. [Compaction Strategies](#compaction-strategies)
4. [Subagent Context Isolation](#subagent-context-isolation)
5. [Token Optimization Techniques](#token-optimization-techniques)
6. [Memory Tool (API-Level)](#memory-tool-api-level)
7. [Multi-Agent Context Management](#multi-agent-context-management)
8. [Best Practices Summary](#best-practices-summary)

---

## Context Engineering Fundamentals

### Definition

Context engineering is "the practice of curating the smallest high-signal set of tokens the model sees at each step." Unlike prompt engineering which focuses on instruction quality, context engineering addresses what information enters the model's window at each turn.

### Core Principles

**Finite Attention Budget**
- LLMs have limited capacity similar to human working memory
- Transformer architecture creates n^2 pairwise relationships for n tokens
- Attention becomes stretched thin as context grows
- Models show "reduced precision for information retrieval and long-range reasoning" at longer contexts

**Minimal High-Signal Approach**
- Find "the smallest set of high-signal tokens that maximize the likelihood of some desired outcome"
- More tokens do not guarantee better results
- Context rot occurs when important details get buried as inputs grow

### Just-in-Time Data Loading

Rather than pre-loading all data, maintain lightweight identifiers and load dynamically:
- File paths
- Stored queries
- Web links

This mirrors human cognition and external indexing systems. Claude Code uses this hybrid model:
- CLAUDE.md files loaded upfront
- Grep and glob for runtime exploration

**Sources:**
- [Anthropic - Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

---

## Memory Architecture

### CLAUDE.md Hierarchy

Claude Code uses a 4-level hierarchical memory system:

| Level | Location | Scope | Precedence |
|-------|----------|-------|------------|
| Enterprise Policy | System-wide paths | All organization users | Loaded first (highest) |
| Project Memory | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team via source control | Loaded second |
| Project Rules | `./.claude/rules/*.md` | Team via source control | With project memory |
| User Memory | `~/.claude/CLAUDE.md` | Individual user (all projects) | Loaded third |
| Project Local | `./CLAUDE.local.md` | Individual (current project) | Loaded last (lowest) |

### File Import Syntax

```markdown
See @README for project overview and @package.json for available npm commands.

# Additional Instructions
- git workflow @docs/git-instructions.md
- Individual preferences @~/.claude/my-project-instructions.md
```

**Rules:**
- Supports relative and absolute paths
- Maximum recursion depth: 5 hops
- Not evaluated inside code spans/blocks

### Modular Rules with `.claude/rules/`

Organize instructions into topic-specific files:

```
your-project/
  .claude/
    CLAUDE.md
    rules/
      code-style.md
      testing.md
      security.md
      frontend/
        react.md
        styles.md
```

### Path-Specific Rules

Use YAML frontmatter for conditional rules:

```markdown
---
paths: src/api/**/*.ts
---

# API Development Rules
- All API endpoints must include input validation
- Use the standard error response format
```

### Memory Lookup Process

1. Starts in current working directory
2. Recurses upward to (but not including) root `/`
3. Reads any `CLAUDE.md` files found
4. Discovers `CLAUDE.md` in subtrees when those directories are read

**Sources:**
- [Claude Code Docs - Memory](https://code.claude.com/docs/en/memory)
- [HumanLayer - Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)

---

## Compaction Strategies

### What Is Compaction?

Compaction summarizes conversation history and starts a new session with the summary preloaded. It preserves essential information while reducing accumulated data.

### Auto-Compact Behavior

- Triggers at approximately 95% context capacity (25% remaining)
- As of v2.0.64, auto-compacting is instant
- Preserves: architectural decisions, unresolved bugs, implementation details
- Discards: redundant tool outputs or messages
- Continues with compressed context plus five most recently accessed files

### Manual Compaction Best Practices

**When to Compact:**
- At natural breakpoints (feature completion, bug fixes, deployment points)
- When you control what gets preserved
- Before starting unrelated work

**Commands:**
- `/compact` - Summarize and compress
- `/compact preserve the coding patterns we established` - Custom preservation instructions
- `/clear` - Complete fresh start (no preservation)

### Strategic Recommendations

1. **Don't rely solely on auto-compact** - May cause loss of critical context
2. **Monitor token percentage** - Exit at 80% for complex multi-file work
3. **Check MCP servers first** - Use `/context` to identify servers consuming space
4. **Fresh session strategy** - `/quit` then `claude` for clean start with right context

**Sources:**
- [Steve Kinney - Claude Code Compaction](https://stevekinney.com/courses/ai-development/claude-code-compaction)
- [ClaudeLog - What Is Auto-Compact](https://claudelog.com/faqs/what-is-claude-code-auto-compact/)
- [Du'An Lightfoot - When Claude Code Starts Compacting](https://www.duanlightfoot.com/posts/what-to-do-when-claude-code-starts-compacting/)

---

## Subagent Context Isolation

### Core Benefits

Each subagent operates in its own isolated context, providing:
- **Longer sessions** - Main context is preserved
- **Better focus** - Tasks don't pollute main conversation
- **Independent execution** - Without affecting main conversation

### How Isolation Works

- Subagents have their own 200k token context window
- They can explore extensively (tens of thousands of tokens)
- Return only condensed summaries (1,000-2,000 tokens) to main agent
- Content explored doesn't bloat main context

### Subagent Configuration

```yaml
---
name: your-sub-agent-name
description: Description of when this subagent should be invoked
tools: tool1, tool2, tool3  # Optional - inherits all if omitted
model: sonnet  # Optional
permissionMode: default  # Optional
skills: skill1, skill2  # Optional
---

Your subagent's system prompt goes here.
```

### Tool Restrictions for Isolation

- **Omit `tools` field** - Inherits ALL tools from main thread
- **Specify tools** - Comma-separated list for granular control

Example read-only agent:
```yaml
tools: Read, Grep, Glob
```

### Known Limitation: Context Isolation Problem

**The Problem:**
When a subagent creates new information (e.g., writes a file), the parent agent remains unaware of the content. This breaks workflows where the parent needs to use that information.

**Current Workarounds:**

1. **SubagentStop Hook with Feedback**
   - Hook parses subagent transcript, generates summary
   - Uses `{"decision": "block", "reason": "..."}` pattern
   - Reason string fed directly to parent as context

2. **State File Decoupling**
   - `SubagentStop` saves to `~/.claude/shared_context.txt`
   - `UserPromptSubmit` reads and injects before next prompt

3. **Git Side-Effects**
   - `PostToolUse` commits changes to Git
   - Parent runs `git status` to discover changes

**Proposed Solution:**
`SubagentStop` hook with `additionalParentContext` field that injects directly into parent's context.

**Sources:**
- [Claude Code Docs - Subagents](https://code.claude.com/docs/en/sub-agents)
- [GitHub Issue #5812 - Context Between Sub-Agents and Parent Agents](https://github.com/anthropics/claude-code/issues/5812)

---

## Token Optimization Techniques

### Model Selection

| Model | Token Efficiency | Best Use Case |
|-------|------------------|---------------|
| Opus 4.5 | 76% fewer tokens at medium effort | Complex refactoring, migration |
| Sonnet 4.5 | Balanced | General development |
| Haiku | Fastest, minimal tokens | Quick searches, exploration |

### Immediate Token Reduction Strategies

1. **Start fresh sessions for separate tasks** - Avoid accumulating irrelevant context
2. **Use `/clear` liberally** - Reset between unrelated tasks
3. **Compact at 50% capacity** - Don't wait for auto-compact
4. **Disable unused MCP servers** - Each adds tool definitions to system prompt

### Structural Optimizations

**CLAUDE.md Optimization:**
- Keep minimal - Only what's needed in EVERY session
- Use progressive disclosure - Tell Claude how to find information, not everything it could know
- Put detailed context in `docs/` and reference via `@docs/filename.md`

**Tiered Documentation Approach:**
- Can achieve 62% token reduction (1,300 tokens per session)
- ~85% relevant context per session

### Advanced Techniques

**MCP Response Optimization:**
- Offload tool executions from LLM context to lightweight scripts
- Use MCP Response Analyzer Skill for 95%+ reduction via intelligent filtering
- Store large MCP responses in files, analyze separately

**Multi-Agent Efficiency:**
- Use Git worktrees for parallel agent isolation
- Prevents rework from merge conflicts
- Each agent operates in isolated branch

### Subscription vs. API

For heavy users, flat-rate subscriptions (Claude Max at $100-200/month) may be more cost-effective than pay-per-token API billing.

**Sources:**
- [ClaudeLog - How to Optimize Token Usage](https://claudelog.com/faqs/how-to-optimize-claude-code-token-usage/)
- [Medium - Stop Wasting Tokens: 60% Context Optimization](https://medium.com/@jpranav97/stop-wasting-tokens-how-to-optimize-claude-code-context-by-60-bfad6fd477e5)
- [Medium - 90% Token Reduction](https://medium.com/coding-nexus/forget-toon-i-slashed-my-token-usage-by-90-in-my-claude-workflow-77b83c61c23f)

---

## Memory Tool (API-Level)

### Overview

The Memory Tool (beta) enables Claude to store and retrieve information across conversations through a file-based system. It operates client-side with developer-controlled storage.

### How It Works

1. Claude automatically checks `/memories` directory before starting tasks
2. Performs CRUD operations on memory files
3. References memories in future conversations
4. Treats memory as extension of working context

### Supported Commands

| Command | Purpose |
|---------|---------|
| `view` | Show directory contents or file contents |
| `create` | Create new file |
| `str_replace` | Replace text in file |
| `insert` | Insert text at specific line |
| `delete` | Delete file or directory |
| `rename` | Rename or move file/directory |

### Performance Improvements

Testing on agentic search tasks:
- Memory tool + context editing: **39% performance improvement**
- Context editing alone: **29% improvement**
- 100-turn web search: **84% token reduction**

### Context Editing Integration

When context grows beyond threshold:
1. Claude receives warning notification
2. Preserves important information to memory files
3. Old tool results cleared automatically
4. Claude retrieves from memory when needed

```python
context_management={
    "edits": [
        {
            "type": "clear_tool_uses_20250919",
            "trigger": {
                "type": "input_tokens",
                "value": 100000
            },
            "keep": {
                "type": "tool_uses",
                "value": 3
            }
        }
    ]
}
```

### Security Considerations

- Validate all paths to prevent directory traversal
- Implement file size limits
- Consider memory expiration policies
- Strip sensitive information

**Sources:**
- [Claude Docs - Memory Tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
- [Claude Blog - Context Management](https://claude.com/blog/context-management)

---

## Multi-Agent Context Management

### Architecture Patterns

**Sub-Agent Topology:**

| Agent Type | Role | Context Usage |
|------------|------|---------------|
| Reader | Extracts context, returns 400-word abstracts | Minimal |
| Planner | Converts goals into steps with acceptance criteria | Planning-focused |
| Builder | Writes code with self-checking tests | Full tools |
| Critic | Verifies outputs against rules | Read-only |

**Orchestrator Pattern:**
- Maintains high-level plan
- Dispatches to specialized subagents
- Merges reports into consolidated notes
- Holds global memory (task state, results, coordination metadata)

### Communication Patterns

**Clear Handoffs:**
- Use hooks to print explicit next steps
- Humans approve transitions
- Prevent autonomous chaining without oversight

**Definition of Done:**
- Each agent has completion checklist
- PM: acceptance criteria
- Architect: ADRs
- Implementer: passing tests

### Permission Hygiene

Scope tools per agent:
- **PM/Architect**: Read-heavy (Glob, Grep, Read)
- **Implementer**: Edit/Write/Bash plus UI testing
- **Reviewer**: Read, Grep, Glob, Bash (read-only)

### Parallelization Guidelines

- Run subagents only for disjoint tasks (different modules)
- Architect flags conflicts
- Hooks warn of overlapping directories
- Use Git worktrees for true isolation

### Episodic Memory System

Community solution for perfect recall across sessions:

**Components:**
1. Automatic archiving hook (saves conversations from `~/.claude/projects`)
2. SQLite vector search database (semantic retrieval)
3. Command-line tool for searching
4. MCP integration for autonomous memory access
5. Skill module for teaching when to search
6. Haiku subagent for summarizing (prevents context bloat)

**Configuration:**
```json
{
  "cleanupPeriodDays": 99999
}
```

**Sources:**
- [PubNub - Best Practices for Claude Code Subagents](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)
- [Zach Wills - Parallelizing Development with Subagents](https://zachwills.net/how-to-use-claude-code-subagents-to-parallelize-development/)
- [Blog - Episodic Memory for Claude Code](https://blog.fsck.com/2025/10/23/episodic-memory/)

---

## Best Practices Summary

### CLAUDE.md Best Practices

**Do:**
- Be specific: "Use 2-space indentation" not "Format code properly"
- Use bullet points under descriptive headings
- Include frequently used commands
- Document conventions and naming patterns
- Review and update as project evolves

**Don't:**
- Fill with generic instructions ("write clean code")
- Mix multiple topics in one file
- Store sensitive information (use `.local.md`)
- Overload with information needed only occasionally

### Context Management Checklist

- [ ] Keep CLAUDE.md minimal (essential for EVERY session)
- [ ] Use `/clear` for new tasks
- [ ] Use `/compact` with custom instructions at logical breakpoints
- [ ] Monitor token usage in status bar
- [ ] Disable unused MCP servers
- [ ] Store detailed docs separately, reference with `@`
- [ ] Use path-specific rules for large projects

### Token Optimization Checklist

- [ ] Start fresh sessions for unrelated tasks
- [ ] Compact at 50% capacity, don't wait for auto-compact
- [ ] Use appropriate model (Haiku for search, Opus for complex work)
- [ ] Offload large MCP responses to files
- [ ] Use subagents for exploration to preserve main context
- [ ] Consider flat-rate subscription for heavy usage

### Subagent Design Checklist

- [ ] Single, clear responsibility per agent
- [ ] Detailed system prompt with examples
- [ ] Appropriate tool restrictions
- [ ] Version control project subagents
- [ ] Use "PROACTIVELY" in descriptions for auto-delegation
- [ ] Plan for context isolation limitations
- [ ] Implement handoff hooks for state transfer

### Memory Folder Structure

```
project/
  memory/
    NOTES.md
    decisions/
    research/
  tasks/
  outputs/
  .claude/
    CLAUDE.md
    agents/
    rules/
```

### Operational Principles

1. **Bias toward fewer tokens** - "Does this line help the next action?"
2. **Names over narratives** - File names and timestamps beat prose
3. **One-page notes max** - Split when exceeding
4. **Plan in five steps max** - Let model refine incrementally
5. **Fail loudly** - Throw on validation failures, fix in one turn
6. **Cite everything** - Require file paths or URLs for claims

---

## Key Metrics

| Technique | Token Reduction | Source |
|-----------|-----------------|--------|
| Memory tool + context editing | 39% performance improvement | Anthropic |
| Context editing alone | 29% improvement | Anthropic |
| 100-turn with context editing | 84% token reduction | Anthropic |
| Opus 4.5 at medium effort | 76% fewer tokens | Anthropic |
| MCP Response Analyzer | 95%+ reduction | Community |
| Tiered documentation | 62% reduction | Community |

---

## References

### Official Documentation
- [Claude Code Docs - Memory](https://code.claude.com/docs/en/memory)
- [Claude Code Docs - Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Docs - Memory Tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
- [Anthropic - Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Claude Blog - Context Management](https://claude.com/blog/context-management)

### Community Resources
- [GitHub - Context Isolation Issue #5812](https://github.com/anthropics/claude-code/issues/5812)
- [Episodic Memory for Claude Code](https://blog.fsck.com/2025/10/23/episodic-memory/)
- [Steve Kinney - Claude Code Compaction](https://stevekinney.com/courses/ai-development/claude-code-compaction)
- [PubNub - Subagent Best Practices](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)
- [Zach Wills - Parallelizing Development](https://zachwills.net/how-to-use-claude-code-subagents-to-parallelize-development/)
- [BinaryVerseAI - Claude Agent SDK Context Engineering](https://binaryverseai.com/claude-agent-sdk-context-engineering-long-memory/)
