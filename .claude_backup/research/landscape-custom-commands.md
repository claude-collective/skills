# Claude Code Custom Commands: Landscape Research

> Research compiled: 2026-01-05
> Purpose: Document patterns, structures, and best practices for Claude Code extensibility

---

## Table of Contents

1. [Overview](#overview)
2. [Slash Commands](#slash-commands)
3. [Subagents](#subagents)
4. [Hooks](#hooks)
5. [Plugins](#plugins)
6. [Memory Files (CLAUDE.md)](#memory-files-claudemd)
7. [MCP Integration](#mcp-integration)
8. [Community Patterns](#community-patterns)
9. [Best Practices](#best-practices)
10. [Sources](#sources)

---

## Overview

Claude Code offers a comprehensive extensibility system built around five core extension points:

| Extension Type | Location | Scope | Purpose |
|---------------|----------|-------|---------|
| Slash Commands | `.claude/commands/` | Project/User | Frequently-used prompts as markdown files |
| Subagents | `.claude/agents/` | Project/User | Specialized AI assistants with custom tools/prompts |
| Hooks | `settings.json` | Project/User | Automated scripts at lifecycle events |
| Plugins | `.claude-plugin/` | Distributable | Bundled collections of commands/agents/hooks/MCP |
| Memory Files | `CLAUDE.md` | Project/User | Persistent project context and instructions |

---

## Slash Commands

### Storage Locations

| Type | Location | Indicator in /help |
|------|----------|-------------------|
| Project Commands | `.claude/commands/` | `(project)` |
| Personal Commands | `~/.claude/commands/` | `(user)` |
| Plugin Commands | `commands/` in plugin dir | `(plugin-name)` |
| MCP Commands | From MCP servers | `mcp__server__command` |

### File Format

Each `.md` file becomes a slash command. The filename (without extension) is the command name.

#### Basic Command

```markdown
Analyze this code for performance issues and suggest optimizations.
```

Save as `.claude/commands/optimize.md`, invoke with `/optimize`.

#### With YAML Frontmatter

```yaml
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Create a git commit with conventional commits format
model: claude-3-5-haiku-20241022
disable-model-invocation: false
---

Create a git commit with message: $ARGUMENTS
```

### Frontmatter Options

| Option | Purpose | Default |
|--------|---------|---------|
| `allowed-tools` | List of tools the command can use | Inherits from conversation |
| `argument-hint` | Expected arguments (shown in autocomplete) | None |
| `description` | Brief description | First line of prompt |
| `model` | Specific model to use | Inherits from conversation |
| `disable-model-invocation` | Prevent SlashCommand tool from calling | `false` |

### Arguments

**All Arguments (`$ARGUMENTS`):**
```markdown
Fix issue #$ARGUMENTS following our coding standards

# Usage: /fix-issue 123 high-priority
# $ARGUMENTS becomes: "123 high-priority"
```

**Positional Arguments (`$1`, `$2`, etc.):**
```markdown
Review PR #$1 with priority $2 and assign to $3.

# Usage: /review-pr 456 high alice
# $1="456", $2="high", $3="alice"
```

### Dynamic Content

**Bash Command Execution (`!` prefix):**
```markdown
## Context

- Current git status: !`git status`
- Current git diff: !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Based on the above changes, create a single git commit.
```

**File References (`@` prefix):**
```markdown
Review the implementation in @src/utils/helpers.js
Compare @src/old-version.js with @src/new-version.js
```

### Namespacing via Subdirectories

```
.claude/commands/
├── frontend/
│   └── component.md    → /component (project:frontend)
├── backend/
│   └── test.md         → /test (project:backend)
└── deploy.md           → /deploy (project)
```

### Complete Example

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Create a git commit with conventional commits format
model: claude-3-5-haiku-20241022
---

# Git Commit Helper

Create a git commit following conventional commits format.

## Context

- Current git status: !`git status`
- Current git diff (staged): !`git diff --cached`
- Current branch: !`git branch --show-current`

## Task

Create a commit with message: $ARGUMENTS

Follow conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for formatting
- `refactor:` for code restructuring
- `test:` for tests
- `chore:` for maintenance
```

---

## Subagents

### What Are Subagents?

Subagents are specialized AI assistants with:
- Custom system prompts defining expertise
- Separate context windows (prevent main thread pollution)
- Configurable tool access
- Independent operation returning results

### Storage Locations

| Type | Location | Priority |
|------|----------|----------|
| Project subagents | `.claude/agents/` | Highest |
| User subagents | `~/.claude/agents/` | Lower |
| Plugin agents | `agents/` in plugin dir | Standard |

### File Format

```markdown
---
name: your-sub-agent-name
description: Description of when this subagent should be invoked
tools: tool1, tool2, tool3  # Optional - inherits all tools if omitted
model: sonnet  # Optional - specify model alias or 'inherit'
permissionMode: default  # Optional
skills: skill1, skill2  # Optional - skills to auto-load
---

Your subagent's system prompt goes here. This can be multiple paragraphs
and should clearly define the subagent's role, capabilities, and approach.
```

### Configuration Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (lowercase, hyphens) |
| `description` | Yes | Natural language purpose description |
| `tools` | No | Comma-separated tool list; omit to inherit all |
| `model` | No | `sonnet`, `opus`, `haiku`, or `'inherit'` |
| `permissionMode` | No | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan`, `ignore` |
| `skills` | No | Comma-separated skill names to auto-load |

### Example Subagents

**Code Reviewer:**
```markdown
---
name: code-reviewer
description: Expert code review specialist. Use after code changes.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of code quality.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
- Performance considerations addressed

Provide feedback organized by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)
```

**Debugger:**
```markdown
---
name: debugger
description: Debugging specialist for errors and test failures
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

For each issue, provide:
- Root cause explanation
- Evidence supporting diagnosis
- Specific code fix
- Testing approach
- Prevention recommendations
```

### Built-in Subagents

| Subagent | Model | Tools | Purpose |
|----------|-------|-------|---------|
| General-Purpose | Sonnet | All | Complex multi-step tasks |
| Plan | Sonnet | Read, Glob, Grep, Bash | Codebase research in plan mode |
| Explore | Haiku | Glob, Grep, Read, Bash (read-only) | Fast codebase searching |

### Invocation Patterns

**Automatic delegation** based on task description and subagent's `description` field.

**Explicit invocation:**
```
> Use the code-reviewer subagent to check my recent changes
> Have the debugger subagent investigate this error
```

**Proactive triggers:** Include phrases like "use PROACTIVELY" or "MUST BE USED" in descriptions.

---

## Hooks

### Overview

Hooks are automated scripts that run at specific points in Claude Code's lifecycle.

### Configuration Location

- `~/.claude/settings.json` (user settings)
- `.claude/settings.json` (project settings)
- `.claude/settings.local.json` (local project settings)

### Hook Events

#### Tool-Related Events (with matchers)

| Event | When | Matchers |
|-------|------|----------|
| `PreToolUse` | Before tool execution | Tool names |
| `PostToolUse` | After tool completion | Tool names |
| `PermissionRequest` | When permission dialog shown | Tool names |

#### Session/Workflow Events

| Event | When | Matchers |
|-------|------|----------|
| `UserPromptSubmit` | User submits prompt | None |
| `Stop` | Main agent finishes | None |
| `SubagentStop` | Subagent finishes | None |
| `SessionStart` | Session begins | `startup`, `resume`, `clear`, `compact` |
| `SessionEnd` | Session terminates | None |
| `PreCompact` | Before compact | `manual`, `auto` |
| `Notification` | Notification sent | `permission_prompt`, `idle_prompt`, etc. |

### Configuration Format

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/format-code.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/validate-command.py"
          }
        ]
      }
    ]
  }
}
```

### Hook Types

**Command Hooks (`type: "command"`):** Execute bash scripts with JSON input via stdin.

**Prompt Hooks (`type: "prompt"`):** Use LLM for context-aware decisions.

### Hook Input (JSON via stdin)

All hooks receive:
```json
{
  "session_id": "string",
  "transcript_path": "/path/to/conversation.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default|plan|acceptEdits|dontAsk|bypassPermissions",
  "hook_event_name": "EventName"
}
```

**PreToolUse additional fields:**
```json
{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  }
}
```

### Exit Codes

| Exit Code | Meaning |
|-----------|---------|
| 0 | Success (JSON output parsed) |
| 2 | Blocking error (tool call denied) |
| Other | Non-blocking error |

### PreToolUse Decision Output

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "reason"
  }
}
```

### Use Cases

- **Block risky actions:** Prevent writes to `.env`, production configs, `/.git`
- **Auto-apply standards:** Run prettier, gofmt, or linters after edits
- **Validate commands:** Check bash commands before execution
- **Add context:** Inject additional context before prompts

---

## Plugins

### Overview

Plugins bundle multiple customization tools into a single installable package:
- Slash commands
- Subagents
- MCP servers
- Hooks

### Plugin Structure

```
.claude-plugin/
├── plugin.json          # Plugin metadata
├── commands/
│   └── command-one.md
├── agents/
│   └── agent-one.md
├── hooks/
│   └── hooks.json
└── mcp-servers/
    └── server-config.json
```

### Installation

```
/plugin install user/repo-name
/plugin install https://github.com/user/repo
```

### Management

```
/plugin list           # View installed plugins
/plugin enable name    # Enable a plugin
/plugin disable name   # Disable a plugin
/plugin remove name    # Uninstall a plugin
```

### Plugin Commands

Format: `/plugin-name:command-name` (or `/command-name` if no conflicts)

### Marketplaces

Curated collections of plugins with `.claude-plugin/marketplace.json`:

```
/plugin marketplace add user-or-org/repo-name
```

### Use Cases

- Standardizing team environments
- Supporting open source packages
- Sharing productivity workflows
- Connecting internal tools via MCP
- Bundling framework-specific customizations

---

## Memory Files (CLAUDE.md)

### File Hierarchy

| File | Location | Scope | Git |
|------|----------|-------|-----|
| Project Memory | `./CLAUDE.md` | Team | Committed |
| Local Project Memory | `./CLAUDE.local.md` | Personal | Ignored |
| User Memory | `~/.claude/CLAUDE.md` | All projects | N/A |

### Best Practices

**Be Specific and Concise:**
- "Use 2-space indentation" beats "Format code properly"
- Use bullet points and markdown headings

**Keep Files Minimal:**
- Under 500 lines for core files
- Only include what's needed in EVERY session
- Use imports for detailed specifications

**Limit Instructions:**
- Frontier models can follow ~150-200 instructions consistently
- Focus on universally applicable instructions

**Use Imports:**
```markdown
See @docs/api-reference.md for API patterns
See @docs/testing-guide.md for test conventions
```

**Avoid:**
- Code style guidelines (use linters instead)
- Code snippets (become stale; use file:line references)
- Rarely-needed information (reference files instead)

### Quick Memory Patterns

**Bootstrap Pattern:** Use `/init` to generate initial CLAUDE.md from codebase analysis.

**Quick Memory Pattern:** Prefix with `#` to add instantly: `# build fails if NODE_ENV isn't set`

**Checkpoint Pattern:** Before refactoring, tell Claude to update memory files.

### Maintenance

- Regular audits against actual codebase
- Scoped updates when correcting Claude
- View loaded files with `/memory` command

---

## MCP Integration

### Overview

Model Context Protocol (MCP) enables Claude Code to connect to external tools, databases, and APIs.

### Configuration

MCP servers configured in settings or via plugins:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"]
    }
  }
}
```

### Transport Types

- **HTTP servers** (recommended for remote)
- **stdio** (local processes)
- **SSE** (server-sent events)

### Tool Naming

MCP tools follow: `mcp__<server>__<tool>`

Examples:
- `mcp__github__list_prs`
- `mcp__memory__create_entities`
- `mcp__filesystem__read_file`

### MCP Slash Commands

MCP servers can expose prompts as slash commands:

```
/mcp__github__list_prs
/mcp__github__pr_review 456
```

### Management

```
/mcp                    # View servers and status
/mcp add <server>       # Add new server
/mcp remove <server>    # Remove server
```

---

## Community Patterns

### Popular Command Collections

**[wshobson/commands](https://github.com/wshobson/commands):** 57 production-ready commands
- 15 workflow commands (multi-agent orchestration)
- 42 tool commands (focused utilities)

**[Claude-Command-Suite](https://github.com/qdhenry/Claude-Command-Suite):** 148+ commands
- 10+ namespaces
- 54 AI agents
- GitHub-Linear sync

**[awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code):** Curated list
- Context engineering patterns
- AB Method workflow
- Domain-specific examples

### Workflow Patterns

**Feature Development Pipeline:**
1. `/feature-development` - orchestrate implementation
2. `/security-scan` - vulnerability assessment
3. `/performance-optimization` - tuning
4. `/deploy-checklist` - pre-deployment verification

**TDD Workflow:**
- `/tdd-cycle` - complete orchestration
- Or granular: `/tdd-red` -> `/tdd-green` -> `/tdd-refactor`

**Modernization Flow:**
1. `/legacy-modernize`
2. `/deps-audit` -> `/deps-upgrade`
3. `/refactor-clean`
4. `/test-harness`
5. `/docker-optimize`

### Subagent Collections

**[VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents):** 100+ agents
- Full-stack development
- DevOps
- Data science
- Business operations

**[subagents.app](https://subagents.app/):** Searchable directory of community subagents

---

## Best Practices

### Slash Commands

1. **Keep commands focused:** One clear purpose per command
2. **Use frontmatter:** Add description, argument-hint, allowed-tools
3. **Leverage bash execution:** Embed context dynamically
4. **Organize with namespaces:** Use subdirectories for related commands
5. **Share via git:** Project commands for team consistency

### Subagents

1. **Generate with Claude first:** Use `/agents` then customize
2. **Single responsibility:** One expertise area per subagent
3. **Detailed prompts:** Include specific instructions and constraints
4. **Limit tools:** Only grant necessary tool access
5. **Proactive descriptions:** Include trigger phrases like "use PROACTIVELY"

### Hooks

1. **Validate inputs:** Check for malicious content
2. **Use absolute paths:** Prevent path traversal
3. **Set timeouts:** Default 60s, customize as needed
4. **Return proper exit codes:** 0 for success, 2 to block
5. **Test thoroughly:** Hooks execute arbitrary commands

### Memory Files

1. **Keep minimal:** Under 500 lines
2. **Use imports:** Reference detailed docs with `@`
3. **Regular maintenance:** Audit against actual code
4. **Prefer pointers:** File:line references over snippets
5. **Use linters:** Not memory files for style guidelines

### General

1. **Start simple:** Add complexity as needed
2. **Version control:** Share project customizations
3. **Document purpose:** Clear descriptions for discoverability
4. **Test incrementally:** Validate each extension
5. **Monitor costs:** Complex workflows increase token usage

---

## Sources

### Official Documentation
- [Slash Commands - Claude Code Docs](https://code.claude.com/docs/en/slash-commands)
- [Subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Hooks Reference - Claude Code Docs](https://code.claude.com/docs/en/hooks)
- [MCP Integration - Claude Code Docs](https://code.claude.com/docs/en/mcp)
- [Memory Management - Claude Code Docs](https://code.claude.com/docs/en/memory)
- [Slash Commands in the SDK](https://platform.claude.com/docs/en/agent-sdk/slash-commands)
- [Claude Code Plugins Announcement](https://claude.com/blog/claude-code-plugins)

### Community Resources
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [wshobson/commands](https://github.com/wshobson/commands)
- [Claude-Command-Suite](https://github.com/qdhenry/Claude-Command-Suite)
- [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)
- [subagents.app](https://subagents.app/)

### Tutorials & Guides
- [How to Create Custom Slash Commands in Claude Code](https://en.bioerrorlog.work/entry/claude-code-custom-slash-command)
- [Claude Code Best Practices: Memory Management](https://cuong.io/blog/2025/06/15-claude-code-best-practices-memory-management)
- [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Cooking with Claude Code: The Complete Guide](https://www.siddharthbharath.com/claude-code-the-complete-guide/)
- [Claude Code Tips & Tricks: Custom Slash Commands](https://cloudartisan.com/posts/2025-04-14-claude-code-tips-slash-commands/)
