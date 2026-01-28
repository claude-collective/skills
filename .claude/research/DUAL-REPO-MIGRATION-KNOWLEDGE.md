# Dual Repository Migration Knowledge Document

> **Created**: 2026-01-28
> **Purpose**: Implementation specification for Phase 1 of dual-repo architecture
> **Source of Truth**: `.claude/research/findings/v2/DUAL-REPO-ARCHITECTURE.md`

---

## Executive Summary

This document captures the complete analysis for migrating from a single monorepo (`claude-subagents`) to a dual-repo architecture:

1. **CLI Repo** (`/home/vince/dev/cli`) - The CLI tool for managing skills
2. **Skills Repo** (`/home/vince/dev/claude-subagents`) - Skills, stacks, agents, and content (to become marketplace)

**Phase 1 Goal**: Enable CLI to fetch skills from remote GitHub repository instead of bundled local content.

---

## Part 1: Current State Analysis

### 1.1 Repository Comparison

| Aspect              | CLI Repo (`/home/vince/dev/cli`) | Skills Repo (`/home/vince/dev/claude-subagents`) |
| ------------------- | -------------------------------- | ------------------------------------------------ |
| **Purpose**         | CLI tool only                    | Skills, stacks, agents, templates, config        |
| **src/cli/**        | Full CLI implementation          | Identical CLI code (duplicate)                   |
| **src/agents/**     | Agent templates (bundled)        | Agent templates (source)                         |
| **src/skills/**     | NOT present                      | 76+ skills in category folders                   |
| **src/stacks/**     | NOT present                      | 14 stack configurations                          |
| **src/config/**     | NOT present                      | skills-matrix.yaml                               |
| **src/schemas/**    | JSON schemas                     | Identical schemas                                |
| **.claude-plugin/** | NOT present                      | Marketplace plugin manifest                      |
| **dist/**           | NOT present                      | Compiled plugins for distribution                |

### 1.2 CLI Code Status

Both repos contain **identical** CLI code in `src/cli/`. Files verified as identical:

- `src/cli/lib/source-fetcher.ts` - Already has giget integration
- `src/cli/lib/source-loader.ts` - Loads matrix from source
- `src/cli/lib/config.ts` - Source resolution with precedence
- `src/cli/lib/skill-copier.ts` - Copies skills from source
- `src/cli/lib/local-skill-loader.ts` - Local skill discovery
- `src/cli/commands/init.ts` - Main init command
- `src/cli/consts.ts` - Constants including paths

**File count**: 65 TypeScript files in each `src/cli/` directory (identical set).

### 1.3 Remote Fetching: Already Implemented

The CLI repo **already has giget integration** for remote fetching:

**source-fetcher.ts** (lines 61-74):

```typescript
export async function fetchFromSource(
  source: string,
  options: FetchOptions = {},
): Promise<FetchResult> {
  const { forceRefresh = false, subdir } = options;

  // Handle local sources
  if (isLocalSource(source)) {
    return fetchFromLocalSource(source, subdir);
  }

  // Handle remote sources via giget
  return fetchFromRemoteSource(source, { forceRefresh, subdir });
}
```

**config.ts** (lines 15, 192-230):

```typescript
export const DEFAULT_SOURCE = "github:claude-collective/skills";

export async function resolveSource(
  flagValue?: string,
  projectDir?: string,
): Promise<ResolvedConfig> {
  // 1. CLI flag takes highest priority
  // 2. Environment variable (CC_SOURCE)
  // 3. Project config (.claude-collective/config.yaml)
  // 4. Global config (~/.claude-collective/config.yaml)
  // 5. Default (github:claude-collective/skills)
}
```

### 1.4 How `cc init` Currently Gets Skills

**Flow (init.ts lines 157-180)**:

1. Calls `loadSkillsMatrixFromSource()` with optional `--source` flag
2. Source resolution checks: flag > env > project config > global config > default
3. If source is `github:claude-collective/skills` and local `src/skills/` exists, uses local (dev mode)
4. Otherwise, uses giget to fetch from remote
5. Matrix is loaded from `src/config/skills-matrix.yaml` in fetched content
6. Skills are extracted from `src/skills/` in fetched content

**Dev Mode Detection** (source-loader.ts lines 104-111):

```typescript
async function isDevMode(source: string): Promise<boolean> {
  if (!source.includes("claude-collective/skills")) {
    return false;
  }
  return hasLocalSkills(); // Checks if PROJECT_ROOT has src/skills/
}
```

---

## Part 2: Files to Remove from claude-subagents

### 2.1 Complete Removal List

The following files/directories should be **removed** from `claude-subagents` after migration:

| Path                     | Reason                                 |
| ------------------------ | -------------------------------------- |
| `src/cli/`               | CLI code moves to CLI repo exclusively |
| `src/types.ts`           | CLI types, move to CLI repo            |
| `src/schemas/`           | JSON schemas for CLI validation        |
| `CLI-README.md`          | CLI documentation                      |
| `CLI-TEST-PROGRESS.md`   | CLI test tracking                      |
| `MIGRATION-PLAN.md`      | Migration planning                     |
| `package.json` (partial) | Remove CLI dependencies and scripts    |
| `tsup.config.ts`         | CLI build configuration                |
| `vitest.config.ts`       | CLI test configuration                 |
| `node_modules/`          | Will be rebuilt for content-only deps  |

### 2.2 Files to KEEP in claude-subagents

| Path                            | Purpose                                    |
| ------------------------------- | ------------------------------------------ |
| `src/skills/`                   | All 76+ skills (marketplace content)       |
| `src/stacks/`                   | Stack configurations (marketplace content) |
| `src/agents/`                   | Agent templates and partials               |
| `src/config/skills-matrix.yaml` | Skill relationships and metadata           |
| `src/docs/`                     | Documentation                              |
| `src/commands/`                 | CLI command docs (reference)               |
| `.claude-plugin/`               | Marketplace plugin manifest                |
| `dist/`                         | Compiled plugins for distribution          |
| `.claude/`                      | Research, decisions, progress tracking     |
| `CLAUDE.md`                     | Project memory                             |
| `README.md`                     | Repository README                          |

### 2.3 Files Unique to Each Repo After Migration

**CLI Repo Only:**

- `src/cli/` - Complete CLI implementation
- `src/types.ts` - CLI types
- `src/schemas/` - Validation schemas
- `src/agents/` - Bundled agent templates (for compilation)
- CLI build/test config files

**Skills Repo Only:**

- `src/skills/` - Marketplace skills
- `src/stacks/` - Stack configurations
- `src/config/skills-matrix.yaml` - Skill matrix
- `src/docs/` - Documentation
- `.claude-plugin/` - Marketplace manifest
- `dist/` - Compiled plugins

---

## Part 3: Changes Needed for Remote Fetching

### 3.1 Current Blockers

**No blockers for basic remote fetching.** The infrastructure exists:

1. `giget` is already a dependency
2. `source-fetcher.ts` handles remote downloads
3. `source-loader.ts` can load from cached remote content
4. Config precedence system allows source override

### 3.2 Required Changes for Phase 1

#### Change 1: Remove Dev Mode Auto-Detection

**File**: `src/cli/lib/source-loader.ts`
**Lines**: 69, 104-111

**Current behavior**: When running from within the skills repo, automatically uses local content.

**Required change**: Remove or make optional. The CLI repo won't have `src/skills/`, so dev mode won't trigger. However, for cleaner separation:

```typescript
// Remove this check entirely, or add explicit flag
async function isDevMode(source: string): Promise<boolean> {
  // REMOVE: This check is for development within the skills repo
  // CLI repo should always fetch from remote
  return false;
}
```

**Alternative**: Keep dev mode but change condition to check for explicit `.cc-dev` marker file.

#### Change 2: Update Default Source URL

**File**: `src/cli/lib/config.ts`
**Line**: 15

**Current**:

```typescript
export const DEFAULT_SOURCE = "github:claude-collective/skills";
```

**Required**: Update to actual repository URL once renamed:

```typescript
export const DEFAULT_SOURCE =
  "github:claude-collective/claude-collective-skills";
// OR if skills repo is renamed:
export const DEFAULT_SOURCE = "github:claude-collective/skills";
```

#### Change 3: Update PROJECT_ROOT for CLI Repo

**File**: `src/cli/consts.ts`
**Lines**: 8-10

**Current**:

```typescript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const CLI_ROOT = path.resolve(__dirname, "..");
export const PROJECT_ROOT = path.resolve(__dirname, "../..");
```

**Required**: PROJECT_ROOT should not be used for content lookup in CLI repo. Content comes from fetched source, not PROJECT_ROOT.

#### Change 4: Bundle Agent Templates in CLI

Per architecture decision, templates should be bundled in CLI:

**Location in CLI repo**: `src/agents/_templates/`

Already present:

- `src/agents/_templates/agent.liquid`

**Required**: Ensure templates are bundled at build time or accessible from CLI.

### 3.3 Configuration Changes

#### New Configuration Option: Force Remote

Add option to force remote fetching even in development:

```typescript
export interface SourceLoadOptions {
  sourceFlag?: string;
  projectDir?: string;
  forceRefresh?: boolean;
  forceRemote?: boolean; // NEW: Skip dev mode detection
}
```

#### Cache Configuration

Cache location (already defined in consts.ts):

```typescript
export const CACHE_DIR = path.join(os.homedir(), ".cache", "claude-collective");
```

Skills are cached at:

```
~/.cache/claude-collective/sources/github-claude-collective-skills/
```

---

## Part 4: Testing Plan

### 4.1 Unit Tests (CLI Repo)

| Test File                    | Purpose               | Status |
| ---------------------------- | --------------------- | ------ |
| `source-fetcher.test.ts`     | Remote fetching       | EXISTS |
| `source-loader.test.ts`      | Matrix loading        | EXISTS |
| `config.test.ts`             | Source resolution     | EXISTS |
| `skill-copier.test.ts`       | Skill copying         | EXISTS |
| `local-skill-loader.test.ts` | Local skill discovery | EXISTS |

**New tests needed**:

- Test fetching from actual GitHub repo (integration)
- Test cache invalidation
- Test offline behavior with cache

### 4.2 Integration Tests

1. **Fresh Install Test**

   ```bash
   # Remove cache
   rm -rf ~/.cache/claude-collective/

   # Run init (should fetch from remote)
   cc init --source github:claude-collective/skills
   ```

2. **Cached Fetch Test**

   ```bash
   # Should use cached content
   cc init
   ```

3. **Force Refresh Test**

   ```bash
   # Should fetch fresh content
   cc init --refresh
   ```

4. **Custom Source Test**
   ```bash
   # Should fetch from custom repo
   cc init --source github:myorg/my-skills
   ```

### 4.3 End-to-End Tests

1. Run `cc init` in fresh directory
2. Verify skills are copied correctly
3. Verify agents are compiled correctly
4. Verify config.yaml is generated correctly
5. Run `cc compile` to verify recompilation works

---

## Part 5: Risk Assessment

### 5.1 High Risk Items

| Risk                 | Impact               | Mitigation                           |
| -------------------- | -------------------- | ------------------------------------ |
| Network failures     | Users can't init     | Cache fallback, clear error messages |
| GitHub rate limits   | Fetch failures       | Authenticated requests, cache        |
| Breaking API changes | Matrix parsing fails | Version pinning, validation          |

### 5.2 Medium Risk Items

| Risk                 | Impact                | Mitigation                      |
| -------------------- | --------------------- | ------------------------------- |
| Cache corruption     | Inconsistent state    | Cache validation, force refresh |
| Path resolution      | File not found errors | Comprehensive testing           |
| Local skill conflict | Duplicate skills      | Clear error messages            |

### 5.3 Low Risk Items

| Risk                    | Impact       | Mitigation                        |
| ----------------------- | ------------ | --------------------------------- |
| Performance degradation | Slower init  | Lazy loading, progress indicators |
| Disk space              | Cache growth | Cache cleanup command             |

---

## Part 6: Migration Checklist

### Phase 1: Enable Remote Fetching (This Phase)

- [ ] **P1.1** Remove dev mode auto-detection in CLI repo
- [ ] **P1.2** Verify giget fetches from remote correctly
- [ ] **P1.3** Test cache behavior (first fetch, subsequent fetches)
- [ ] **P1.4** Test force refresh flag
- [ ] **P1.5** Test custom source flag
- [ ] **P1.6** Update error messages for network failures
- [ ] **P1.7** Document source configuration options

### Phase 2: Remove CLI from Skills Repo

- [ ] **P2.1** Delete `src/cli/` directory
- [ ] **P2.2** Delete `src/types.ts`
- [ ] **P2.3** Delete `src/schemas/`
- [ ] **P2.4** Update package.json (remove CLI deps)
- [ ] **P2.5** Delete CLI config files
- [ ] **P2.6** Update README.md

### Phase 3: Rename Skills Repo

- [ ] **P3.1** Rename repo to `claude-collective-skills`
- [ ] **P3.2** Update all references in CLI repo
- [ ] **P3.3** Update documentation

---

## Part 7: Key Files Reference

### CLI Repo - Core Files

| File                                                | Purpose                    | Lines of Interest |
| --------------------------------------------------- | -------------------------- | ----------------- |
| `/home/vince/dev/cli/src/cli/lib/source-fetcher.ts` | Remote fetching via giget  | 61-74, 104-139    |
| `/home/vince/dev/cli/src/cli/lib/source-loader.ts`  | Matrix loading from source | 56-93, 104-111    |
| `/home/vince/dev/cli/src/cli/lib/config.ts`         | Source resolution          | 15, 192-230       |
| `/home/vince/dev/cli/src/cli/lib/skill-copier.ts`   | Skill copying              | 161-185, 194-230  |
| `/home/vince/dev/cli/src/cli/commands/init.ts`      | Init command               | 157-180           |
| `/home/vince/dev/cli/src/cli/consts.ts`             | Constants                  | 14-43             |

### Skills Repo - Content Files

| File                                                             | Purpose                  |
| ---------------------------------------------------------------- | ------------------------ |
| `/home/vince/dev/claude-subagents/src/skills/`                   | 76+ skills in categories |
| `/home/vince/dev/claude-subagents/src/stacks/`                   | 14 stack configurations  |
| `/home/vince/dev/claude-subagents/src/agents/`                   | Agent templates          |
| `/home/vince/dev/claude-subagents/src/config/skills-matrix.yaml` | Skill relationships      |

---

## Part 8: Implementation Notes

### For Developer Agent

When implementing Phase 1:

1. **Start with source-loader.ts** - Remove or disable dev mode detection
2. **Test fetching** - Verify giget downloads correctly
3. **Test caching** - Verify subsequent runs use cache
4. **Test edge cases** - Network failures, invalid sources, empty cache

### For Tester Agent

Test scenarios:

1. **Happy path**: Fresh init with default source
2. **Custom source**: Init with `--source` flag
3. **Cache hit**: Second init uses cache
4. **Force refresh**: `--refresh` flag fetches fresh
5. **Network failure**: Graceful error handling
6. **Invalid source**: Clear error message
7. **Local skills**: Work alongside remote skills

### For PM Agent

Track progress in:

- `.claude/progress.md` - Current migration status
- `src/docs/TODO.md` - Task tracking

Success criteria for Phase 1:

1. CLI can fetch skills from remote without local content
2. Cache works correctly
3. All existing tests pass
4. New integration tests for remote fetching

---

## Appendix A: giget Protocol Support

giget supports these source formats:

```
github:org/repo          # GitHub (default branch)
github:org/repo#ref      # GitHub with ref (branch/tag/commit)
gh:org/repo              # GitHub shorthand
gitlab:org/repo          # GitLab
bitbucket:org/repo       # Bitbucket
sourcehut:user/repo      # SourceHut
https://...              # Direct URL
```

For private repos, set `GIGET_AUTH` environment variable:

```bash
export GIGET_AUTH=ghp_your_github_token
```

---

## Appendix B: Directory Structure After Migration

### CLI Repo (claude-collective-cli)

```
cli/
├── src/
│   ├── cli/           # Complete CLI implementation
│   ├── agents/        # Bundled agent templates
│   ├── schemas/       # JSON validation schemas
│   └── types.ts       # CLI types
├── package.json       # CLI package with giget dependency
├── tsup.config.ts     # Build configuration
├── vitest.config.ts   # Test configuration
└── README.md
```

### Skills Repo (claude-collective-skills)

```
skills/
├── src/
│   ├── skills/        # 76+ skills in categories
│   ├── stacks/        # 14 stack configurations
│   ├── agents/        # Agent source (for reference)
│   ├── config/        # skills-matrix.yaml
│   └── docs/          # Documentation
├── dist/
│   ├── plugins/       # Compiled skill plugins
│   └── stacks/        # Compiled stack plugins
├── .claude-plugin/
│   ├── plugin.json    # Marketplace manifest
│   └── marketplace.json
├── package.json       # Minimal, content-focused
└── README.md
```

---

## Migration Progress Log

### 2026-01-28 - Phase 1 Complete

**Completed Tasks:**

1. **Research** (Tasks 1-3) ✅
   - Analyzed CLI repo structure
   - Identified remote fetching is already implemented via giget
   - Created this knowledge base document

2. **Implement Remote Fetching** (Task 4) ✅
   - Updated `source-loader.ts` to use opt-in `devMode` flag instead of auto-detection
   - Fixed integration tests to point to skills repo
   - Copied schemas to CLI repo
   - All 357 tests pass in CLI repo

3. **Test Remote Compilation** (Task 6) ✅
   - Verified `cc compile-plugins --skills-dir /path/to/skills` works
   - Verified `cc compile-stack` works
   - All 89 skills compile correctly
   - All 14 agents compile with full content

4. **Remove CLI from Skills Repo** (Task 5) ✅
   - Removed `src/cli/` directory
   - Removed `src/types.ts`
   - Removed `src/schemas/`
   - Removed `src/config/` (skills-matrix moved to CLI)
   - Removed `tsup.config.ts`, `vitest.config.ts`
   - Simplified `package.json` to content-only

**Current State:**

Skills repo (`claude-subagents`) now contains:

```
src/
├── agents/     # Agent templates
├── commands/   # CLI command docs (reference)
├── docs/       # Documentation
├── skills/     # 89 skills
└── stacks/     # 14 stack configurations
```

CLI repo (`cli`) now contains:

```
src/
├── agents/     # Bundled agent templates
├── cli/        # Complete CLI implementation
├── schemas/    # JSON validation schemas
└── types.ts    # CLI types
config/
└── skills-matrix.yaml  # Skills relationships
```

5. **Implement Wizard Mode Selection** (Task 7) ✅
   - Added `installMode: 'plugin' | 'local'` to wizard state and result
   - Added toggle in approach screen
   - Plugin mode shows as default (for native Claude plugin install)
   - Local mode available for `.claude/skills/` copy

6. **Bundle Templates in CLI** (Task 8) ✅
   - Updated `init.ts`, `agent-recompiler.ts`, `stack-plugin-compiler.ts`, `compiler.ts`
   - Templates now load from `PROJECT_ROOT/src/agents/_templates/`
   - Skills matrix loads from `PROJECT_ROOT/config/skills-matrix.yaml`
   - Skills content fetched from remote or local source
   - All 357 tests pass

**Final Architecture:**

```
CLI Repo (/home/vince/dev/cli)
├── config/
│   └── skills-matrix.yaml    # Bundled - skill definitions and relationships
├── src/
│   ├── agents/
│   │   └── _templates/
│   │       └── agent.liquid  # Bundled - agent compilation template
│   ├── cli/                  # CLI implementation
│   └── schemas/              # JSON validation schemas
└── package.json

Skills Repo (/home/vince/dev/claude-subagents)
├── src/
│   ├── agents/              # Agent category folders (definitions)
│   ├── skills/              # 89 skills
│   ├── stacks/              # 14 stack configurations
│   └── docs/                # Documentation
└── package.json             # Minimal, content-only
```

**Key Decisions Made:**

1. Skills matrix bundled with CLI (not fetched from remote)
2. Templates bundled with CLI (not fetched from remote)
3. Skills content fetched from source (local or remote)
4. Installation mode selection in wizard (Plugin vs Local)
5. Dev mode is now opt-in via flag, not auto-detected

---

**End of Document**
