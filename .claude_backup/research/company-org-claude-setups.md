# Company/Organization Claude Code Setups - Deep Research

## Research Summary

This document compiles publicly shared Claude Code setups from companies, organizations, startups, and consultancies. It includes engineering blog posts, open-source agent collections, and enterprise templates.

---

## Enterprise Adopters with Public Case Studies

### 1. Treasure Data

**Company**: Treasure Data (Customer Data Platform company)
**What they shared**: Engineering blog post + open-source TD Skills for Claude Code
**Industry/Domain**: Data infrastructure, CDP

**Blog Post**: https://www.treasuredata.com/blog/engineering-team-agentic-ai/

**Key Details**:
- Over 80% of engineering team adopted Claude Code
- Senior principal engineer built new MCP server in one day (previously took weeks)
- 10x productivity goal became reality
- Other departments like customer support also benefiting

**Open Source Repository**: https://github.com/treasure-data/td-skills
- Treasure Data Skills for Claude Code to enhance productivity with TD-specific tools
- Skills teach Claude how to use their tools and follow their best practices
- Related tool: https://github.com/treasure-data/aps_claude_tools

---

### 2. TELUS

**Company**: TELUS (Canadian telecom and healthcare services - 57,000 employees)
**What they shared**: Enterprise deployment case study
**Industry/Domain**: Telecommunications, Healthcare

**Key Details**:
- Deployed Claude Code to 57,000 employees via internal "Fuel iX" platform
- Achieved 30% faster pull request turnaround times
- Developers leverage Claude Code directly within VS Code and GitHub
- Processes over 100 billion tokens per month
- Integration path: Claude Enterprise via MCP connectors and Bedrock hosting

**Source**: DevOps.com article on enterprise deployments

---

### 3. Altana

**Company**: Altana (AI-powered supply chain networks)
**What they shared**: Enterprise adoption results
**Industry/Domain**: Supply chain, AI/ML

**Key Details**:
- Development velocity improvements of 2-10x across engineering teams
- "We're taking on significantly more ambitious projects as a result" - Peter Swartz, Co-founder and Chief Science Officer

**Source**: Anthropic enterprise announcements

---

### 4. Behavox

**Company**: Behavox (Compliance and security company)
**What they shared**: Enterprise rollout case study
**Industry/Domain**: Financial compliance, Security

**Key Details**:
- Rolled out to hundreds of developers
- "It has quickly become our go-to pair programmer" - Artem Pikulin, Senior Manager of Machine Learning Operations

**Source**: DevOps.com enterprise coverage

---

### 5. IG Group

**Company**: IG Group (Global online trading and financial services)
**What they shared**: Customer story and productivity metrics
**Industry/Domain**: Financial services, Trading

**Customer Story URL**: https://claude.com/customers/ig-group

**Key Details**:
- Analytics team saves ~70 hours weekly through AI-assisted workflows
- Marketing teams achieved triple-digit improvements in speed-to-market
- Full ROI within three months
- Reduced dependence on external agencies
- Doubled productivity in certain use cases

---

### 6. Coder

**Company**: Coder (Cloud development environments)
**What they shared**: Claude Code Tasks integration
**Industry/Domain**: DevOps, Cloud infrastructure

**Blog Post**: https://coder.com/blog/launch-dec-2025-coder-tasks

**Key Details**:
- Integrated Claude Code as background agent for GitHub Issues workflow
- Powers secure, scalable development across automotive, finance, government, and technology
- Workflow: GitHub Issue label triggers Coder Task running Claude Code as background agent
- Agent picks up issue, reads description/comments/context from GitHub
- Opens PR when finished, notifies if stuck

**Architecture**:
- Every AI-generated pull request reviewed by human expert
- Process can repeat or be corrected manually
- Runs in isolated sandbox with network and filesystem restrictions

---

### 7. Accenture (Anthropic Partnership)

**Company**: Accenture (Global consulting firm)
**What they shared**: Enterprise partnership and training program
**Industry/Domain**: Consulting, Enterprise services

**Source**: https://www.anthropic.com/news/anthropic-accenture-partnership

**Key Details**:
- Formed "Accenture Anthropic Business Group"
- ~30,000 Accenture professionals receiving Claude training
- Creating one of largest ecosystems of Claude practitioners
- Claude Code at center of enterprise software development lifecycle
- Framework to quantify productivity gains and ROI
- Workflow redesign for AI-first development teams

---

## Startups with Open-Sourced Claude Code Configurations

### 8. Snapbar / OneRedOak (Patrick Ellis)

**Company**: Snapbar (AI-native event marketing platform)
**Creator**: Patrick Ellis (CTO & Co-Founder, Forbes 30 Under 30)
**What they shared**: Production Claude Code workflows from AI-native startup
**Industry/Domain**: Event marketing, Photography

**GitHub Repository**: https://github.com/OneRedOak/claude-code-workflows

**Agents/Workflows Included**:
1. **Automated Code Review System** - Dual-loop architecture with slash commands and GitHub Actions
2. **Security Review System** - Automated vulnerability identification
3. **Design Review System** - Uses Playwright MCP for front-end code review

**Key Insights**:
- Uses Playwright MCP for autonomous front-end iteration
- Adds "Please use the playwright MCP server when making visual changes" to CLAUDE.md
- Workflows covered with tutorials on Patrick Ellis' YouTube channel

**Clients**: Disney, Nike, Coca-Cola, Google, Meta, Microsoft, Amazon, FIFA

---

### 9. Asterisk (Y Combinator S24)

**Company**: Asterisk (YC S24 startup)
**What they shared**: Claudia - Open source GUI for Claude Code
**Industry/Domain**: Developer tools, AI tooling

**Product URL**: https://claudia.so/
**GitHub Repository**: https://github.com/getAsterisk/claudia (19.1k stars, 1.5k forks)

**Features**:
- Interactive GUI for Claude Code sessions
- Custom AI agent creation
- Sandboxed execution environments
- Real-time usage analytics
- Built-in CLAUDE.md editor with live preview
- Project and session management

**Tech Stack**: Tauri 2, React 18, TypeScript, Rust
**License**: AGPL-3.0

---

### 10. Loki Mode (asklokesh)

**Creator**: asklokesh
**What they shared**: 37-agent autonomous startup building system
**Industry/Domain**: Startup automation, Full-stack development

**GitHub Repository**: https://github.com/asklokesh/claudeskill-loki-mode
**DEV.to Article**: https://dev.to/asklokesh/how-i-built-an-autonomous-ai-startup-system-with-37-agents-using-claude-code-2p79

**Key Details**:
- 37 specialized AI agent types across 6 swarms
- RARV cycle (Reason-Act-Reflect-Verify) with self-verification
- 100+ agents working simultaneously
- Circuit breakers borrowed from distributed systems design
- Dead letter queue for failed tasks

**Workflow**: PRD → Research → Architecture → Development → Testing → Deployment → Marketing → Revenue
**License**: MIT

---

### 11. Automaze.io (CCPM)

**Company**: Automaze.io
**What they shared**: Claude Code Project Manager
**Industry/Domain**: Project management, Developer tools

**GitHub Repository**: https://github.com/automazeio/ccpm (3.4k stars, 338 forks)

**Key Features**:
- Uses GitHub Issues as database
- Git worktrees for parallel agent execution
- Multiple Claude instances working simultaneously
- Complete audit trail: PRD → Epic → Task → Issue → Code → Commit
- ~50 bash scripts and markdown implementation

**Installation**: `curl -sSL https://automaze.io/ccpm/install | bash`

---

### 12. Anand Chowdhary (continuous-claude)

**Creator**: Anand Chowdhary
**What they shared**: Autonomous Claude Code loop for PRs
**Industry/Domain**: DevOps, CI/CD automation

**GitHub Repository**: https://github.com/AnandChowdhary/continuous-claude (1.1k stars, 76 forks)
**Blog Post**: https://anandchowdhary.com/blog/2025/running-claude-code-in-a-loop

**Key Features**:
- Runs Claude Code in continuous loop
- Autonomously creates PRs, waits for checks, merges
- SHARED_TASK_NOTES.md for context preservation between iterations
- Supports cost budgets and duration limits

**Use Case**: Built to write unit tests for codebase with hundreds of thousands of lines, going from 0% to 80%+ coverage

---

## Developer Tool Companies with Claude Code Integrations

### 13. Daniel Avila (davila7/claude-code-templates)

**Creator**: Daniel Avila (LatinXinAI)
**What they shared**: Comprehensive CLI tool and templates
**Industry/Domain**: Developer tools, AI templates

**GitHub Repository**: https://github.com/davila7/claude-code-templates (7.5k stars, 646 forks)
**Web Interface**: https://www.aitmpl.com/
**Medium Guide**: https://medium.com/latinxinai/complete-guide-to-claude-code-templates-4e53d6688b34

**Agents Included (160+)**:
- `development-team/` - Full-stack developers, architects
- `domain-experts/` - Security, performance, accessibility specialists
- `creative-team/` - Content creators, designers
- `business-team/` - Product managers, analysts
- `development-tools/` - Tool specialists, DevOps experts

**Key Feature**: Docker Sandbox Provider for isolated execution (v1.27.0+)

---

### 14. ruvnet (Claude-Flow)

**Creator**: Reuven Cohen (ruvnet)
**What they shared**: Enterprise-grade agent orchestration platform
**Industry/Domain**: AI orchestration, Enterprise tools

**GitHub Repository**: https://github.com/ruvnet/claude-flow

**Key Features**:
- 64-agent system across 12 categories
- Hive-mind swarm intelligence
- 87+ MCP tools
- Stream-json chaining for real-time agent-to-agent communication
- Enterprise topology support

**Example Result**: ~150k lines of code built with swarm in two days

---

### 15. Seth Hobson (wshobson/agents)

**Creator**: Seth Hobson
**What they shared**: Production-ready multi-agent orchestration system
**Industry/Domain**: Software development, Multi-agent systems

**GitHub Repository**: https://github.com/wshobson/agents

**Contents**:
- 99 specialized AI agents
- 15 multi-agent workflow orchestrators
- 107 agent skills
- 71 development tools
- 67 focused, single-purpose plugins

**Agent Categories**: Architecture, Languages, Infrastructure, Quality, Data/AI, Documentation, Business Operations, SEO

**Model Strategy**: Three-tier (Opus, Sonnet, Haiku) optimization

---

### 16. VoltAgent (awesome-claude-code-subagents)

**Organization**: VoltAgent
**What they shared**: Definitive collection of Claude Code subagents
**Industry/Domain**: Full-stack development, DevOps, Data science

**GitHub Repository**: https://github.com/VoltAgent/awesome-claude-code-subagents (5.9k stars, 639 forks)

**Agent Categories (100+)**:
- Core Development
- Language Specialists
- Infrastructure (DevOps, cloud, deployment)
- Quality & Security
- Data & AI
- Meta-Orchestration
- Research & Analysis

**Key Feature**: Independent context windows preventing cross-contamination

---

### 17. lst97 (claude-code-sub-agents)

**Creator**: lst97
**What they shared**: Personal full-stack development subagents
**Industry/Domain**: Full-stack development

**GitHub Repository**: https://github.com/lst97/claude-code-sub-agents (~1k stars, 185 forks)

**Key Features**:
- 33 specialized AI subagents
- Intelligent Auto-Delegation
- Multi-Agent Orchestration
- Agent Organizer system for team assembly
- Enterprise-scale 7-agent orchestration examples

**Example**: "Implement user authentication" auto-selects: backend-architect → security-auditor → test-automator

---

### 18. lodetomasi (agents-claude-code)

**Creator**: lodetomasi
**What they shared**: 100 hyper-specialized AI agents
**Industry/Domain**: Full-stack development

**GitHub Repository**: https://github.com/lodetomasi/agents-claude-code

**Key Features**:
- 100 AI-powered specialists
- Experts in React, AWS, Kubernetes, ML, Security & more
- Each agent uses ideal model (Opus/Sonnet/Haiku) automatically
- Zero configuration required

---

### 19. SuperClaude Framework

**Organization**: SuperClaude-Org
**What they shared**: Meta-programming configuration framework
**Industry/Domain**: Developer productivity

**GitHub Repository**: https://github.com/SuperClaude-Org/SuperClaude_Framework

**Key Features**:
- Behavioral instruction injection
- Component orchestration
- Cognitive personas
- Specialized commands
- Development methodologies

---

### 20. The Agentic Startup (nategarelik)

**Creator**: nategarelik
**What they shared**: High-energy startup Claude Code configuration
**Industry/Domain**: Startup development

**GitHub Repository**: https://github.com/nategarelik/agentic-startup-claude-config

**Key Features**:
- 11 Role Archetypes
- 5 specialized subagents
- Parallel execution
- Enterprise safety
- Activity-based agent collaboration

---

## Platform Integrations

### 21. Vercel

**Company**: Vercel
**What they shared**: Next.js DevTools MCP Server + AI Gateway integration
**Industry/Domain**: Cloud platform, Frontend

**Repository**: https://github.com/vercel/next-devtools-mcp
**Documentation**: https://vercel.com/docs/ai-gateway/claude-code

**Key Details**:
- MCP server for Next.js development tools
- Claude Code support in AI Gateway
- Coding Agent Platform template
- Collaboration with Anthropic on Claude Sonnet 4.5

---

### 22. Blockhead Consulting

**Company**: Blockhead Consulting
**What they shared**: Multi-agent workflow for 400K+ lines of code
**Industry/Domain**: Software consulting

**Blog Post**: https://blockhead.consulting/blog/claude_code_workflow_july_2025

**Key Workflow Details**:
- 4 Claude Code instances in split terminal windows
- Each agent given staff engineer role identity
- Required to run linter, analyzer, build and test before completion
- Self-review asking: "Does your work reflect staff engineer quality?"
- Project structure: `project-overview/`, `ai_docs/`, `planning/`, git submodules

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Enterprise Case Studies | 7 |
| Startup Open-Source Configs | 5 |
| Developer Tool Projects | 9 |
| Platform Integrations | 2 |
| **Total Organizations** | **23** |

## Key Patterns Observed

1. **CLAUDE.md as Team Documentation**: Almost all setups emphasize maintaining a CLAUDE.md file checked into git
2. **Multi-Agent Architectures**: Trend toward specialized agents over single general-purpose Claude
3. **GitHub Integration**: Heavy use of GitHub Issues/PRs as coordination mechanism
4. **Parallel Execution**: Multiple Claude instances in split terminals or worktrees
5. **Quality Gates**: Automated linting, testing, and self-review before completion
6. **Domain Specialization**: Agents organized by function (frontend, backend, security, etc.)

## Sources

- [Anthropic Engineering Blog](https://www.anthropic.com/engineering/claude-code-best-practices)
- [How Anthropic Teams Use Claude Code](https://www.anthropic.com/news/how-anthropic-teams-use-claude-code)
- [Treasure Data Engineering Blog](https://www.treasuredata.com/blog/engineering-team-agentic-ai/)
- [IG Group Customer Story](https://claude.com/customers/ig-group)
- [DevOps.com Enterprise Coverage](https://devops.com/enterprise-ai-development-gets-a-major-upgrade-claude-code-now-bundled-with-team-and-enterprise-plans/)
- [Coder Launch Week Blog](https://coder.com/blog/launch-dec-2025-coder-tasks)
- [Accenture-Anthropic Partnership](https://www.anthropic.com/news/anthropic-accenture-partnership)
- [VentureBeat - Claude Code Creator Workflow](https://venturebeat.com/technology/the-creator-of-claude-code-just-revealed-his-workflow-and-developers-are)
- [Blockhead Consulting Blog](https://blockhead.consulting/blog/claude_code_workflow_july_2025)
