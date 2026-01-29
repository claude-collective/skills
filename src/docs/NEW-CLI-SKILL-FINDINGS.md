# New CLI Skill Registration Findings

> **Generated**: 2026-01-29
> **Updated**: 2026-01-29
> **Status**: Complete - CLI Stack Created

---

## Overview

Added two new skills:

1. **CLI skill** (`src/skills/cli/cli-commander (@vince)/`) - New category `cli`
2. **CLI Reviewing skill** (`src/skills/reviewing/reviewing (@vince)/cli-reviewing (@vince)/`) - Under `methodology` category

Created stack configuration for compiling CLI agents: 3. **CLI Stack** (`src/stacks/cli-stack/config.yaml`) - Maps skills to agents

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Skills Repo (this repo)                     │
├─────────────────────────────────────────────────────────────────┤
│  src/skills/           → Public skills (marketplace)             │
│  src/stacks/cli-stack/ → Stack config (skill-to-agent mapping)   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                        cc compile --stack cli-stack
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        CLI Repo                                  │
├─────────────────────────────────────────────────────────────────┤
│  src/agents/           → Agent partials (templates)              │
│    developer/cli-developer/                                      │
│    reviewer/cli-reviewer/                                        │
│  src/cli/lib/skill-agent-mappings.ts → Runtime routing           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                        Compiled agents (output)
```

---

## Changes Applied

### Skills Repo (`/home/vince/dev/claude-subagents`)

| File                                               | Change                                   |
| -------------------------------------------------- | ---------------------------------------- |
| `src/skills/cli/cli-commander (@vince)/`           | New CLI skill                            |
| `src/skills/reviewing/.../cli-reviewing (@vince)/` | New CLI reviewing skill                  |
| `cli-reviewing metadata.yaml`                      | Fixed `requires: cli-commander (@vince)` |
| `src/stacks/cli-stack/config.yaml`                 | **Created**: Stack config for CLI agents |

### CLI Repo (`/home/vince/dev/cli`)

| File                                   | Change                                             |
| -------------------------------------- | -------------------------------------------------- |
| `src/schemas/metadata.schema.json`     | Added `"cli"` to SkillCategory enum                |
| `src/cli/lib/skill-agent-mappings.ts`  | Added `"cli/*"` mapping to CLI + backend agents    |
| `src/cli/lib/skill-agent-mappings.ts`  | Added cli-developer, cli-reviewer preloaded skills |
| `src/cli/lib/skill-agent-mappings.ts`  | Added `"cli"` to SUBCATEGORY_ALIASES               |
| `src/cli/lib/marketplace-generator.ts` | Added CLI patterns for categorization              |
| `src/cli/lib/agent-fetcher.ts`         | Refactored to load agent partials locally          |
| `src/cli/commands/compile.ts`          | Updated to use `getAgentDefinitions()`             |
| `src/cli/commands/edit.ts`             | Updated to use `getAgentDefinitions()`             |
| `src/agents/developer/cli-developer/`  | Agent partial (pre-existing)                       |
| `src/agents/reviewer/cli-reviewer/`    | Agent partial (pre-existing)                       |

---

## How to Compile CLI Agents

From this skills repo:

```bash
# Navigate to skills repo
cd /home/vince/dev/claude-subagents

# Compile using CLI stack (agent partials auto-loaded from CLI repo)
bun /home/vince/dev/cli/src/cli/index.ts compile-stack --stack cli-stack -v

# Output will be in dist/stacks/cli-stack/
```

The compile-stack command:

- Loads **stacks and skills** from current directory (skills repo)
- Loads **agent partials** from CLI repo (default, via `getAgentDefinitions()`)
- Can override agent source with `--agent-source <url>` flag

Output structure:

```
dist/stacks/cli-stack/
├── .claude-plugin/plugin.json
├── README.md
├── agents/
│   ├── cli-developer.md      # Compiled with cli-commander skill
│   ├── cli-reviewer.md       # Compiled with cli-commander + reviewing + cli-reviewing
│   └── ...
└── skills/
    ├── cli-commander (@vince)/
    ├── cli-reviewing (@vince)/
    └── ...
```

---

## Skill IDs

| Skill         | Folder                                             | ID                       |
| ------------- | -------------------------------------------------- | ------------------------ |
| CLI Commander | `src/skills/cli/cli-commander (@vince)/`           | `cli-commander (@vince)` |
| CLI Reviewing | `src/skills/reviewing/.../cli-reviewing (@vince)/` | `cli-reviewing (@vince)` |

---

## Agent Partials (CLI Repo)

| Agent         | Path                                  | Receives Skills                                     |
| ------------- | ------------------------------------- | --------------------------------------------------- |
| cli-developer | `src/agents/developer/cli-developer/` | cli-commander (preloaded)                           |
| cli-reviewer  | `src/agents/reviewer/cli-reviewer/`   | cli-commander, reviewing, cli-reviewing (preloaded) |

---

## Validation

```bash
# Type check CLI repo
cd /home/vince/dev/cli && bun tsc --noEmit

# Validate skills
bun src/cli/index.ts validate ../claude-subagents/src/skills --all

# List stacks
bun src/cli/index.ts stacks ../claude-subagents
```
