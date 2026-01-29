# Agent Rename Tracker

## Status: COMPLETE

All agents renamed with domain prefixes to enable multi-domain installation without naming collisions.

**Repository Structure:**

- Agents live in CLI repo: `/home/vince/dev/cli/src/agents/`
- Skills and stacks live in claude-subagents repo: `/home/vince/dev/claude-subagents/src/`

## Rename Map

| Old Name              | New Name               | Status |
| --------------------- | ---------------------- | ------ |
| `frontend-developer`  | `web-developer`        | ✅     |
| `frontend-reviewer`   | `web-reviewer`         | ✅     |
| `frontend-researcher` | `web-researcher`       | ✅     |
| `backend-developer`   | `api-developer`        | ✅     |
| `backend-reviewer`    | `api-reviewer`         | ✅     |
| `backend-researcher`  | `api-researcher`       | ✅     |
| `pm`                  | `web-pm`               | ✅     |
| `architecture`        | `web-architecture`     | ✅     |
| `tester`              | `web-tester`           | ✅     |
| `pattern-critique`    | `web-pattern-critique` | ✅     |

## Unchanged (Truly Agnostic)

- `skill-summoner` - meta agent, domain-agnostic
- `agent-summoner` - meta agent, domain-agnostic
- `documentor` - meta agent, domain-agnostic
- `pattern-scout` - pattern extraction, domain-agnostic
- `cli-developer` - CLI-specific, not web/api
- `cli-reviewer` - CLI-specific, not web/api

## Files Updated

### Agent Folders (claude-subagents repo)

All 10 agent folders renamed in `/home/vince/dev/claude-subagents/src/agents/`:

- `developer/web-developer/`
- `developer/api-developer/`
- `developer/web-architecture/`
- `reviewer/web-reviewer/`
- `reviewer/api-reviewer/`
- `researcher/web-researcher/`
- `researcher/api-researcher/`
- `planning/web-pm/`
- `pattern/web-pattern-critique/`
- `tester/web-tester/`

### Stack Configs (14 files)

All stack config files updated in `/home/vince/dev/claude-subagents/src/stacks/*/config.yaml`:

- fullstack-react
- cli-stack
- minimal-backend
- mobile-stack
- modern-react
- modern-react-tailwind
- enterprise-react
- vue-stack
- nuxt-stack
- angular-stack
- solidjs-stack
- remix-stack
- full-observability
- work-stack

### CLI TypeScript Files

Updated in `/home/vince/dev/cli/src/`:

- `cli/lib/skill-agent-mappings.ts`
- `cli/commands/eject.ts`
- `schemas/stack.schema.json`
- `schemas/agent.schema.json`
- `schemas/agent-frontmatter.schema.json`
- `types.ts`
- Various test files

### Commands

- `src/commands/screenshot-to-layout.md` - updated to reference `web-developer`

### CLI Agents Folder

Removed `/home/vince/dev/cli/src/agents/` - agents should only exist in claude-subagents repo.

## Documentation Files (Not Updated)

The following documentation files still reference old names as historical context:

- `src/docs/TODO.md`
- `src/docs/TODO-COMPLETED.md`
- `src/docs/INDEX.md`
- `src/docs/plugins/*.md`
- `src/docs/agents/*.md`
- `src/docs/CLAUDE_ARCHITECTURE_BIBLE.md`

These are documentation about the system architecture and don't need updating.

## Verification

```bash
# Verify new folder names exist
ls src/agents/*/

# Verify no orphan references in active code
grep -r "frontend-developer\|backend-developer" src/agents/ src/stacks/ src/commands/
# Should return nothing
```

## Additional Fixes

### Stack Skill References

Fixed invalid skill references in all 14 stack configs:

- Replaced `methodology/universal` with `meta/methodology`
- Removed `methodology/implementation` (nonexistent)
- Removed `methodology/extended-session` (nonexistent)

The folder expansion now correctly expands `meta/methodology` to all methodology skills.

### Test Updates

- Updated `agent-recompiler.test.ts` to use CLI repo for agents
- Updated `integration.test.ts` to pass `agentSourcePath` for stack compilation
- Fixed `extractBaseName` logic to extract leaf names from paths

### CLI-Specific Agents

The following agents were not renamed (CLI-specific, not web/api):

- `cli-developer` - CLI application development
- `cli-reviewer` - CLI code review

## Date Completed

2026-01-30
