# CLAUDE.md Configuration Landscape (January 2026)

Research compiled from community resources, official documentation, and real-world examples.

## Table of Contents

1. [What is CLAUDE.md?](#what-is-claudemd)
2. [File Locations and Hierarchy](#file-locations-and-hierarchy)
3. [Core Structure Patterns](#core-structure-patterns)
4. [Best Practices](#best-practices)
5. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
6. [Advanced Features](#advanced-features)
7. [Modular Configuration with .claude/rules/](#modular-configuration-with-clauderules)
8. [Agent Skills (SKILL.md)](#agent-skills-skillmd)
9. [Custom Slash Commands](#custom-slash-commands)
10. [Subagents and Multi-Agent Orchestration](#subagents-and-multi-agent-orchestration)
11. [Context Window Optimization](#context-window-optimization)
12. [Monorepo Strategies](#monorepo-strategies)
13. [Community Resources](#community-resources)

---

## What is CLAUDE.md?

CLAUDE.md is a special Markdown file that Claude Code automatically ingests to gain project-specific context before starting work. It acts as:
- A "pre-flight briefing" that rides along with every request
- A persistent configuration that establishes project structure and constraints
- Project memory that survives session restarts

As developer Anthony Calzadilla puts it: *"It's how you set constraints, establish the project structure, and teach the AI how to operate within your stack - without bloating the codebase or relying on fragile comments."*

### Key Characteristics

- No required format - concise and human-readable recommended
- Automatically loaded into context at session start
- Counts toward token budget with every interaction
- Can be hierarchical across directories

---

## File Locations and Hierarchy

### Standard Locations

| Location | Scope | Version Control |
|----------|-------|-----------------|
| `~/.claude/CLAUDE.md` | All projects (global) | Personal |
| `./CLAUDE.md` | Project root | Shared (recommended) |
| `./.claude/CLAUDE.md` | Project root (alternative) | Shared |
| `./CLAUDE.local.md` | Project root | Personal (auto-gitignored) |
| `./subdir/CLAUDE.md` | Subdirectory | Context-specific |

### Hierarchy Loading Behavior

1. **Parent directories**: Starting from cwd, Claude recurses up (not including root) and reads all CLAUDE.md files found
2. **Child directories**: Loaded on-demand when working with files in subdirectories
3. **Priority**: Most specific (nested) instructions take precedence when relevant

### Settings Files

```
~/.claude/settings.json        # Global settings
.claude/settings.json          # Project settings (version controlled)
.claude/settings.local.json    # Personal overrides (gitignored)
```

---

## Core Structure Patterns

### Recommended Sections

A well-structured CLAUDE.md typically includes:

1. **Tech Stack** - Languages, frameworks, tools used
2. **Code Style & Conventions** - Import standards, formatting, naming patterns
3. **Development Workflow** - Branch strategy, commit format, PR requirements
4. **Testing Strategy** - Frameworks, coverage requirements, naming conventions
5. **Project Structure** - High-level directory overview
6. **Do Not Section** - Explicit restrictions and boundaries

### Example Structure

```markdown
# Project Name

## Tech Stack
- Framework: Next.js 15
- Language: TypeScript
- State: Zustand + React Query
- Styling: SCSS Modules + cva

## Commands
- `npm run build` - Build production
- `npm run test` - Run tests
- `npm run lint` - Lint and format

## Code Conventions
- Named exports only (no defaults in libraries)
- kebab-case file names
- Import ordering: React > External > Internal > Relative > Styles

## Decision Trees

### State Management
Is it server data (from API)?
├─ YES → React Query
└─ NO → Is it needed across multiple components?
    ├─ YES → Zustand
    └─ NO → useState in component

## Do Not
- Do not edit files in `src/legacy/`
- Do not commit directly to main branch
- Do not use `any` without justification comment
```

### Decision Tree Pattern

Strong configurations provide *"a clear decision tree that routes Claude to the right workflow based on task type."* This helps structure decision-making and aids the LLM in following instructions.

---

## Best Practices

### 1. Keep It Concise
- Aim for under 10k words for best performance
- Brevity is key - Claude has limited context space
- Use bullet points and short sentences over paragraphs

### 2. Be Specific
- *"Use 2-space indentation"* is better than *"Format code properly"*
- Show exact patterns to follow
- Leave no room for interpretation

### 3. Treat as Living Document
- Iterate based on results
- Add instructions when Claude repeatedly makes mistakes
- Create a feedback loop: Claude mistake → Add to CLAUDE.md → Commit → Fixed

### 4. Use Progressive Disclosure
- Don't tell Claude everything upfront
- Tell it *how to find* important information when needed
- Reference paths to detailed docs: *"See @docs/api-guide.md for API patterns"*

### 5. Provide Alternatives with Constraints
- Avoid negative-only constraints like *"Never use --foo-bar flag"*
- Always provide an alternative action

### 6. Focus on Real Problems
Document:
- Commands you type repeatedly
- Architectural context that takes time to explain
- Workflows that prevent rework

---

## Anti-Patterns to Avoid

### 1. Using CLAUDE.md for Code Style Guidelines
> *"Never send an LLM to do a linter's job. LLMs are comparably expensive and incredibly slow compared to traditional linters and formatters."*

Use ESLint, Prettier, and other deterministic tools instead.

### 2. Adding Too Many Instructions
As instruction count increases, instruction-following quality decreases *uniformly* - Claude begins ignoring all instructions, not just new ones.

### 3. Creating Too Many Complex Slash Commands
> *"If you have a long list of complex custom slash commands, you've created an anti-pattern. The entire point is to type almost whatever you want and get useful results."*

### 4. Overloading with MCP Tokens
> *"If you're using more than 20k tokens of MCPs, you're crippling Claude. That would only give you a measly 20k tokens left of actual work."*

### 5. @-Mentioning Large Documentation Files
Embedding entire files on every run bloats context. Instead, pitch the agent on *why* and *when* to read the file.

### 6. Big Soup of Dos and Don'ts
Conflicting instructions make the LLM fragile. Keep rules consistent and organized by topic.

### 7. Adding Content Without Iteration
Take time to experiment and determine what produces the best instruction following.

---

## Advanced Features

### File Imports with @ Syntax

CLAUDE.md files can import additional files:

```markdown
# Project Guidelines

See @README for project overview
See @package.json for available npm commands
See @docs/api-patterns.md for API conventions

# Personal preferences
@~/.claude/my-personal-preferences.md
```

**Key points:**
- Both relative and absolute paths work
- Imports from home directory allow personal instructions not in repo
- Max depth of 5 hops for recursive imports
- Imports not evaluated inside code blocks

### Extended Thinking Triggers

Use specific words to increase Claude's thinking budget:

| Phrase | Effect |
|--------|--------|
| "think" | Basic extended thinking |
| "think hard" | More thinking budget |
| "think harder" | Even more budget |
| "ultrathink" | Maximum thinking budget |

### Dynamic Mode Adaptation

Configure context-driven behavior switching:

```markdown
## EXPLORATION MODE
Triggered by: undefined requirements, unclear specifications
- Multi-observer analysis of problem space
- Systematic requirement clarification
- Architecture decision documentation

## IMPLEMENTATION MODE
Triggered by: clear specifications, defined tasks
- Direct code generation
- Comprehensive error handling
- Test-driven approach
```

---

## Modular Configuration with .claude/rules/

For larger projects, organize instructions in `.claude/rules/` directory.

### Directory Structure

```
your-project/
├── .claude/
│   ├── CLAUDE.md              # Main project instructions
│   └── rules/
│       ├── code-style.md      # Code style guidelines
│       ├── testing.md         # Testing conventions
│       ├── security.md        # Security requirements
│       └── api/
│           └── validation.md  # API-specific rules
```

### Conditional/Path-Scoped Rules

Use YAML frontmatter to scope rules to specific files:

```markdown
---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---

# React Component Guidelines
...
```

Rules without `paths` load everywhere.

### Benefits

- **Organization**: Topic-based files easier to navigate
- **Conditional rules**: Apply only to specific file types
- **Team collaboration**: Smaller files reduce merge conflicts
- **Modularity**: Share via symlinks across projects
- **Scalability**: Add files as project grows

### Best Practices for Rules

- Keep individual files under 500 lines
- Use subdirectories to group related rules
- One concern per file
- Use descriptive filenames: `api-validation.md` beats `rules1.md`
- Remove obsolete information regularly

---

## Agent Skills (SKILL.md)

Skills are folders of instructions, scripts, and resources that Claude loads dynamically for specialized tasks.

### Directory Locations

```
~/.config/claude/skills/     # Personal skills (all projects)
.claude/skills/              # Project skills (team-shared)
```

### SKILL.md Structure

```markdown
---
name: create-component
description: Create React components following project patterns
---

# Create Component Skill

## When to Use
Use this skill when creating new React components.

## Instructions
1. Check existing component patterns in @src/components
2. Follow naming conventions...
```

### Required Metadata

- `name`: Skill identifier
- `description`: Brief description for skill discovery

### Optional Bundled Files

```
my-skill/
├── SKILL.md
├── scripts/
│   └── generate.py
├── references/
│   └── patterns.md
└── assets/
    └── template.tsx
```

---

## Custom Slash Commands

### Storage Locations

```
.claude/commands/            # Project commands
~/.claude/commands/          # Personal commands (all projects)
```

### Naming Convention

| File Path | Command | Display |
|-----------|---------|---------|
| `.claude/commands/review.md` | `/review` | (project) |
| `.claude/commands/frontend/test.md` | `/test` | (project:frontend) |
| `.claude/commands/frontend/component.md` | `/project:frontend:component` | - |

### Command File Format

```markdown
---
description: Create a new React component
argument-hint: <component-name>
allowed-tools: ["Edit", "Write", "Read"]
model: claude-sonnet-4-20250514
---

Create a new React component named $1 following project patterns.

Use $ARGUMENTS for the component name if multiple args provided.
```

### Integration with CLAUDE.md

Reference commands in CLAUDE.md to encourage Claude to use them:

```markdown
## Workflows
- For code review, use /review command
- For new components, use /project:frontend:component
```

---

## Subagents and Multi-Agent Orchestration

### Built-in Subagents

Claude Code includes:
- **General-purpose subagent**: Complex, multi-step tasks
- **Explore subagent**: Read-only commands (ls, git status, git log, etc.)

### Creating Custom Subagents

Place `.md` files in:
- `.claude/agents/` - Project subagents
- `~/.claude/agents/` - Personal subagents

### Subagent Configuration Format

```markdown
---
name: frontend-specialist
description: Expert in React and frontend architecture
tools: ["Read", "Edit", "Write", "Glob", "Grep"]
model: claude-sonnet-4-20250514
permissionMode: default
skills: ["create-component", "test-component"]
---

You are a frontend development specialist focused on React applications.

## Responsibilities
- Component architecture
- State management decisions
- Performance optimization

## Approach
- Always check existing patterns first
- Prefer composition over inheritance
- Write tests for new components
```

### Multi-Agent Use Cases

1. **Codebase Documentation**: Primary agent lists items, subagents document each
2. **Large-Scale Refactoring**: Primary finds instances, subagents handle each file
3. **Parallel Development**: Multiple agents work on different concerns simultaneously

### Best Practices

- Avoid placing orchestration instructions in global `~/.claude/CLAUDE.md`
- Enable multi-agent workflows only for projects requiring coordination
- Start with lightweight agents (under 3k tokens) for efficiency
- Create focused, single-purpose agents initially

---

## Context Window Optimization

### Context Sizes

| Plan | Context Window |
|------|---------------|
| Standard | 200K tokens (~500 pages) |
| Enterprise (Sonnet 4.5) | 500K tokens |
| Sonnet 4/4.5 API | 1M tokens |

### Optimization Strategies

1. **Keep CLAUDE.md lean**: Split wisely between project and local files
2. **Use `/compact`**: Summarize and compress conversation history
3. **Disable unused MCP servers**: Each adds tool definitions to system prompt
4. **Use `/context`**: Visualize token consumption
5. **Reference excerpts**: Don't dump entire docs into CLAUDE.md
6. **Set file boundaries**: Explicitly tell Claude which files to ignore

### Token Efficiency Tips

- Previous thinking blocks are auto-stripped from context
- Compaction is instant (continuous background memory)
- ~80% context triggers auto-compaction
- File-based analysis can achieve 97% token savings for large JSON

---

## Monorepo Strategies

### Hierarchical CLAUDE.md

```
monorepo/
├── CLAUDE.md                    # Root: shared conventions
├── packages/
│   ├── frontend/
│   │   └── CLAUDE.md            # Frontend-specific
│   └── backend/
│       └── CLAUDE.md            # Backend-specific
└── apps/
    └── web/
        └── CLAUDE.md            # App-specific
```

### Reducing Context in Monorepos

One developer reduced CLAUDE.md from 47k to 9k words by splitting across services:
- Backend components don't need frontend guides
- Each domain gets relevant context only
- Aim for under 10k words per CLAUDE.md

### Key Strategies

1. Root CLAUDE.md: Only shared conventions
2. Per-package CLAUDE.md: Domain-specific patterns
3. Use conditional rules in `.claude/rules/`
4. Leverage on-demand loading for child directories

---

## Community Resources

### Official Documentation

- [Claude Blog: Using CLAUDE.md Files](https://claude.com/blog/using-claude-md-files)
- [Claude Code Docs: Memory](https://code.claude.com/docs/en/memory)
- [Anthropic: Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### Curated Collections

- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) - Commands, files, workflows collection
- [awesome-claude-md](https://github.com/josix/awesome-claude-md) - CLAUDE.md examples from public projects
- [Claude-Flow Templates](https://github.com/ruvnet/claude-flow/wiki/CLAUDE-MD-Templates) - Template collection
- [Claude Code Templates](https://github.com/davila7/claude-code-templates) - CLI tool with 400+ components

### Example Repositories

- [ArthurClune/claude-md-examples](https://github.com/ArthurClune/claude-md-examples) - Sample files
- [Full CLAUDE.md Sample (Gist)](https://gist.github.com/scpedicini/179626cfb022452bb39eff10becb95fa)
- [vibecoding CLAUDE.md](https://github.com/cpjet64/vibecoding/blob/main/CLAUDE.md) - Real-world example

### Subagents & Skills

- [anthropics/skills](https://github.com/anthropics/skills) - Official Agent Skills repository
- [awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) - Subagent collection
- [wshobson/agents](https://github.com/wshobson/agents) - Multi-agent orchestration

### Guides and Tutorials

- [HumanLayer: Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [Maxitect: Building an Effective CLAUDE.md](https://www.maxitect.blog/posts/maximising-claude-code-building-an-effective-claudemd)
- [ClaudeLog: CLAUDE.md Supremacy](https://claudelog.com/mechanics/claude-md-supremacy/)
- [Apidog: 5 Best Practices](https://apidog.com/blog/claude-md/)
- [Arize: Prompt Learning Optimizations](https://arize.com/blog/claude-md-best-practices-learned-from-optimizing-claude-code-with-prompt-learning/)

### Tools & Utilities

- `/init` command - Auto-generate CLAUDE.md from codebase analysis
- `/context` command - Visualize token usage and context consumption
- `/compact` command - Compress conversation history

---

## Quick Reference

### File Priority (Highest to Lowest)

1. Current directory CLAUDE.md
2. Parent directory CLAUDE.md files (recursive)
3. `.claude/rules/*.md` files
4. Global `~/.claude/CLAUDE.md`

### What to Include

- Build/test commands
- Directory structure overview
- Naming conventions
- Decision trees for common choices
- Links to detailed documentation
- Boundaries and restrictions

### What to Avoid

- Linting rules (use ESLint/Prettier)
- Excessive code examples
- Conflicting instructions
- Large embedded documents
- Instructions for edge cases

### Token Budget Rule of Thumb

- Keep CLAUDE.md under 10k words
- Rules files under 500 lines each
- MCP servers under 20k tokens total
- Leave headroom for actual work

---

*Last updated: January 2026*
