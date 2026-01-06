# Landscape Research: Profile-Based Agent Configurations

## Executive Summary

Profile-based agent configuration is an emerging standard across AI coding assistants, with multiple tools implementing similar but distinct approaches. The key trend is toward **declarative, file-based configuration** that lives in version control and can be shared across teams.

---

## The AGENTS.md Standard: Industry Convergence

### Overview

Google, OpenAI, Factory, Sourcegraph, and Cursor jointly launched **AGENTS.md** as a simple open standard for providing context and instructions to AI coding agents. This represents the most significant effort toward cross-platform interoperability.

**Official site:** https://agents.md/

### Key Characteristics

- **Format:** Standard Markdown with no required structure
- **Location:** Project root (closest file to edited code wins)
- **Purpose:** README for agents - build steps, tests, conventions, coding standards
- **Philosophy:** Natural language instructions, imperative statements, RFC 2119-style keywords (MUST, SHOULD)

### Supported Tools

| Tool | Support Level |
|------|---------------|
| GitHub Copilot | Native |
| ChatGPT Codex CLI | Native |
| OpenCode | Native |
| Aider | Via `--conventions-file` flag |
| Gemini CLI | Via settings.json |
| Cline | Fallback support |
| Claude Code | Via CLAUDE.md (similar concept) |

### Best Practices from 2,500+ Repositories

GitHub's analysis of AGENTS.md files across repositories identified six core areas to cover:
1. Commands (how to build, test, run)
2. Testing requirements
3. Project structure
4. Code style guidelines
5. Git workflow
6. Boundaries (what agents should NOT do)

**Sources:**
- [AGENTS.md Official Site](https://agents.md/)
- [GitHub Changelog: AGENTS.md Support](https://github.blog/changelog/2025-08-28-copilot-coding-agent-now-supports-agents-md-custom-instructions/)
- [Agent Rules Standard GitHub](https://github.com/agent-rules/agent-rules)
- [How to write a great agents.md - GitHub Blog](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

---

## Tool-Specific Configuration Systems

### Claude Code - CLAUDE.md and Subagents

**Configuration Hierarchy:**
1. **CLAUDE.md files** - Hierarchical, with nested directories having higher priority
2. **Global user memory** - `~/.config/claude/` for cross-project preferences
3. **Local project memory** - Git-ignored, personal preferences per project
4. **Subagents** - Specialized agents in `.claude/agents/` directory
5. **Skills** - Prompt expansion via `.claude/skills/`

**Key Features:**
- Subagents operate in isolated contexts, preventing main conversation pollution
- Each subagent can have different tool access levels
- Custom slash commands in `.claude/commands/` folder
- Skills can be user, project, or built-in scoped

**Best Practices:**
- Start simple with basic project structure
- Document custom tools with usage examples
- Treat customization as ongoing practice, not one-time setup
- Generate initial subagents with Claude, then iterate

**Sources:**
- [Using CLAUDE.MD files - Claude Blog](https://claude.com/blog/using-claude-md-files)
- [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Customization Guide](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)
- [Claude Agent Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)

---

### GitHub Copilot - Multi-Layer Configuration

**Configuration Files:**
1. `.github/copilot-instructions.md` - Repository-wide (auto-applied)
2. `.github/instructions/*.instructions.md` - Pattern-matched instructions with glob support
3. `.github/agents/*.md` - Custom agent profiles (agent personas)
4. `AGENTS.md` - Nested files for folder-specific instructions

**Agent Profile Format:**
```yaml
---
name: docs-agent
model: gpt-4o
target: vscode  # or github-copilot
---

[Agent instructions in Markdown, up to 30,000 characters]
```

**Scope Options:**
- **Repository level:** `.github/agents/CUSTOM-AGENT-NAME.md`
- **Organization level:** `/agents/CUSTOM-AGENT-NAME.md` in `.github-private` repository
- **User profile:** Current user profile folder (cross-workspace)

**Filtering by Agent:**
```yaml
---
excludeAgent: "code-review"  # Hide from code review agent
excludeAgent: "coding-agent"  # Hide from coding agent
---
```

**Sources:**
- [GitHub Docs: Custom Agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)
- [VS Code Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [Custom Agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents)

---

### Cursor AI - Rules System

**Rule Types:**
1. **User Rules** - Global preferences in Cursor Settings (plain text only)
2. **Project Rules** - `.cursor/rules/*.mdc` files with YAML frontmatter

**Rule Activation Modes:**
- `Always` - Automatically included in all contexts
- `Agent Requested` - AI chooses to include based on task relevance
- `Manual` - Activated via @mention in input box
- `Auto Attached` - Based on file pattern matching

**Rule File Format:**
```yaml
---
description: React component guidelines
globs: "**/*.tsx"
---

- Use functional components with hooks
- Always include prop types
```

**Limits:**
- Individual rule files: 6,000 characters max
- Total combined rules: 12,000 characters max
- Global rules take priority when limit exceeded

**Sources:**
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [Awesome CursorRules GitHub](https://github.com/PatrickJS/awesome-cursorrules)
- [Cursor Rules Best Practices](https://medium.com/@aashari/getting-better-results-from-cursor-ai-with-simple-rules-cbc87346ad88)

---

### Windsurf - Cascade Rules

**Rule Locations:**
1. **Global rules** - `global_rules.md` (applies to all workspaces)
2. **Workspace rules** - `.windsurf/rules/` directory

**Rule Activation Modes:**
- Manual (via @mention)
- Automatic (always applied)
- Pattern-based (tied to file patterns or descriptions)

**Limits:**
- Individual rule files: 6,000 characters max
- Total combined: 12,000 characters max

**Additional Features:**
- Workflows/Rulebooks: Reusable markdown rulebooks with autogenerated slash commands
- `.codeiumignore` for file exclusion (like .gitignore)
- Enterprise: Global `.codeiumignore` in `~/.codeium/` folder

**Sources:**
- [Windsurf Cascade Documentation](https://docs.windsurf.com/windsurf/cascade/cascade)
- [Windsurf Rules Directory](https://windsurf.com/editor/directory)
- [Windsurf Rules & Workflows](https://www.paulmduvall.com/using-windsurf-rules-workflows-and-memories/)

---

### Cline - .clinerules System

**Configuration:**
- `.clinerules` file in project root
- Can also be `.clinerules/` folder with multiple `.md` files

**Example Structure:**
```
your-project/
├── .clinerules/
│   ├── 01-coding.md
│   ├── 02-documentation.md
│   └── current-sprint.md
├── src/
```

**Features:**
- Cline v3.13+ has dedicated popover UI for managing rules
- Toggle rules on/off from chat interface
- Falls back to AGENTS.md if present
- Memory Bank for extended project context

**Slash Commands:**
- `/newrule` - Create a new rule via chat

**Sources:**
- [Cline Rules Documentation](https://docs.cline.bot/features/cline-rules)
- [Cline Prompt Engineering Guide](https://medium.com/@evanmusick.dev/cline-prompt-engineering-crash-course-custom-instructions-that-actually-work-520ef1162fc2)
- [Cline AI Tutorial](https://www.datacamp.com/tutorial/cline-ai)

---

### Aider - Conventions File

**Configuration:**
- Default: `CONVENTIONS.md` in project root
- Custom: `--conventions-file <path>` flag
- Config file: `.aider.conf.yml`

**YAML Config Example:**
```yaml
read: CONVENTIONS.md
# or multiple files
read: [CONVENTIONS.md, anotherfile.txt]
```

**Benefits:**
- Simple, focused approach
- Integrates with Agent Rules standard via `--conventions-file AGENTS.md`
- Auto-linting and testing integration

**Sources:**
- [Aider Conventions Documentation](https://aider.chat/docs/usage/conventions.html)
- [Aider Usage Guide](https://aider.chat/docs/usage.html)

---

## Multi-Agent Frameworks

### CrewAI - YAML-Based Agent Profiles

**Project Structure:**
```
src/<project_name>/
├── config/
│   ├── agents.yaml
│   └── tasks.yaml
├── crew.py
└── main.py
```

**agents.yaml Example:**
```yaml
researcher:
  role: "Senior Research Analyst"
  goal: "Uncover cutting-edge developments in {topic}"
  backstory: "You're a seasoned researcher..."
  tools:
    - search_tool
    - web_scraper
  allow_delegation: true
```

**Key Agent Attributes:**
- `role`, `goal`, `backstory` (required)
- `tools`, `cache`, `max_rpm` (optional)
- `temperature`, `allow_delegation` (optional)
- Memory support for context across runs

**Benefits:**
- YAML separation allows non-technical users to adjust agent properties
- Scales well as complexity grows
- Crew-wide settings like shared working directories

**Sources:**
- [CrewAI Agents Documentation](https://docs.crewai.com/en/concepts/agents)
- [CrewAI YAML Configuration Tutorial](https://codesignal.com/learn/courses/getting-started-with-crewai-agents-and-tasks/lessons/configuring-crewai-agents-and-tasks-with-yaml-files)
- [Customizing Agents in CrewAI](https://docs.crewai.com/how-to/Customizing-Agents/)

---

### MetaGPT - Software Company Simulation

**Built-in Roles:**
- Product Manager
- Architect
- Project Manager
- Engineer
- QA Engineer

**Custom Role Components:**
1. **Actions** - Discrete tasks (writing PRD, conducting research)
2. **Roles** - Responsibilities and action assignments

**Configuration:**
- `~/.metagpt/config2.yaml` for global settings
- Roles defined in Python with `name`, `profile`, `goal`, `constraints`

**Team Assembly:**
```python
team = Team()
team.hire([SimpleCoder(), SimpleTester(), SimpleReviewer()])
team.run_project(idea)
```

**Sources:**
- [MetaGPT GitHub](https://github.com/FoundationAgents/MetaGPT)
- [MetaGPT Introduction](https://docs.deepwisdom.ai/main/en/guide/get_started/introduction.html)
- [MetaGPT Multi-Agent Tutorial](https://github.com/geekan/MetaGPT-docs/blob/main/src/en/guide/tutorials/multi_agent_101.md)

---

### LangChain/LangSmith - Model Profiles and Workspaces

**LangChain 1.1 Features:**
- `.profile` attribute on chat models exposing capabilities
- Capabilities sourced from models.dev (open-source model registry)
- Middleware system for agent customization

**LangSmith Agent Builder:**
- Workspace agents for team sharing and cloning
- One-click cloning of useful agents
- MCP server integration for internal tools
- OAuth authentication for non-technical teams

**Sources:**
- [LangChain 1.1 Changelog](https://changelog.langchain.com/announcements/langchain-1-1)
- [LangSmith Agent Builder Beta](https://blog.langchain.com/langsmith-agent-builder-now-in-public-beta/)
- [LangChain 1.1 Model Profiles](https://medium.com/@theshubhamgoel/langchain-1-1-in-action-model-profiles-middleware-safety-and-production-best-practices-9da365daac06)

---

### AutoGPT - Library Agents and Presets

**Platform Features (v0.4.11+):**
- Library v2 Agents and Presets
- Low-code workflow builder
- Marketplace for pre-built agents
- Goal-driven configuration (up to 5 goals per agent)

**Configuration:**
- API keys in environment variables
- Agent profile with name, goals, and role
- Docker-based deployment

**Sources:**
- [AutoGPT Guide 2025](https://autogpt.net/autogpt-guide-2025/)
- [AutoGPT GitHub](https://github.com/Significant-Gravitas/AutoGPT)

---

## Enterprise and Team Features

### Tabnine

- Centralized visibility and policy enforcement
- Granular access controls per user/team/workspace
- Team-trained models learning from organizational patterns
- Local deployment options for sensitive codebases

### Continue (Open Source)

- Hub for sharing custom assistants
- Organizations can create specialized assistants for internal libraries
- Share coding style across all developers

### Gemini Code Assist (Business)

- Private Google Access, VPC Service Controls
- Granular IAM permissions
- 1M token context window
- Secure enterprise adoption at scale

### Mistral Code

- Team-shared AI configurations
- Consistent assistance across team members
- Reduced onboarding time via shared configurations

**Sources:**
- [Best AI Coding Assistants for Every Team Size](https://www.augmentcode.com/guides/best-ai-coding-assistants-for-every-team-size)
- [Tabnine Enterprise](https://www.tabnine.com/)
- [Gemini Code Assist Business](https://codeassist.google/products/business)

---

## Project Management Agents

### Microsoft Project Manager Agent

- Part of Microsoft Planner
- Runs on Multi-Agent Runtime Service (MARS) built on Microsoft Autogen
- Breaks goals into actionable tasks automatically
- Can execute tasks on user's behalf

### Epicflow Epica

- Tracks progress across multiple projects
- Detects bottlenecks and sends alerts
- Designed for complex portfolio and resource management

**Sources:**
- [Microsoft Planner Agent](https://techcommunity.microsoft.com/blog/plannerblog/unleashing-the-power-of-agents-in-microsoft-planner/4304794)
- [AI Agents for Project Management - Epicflow](https://www.epicflow.com/blog/ai-agents-for-project-management/)

---

## Comparison Matrix

| Tool | Config File | Hierarchy | Team Sharing | Pattern Matching |
|------|-------------|-----------|--------------|------------------|
| Claude Code | CLAUDE.md, .claude/ | Yes (nested) | Via Git | No |
| GitHub Copilot | .github/\*, AGENTS.md | Yes | Via Git | Yes (globs) |
| Cursor | .cursor/rules/\*.mdc | Yes | Via Git | Yes (globs) |
| Windsurf | .windsurf/rules/ | Yes | Via Git | Yes |
| Cline | .clinerules/ | Yes | Via Git | No |
| Aider | CONVENTIONS.md | No | Via Git | No |
| CrewAI | config/agents.yaml | No | Via Git | No |
| MetaGPT | config2.yaml | No | Via Code | No |

---

## Key Patterns and Recommendations

### 1. Adopt AGENTS.md for Cross-Tool Compatibility
If using multiple AI tools, maintain an AGENTS.md file alongside tool-specific configs. Most tools will read it as fallback or primary configuration.

### 2. Use Hierarchical Configuration
Most modern tools support nested configuration files. Leverage this for:
- Monorepo setups (different rules per package)
- Team overrides (project rules + personal preferences)
- Sprint-specific configurations

### 3. Version Control Your Configurations
All major tools store configurations as files that can be committed. Benefits:
- Consistency across team
- Change tracking
- Pull request reviews for rule changes

### 4. Separate Concerns
Recommended organization:
- **Global:** Personal preferences (editor settings, communication style)
- **Project:** Coding standards, architecture decisions, build commands
- **Directory:** Technology-specific rules (e.g., React patterns in `/frontend`)

### 5. Start Simple, Iterate
From GitHub's analysis of 2,500+ repositories:
> "The best agent files grow through iteration, not upfront planning."

### 6. Consider Agent-Specific Instructions
For tools like GitHub Copilot that have multiple agents (coding, code review), use `excludeAgent` or similar filters to tailor instructions per agent type.

---

## Research Date
January 2026

## Related Research
- [Agentic Project Management (APM)](https://github.com/sdi2200262/agentic-project-management)
- [Agent Rules Community Standard](https://github.com/agent-rules/agent-rules)
- [Models.dev - Model Capability Registry](https://models.dev)
