# TODO

See `.claude/research/findings/FINAL-DECISION.md` for full architectural decisions.

---

## Phase 0A: Co-located Config ✅ COMPLETE

- [x] Created agent.yaml in each of the 16 agent folders
- [x] Deleted registry.yaml
- [x] compile.ts scans directories for agents and skills

---

## Phase 0B: SKILL.md as Source of Truth ⏳ NEXT

SKILL.md frontmatter becomes the single source of truth for skill identity. No `id` field - `name` IS the identifier.

### Tasks

- [ ] Add frontmatter parser to compile.ts (parse `---` blocks from markdown)
- [ ] Update loadAllSkills() to read from SKILL.md frontmatter instead of skill.yaml
- [ ] Rename all skill.yaml → metadata.yaml (32 files)
- [ ] Remove `id`, `name`, `description` from metadata.yaml files
- [ ] Keep in metadata.yaml: category, category_exclusive, author, version, tags, requires, compatible_with, conflicts_with
- [ ] Update SKILL.md frontmatter to use display name (not full path) for `name`
- [ ] Add optional `model` field to SKILL.md frontmatter schema
- [ ] Update schemas: create metadata.schema.json, update skill validation
- [ ] Update types.ts with new interfaces

### SKILL.md Frontmatter (Final)

```yaml
---
name: frontend/react (@vince)           # This IS the identifier
description: Component architecture, hooks, patterns
model: opus                             # Optional
---
```

### metadata.yaml (Final)

```yaml
category: framework
category_exclusive: true
author: "@vince"
version: "1.0.0"
compatible_with: [...]
conflicts_with: [...]
requires: [...]
tags: [...]
```

---

## Phase 0D: Stack Architecture ⏳ AFTER 0B

Convert stacks from single YAML files to directories.

### Tasks

- [ ] Create stack directory structure: `src/stacks/{stack-id}/`
- [ ] Move modern-react.yaml → modern-react/config.yaml
- [ ] Move minimal-react.yaml → minimal-react/config.yaml
- [ ] Move photoroom-webapp.yaml → photoroom-webapp/config.yaml
- [ ] Create CLAUDE.md for each stack (move from profiles)
- [ ] Update stack config.yaml format (skills as array, not object)
- [ ] Update compile.ts to load stacks from directories
- [ ] Add template cascade: resolveTemplate(profile, stack)
- [ ] Add CLAUDE.md cascade: resolveClaudeMd(profile, stack)

### Stack Directory (Final)

```
src/stacks/{stack-id}/
├── config.yaml           # Stack configuration
├── CLAUDE.md             # Stack conventions
└── agent.liquid          # Optional: stack-specific template
```

---

## Phase 0D.1: Stack Compilation ⏳ AFTER 0D

Add `--stack` flag to compile.ts for direct stack compilation.

### Tasks

- [ ] Add `--stack=<stack-id>` option to compile.ts
- [ ] Stack compilation outputs to same `.claude/` directory as profile compilation
- [ ] Create `home-stack` - exact 1:1 mapping of current home profile
- [ ] Create `work-stack` - exact 1:1 mapping of current work profile

### Verification (Manual)

Before proceeding to 0E, manually verify:

```bash
# Compile using profile
bun src/compile.ts --profile=home
# Save output or checksum

# Compile using stack
bun src/compile.ts --stack=home-stack
# Compare output - must be IDENTICAL

# Same for work
bun src/compile.ts --profile=work
bun src/compile.ts --stack=work-stack
# Compare output - must be IDENTICAL
```

**Only proceed to Phase 0E after personal verification that outputs are identical.**

---

## Phase 0E: Profile Simplification ⏳ AFTER VERIFICATION

Convert profiles to thin overlays pointing to stacks.

### Tasks

- [ ] Simplify home/config.yaml to just: name + stack reference
- [ ] Simplify work/config.yaml to just: name + stack reference
- [ ] Keep CLAUDE.md in profiles (optional override)
- [ ] Support optional agent.liquid in profiles (optional override)
- [ ] Remove explicit skill definitions from profile configs
- [ ] Remove explicit agent/prompt configurations from profiles
- [ ] Update compile.ts to use stack for all skill/agent resolution

### Profile config.yaml (Final)

```yaml
name: home
stack: home-stack
```

That's it. No skills, no agents, no prompts defined in profiles.

---

## Phase 0C: Skills Truly Atomic ⏳ LAST

Skills reference other domains they shouldn't own. 12 skills need cleanup.

### HIGH Priority (6 skills)

- [ ] React - remove SCSS Modules, React Query, Zustand references
- [ ] Performance (frontend) - remove React Query, SCSS, Vitest references
- [ ] React Query - remove Zustand, MSW references
- [ ] Observability - remove Hono, Drizzle, React references
- [ ] Better Auth - remove Hono, Drizzle references
- [ ] PostHog Analytics - remove Better Auth, Email references

### MEDIUM Priority (6 skills)

- [ ] SCSS Modules - remove lucide-react reference
- [ ] Zustand - remove React Query reference
- [ ] Vitest - remove MSW from description
- [ ] MSW - remove React Testing Library references
- [ ] Resend Email - use generic "authentication flow" language
- [ ] GitHub Actions - remove React Query, Zustand references

---

## Phase 3: CLI Commands ⏸️ BLOCKED

Blocked until 0B-0E complete.

- [ ] Research CLI framework (commander, oclif, etc.)
- [ ] claude-stacks list
- [ ] claude-stacks use <id>
- [ ] claude-stacks build (wizard)
- [ ] claude-stacks export

---

## Deferred (Future)

- [ ] Copy skills into stacks for independent versioning (after skills stabilize)
- [ ] Stack Arena (side-by-side comparison)
- [ ] Web catalog
- [ ] Community features (upvotes, submissions)

---

## Later

- [ ] Try https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-simplifier/agents/code-simplifier.md
