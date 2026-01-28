# Dual Repository Architecture

> **Status**: Proposed - Next Major Refactor
> **Created**: 2026-01-27
> **Updated**: 2026-01-28
> **Purpose**: Define the architecture for public marketplace distribution AND private work repository usage

---

## Summary of Architectural Decisions

| #   | Question                                | Decision                                                                  |
| --- | --------------------------------------- | ------------------------------------------------------------------------- |
| 1   | Where do templates live?                | **Bundled in CLI repo** (not public skills repo)                          |
| 2   | Where do partials live?                 | **Bundled in CLI repo** (with templates)                                  |
| 3   | Are agents plugins?                     | **NO** - agents are compiled output, not marketplace artifacts            |
| 4   | How to reference remote skills?         | **`github:user/repo/path`** syntax with caching                           |
| 5   | How does user select install mode?      | **Wizard asks** "plugin or local" (not CLI flag)                          |
| 6   | How does plugin mode work?              | **Loop `claude plugin install`** for each selected skill                  |
| 7   | How does local mode work?               | **Copy from source** to `.claude/skills/`                                 |
| 8   | Where are agents compiled to?           | **`.claude/agents/`** (not inside a plugin)                               |
| 9   | Does `cc compile` discover both?        | **YES** - discovers from plugins AND local skills                         |
| 10  | Manifest for local skills?              | **NO** - only needed for marketplace publishing                           |
| 11  | Copy from source or compiled?           | **Source** (`src/skills/`) - retains full metadata                        |
| 12  | Why native plugin install?              | **Lifecycle management** (update, uninstall, list)                        |
| 13  | Single combined plugin?                 | **NO** - each skill is separate plugin                                    |
| 14  | How to display skills in CLI?           | **Two categories**: "Installed" (plugins) and "Local" (`.claude/skills/`) |
| 15  | Distinguish copied-local vs user-local? | **NO** - both are just "Local"                                            |

---

## Overview

Two distinct usage patterns with clear separation:

1. **Public Marketplace** - Skills and Stacks distributed to the world
2. **Work Repository** - Private skills for internal use only

### Key Architectural Decision: Agents are NOT Plugins

**Agents are compiled OUTPUT, not distributable artifacts.**

- **Skills** = Marketplace plugins (installable, distributable)
- **Stacks** = Marketplace plugins (curated skill collections)
- **Agents** = Compiled output (generated locally from templates + skills)

Templates (`agent.liquid`, partials) are **bundled in the CLI**, not in the marketplace. Users never install agents - they compile them locally from their selected skills.

### What IS a Marketplace Plugin

| Artifact      | Plugin? | Distribution                                    |
| ------------- | ------- | ----------------------------------------------- |
| **Skills**    | YES     | Installed via `cc add skill-name`               |
| **Stacks**    | YES     | Installed via `cc init` (curated skill bundles) |
| **Agents**    | NO      | Compiled locally from templates + skills        |
| **Templates** | NO      | Bundled in CLI, ejectable for customization     |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PUBLIC MARKETPLACE                               │
│                 github:claude-collective/skills                      │
├─────────────────────────────────────────────────────────────────────┤
│  dist/plugins/                                                       │
│  ├── skill-react/           ← Individual skill plugins               │
│  ├── skill-zustand/                                                  │
│  ├── skill-drizzle/                                                  │
│  ├── ... (80+ skill plugins)                                         │
│  ├── stack-fullstack-react/ ← Curated skill collections              │
│  └── stack-*/               ← Other stack plugins                    │
│                                                                       │
│  src/skills/                ← SOURCE skills (has metadata.yaml)      │
│  ├── frontend/react/                                                 │
│  └── backend/api-hono/                                               │
│                                                                       │
│  NOTE: Agents are NOT plugins. Templates bundled in CLI.             │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
           PLUGIN MODE                     LOCAL MODE
    (claude plugin install)           (copy from src/skills/)
                    │                             │
                    └──────────────┬──────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      WORK REPOSITORY                                 │
│                    (Private, not published)                          │
├─────────────────────────────────────────────────────────────────────┤
│  work-repo/                                                          │
│  ├── apps/                      ← Application code                   │
│  ├── packages/                  ← Shared packages                    │
│  └── .claude/                                                        │
│      ├── plugins/               ← PLUGIN MODE: native-installed      │
│      │   ├── skill-react/       ← Via `claude plugin install`        │
│      │   ├── skill-zustand/                                          │
│      │   └── skill-react-query/                                      │
│      ├── skills/                ← LOCAL MODE: copied from source     │
│      │   ├── backend-api-hono/  │  OR user-created skills            │
│      │   ├── company-auth/                                           │
│      │   └── internal-api/                                           │
│      ├── agents/                ← BOTH MODES: compiled output        │
│      │   ├── frontend-developer.md                                   │
│      │   ├── backend-developer.md                                    │
│      │   └── pm.md                                                   │
│      └── config.yaml            ← Agent-skill mappings               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Public Marketplace

### Purpose

- Distribute 80+ skills publicly
- Provide meta agents (skill-summoner, agent-summoner) for creating new skills/agents
- Allow anyone to install and use

### Structure

```
claude-collective/skills/
├── dist/plugins/
│   ├── skill-*/              ← Individual skill plugins
│   └── stack-*/              ← Stack plugins (curated skill collections)
├── src/skills/               ← Source for skills
└── marketplace.json          ← Plugin index (skills + stacks only)
```

**Note:** Agent source (`src/agents/`) and templates (`agent.liquid` + partials) are NOT in the marketplace repo. They are bundled directly in the CLI package. Partials include `workflow.md`, `intro.md`, `examples.md`, etc.

### Distribution

- GitHub repository serves as marketplace
- Users add via `/plugin > Discover`
- Install via `/plugin install skill-name@claude-collective`

### Versioning

- Each plugin has independent version in `plugin.json`
- Users update via `/plugin update`
- Breaking changes communicated via changelog

---

## Work Repository Pattern

### Purpose

- Private/internal skills and agents
- Team creates whatever they need
- Nothing published externally
- Full control, no external dependencies (except optional meta agents)

### Structure

```
work-repo/
├── .claude/
│   ├── plugins/              ← Installed plugins (from public marketplace)
│   │   ├── agent-summoner/   ← Optional: for creating agents
│   │   └── skill-summoner/   ← Optional: for creating skills
│   ├── skills/               ← LOCAL skills (never published)
│   │   └── {skill-name}/
│   │       ├── SKILL.md
│   │       └── metadata.yaml
│   ├── agents/               ← LOCAL compiled agents
│   │   └── {agent-name}.md
│   └── config.yaml           ← Agent-skill mappings
├── apps/
├── packages/
└── ...
```

### Workflow

1. **Initial Setup**

   ```bash
   # Optional: Install meta agents for creating skills/agents
   /plugin install agent-summoner@claude-collective
   /plugin install skill-summoner@claude-collective
   ```

2. **Create Local Skills**

   ```bash
   # Using skill-summoner agent
   # OR manually create in .claude/skills/
   ```

3. **Configure Agent-Skill Mappings**

   ```yaml
   # .claude/config.yaml
   agents:
     frontend-developer:
       skills:
         - local/company-auth
         - local/internal-api
     backend-developer:
       skills:
         - local/internal-api
         - local/database-patterns
   ```

4. **Compile Agents**

   ```bash
   cc compile
   # Reads config.yaml
   # Reads skills from .claude/skills/
   # Outputs agents to .claude/agents/
   ```

5. **Version with Work Repo**
   - Skills and agents are just files
   - Versioned with work repo's git history
   - No separate versioning needed

### Key Principles

| Aspect        | Work Repo Approach                          |
| ------------- | ------------------------------------------- |
| Skills        | Local in `.claude/skills/`, never published |
| Agents        | Compiled locally, never published           |
| Versioning    | Same as work repo (git)                     |
| Distribution  | None - stays in repo                        |
| External deps | Optional meta agents only                   |
| Updates       | Edit files directly, commit, push           |

---

## CLI Changes Required

### Current Behavior

- `cc init` copies skills into `.claude/plugins/claude-collective/` (single combined plugin)
- Skills and agents bundled together in one plugin
- Creates custom plugin manifest
- Does not use native Claude plugin install

### Required Changes

1. **Wizard-based mode selection (NOT flags)**

   ```
   cc init
     → Wizard displays skills selection
     → Wizard asks: "How would you like to install?"
       ├── Plugin Mode (uses native claude plugin install)
       └── Local Mode (copies to .claude/skills/)
   ```

   Mode selection in same view as expert/non-expert toggle.

2. **Plugin Mode: Loop native install**

   ```typescript
   for (const skill of selectedSkills) {
     await exec(
       `claude plugin install skill-${skill}@claude-collective --scope project`,
     );
   }
   ```

   - Each skill installed as separate plugin
   - Native lifecycle management works
   - Shows in `claude plugin list`

3. **Local Mode: Copy from source**

   ```typescript
   for (const skill of selectedSkills) {
     await copyFromSource(skill, ".claude/skills/");
   }
   ```

   - Copy from `src/skills/` (has full metadata.yaml)
   - NOT from `dist/plugins/` (lacks metadata.yaml)
   - Flat structure in `.claude/skills/`

4. **Unified compile command**

   ```bash
   cc compile
   # Discovers from .claude/plugins/*/skills/
   # Discovers from .claude/skills/
   # Merges all skills (local takes precedence)
   # Outputs agents to .claude/agents/
   ```

5. **Support mixed sources in config**

   ```yaml
   # config.yaml
   agents:
     frontend-developer:
       skills:
         - react # From installed plugin OR local
         - company-patterns # From .claude/skills/
   ```

   No `local/` prefix needed - compile discovers from both locations.

6. **Eject templates for customization**

   ```bash
   cc eject templates
   # Copies bundled templates to .claude/templates/
   # User can now customize locally
   ```

7. **CLI displays skills in categories**

   ```
   cc list

   INSTALLED (from plugins)
   ────────────────────────
     react (@vince)
     zustand (@vince)

   LOCAL (in .claude/skills/)
   ────────────────────────
     company-auth (@local)
     internal-api (@local)
   ```

   - "Installed" = skills from `.claude/plugins/*/`
   - "Local" = skills from `.claude/skills/` (no distinction between copied vs created)

---

## Template & Eject System

### Key Decision: Templates Bundled in CLI

**Templates live in the CLI package, NOT in the public skills marketplace.**

This means:

- Users don't need marketplace access for compilation
- Templates are versioned with the CLI, not separately
- Customization is opt-in via `cc eject templates`

### What's Bundled in CLI

The CLI package includes templates AND partials (not in the public skills repo):

**Templates:**

- `agent.liquid` - Main agent template

**Partials (in `partials/` directory):**

- `workflow.md` - Workflow section partial
- `intro.md` - Introduction section partial
- `examples.md` - Examples section partial
- Additional partials as needed for agent structure

These are bundled directly in the CLI package. Users don't need access to the public skills marketplace to compile agents.

### Resolution Order

On `cc compile`, for BOTH `agent.liquid` AND all partials:

1. **Local first**: Check `.claude/templates/` (if user ejected)
2. **Bundled fallback**: Use templates/partials bundled in CLI

This applies to the main template AND each individual partial. Users can eject and customize just specific partials if needed.

### The Problem Templates Solve

Work repo users need access to agent templates but they won't:

- Fork the public skills repo
- Clone it separately
- Make PRs for changes

### Solution: Bundle + Eject

The CLI bundles templates internally. Users don't need to think about them unless they want customization.

```
CLI (installed globally or via npx)
     │
     ├── Bundles templates internally
     │   └── agent.liquid
     │   └── partials/
     │       ├── workflow.md
     │       ├── intro.md
     │       └── examples.md
     │
     └── On compile:
         1. Check .claude/templates/ (local overrides)
         2. Fall back to bundled templates
```

### Eject Command

```bash
cc eject templates
```

Copies BOTH `agent.liquid` AND all partials to local:

```
.claude/templates/
├── agent.liquid           ← Main agent template
└── partials/
    ├── workflow.md        ← Workflow section
    ├── intro.md           ← Introduction section
    ├── examples.md        ← Examples section
    └── ...                ← Any additional partials
```

**Important:** Partials live in the CLI repository, NOT the public skills repo. They are bundled alongside templates in the CLI package.

### Template & Partial Resolution Order

For both `agent.liquid` and each partial file:

1. **Local first**: `.claude/templates/` (if exists after eject)
2. **Bundled fallback**: Templates/partials bundled in CLI

Resolution is per-file, so users can eject and customize only specific partials while using bundled versions for the rest.

### Eject Behavior

| Aspect          | Behavior                                      |
| --------------- | --------------------------------------------- |
| **Default**     | Uses bundled templates, auto-updated with CLI |
| **After eject** | Uses local templates, user owns them          |
| **Sync**        | Never syncs back - ejected = your copy        |
| **Updates**     | CLI updates don't affect ejected templates    |

### What Can Be Ejected

```bash
cc eject templates      # Agent templates + partials
cc eject skills         # Skill scaffolding templates
cc eject config         # Default config.yaml template
cc eject all            # Everything
```

### Work Repo Flow

```bash
# 1. Initial setup - just works with defaults
cc init --local
cc compile              # Uses bundled templates

# 2. Team decides they need custom templates
cc eject templates      # Copies to .claude/templates/

# 3. Team customizes
vim .claude/templates/agent.liquid
vim .claude/templates/partials/workflow.md

# 4. Compile uses local templates
cc compile              # Uses .claude/templates/

# 5. Commit to work repo
git add .claude/templates/
git commit -m "Customize agent templates for our stack"
```

### No Contribution Back

This is intentional:

- Work repo templates are company-specific
- Customizations don't make sense for public repo
- Ejecting is a one-way operation
- Users update bundled templates by updating CLI version

### Partial Eject (Not Full Eject)

Important distinction:

| Model                         | CLI After Eject                   | Use Case        |
| ----------------------------- | --------------------------------- | --------------- |
| **Full Eject** (CRA-style)    | Stops working, you're on your own | Not recommended |
| **Partial Eject** (our model) | Still works, uses local overrides | Recommended     |

We use **Partial Eject**:

- Eject specific pieces (templates, config)
- CLI still functions normally
- Just uses local files instead of bundled where they exist

---

## CLI Usage After Eject

The CLI remains useful for work repos even after ejecting templates.

### Commands Still Used

| Command             | Use Case                                              | Frequency      |
| ------------------- | ----------------------------------------------------- | -------------- |
| `cc compile`        | Regenerate agents when skills/templates/config change | **Daily**      |
| `cc add skill-name` | Install new public skills that look useful            | Occasional     |
| `cc list`           | Browse what's available in marketplace                | Occasional     |
| `cc update`         | Update installed plugins (meta agents, public skills) | Occasional     |
| `cc create skill`   | Scaffold a new local skill                            | As needed      |
| `cc validate`       | Validate local skills and config                      | Before commits |

### Day-to-Day Workflow

```bash
# Morning: Team member adds a new skill
vim .claude/skills/new-api-pattern/SKILL.md
vim .claude/skills/new-api-pattern/metadata.yaml

# Update config to assign skill to agents
vim .claude/config.yaml

# Recompile agents
cc compile

# Commit
git add .claude/
git commit -m "Add new-api-pattern skill"
```

### Adding Public Skills

```bash
# Browse marketplace
cc list --category backend

# See something useful
cc add skill-kubernetes

# It's now installed alongside local skills
# Update config to use it
vim .claude/config.yaml

# Recompile
cc compile
```

### Updating Installed Plugins

```bash
# Check for updates
cc update --check

# Update all installed plugins
cc update

# Recompile with updated skills
cc compile
```

### What Eject Changes vs Doesn't Change

| Aspect            | Before Eject           | After Eject                     |
| ----------------- | ---------------------- | ------------------------------- |
| `cc compile`      | Uses bundled templates | Uses local `.claude/templates/` |
| `cc add`          | Works                  | Works (unchanged)               |
| `cc list`         | Works                  | Works (unchanged)               |
| `cc update`       | Works                  | Works (unchanged)               |
| `cc create skill` | Works                  | Works (unchanged)               |
| Template updates  | Auto with CLI update   | Manual (you own them)           |

---

## Migration Path

### Phase 1: Bundle Templates AND Partials in CLI

- Move templates (`agent.liquid`) AND partials (`workflow.md`, `intro.md`, `examples.md`, etc.) into CLI bundle
- Partials live in CLI repo alongside templates, NOT in public skills repo
- CLI no longer requires access to public repo for templates or partials
- Compile uses bundled templates/partials by default

### Phase 2: Wizard Mode Selection

- Remove `--local` and `--plugin` flags from `cc init`
- Add mode selection step to wizard (same view as expert toggle)
- User chooses "Plugin Mode" or "Local Mode"

### Phase 3: Plugin Mode Implementation

- Implement loop calling `claude plugin install skill-X@marketplace`
- Each selected skill installed as separate native plugin
- Remove custom manifest generation for user installs
- Agents compiled to `.claude/agents/` (not bundled in plugin)

### Phase 4: Local Mode Implementation

- Copy skills from `src/skills/` (source) to `.claude/skills/`
- Flatten directory structure (no category hierarchy)
- Retain full `metadata.yaml` for marketplace compatibility
- Agents compiled to `.claude/agents/`

### Phase 5: Unified Compilation

- `cc compile` discovers from both `.claude/plugins/*/skills/` AND `.claude/skills/`
- Merge all discovered skills (local takes precedence)
- Output agents to `.claude/agents/`
- Template resolution: local `.claude/templates/` first, bundled fallback

### Phase 6: Eject Command

- `cc eject templates` copies `agent.liquid` AND all partials to `.claude/templates/`
- `cc eject skills` copies skill scaffolding templates
- `cc eject config` copies default config.yaml template
- Compile checks for local templates/partials first, falls back to bundled (per-file resolution)

---

## Questions Resolved

| #   | Question                                      | Resolution                                                                  |
| --- | --------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Skill discovery precedence?                   | **Local always wins** (allows overrides)                                    |
| 2   | Meta agent updates?                           | **Standard `claude plugin update`** - meta agents don't touch local content |
| 3   | Config format distinguish local vs installed? | **NO prefix needed** - compile discovers from both locations automatically  |
| 4   | Validation for local skills?                  | **Optional/relaxed** validation                                             |
| 5   | Template versioning after eject?              | **Warn on CLI update** if local templates exist                             |
| 6   | Partial eject granularity?                    | **Yes** - `cc eject templates/partials/workflow.md`                         |
| 7   | Mode selection UI?                            | **Wizard** (not CLI flags) - same view as expert toggle                     |
| 8   | Plugin mode implementation?                   | **Loop native `claude plugin install`** for each skill                      |
| 9   | Where do agents go?                           | **`.claude/agents/`** (not inside a plugin)                                 |
| 10  | Copy from source or compiled?                 | **Source** (`src/skills/`) - has full metadata.yaml                         |
| 11  | Manifest for local skills?                    | **NO** - only marketplace plugins need manifests                            |
| 12  | Single combined plugin?                       | **NO** - each skill is separate plugin via native install                   |

## Open Questions

1. **Remote skill references**: Exact syntax for `github:user/repo/path` references
   - Proposed: `remote: github:user/repo#version` in config.yaml

2. **Cache location**: Where to cache remotely fetched skills
   - Proposed: `~/.cache/claude-collective/sources/`

3. **Offline compilation**: How to handle when remote skills cached but user offline
   - Proposed: Use cache, warn if stale

---

## Installation Modes: Plugin vs Local

### Mode Selection

Users select installation mode **via the wizard**, not CLI flags:

```
cc init
  │
  └── Wizard Step: "How would you like to install skills?"
      ├── Plugin Mode (native Claude plugin install)
      └── Local Mode (copy to .claude/skills/)
```

**No `--plugin` or `--local` flags.** The wizard handles mode selection in the same view where expert/non-expert mode is toggled.

---

### Plugin Mode: Loop Native Install

When user selects "Plugin Mode":

```typescript
// For each skill the user selects:
for (const skill of selectedSkills) {
  await exec(
    `claude plugin install skill-${skill.name}@claude-collective --scope project`,
  );
}
// Agents compiled separately to .claude/agents/
await compileAgents(selectedSkills, ".claude/agents/");
```

**What happens:**

1. Each skill is installed as a **separate plugin**
2. Native Claude CLI handles installation, caching, registration
3. Skills appear in `claude plugin list`
4. Lifecycle commands work: `update`, `uninstall`, `disable`
5. Agents compiled to `.claude/agents/` (not part of any plugin)

**Why native install:**

- Proper lifecycle management
- Shows in `claude plugin list`
- `claude plugin update skill-X` works
- `claude plugin uninstall skill-X` works
- Official integration with Claude Code

---

### Local Mode: Copy to Skills Folder

When user selects "Local Mode":

```typescript
// For each skill the user selects:
for (const skill of selectedSkills) {
  await copyFromSource(skill, ".claude/skills/");
}
// Agents compiled to .claude/agents/
await compileAgents(selectedSkills, ".claude/agents/");
```

**What happens:**

1. Skills copied from **source** (`src/skills/`), NOT compiled (`dist/plugins/`)
2. Full `metadata.yaml` retained (marketplace-compatible)
3. User can modify skills locally
4. User can later publish to their own marketplace (no changes needed)
5. Agents compiled to `.claude/agents/`

**Why copy from source:**

- Source has full `metadata.yaml` (compiled plugins don't)
- Retains marketplace-compatible format
- User can publish modified skills later without conversion

---

### Final Directory Structure

```
.claude/
├── plugins/                          ← Skills installed via Plugin Mode
│   ├── skill-react/
│   │   └── skills/react/
│   │       ├── SKILL.md
│   │       └── examples/
│   ├── skill-zustand/
│   │   └── skills/zustand/
│   │       └── SKILL.md
│   └── skill-react-query/
│       └── skills/react-query/
│           └── SKILL.md
│
├── skills/                           ← Skills installed via Local Mode
│   ├── backend-api-hono/             │   OR user-created skills
│   │   ├── SKILL.md
│   │   ├── metadata.yaml
│   │   └── examples/
│   └── my-custom-skill/
│       ├── SKILL.md
│       └── metadata.yaml
│
├── agents/                           ← Compiled agents (BOTH modes)
│   ├── frontend-developer.md
│   ├── backend-developer.md
│   └── pm.md
│
├── templates/                        ← Only if user runs `cc eject templates`
│   ├── agent.liquid
│   └── partials/
│       ├── workflow.md
│       └── intro.md
│
└── config.yaml                       ← Agent-skill mappings
```

---

### Unified Compilation

`cc compile` discovers skills from **both locations**:

```typescript
async function compile() {
  // 1. Discover from plugins
  const pluginSkills = await discoverFromPlugins(".claude/plugins/*/skills/");

  // 2. Discover from local skills
  const localSkills = await discoverFromLocal(".claude/skills/");

  // 3. Merge (local takes precedence if same name)
  const allSkills = mergeSkills(pluginSkills, localSkills);

  // 4. Read config.yaml for agent-skill mappings
  const config = await readConfig(".claude/config.yaml");

  // 5. Compile agents
  for (const agent of config.agents) {
    const output = await compileAgent(agent, allSkills);
    await writeFile(`.claude/agents/${agent.name}.md`, output);
  }
}
```

**Precedence:** Local skills override plugin skills if same name exists.

---

### Three User Journeys

#### 1. Plugin → Plugin (Native Install)

```bash
cc init
# Wizard: Select skills
# Wizard: Choose "Plugin Mode"
# → Loops: claude plugin install skill-X@marketplace
# → Compiles agents to .claude/agents/

# Later: Update a skill
claude plugin update skill-react

# Later: Remove a skill
claude plugin uninstall skill-zustand
```

#### 2. Plugin → Local (Copy to Skills)

```bash
cc init
# Wizard: Select skills
# Wizard: Choose "Local Mode"
# → Copies skills to .claude/skills/
# → Compiles agents to .claude/agents/

# Later: Modify a skill
vim .claude/skills/react/SKILL.md
cc compile

# Later: Publish to own marketplace
# Skills already in correct format - just copy to your repo
```

#### 3. Local → Local (Manual Creation)

```bash
# Create skill manually
mkdir -p .claude/skills/my-skill
cat > .claude/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: My custom skill
---
# Instructions here
EOF

cat > .claude/skills/my-skill/metadata.yaml << 'EOF'
cli_name: My Custom Skill
EOF

# Compile to include in agents
cc compile
```

---

### Comparison Table

| Aspect                     | Plugin Mode                  | Local Mode               | Manual Local      |
| -------------------------- | ---------------------------- | ------------------------ | ----------------- |
| **Installation**           | `claude plugin install` loop | Copy from source         | Manual creation   |
| **Location**               | `.claude/plugins/skill-*/`   | `.claude/skills/`        | `.claude/skills/` |
| **Lifecycle**              | `update`, `uninstall` work   | Manual (delete folder)   | Manual            |
| **Format**                 | Plugin structure             | Source structure         | Minimal           |
| **Publishable**            | Already in marketplace       | Yes (no changes)         | Needs metadata    |
| **Modifiable**             | No (managed by Claude)       | Yes                      | Yes               |
| **Dependency checking**    | Yes (if metadata exists)     | Yes (if metadata exists) | No                |
| **Shows in `plugin list`** | Yes                          | No                       | No                |

---

### CLI Display: Skill Categories

When running CLI commands (`cc init`, `cc list`, etc.), skills are displayed in two categories:

```
cc list

INSTALLED (from plugins)
────────────────────────
  react (@vince)              React component patterns
  zustand (@vince)            Client state management
  react-query (@vince)        Server state with React Query

LOCAL (in .claude/skills/)
────────────────────────
  backend-api-hono (@vince)   Copied from marketplace
  company-auth (@local)       Team-created skill
  internal-api (@local)       Team-created skill

MARKETPLACE (available to install)
────────────────────────
  drizzle (@vince)            Database ORM patterns
  hono (@vince)               API framework patterns
  ...
```

**Categories:**
| Category | Source | Description |
|----------|--------|-------------|
| **Installed** | `.claude/plugins/*/` | Skills installed via Plugin Mode (native `claude plugin install`) |
| **Local** | `.claude/skills/` | Skills copied via Local Mode OR user-created. No distinction between the two. |
| **Marketplace** | Remote | Available skills not yet installed |

**Note:** We do NOT distinguish between "copied from marketplace to local" vs "user-created local". Both appear under "Local" - they're all just local skills.

---

### Remote Skill References

For future enhancement, skills can be referenced by URL:

```yaml
# .claude/config.yaml
skills:
  # Local skill
  - local: ./skills/my-custom-skill

  # Remote skill (fetched + cached)
  - remote: github:vince/skills/backend-api-hono

  # Remote with version pin
  - remote: github:vince/skills/react#v1.0.0
```

**Fetching behavior:**

- First compile: Fetch from URL → Cache to `~/.cache/claude-collective/`
- Subsequent compiles: Use cache (fast, offline)
- Force refresh: `cc compile --force-refresh`

---

### What CLI Components Change

| Component            | Current                            | New                                                            |
| -------------------- | ---------------------------------- | -------------------------------------------------------------- |
| `cc init`            | Copies to plugin, creates manifest | Wizard asks mode, either native install OR copy to local       |
| `cc compile`         | Reads from plugin only             | Discovers from plugins AND local, outputs to `.claude/agents/` |
| `skill-copier.ts`    | Copies to plugin dir               | Copies to `.claude/skills/` (local mode)                       |
| `plugin-manifest.ts` | Always generates                   | Not used for local mode                                        |
| Mode selection       | `--local` flag                     | Wizard option (like expert mode toggle)                        |

---

## Related Documents

- `TODO.md` - Task tracking
- `CLI-FRAMEWORK-RESEARCH.md` - CLI capabilities
- `SIMPLIFIED-PLUGIN-ARCHITECTURE.md` - Current plugin architecture
