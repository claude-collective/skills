# Claude Collective

A plugin distribution system for Claude Code. Compile skills into distributable plugins with the CLI, or install from the marketplace.

## Quick Start

### Build Custom Stack

```bash
# Create your first stack (also creates the shared plugin)
cc init --name my-stack

# Select skills through the wizard
# Outputs to:
#   ~/.claude-collective/stacks/my-stack/skills/  (source)
#   ~/.claude/plugins/claude-collective/          (plugin)
```

### Managing Stacks

```bash
# List all stacks
cc list

# Switch to a different stack
cc switch work-stack

# Add a skill to the active stack
cc add zustand
```

### Install from Marketplace

```bash
# Add marketplace (one time)
/plugin marketplace add claude-collective/skills

# Install individual skills
/plugin install skill-react@claude-collective

# Or install a pre-built stack
/plugin install stack-fullstack-react@claude-collective
```

---

## What's Included

- **83 skill plugins** covering frontend, backend, testing, mobile, and more
- **Pre-built stacks** with agents and curated skill combinations
- **CLI** for building custom stacks and managing plugins

### Skill Categories

| Category | Skills | Examples                                |
| -------- | ------ | --------------------------------------- |
| Frontend | 33     | React, Vue, Angular, Next.js, Remix     |
| Backend  | 12     | Hono, Express, Fastify, Drizzle, Prisma |
| Testing  | 8      | Vitest, Playwright, Cypress, RTL        |
| API      | 12     | React Query, tRPC, GraphQL, WebSocket   |
| Mobile   | 3      | React Native, Expo                      |
| Tooling  | 6      | ESLint, Prettier, Vite, Turborepo       |

See [marketplace README](./.claude-plugin/README.md) for the full list.

---

## Plugin System

### Architecture

The CLI uses a stack-based architecture with a single shared plugin:

```
~/.claude-collective/                    # SOURCE
├── config.yaml                          # source, active_stack
└── stacks/
    ├── work-stack/
    │   └── skills/
    │       ├── react/SKILL.md
    │       └── hono/SKILL.md
    └── home-stack/
        └── skills/
            ├── react/SKILL.md
            └── zustand/SKILL.md

~/.claude/plugins/claude-collective/     # OUTPUT
├── .claude-plugin/plugin.json
├── agents/                              # Compiled agents
├── skills/                              # Active stack's skills
├── CLAUDE.md
└── README.md
```

### CLI Commands

```bash
# Create a new stack
cc init --name my-stack

# Switch active stack
cc switch work-stack

# Add skill to active stack
cc add zustand

# List all stacks
cc list

# Recompile agents after manual edits
cc compile
```

### Publishing Commands (CI Only)

```bash
# Compile all skills to plugins
cc compile-plugins

# Compile a stack
cc compile-stack -s fullstack-react

# Generate marketplace.json
cc generate-marketplace

# Validate plugins
cc validate ./dist/plugins --all
```

See [CLI Reference](./src/docs/plugins/CLI-REFERENCE.md) for complete documentation.

---

## Development

### Project Structure

```
claude-collective/
  src/
    skills/           # Source skills organized by category
    stacks/           # Stack configurations
    agents/           # Agent templates and definitions
    cli/              # CLI implementation
    docs/             # Documentation
    schemas/          # JSON schemas for validation
  dist/
    plugins/          # Compiled skill plugins (83 plugins)
    stacks/           # Compiled stack plugins
  .claude-plugin/
    marketplace.json  # Marketplace definition
    README.md         # Marketplace documentation
```

### Build Commands

```bash
# Install dependencies
bun install

# Run CLI commands
bun src/cli/index.ts init --name my-stack
bun src/cli/index.ts switch work-stack
bun src/cli/index.ts add zustand

# Compile all plugins (for marketplace)
bun src/cli/index.ts compile-plugins

# Compile stacks (for marketplace)
bun src/cli/index.ts compile-stack -s fullstack-react

# Generate marketplace
bun src/cli/index.ts generate-marketplace

# Validate all plugins
bun src/cli/index.ts validate dist/plugins --all
```

### Adding a New Skill

1. Create skill directory: `src/skills/<category>/<name> (@author)/`
2. Add `SKILL.md` with frontmatter and content
3. Add `metadata.yaml` with version and description
4. Run `cc compile-plugins --skill <category>/<name>`
5. Run `cc generate-marketplace`

See [Plugin Development Guide](./src/docs/plugins/PLUGIN-DEVELOPMENT.md) for details.

---

## Documentation

| Document                                                                      | Description                        |
| ----------------------------------------------------------------------------- | ---------------------------------- |
| [CLI Reference](./src/docs/plugins/CLI-REFERENCE.md)                          | Complete CLI command documentation |
| [Plugin Development](./src/docs/plugins/PLUGIN-DEVELOPMENT.md)                | How to create and publish plugins  |
| [Plugin Architecture](./src/docs/plugins/PLUGIN-DISTRIBUTION-ARCHITECTURE.md) | Technical architecture details     |
| [Marketplace README](./.claude-plugin/README.md)                              | Available skills and installation  |

---

## License

MIT
