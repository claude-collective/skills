# Claude Code MCP Servers, Plugins, and Extension Ecosystem - Deep Research

## Executive Summary

The Claude Code extension ecosystem is rapidly maturing, with multiple categories of extensions:
1. **MCP (Model Context Protocol) Servers** - Connect Claude Code to external tools, databases, and APIs
2. **Plugins** - Bundles of commands, agents, skills, hooks, and MCP configurations
3. **Plugin Marketplaces** - Curated directories for discovering and installing plugins
4. **Hooks** - Event handlers that trigger at specific workflow points
5. **Slash Commands** - Custom shortcuts for frequently-used operations
6. **Skills** - Pre-built capabilities for specialized tasks

---

## I. MCP (Model Context Protocol) Servers

### Official MCP Resources

| Resource | Type | Stars | Description | URL |
|----------|------|-------|-------------|-----|
| **modelcontextprotocol/servers** | Official Repo | N/A | Reference MCP servers maintained by MCP steering group | https://github.com/modelcontextprotocol/servers |
| **MCP Registry** | Official Registry | N/A | Official registry for discovering MCP servers | https://registry.modelcontextprotocol.io |
| **microsoft/mcp** | Official MS Repo | N/A | Catalog of official Microsoft MCP server implementations | https://github.com/microsoft/mcp |

### Official Reference MCP Servers

| Server | Description |
|--------|-------------|
| **server-fetch** | Web content fetching and conversion for efficient LLM usage |
| **server-filesystem** | Secure file operations with configurable access controls |
| **server-git** | Tools to read, search, and manipulate Git repositories |
| **server-github** | GitHub integration - PRs, issues, repos |
| **server-memory** | Knowledge graph-based persistent memory system |
| **server-sequential-thinking** | Dynamic and reflective problem-solving through thought sequences |
| **Everything** | Reference/test server with prompts, resources, and tools |

### Popular Third-Party MCP Servers

| Repo/Package | Stars | Description | URL |
|--------------|-------|-------------|-----|
| **punkpeye/awesome-mcp-servers** | 76,500 | Largest curated collection of MCP servers (500+ servers) | https://github.com/punkpeye/awesome-mcp-servers |
| **steipete/claude-code-mcp** | 970 | Claude Code as one-shot MCP server ("agent in your agent") | https://github.com/steipete/claude-code-mcp |
| **wonderwhy-er/DesktopCommanderMCP** | N/A | Terminal control, file system search, diff file editing | https://github.com/wonderwhy-er/DesktopCommanderMCP |
| **doobidoo/mcp-memory-service** | N/A | Automatic context memory across sessions | https://github.com/doobidoo/mcp-memory-service |
| **mkreyman/mcp-memory-keeper** | N/A | Persistent context management for Claude | https://github.com/mkreyman/mcp-memory-keeper |
| **supabase-community/supabase-mcp** | N/A | Supabase database integration | https://github.com/supabase-community/supabase-mcp |
| **makenotion/notion-mcp-server** | N/A | Official Notion MCP Server | https://github.com/makenotion/notion-mcp-server |

### MCP Server Directories/Aggregators

| Site | Description | URL |
|------|-------------|-----|
| **MCPServers.org** | Community collection of MCP servers | https://mcpservers.org |
| **MCPcat.io** | MCP server guides and directory | https://mcpcat.io |
| **mcp.so** | MCP server discovery platform | https://mcp.so |
| **smithery.ai** | MCP server marketplace | https://smithery.ai |

---

## II. Plugin Marketplaces

### Official Anthropic Plugin Resources

| Resource | Description | URL |
|----------|-------------|-----|
| **anthropics/claude-code/plugins** | Official example plugins in main repo | https://github.com/anthropics/claude-code/tree/main/plugins |
| **anthropics/claude-plugins-official** | Anthropic-managed high-quality plugins directory | https://github.com/anthropics/claude-plugins-official |
| **anthropics/skills** | Official public repository for Agent Skills | https://github.com/anthropics/skills |

### ccplugins Organization

| Repo | Description | URL |
|------|-------------|-----|
| **ccplugins/awesome-claude-code-plugins** | Curated list of slash commands, subagents, MCP servers, hooks | https://github.com/ccplugins/awesome-claude-code-plugins |
| **ccplugins/marketplace** | Claude Code Plugins Marketplace - curated plugins only | https://github.com/ccplugins/marketplace |

### Community Plugin Marketplaces (GitHub)

| Repo | Stars | Description | URL |
|------|-------|-------------|-----|
| **wshobson/agents** | N/A | 67 plugins, 99 agents, 107 skills - intelligent automation | https://github.com/wshobson/agents |
| **wshobson/commands** | N/A | Production-ready slash commands collection | https://github.com/wshobson/commands |
| **zpaper-com/ClaudeKit** | N/A | 12 agents, 7 workflow commands, 3 hooks | https://github.com/zpaper-com/ClaudeKit |
| **Dev-GOM/claude-code-marketplace** | N/A | Hooks, commands, agents for developer productivity | https://github.com/Dev-GOM/claude-code-marketplace |
| **kivilaid/plugin-marketplace** | N/A | 100+ plugins showcasing all component types | https://github.com/kivilaid/plugin-marketplace |
| **claude-market/marketplace** | N/A | Hand-curated open source marketplace | https://github.com/claude-market/marketplace |
| **claudebase/marketplace** | N/A | 24 skills, 14 agents, 21 commands | https://github.com/claudebase/marketplace |
| **netresearch/claude-code-marketplace** | N/A | Curated Agent Skills by Netresearch | https://github.com/netresearch/claude-code-marketplace |
| **jeremylongshore/claude-code-plugins-plus-skills** | N/A | 739 Agent Skills, Jupyter tutorials | https://github.com/jeremylongshore/claude-code-plugins-plus-skills |
| **feiskyer/claude-code-settings** | 991 | Settings, commands, agents for "vibe coding" | https://github.com/feiskyer/claude-code-settings |
| **halans/cc-marketplace-boilerplate** | N/A | Marketplace boilerplate template | https://github.com/halans/cc-marketplace-boilerplate |

### Plugin Marketplace Websites

| Website | Description | URL |
|---------|-------------|-----|
| **claudecodeplugin.com** | Plugin directory & skills marketplace | https://www.claudecodeplugin.com |
| **claudemarketplaces.com** | Claude Code plugin marketplace | https://claudemarketplaces.com |
| **claudecodemarketplace.com** | Claude Code plugins directory | https://claudecodemarketplace.com |
| **claude-plugins.dev** | Community registry with CLI | https://claude-plugins.dev |
| **claudecodeplugins.io** | 308 Agent Skills hub | https://claudecodeplugins.io |
| **skillsmp.com** | Skills Marketplace for Claude, Codex, ChatGPT | https://skillsmp.com |

---

## III. Awesome Lists & Curated Collections

| Repo | Stars | Description | URL |
|------|-------|-------------|-----|
| **hesreallyhim/awesome-claude-code** | 18,800 | Commands, files, workflows for Claude Code | https://github.com/hesreallyhim/awesome-claude-code |
| **jqueryscript/awesome-claude-code** | N/A | Tools, IDE integrations, frameworks | https://github.com/jqueryscript/awesome-claude-code |
| **alvinunreal/awesome-claude** | N/A | Awesome things related to Anthropic Claude | https://github.com/alvinunreal/awesome-claude |
| **danielrosehill/Claude-Code-MCP-List** | N/A | MCPs for Claude Code on Linux Desktop | https://github.com/danielrosehill/Claude-Code-MCP-List |
| **travisvn/awesome-claude-skills** | N/A | Curated list of Claude Skills | https://github.com/travisvn/awesome-claude-skills |

---

## IV. Slash Commands Collections

| Repo | Description | URL |
|------|-------------|-----|
| **wshobson/commands** | Production-ready slash commands | https://github.com/wshobson/commands |
| **qdhenry/Claude-Command-Suite** | Professional commands for code review, security, architecture | https://github.com/qdhenry/Claude-Command-Suite |
| **webmattic/claude-commands** | Production-ready slash commands collection | https://github.com/webmattic/claude-commands |
| **brennercruvinel/CCPlugins** | 24 professional enterprise-grade commands | https://github.com/brennercruvinel/CCPlugins |
| **ffscoal/ccplugins** | Time-saving Claude Code plugins | https://github.com/ffscoal/ccplugins |
| **yanmxa/cc-plugins** | Plugins for "lazy developers" | https://github.com/yanmxa/cc-plugins |

---

## V. Hooks Collections

Claude Code hooks modify behavior at key workflow points:

| Hook Event | When It Fires |
|------------|---------------|
| SessionStart | When session begins |
| SessionEnd | When session ends |
| PreToolUse | Before a tool is executed |
| PostToolUse | After a tool executes |
| Notification | When notifications occur |
| UserPromptSubmit | When user submits prompt |
| Stop | When execution stops |
| SubagentStop | When subagent stops |
| PreCompact | Before context compaction |

**Notable Hook Plugins:**
- **hook-git-auto-backup** - Commits after Claude sessions
- **hook-todo-collector** - Scans TODOs at session end
- **hook-complexity-monitor** - Checks code after edits
- **hook-auto-docs** - Updates documentation at session end
- **hook-session-summary** - Summarizes file operations
- **hook-sound-notifications** - Audio notifications for events

---

## VI. Plugin Component Types

Claude Code plugins can include any combination of:

| Component | Description |
|-----------|-------------|
| **Commands** | Custom slash commands for frequent operations |
| **Agents** | Specialized AI assistants for specific tasks |
| **Skills** | Modular knowledge packages with workflows and resources |
| **Hooks** | Event handlers that trigger at workflow points |
| **MCP Servers** | External tool and data source connections |

### Plugin Directory Structure

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json      # Plugin metadata (required)
├── .mcp.json            # MCP server configuration (optional)
├── commands/            # Slash commands (optional)
├── agents/              # Agent definitions (optional)
├── skills/              # Skill definitions (optional)
└── README.md            # Documentation
```

---

## VII. Key MCP Server Categories

### Database MCP Servers
- PostgreSQL, MySQL, SQLite
- Supabase (official MCP)
- MongoDB, Redis
- Bytebase DB Hub

### Productivity MCP Servers
- Notion (official MCP)
- Slack
- Linear
- Jira/Confluence

### Development MCP Servers
- GitHub (official MCP)
- GitLab
- Sentry
- Stripe

### AI/ML MCP Servers
- Perplexity search
- Context7 (real-time library docs)
- Sequential Thinking

### Cloud/Infrastructure
- AWS MCP collection
- Cloudflare Workers
- Docker

### Specialized
- Blender (3D modeling)
- Figma
- MATLAB
- Arduino/robotics

---

## VIII. Installation Methods

### Adding a Plugin Marketplace
```bash
/plugin marketplace add your-org/plugins
```

### Installing a Plugin
```bash
/plugin install plugin-name@marketplace
```

### Adding an MCP Server (CLI)
```bash
claude mcp add github --scope user
```

### Adding MCP Server with Config
```bash
claude mcp add-json desktop-commander --scope user '{ "command": "npx", "args": [ "@wonderwhy-er/desktop-commander@latest" ] }'
```

---

## IX. Notable Standalone Projects

| Project | Stars | Description | URL |
|---------|-------|-------------|-----|
| **grahama1970/claude-code-mcp-enhanced** | N/A | Enhanced Claude Code MCP with orchestration | https://github.com/grahama1970/claude-code-mcp-enhanced |
| **Tenormusica2024/claude-mcp-setup** | N/A | Complete setup guide for 10 MCP servers | https://github.com/Tenormusica2024/claude-mcp-setup |
| **ivan-magda/claude-code-plugin-template** | N/A | Template for creating plugin marketplaces | https://github.com/ivan-magda/claude-code-plugin-template |
| **stbenjam/claude-marketplace-template** | N/A | Easy marketplace deployment template | https://github.com/stbenjam/claude-marketplace-template |
| **fcakyon/claude-codex-settings** | N/A | Battle-tested skills, commands, hooks, agents | https://github.com/fcakyon/claude-codex-settings |

---

## X. Summary Statistics

| Category | Count |
|----------|-------|
| Official MCP Reference Servers | 7 |
| Popular Third-Party MCP Servers | 500+ (in awesome-mcp-servers) |
| GitHub Plugin Marketplaces | 15+ |
| Web-based Plugin Directories | 6+ |
| Awesome Lists | 5+ |
| Total Stars (top repos) | ~100,000+ |

---

## Sources

### Official Resources
- [Claude Code MCP Documentation](https://code.claude.com/docs/en/mcp)
- [Claude Code Plugins Documentation](https://code.claude.com/docs/en/plugins)
- [MCP Official Site](https://modelcontextprotocol.io)
- [Anthropic MCP Announcement](https://www.anthropic.com/news/model-context-protocol)
- [Claude Code Plugins Announcement](https://www.anthropic.com/news/claude-code-plugins)

### Key GitHub Repositories
- [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [ccplugins/awesome-claude-code-plugins](https://github.com/ccplugins/awesome-claude-code-plugins)
- [wshobson/agents](https://github.com/wshobson/agents)
- [steipete/claude-code-mcp](https://github.com/steipete/claude-code-mcp)
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
- [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

### Web Directories
- [MCP Registry](https://registry.modelcontextprotocol.io)
- [MCPServers.org](https://mcpservers.org)
- [ClaudeCodePlugin.com](https://www.claudecodeplugin.com)
- [ClaudeCodeMarketplace.com](https://claudecodemarketplace.com)
