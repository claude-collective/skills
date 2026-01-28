# Local Skills Implementation Plan

## Overview

Enable users to define custom skills in their project's `.claude/skills/` folder. These skills appear alongside marketplace skills in the CLI wizard but are treated differently during compilation.

## Key Decisions

| Aspect                  | Decision                                                  |
| ----------------------- | --------------------------------------------------------- |
| **Location**            | `.claude/skills/` in project directory                    |
| **Path in config.yaml** | Absolute path (not relative)                              |
| **Discovery**           | Auto-scan on CLI commands (`cc init`, `cc compile`, etc.) |
| **Category**            | Dedicated "local" category for visual separation          |
| **Author**              | `@local` to differentiate from marketplace skills         |
| **Schema validation**   | Relaxed (no yaml-language-server comment required)        |
| **Conflict checking**   | None for Phase 1 (local skills allowed with anything)     |

## Phase 1 Requirements

### Skill Structure

```
project/
├── .claude/
│   └── skills/
│       ├── my-company-patterns/
│       │   ├── metadata.yaml    # REQUIRED for Phase 1
│       │   └── SKILL.md
│       └── internal-api-client/
│           ├── metadata.yaml
│           └── SKILL.md
```

### Minimal metadata.yaml

```yaml
# No yaml-language-server schema comment (relaxed validation)
category: local # Always "local" for local skills
author: "@local" # Auto-set or required
cli_name: My Company Patterns # Required - display name
cli_description: Internal coding standards # Required - short description
```

### config.yaml Output

When a local skill is selected, it appears in config.yaml with absolute path:

```yaml
skills:
  - id: react (@vince)
  - id: my-company-patterns (@local)
    local: true
    path: /home/user/project/.claude/skills/my-company-patterns/
```

## Implementation Steps

### 1. Local Skill Discovery

Create `src/cli/lib/local-skill-loader.ts`:

```typescript
interface LocalSkillDiscoveryResult {
  skills: Record<string, LocalSkillMetadata>;
  path: string; // Absolute path to .claude/skills/
}

async function discoverLocalSkills(
  projectDir: string,
): Promise<LocalSkillDiscoveryResult | null>;
```

- Scan for `.claude/skills/` in project directory
- For each subdirectory with `metadata.yaml`, load as local skill
- Set `author: "@local"` and `category: "local"` automatically
- Return null if no `.claude/skills/` folder exists

### 2. Merge with Marketplace Skills

In `source-loader.ts` or wizard initialization:

```typescript
// Load marketplace skills
const marketplaceResult = await loadSkillsMatrixFromSource(options);

// Discover local skills
const localResult = await discoverLocalSkills(process.cwd());

// Merge (local skills added to matrix with special handling)
const mergedMatrix = mergeLocalSkills(marketplaceResult.matrix, localResult);
```

### 3. Wizard Display

Local skills appear in a dedicated "Local Skills" category:

```
◆  Select skills

  📦 Framework
    ○ React
    ○ Vue

  📦 Local Skills              # <-- New category
    ○ my-company-patterns (local)
    ○ internal-api-client (local)
```

### 4. Skip Copying

In `skill-copier.ts`:

```typescript
// Local skills are NOT copied - they stay in place
if (skill.local) {
  return {
    skillId: skill.id,
    path: skill.absolutePath, // Use original location
    local: true,
  };
}
```

### 5. Agent Compilation

When resolving skills for agents, local skills use their absolute path:

```typescript
// For local skills, path is absolute to project
const skillPath = skill.local
  ? skill.absolutePath
  : path.join(pluginDir, "skills", skill.relativePath);
```

## Visual Differentiation

Options for making local skills stand out in the wizard:

1. **Category separation**: All local skills in "Local Skills" category (chosen)
2. **Suffix**: `my-skill (local)`
3. **Color**: Different color in terminal (could add later)
4. **Icon**: Prefix with 📁 or similar (could add later)

## Future Enhancements (Not Phase 1)

- Auto-generate `metadata.yaml` from SKILL.md frontmatter if missing
- Local `.claude/skills-matrix.yaml` for defining relationships between local skills
- Support local skills defining conflicts/requirements with marketplace skills
- `cc validate` checks for local skill structure issues
- Grep-based discovery to check if local skill might conflict with marketplace skill

## Files to Create/Modify

| File                                | Change                                |
| ----------------------------------- | ------------------------------------- |
| `src/cli/lib/local-skill-loader.ts` | **NEW** - Discovery and loading       |
| `src/cli/lib/source-loader.ts`      | Merge local skills into matrix        |
| `src/cli/lib/skill-copier.ts`       | Skip copying for local skills         |
| `src/cli/lib/config-generator.ts`   | Include local flag and absolute path  |
| `src/cli/commands/init.ts`          | Trigger local skill discovery         |
| `src/cli/commands/compile.ts`       | Handle local skills in recompilation  |
| `src/cli/types-matrix.ts`           | Add `local` and `absolutePath` fields |

## Testing Checklist

- [ ] Local skills discovered from `.claude/skills/`
- [ ] Local skills appear in "Local Skills" category in wizard
- [ ] Local skills can be selected alongside marketplace skills
- [ ] Local skills are NOT copied to plugin folder
- [ ] config.yaml contains absolute path for local skills
- [ ] Agents compile correctly with local skill references
- [ ] `cc compile` handles local skills on recompilation
- [ ] Works when `.claude/skills/` doesn't exist (graceful fallback)
- [ ] Works with empty `.claude/skills/` folder
