# Claude Code Skill Systems Landscape Research

**Research Date:** January 2026
**Researcher:** Claude Opus 4.5

## Executive Summary

Claude Skills represent Anthropic's system for extending AI agent capabilities through organized folders of instructions, scripts, and resources. Skills were officially announced on October 16, 2025, and have since been published as an open standard (Agent Skills) on December 18, 2025. The standard has been adopted by major industry players including Microsoft, OpenAI, Cursor, GitHub, Figma, and Atlassian.

---

## Table of Contents

1. [What Are Claude Skills?](#what-are-claude-skills)
2. [Timeline and History](#timeline-and-history)
3. [Agent Skills Open Standard](#agent-skills-open-standard)
4. [Technical Architecture](#technical-architecture)
5. [Skill Structure and Format](#skill-structure-and-format)
6. [Progressive Disclosure Pattern](#progressive-disclosure-pattern)
7. [Context Injection Architecture](#context-injection-architecture)
8. [Skills vs Other Customization Options](#skills-vs-other-customization-options)
9. [Skill Discovery and Activation](#skill-discovery-and-activation)
10. [Reliable Activation Strategies](#reliable-activation-strategies)
11. [Security Considerations](#security-considerations)
12. [Best Practices](#best-practices)
13. [Community Resources](#community-resources)
14. [Industry Adoption](#industry-adoption)
15. [Sources](#sources)

---

## What Are Claude Skills?

Skills are folders containing instructions, scripts, and resources that Claude loads dynamically to improve performance on specialized tasks. They teach Claude how to complete specific tasks in a repeatable way.

### Key Characteristics

- **Composable**: Skills stack together; Claude identifies which skills are needed and coordinates their use
- **Portable**: Same format everywhere; build once, use across Claude apps, Claude Code, and API
- **Efficient**: Only loads what's needed, when it's needed
- **Powerful**: Can include executable code for deterministic operations

### How Skills Work

A Skill is a markdown file (SKILL.md) that teaches Claude specific capabilities. When a request matches a Skill's purpose, Claude automatically applies it. Skills are **model-invoked** - Claude decides which Skills to use based on semantic matching with request descriptions, not explicit commands.

---

## Timeline and History

| Date | Event |
|------|-------|
| February 2025 | Claude Code launched |
| October 16, 2025 | Claude Skills officially announced |
| December 18, 2025 | Agent Skills published as open standard at agentskills.io |
| December 2025 | Microsoft, OpenAI, and major vendors adopt the standard |

---

## Agent Skills Open Standard

Anthropic published Agent Skills as an open standard for cross-platform portability, available at [agentskills.io](https://agentskills.io).

### Specification Overview

The specification defines:
- A skill as a directory containing a SKILL.md file
- Optional directories: `scripts/`, `references/`, `assets/`
- YAML frontmatter with required metadata
- Markdown content for instructions

### Required Frontmatter Fields

| Field | Requirements |
|-------|-------------|
| `name` | 1-64 characters, lowercase letters/numbers/hyphens, must match parent directory |
| `description` | 1-1024 characters, explains functionality and use cases |

### Optional Frontmatter Fields

| Field | Description |
|-------|-------------|
| `license` | Licensing terms |
| `compatibility` | Environment requirements (1-500 chars) |
| `metadata` | Arbitrary key-value mapping |
| `allowed-tools` | Space-delimited pre-approved tools (experimental) |
| `model` | Specific Claude model to use |

### Relationship to MCP

"MCP provides secure connectivity to external software and data, while skills provide the procedural knowledge for using those tools effectively."

Skills complement Model Context Protocol (MCP) - MCP provides the tools, Skills teach Claude how to use them effectively.

---

## Technical Architecture

### Core Concept

Skills operate fundamentally differently from traditional tools. Instead of executing discrete actions and returning results, skills inject comprehensive instruction sets that modify how Claude reasons about and approaches tasks.

### Execution Flow

1. **Discovery**: Skills loaded from multiple sources, filtered by enabled status
2. **Selection**: Claude reads skill descriptions, invokes Skill tool with matching command
3. **Validation**: Skill tool validates input, checks permissions
4. **Context Injection**: Metadata message injected (visible), skill prompt injected (hidden via `isMeta: true`)
5. **Execution**: Claude receives modified context, executes with pre-approved tools
6. **Scope Exit**: Execution context modifications revert

### No Algorithmic Routing

Claude's skill selection mechanism relies entirely on **language model reasoning**, not algorithmic matching:
- No embeddings, classifiers, or pattern matching
- System formats available skills into text description embedded in Skill tool's prompt
- Claude's language model makes the selection decision

---

## Skill Structure and Format

### Minimal Structure

```
my-skill/
└── SKILL.md
```

### Complete Structure

```
pdf-processing/
├── SKILL.md              # Required - overview & navigation
├── FORMS.md              # Form-filling guide (loaded as needed)
├── reference.md          # API reference (loaded as needed)
├── examples.md           # Usage examples (loaded as needed)
└── scripts/
    ├── analyze_form.py   # Utility script (executed, not loaded)
    ├── fill_form.py      # Form filling script
    └── validate.py       # Validation script
```

### SKILL.md Template

```yaml
---
name: my-skill-name
description: A clear description of what this skill does and when to use it
allowed-tools: Read, Bash(python:*)
---

# My Skill Name

## Quick start
[Essential instructions]

## Additional resources
- For complete API details, see [reference.md](reference.md)
- For examples, see [examples.md](examples.md)

## Utility scripts
Run validation:
```bash
python scripts/validate.py input.pdf
```
```

### Discovery Locations

| Location | Path | Scope |
|----------|------|-------|
| Personal | `~/.claude/skills/` or `~/.config/claude/skills/` | User, across all projects |
| Project | `.claude/skills/` | Anyone in the repository |
| Plugin | Bundled with plugins | Plugin users |
| Enterprise | Managed settings | Organization-wide |

**Priority**: Enterprise > Personal > Project > Plugin

---

## Progressive Disclosure Pattern

Progressive disclosure is the core design principle that makes Agent Skills flexible and scalable.

### Three Levels of Disclosure

1. **Level 1 (Metadata)**: Name and description loaded at startup for skill discovery
2. **Level 2 (Instructions)**: Full SKILL.md loaded when skill becomes relevant
3. **Level 3 (Reference Files)**: Additional files loaded only as needed during execution

### Benefits

- Effectively unbounded context capacity
- No context penalty for bundled content until accessed
- Token-efficient skill discovery (few dozen tokens per skill)
- Full details loaded only when task requires them

### Implementation Pattern

```markdown
# SKILL.md

## Quick start
[Essential instructions here]

## Advanced features
**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
**Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
```

Claude loads FORMS.md, REFERENCE.md, or EXAMPLES.md only when needed.

---

## Context Injection Architecture

### Dual-Message Strategy

Skills inject two distinct user messages with different visibility:

**Message 1 (Visible)**:
```
<command-message>The "pdf" skill is loading</command-message>
<command-name>pdf</command-name>
```
- Appears in user interface
- ~50-200 characters

**Message 2 (Hidden)**:
- Full skill prompt from SKILL.md
- `isMeta: true` flag (sent to API but hidden from UI)
- ~500-5,000 words of instructions

### Execution Context Modification

Skills dynamically modify execution context through a `contextModifier` function:
- Pre-approve tool permissions (tools in `allowed-tools` skip user confirmation)
- Override model selection
- Adjust thinking parameters
- Changes persist only during skill execution

---

## Skills vs Other Customization Options

### Comparison Table

| Feature | Best For | Trigger |
|---------|----------|---------|
| **CLAUDE.md** | Project context, conventions, static knowledge | Always loaded |
| **Skills** | Specialized expertise, complex workflows | Auto-invoked by Claude |
| **Slash Commands** | Reusable prompts, manual shortcuts | User types `/command` |
| **Subagents** | Task delegation, isolated context | Explicit spawning |
| **Hooks** | Event-triggered scripts | On file save, etc. |
| **MCP Servers** | External tools/data | Tools need providing |

### Key Distinctions

**CLAUDE.md vs Skills**:
- CLAUDE.md: Short, always-true project conventions and standards
- Skills: Modular chunks of expertise loaded only when relevant

**Skills vs Slash Commands**:
- Skills: Auto-invoked by Claude based on description matching
- Slash Commands: User-triggered with explicit `/command`

**Skills vs Subagents**:
- Skills: Add knowledge to current conversation
- Subagents: Run in separate context with own tools
- Analogy: Skills are like recipes, subagents are like specialized coworkers

---

## Skill Discovery and Activation

### How Claude Selects Skills

1. At startup, Claude loads name and description of each available skill
2. User request is evaluated against skill descriptions using language understanding
3. If match found, Claude invokes Skill tool with matching command parameter
4. No regex, embeddings, or ML classifiers - pure LLM reasoning

### Writing Effective Descriptions

The description determines **when** Claude uses your Skill:

**Bad**:
```yaml
description: Helps with documents
```

**Good**:
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDFs or when the user mentions PDFs, forms, or document extraction.
```

Best practices:
- Be specific, list concrete capabilities
- Include trigger keywords users would naturally say
- Always write in third person
- Explain both what it does and when to apply it

---

## Reliable Activation Strategies

Research from community testing reveals activation success rates:

### Tested Approaches

| Approach | Success Rate | Notes |
|----------|--------------|-------|
| Simple Instruction | 20% | Passive suggestion, often ignored |
| LLM Eval Hook | 80% | Pre-evaluates using Claude API, 10% cheaper |
| Forced Eval Hook | 84% | Three-step commitment mechanism, most consistent |

### Forced Eval Hook Pattern

Creates a commitment mechanism where Claude must:
1. Explicitly evaluate each skill
2. State YES/NO reasoning
3. Activate before implementation

Using emphatic language ("MANDATORY", "CRITICAL") strengthens compliance.

---

## Security Considerations

### Known Risks

1. **Prompt Injection**: Malicious skills can manipulate Claude to execute unintended actions
2. **Data Exfiltration**: Malicious code or prompt-injected data leaks
3. **Command Injection**: Unsafe commands executed through scripts
4. **Tool Abuse**: Skills performing unintended actions

### Known Vulnerabilities (Historical)

- Path restriction bypass (CVE-2025-54794) - Fixed in v0.2.111
- Command injection (CVE-2025-54795) - Fixed in v1.0.20

### Built-in Protections

- Permission system requiring explicit approval for sensitive operations
- Context-aware analysis detecting potentially harmful instructions
- Input sanitization preventing command injection
- Command blocklist blocking risky commands (curl, wget by default)
- Isolated context windows for web fetch
- Trust verification for first-time codebase runs and new MCP servers

### Best Practices

1. Only install skills from trusted sources
2. Thoroughly audit skills from less-trusted sources
3. Ship minimum permission manifest for each Skill
4. Set up logging with detections for unexpected domain egress
5. Schedule red-team sessions against staging Skills
6. Enable sandbox mode via `/sandbox` command
7. Use deny rules for network commands
8. Never bypass permissions mode

---

## Best Practices

### Core Principles

1. **Concise is key**: Challenge each piece of information for necessity
2. **Set appropriate degrees of freedom**: Match specificity to task fragility
3. **Test with all models**: What works for Opus might need more detail for Haiku

### Naming Conventions

Use **gerund form** (verb + -ing) for skill names:
- `processing-pdfs`
- `analyzing-spreadsheets`
- `managing-databases`

Avoid:
- Vague names: `helper`, `utils`, `tools`
- Reserved words: `anthropic-helper`, `claude-tools`

### Structure Guidelines

- Keep SKILL.md under 500 lines
- Use progressive disclosure for larger content
- Avoid deeply nested references (keep one level deep)
- Use forward slashes in file paths, even on Windows
- Include table of contents for files > 100 lines

### Workflow Patterns

**Template Pattern**: Provide output format templates
**Examples Pattern**: Include input/output pairs
**Conditional Workflow**: Guide through decision points
**Feedback Loops**: Run validator -> fix errors -> repeat

### Evaluation-Driven Development

1. Run Claude on representative tasks without a Skill
2. Document specific failures
3. Create evaluations testing identified gaps
4. Establish baseline performance
5. Write minimal instructions to pass evaluations
6. Iterate based on observation

---

## Community Resources

### Official Repositories

- [anthropics/skills](https://github.com/anthropics/skills) - Official Anthropic skills repository (33.7k stars)
- [agentskills/agentskills](https://github.com/agentskills/agentskills) - Open standard specification

### Community Collections

- [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) - Curated list of skills and resources
- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) - Community skill collection
- [VoltAgent/awesome-claude-skills](https://github.com/VoltAgent/awesome-claude-skills) - Another curated collection
- [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) - Real-world usage skills

### Notable Community Skills

- **obra/superpowers** - 20+ battle-tested skills for Claude Code
- **ios-simulator-skill** - iOS app development
- **playwright-skill** - Browser automation
- **ffuf-web-fuzzing** - Security testing
- **claude-d3js-skill** - Data visualization
- **claude-scientific-skills** - Research workflows

### Tools

- **Skill_Seekers** - Converts documentation into Skills
- **skill-creator** - Interactive skill building
- **claude-code-skill-factory** - Skill template generation

---

## Industry Adoption

### Major Adopters

| Company | Implementation |
|---------|----------------|
| Microsoft | VS Code, GitHub integration |
| OpenAI | Codex skills support |
| Cursor | Native skills support |
| Atlassian | Partner skills |
| Figma | Partner skills |
| Notion | Partner skills |
| Canva | Partner skills |
| Stripe | Partner skills |
| Zapier | Partner skills |

### Skills Directory

Anthropic maintains a Skills Directory featuring professionally-built skills from partners for common workflows including:
- Document creation (DOCX, PDF, PPTX, XLSX)
- Design tools integration
- Project management
- Productivity automation

---

## Sources

### Official Documentation

- [Agent Skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Agent Skills Overview - Claude Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Agent Skills Specification](https://agentskills.io/specification)

### Engineering Blog Posts

- [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Introducing Agent Skills](https://www.anthropic.com/news/skills)
- [Skills explained: How Skills compares to prompts, Projects, MCP, and subagents](https://claude.com/blog/skills-explained)

### Deep Dive Analyses

- [Claude Agent Skills: A First Principles Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Inside Claude Code Skills: Structure, prompts, invocation](https://mikhail.io/2025/10/claude-code-skills/)
- [How to Make Claude Code Skills Activate Reliably](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably)
- [Claude Skills: A Technical Deep-Dive into Context Injection Architecture](https://medium.com/data-science-collective/claude-skills-a-technical-deep-dive-into-context-injection-architecture-ee6bf30cf514)

### News and Analysis

- [Anthropic launches enterprise 'Agent Skills' and opens the standard](https://venturebeat.com/ai/anthropic-launches-enterprise-agent-skills-and-opens-the-standard)
- [Agent Skills: Anthropic's Next Bid to Define AI Standards](https://thenewstack.io/agent-skills-anthropics-next-bid-to-define-ai-standards/)
- [Anthropic makes agent Skills an open standard](https://siliconangle.com/2025/12/18/anthropic-makes-agent-skills-open-standard/)

### Guides and Tutorials

- [Claude Skills and CLAUDE.md: a practical 2026 guide for teams](https://www.gend.co/blog/claude-skills-claude-md-guide)
- [Claude Code customization guide: CLAUDE.md, skills, subagents explained](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)
- [Understanding Claude Code's Full Stack: MCP, Skills, Subagents, and Hooks Explained](https://alexop.dev/posts/understanding-claude-code-full-stack/)
- [When to Use Claude Code Skills vs Commands vs Agents](https://danielmiessler.com/blog/when-to-use-skills-vs-commands-vs-agents)

### Security Resources

- [Are Claude Skills Secure? Threat Model, Permissions & Best Practices](https://skywork.ai/blog/ai-agent/claude-skills-security-threat-model-permissions-best-practices-2025/)
- [Claude Code Security Docs](https://code.claude.com/docs/en/security)
- [Bypassing Claude Code: How Easy Is It to Trick an AI Security Reviewer?](https://checkmarx.com/zero-post/bypassing-claude-code-how-easy-is-it-to-trick-an-ai-security-reviewer/)

### Help Center

- [What are Skills?](https://support.claude.com/en/articles/12512176-what-are-skills)
- [Using Skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- [How to create custom Skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)

---

## Key Takeaways

1. **Skills are context injection, not code execution** - They modify Claude's reasoning through instruction templates, not direct program execution

2. **Progressive disclosure is the core architecture** - Enables effectively unbounded context while maintaining efficiency

3. **Agent Skills is now an open standard** - Published at agentskills.io with broad industry adoption

4. **Selection is pure LLM reasoning** - No algorithmic routing; Claude's language understanding matches requests to skills

5. **Skills complement MCP** - MCP provides tools, Skills provide procedural knowledge for using them

6. **Security requires vigilance** - Only install from trusted sources; audit third-party skills thoroughly

7. **Community ecosystem is growing rapidly** - Multiple curated collections and tools available

8. **Skill vs Command vs Subagent decisions matter** - Each has distinct use cases based on automation needs and context isolation requirements
