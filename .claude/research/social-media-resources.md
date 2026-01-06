# Claude Code Agent/Skill Resources on Social Media

## Research Date: January 6, 2026

This document catalogs Claude Code agent and skill resources shared across Twitter/X, YouTube, Discord, and other social platforms.

---

## Twitter/X Resources

### Boris Cherny (Creator of Claude Code)
- **Platform**: Twitter/X
- **Author**: @bcherny
- **Thread**: https://twitter-thread.com/t/2007179832300581177
- **Key Shared Configurations**:
  - Runs 5 Claudes in parallel in terminal, numbered tabs 1-5
  - Uses system notifications to know when Claude needs input
  - Runs 5-10 Claudes on claude.ai/code in parallel with local Claudes
  - Uses `--teleport` to switch between local and web sessions
  - Uses Opus 4.5 with thinking for everything
  - Team shares a single CLAUDE.md checked into git
  - Starts most sessions in Plan mode (shift+tab twice)
  - Uses `--permission-mode=dontAsk` or `--dangerously-skip-permissions` in sandboxes
  - Uses ralph-wiggum plugin for long-running tasks

### Ian Nuttall (@iannuttall)
- **Platform**: Twitter/X
- **Author**: @iannuttall
- **GitHub**: https://github.com/iannuttall

#### Shared Resources:
1. **7 Custom Subagents** (https://x.com/iannuttall/status/1948702664348631446)
   - code-refactorer
   - prd-writer
   - project-task-planner
   - vibe-coding-coach
   - security-auditor
   - frontend-designer
   - content-writer

2. **Settings Configuration** (https://x.com/iannuttall/status/1947966680086528336)
   - Pro tip: Use `~/.claude/settings.json` for safe tools whitelist
   - Example settings shared in thread

3. **Ultrathink Slash Command** (https://x.com/iannuttall/status/1940458814085779905)
   - Spins up 4 sub-agents to process and plan tasks

4. **Kimi K2 Integration** (https://x.com/iannuttall/status/1944705474059718789)
   - How to use Kimi K2 as your agent by changing base URL

5. **VibeTunnel Remote Management** (https://x.com/iannuttall/status/1946556134573412735)
   - Manage agents remotely using phone or browser

### Numman Ali (@nummanali)
- **Platform**: Twitter/X
- **Thread**: https://x.com/nummanali/status/2007768692659015877
- **Content**: Claude Code Official Multi Agent Orchestration
  - Describes a disabled feature enabled through CC Mirror
  - Called "simple yet powerful" and claims it "beats every orchestration I've seen"
  - CC Mirror updates shared

### Nityesh (@nityeshaga)
- **Platform**: Twitter/X
- **Thread**: https://x.com/nityeshaga/status/1980635966776684613
- **Content**: Claude Skills deep dive
  - Describes Skills as "the best way to package custom instructions and code for the agent"
  - Used skill-creator skill to create custom skills
  - Prefers skills over subagents due to context handling

### Mark Fayngersh (@pheuter)
- **Platform**: Twitter/X
- **Thread**: https://x.com/pheuter/status/1991944983687946702
- **Content**: Claude Agent Desktop
  - Thin wrapper around Claude Agent SDK and Skills
  - Available for macOS/Windows
  - Node, Python, Git, and bash tools bundled
  - Work happens in shared Desktop folder

### Riley Brown (@rileybrown_ai)
- **Platform**: Twitter/X and YouTube
- **Threads**:
  - https://x.com/rileybrown_ai/status/1948846549913796650
  - https://x.com/rileybrown_ai/status/1960419350554562578
- **Content**:
  - Claude Code as "best coding agent AND general agent"
  - Setup tutorials covering Research + Content, Obsidian integration, Vercel/GitHub deployment
  - Built mac app, CLI tool, mobile app, research report, and website without code

---

## YouTube Resources

### SeanMatthewAI
- **Platform**: YouTube
- **Channel**: https://www.youtube.com/@SeanMatthewAI
- **Content**: Claude Code Subagents Tutorial

#### GitHub Repositories:
1. **subagent-demo** (https://github.com/SeanMatthewAI/subagent-demo)
   - Demonstrates 3 specialized subagents working together
   - Includes:
     - Frontend Architect (UI building)
     - Database Agent (Supabase integration)
     - BugBot QA Specialist (testing, security scanning)

2. **claude-code-guide** (https://github.com/SeanMatthewAI/claude-code-guide)
   - Repo for AI Coding Fundamentals Series
   - Covers CLAUDE.md optimization and permission management

### ZazenCodes
- **Platform**: YouTube + Substack
- **Substack**: https://zazencodes.substack.com/

#### Shared Resources:
1. **Claude Code Sub Agents Tutorial** (https://zazencodes.substack.com/p/claude-code-sub-agents-tutorial)
   - Introduction to Sub Agents purpose
   - Context preservation demonstration
   - MCP Server Unit Converter use case
   - Product Manager Agent (read-only)
   - Software Engineer Agent (full access)
   - Test Runner Agent

2. **3 Sub Agents You Can Steal** (https://zazencodes.substack.com/p/3-sub-agents-you-can-steal-python)
   - System-Wide Sub Agent creation
   - Adhoc Python Script Writer
   - Anime Quote Py Script Demo
   - Dataviz Demo
   - MCP Starter Kit Demo

### Riley Brown
- **Platform**: YouTube
- **Twitter**: @rileybrown_ai
- **Videos**:
  - Claude Code Setup & General Agent usage
  - Integration with Obsidian
  - Building/deploying web apps with Vercel/GitHub
  - Database & Auth with Firebase
  - Claude Code vs Cursor comparison
  - Building 5 different apps without writing code

---

## Discord Communities

### Official Claude Developers Discord
- **Platform**: Discord
- **Link**: https://discord.com/invite/6PPFFzqPDZ
- **Members**: ~50,000+
- **Content**: Collaboration for AI users and developers

### claude-code-discord Bot
- **Platform**: Discord
- **GitHub**: https://github.com/zebbern/claude-code-discord
- **Features**:
  - Brings Claude Code to Discord channels
  - 48 commands including `/claude`, `/claude-enhanced`, `/claude-models`
  - `/agent` with 7 specialized AI agents
  - Run shell/git commands and manage branches
  - Works from local, VM, or Docker instances

### VoltAgent Community
- **Platform**: Discord (linked from GitHub)
- **GitHub**: https://github.com/VoltAgent/awesome-claude-code-subagents
- **Content**: 100+ specialized AI agents

---

## GitHub Gists with Agent Configurations

### wshobson - User-Level CLAUDE.md Config
- **Link**: https://gist.github.com/wshobson/011992e50f39e48600917ddc0db389f4
- **Content**: User-level config at `~/.claude/CLAUDE.md`
  - Directory structure recommendations
  - Orchestration rules
  - Memory patterns
  - Decision logs
  - Custom subagents setup

### Danm72 - Claude Code Custom Agents Setup
- **Link**: https://gist.github.com/Danm72/314a7f79b27b1fe536a2fe4e30f57446
- **Content**: Instructions for setting up custom agents

### Danm72 - Custom Agents Collection
- **Link**: https://gist.github.com/Danm72/7cdd172f818505b221988916ebdc9371
- **Content**: Collection of custom agent configurations

### tomas-rampas - Sub-Agent Delegation Setup
- **Link**: https://gist.github.com/tomas-rampas/a79213bb4cf59722e45eab7aa45f155c
- **Content**:
  - Agent usage rules for CLAUDE.md
  - plan-agent for planning
  - reader-agent for file reading
  - maker-agent for code writing
  - security-agent for security analysis

### ThomasRohde - Agent Creation Guide
- **Link**: https://gist.github.com/ThomasRohde/af9d281a7a8c73e37448e1a94485eb0c
- **Content**: Creating high-quality specialized Claude agents
  - 12-section agent structure
  - Pattern following from CLAUDE.md

### alirezarezvani - Ultimate Extension Guide
- **Link**: https://gist.github.com/alirezarezvani/a0f6e0a984d4a4adc4842bbe124c5935
- **Content**: Guide covering Tresor, Skill Factory, Skills Library (26+ packages)

---

## Dotfiles with CLAUDE.md Configurations

### harperreed/dotfiles
- **Link**: https://github.com/harperreed/dotfiles/blob/master/.claude/CLAUDE.md
- **Content**: Creative CLAUDE.md with fun instructions

### citypaul/.dotfiles
- **Link**: https://github.com/citypaul/.dotfiles/blob/main/claude/.claude/CLAUDE.md
- **Content**: Modular CLAUDE.md approach
  - Core principles in main file
  - Detailed guidelines in separate files
  - Imports via `@~/.claude/docs/`

---

## Skills Marketplaces & Collections

### SkillsMP.com
- **Link**: https://skillsmp.com/
- **Content**: 25,000+ agent skills
  - Compatible with Claude Code, Codex CLI, ChatGPT
  - Open standard SKILL.md format
  - One-command installation via marketplace.json

### claude-plugins.dev
- **Link**: https://claude-plugins.dev/skills
- **Content**: 55,229+ skills
  - Auto-indexed, open-source
  - Community-maintained
  - Works with Claude, Cursor, OpenCode, Codex

### buildwithclaude.com
- **Link**: https://www.buildwithclaude.com/
- **Content**: Claude Code Subagents & Commands Collection
  - Complete subagent collection
  - Domain experts and productivity tools

### dotclaude.com
- **Link**: https://dotclaude.com/
- **Content**:
  - Sub-agents for parallel execution
  - Plugins bundling commands, agents, MCP servers
  - CLAUDE.md templates
  - Hooks and workflows

### aitmpl.com (Claude Code Templates)
- **Link**: https://www.aitmpl.com/
- **GitHub**: https://github.com/davila7/claude-code-templates
- **Content**: 100+ templates
  - AI agents
  - Custom commands
  - Settings and hooks
  - External integrations (MCPs)
  - Project templates

---

## Major GitHub Repository Collections

### wshobson/agents (17,600+ stars)
- **Link**: https://github.com/wshobson/agents
- **Content**:
  - 99 specialized AI agents
  - 15 multi-agent workflow orchestrators
  - 107 agent skills
  - 71 development tools
  - 67 focused plugins

### wshobson/commands
- **Link**: https://github.com/wshobson/commands
- **Content**: 57 production-ready slash commands
  - 15 workflows (multi-agent orchestration)
  - 42 tools (single-purpose utilities)
- **Install**: `cd ~/.claude && git clone https://github.com/wshobson/commands.git`

### iannuttall/claude-agents (248 stars)
- **Link**: https://github.com/iannuttall
- **Content**: Community favorite subagents

### VoltAgent/awesome-claude-code-subagents
- **Link**: https://github.com/VoltAgent/awesome-claude-code-subagents
- **Content**: 100+ specialized agents
  - Full-stack development
  - DevOps
  - Data science
  - Business operations

### hesreallyhim/awesome-claude-code
- **Link**: https://github.com/hesreallyhim/awesome-claude-code
- **Content**: Curated commands, files, workflows
  - Subagent orchestration
  - Progressive skills
  - Parallel tool calling
  - Master-clone architecture

### qdhenry/Claude-Command-Suite
- **Link**: https://github.com/qdhenry/Claude-Command-Suite
- **Content**:
  - 148+ slash commands
  - 54 AI agents
  - Claude Code Skills
  - Automated workflows

### alirezarezvani/claude-code-tresor
- **Link**: https://github.com/alirezarezvani/claude-code-tresor
- **Content**: v2.7.0 (Dec 2025)
  - Autonomous skills
  - Expert agents
  - Slash commands
  - 10 orchestration commands

### alirezarezvani/claude-code-skill-factory
- **Link**: https://github.com/alirezarezvani/claude-code-skill-factory
- **Content**: Build production-ready skills/agents at scale

### anthropics/skills (Official)
- **Link**: https://github.com/anthropics/skills
- **Content**: Official Anthropic skills repository
  - Creative applications (art, music, design)
  - Technical tasks (testing, MCP generation)
  - Enterprise workflows

### baryhuang/claude-code-by-agents
- **Link**: https://github.com/baryhuang/claude-code-by-agents
- **Content**: Multi-agent orchestration desktop app
  - @agent-name mentions for execution
  - Automatic task decomposition
  - Mix local and remote agents
  - No API key required (uses Claude CLI auth)

### ruvnet/claude-flow
- **Link**: https://github.com/ruvnet/claude-flow
- **Content**: Claude-Flow v2.7
  - Hive-mind swarm intelligence
  - Persistent memory
  - 100+ advanced MCP tools
  - Enterprise-grade architecture

---

## Blogs and Tutorials with Downloadable Resources

### Daily Dose of Data Science (Avi Chawla)
- **Link**: https://blog.dailydoseofds.com/p/sub-agents-in-claude-code
- **Content**: Code reviewer subagent with Claude Context MCP

### alexop.dev
- **Link**: https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/
- **Content**: CLAUDE.md, skills, subagents guide

### Creator Economy
- **Link**: https://creatoreconomy.so/p/claude-code-tutorial-build-a-youtube-research-agent-in-15-min
- **Content**: YouTube Research Agent tutorial with slash commands

### Sider.ai
- **Link**: https://sider.ai/blog/ai-tools/step-by-step-building-a-youtube-research-agent-with-claude-code
- **Content**: Step-by-step YouTube Research Agent guide

---

## Key Takeaways

### Installation Methods
1. **Project-level agents**: Copy to `.claude/agents/`
2. **Global agents**: Copy to `~/.claude/agents/`
3. **Plugin marketplace**: `/plugin marketplace add repo-name`
4. **Direct install**: `/plugin install skill-name@marketplace`
5. **Git clone**: `cd ~/.claude && git clone repo-url`

### Most Popular Agent Types
1. Code reviewer/refactorer
2. Security auditor
3. Frontend/UI designer
4. Database specialist
5. Test runner/QA
6. PRD/documentation writer
7. Project planner
8. Research agent

### Configuration Best Practices (from Twitter threads)
1. Use `~/.claude/settings.json` for safe tools whitelist
2. Share CLAUDE.md via git for team consistency
3. Start sessions in Plan mode for complex tasks
4. Use parallel agents for large codebases
5. Give Claude a way to verify its work
6. Use subagents for context isolation
