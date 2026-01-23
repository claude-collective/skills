# Work-in-Progress Output Formats

These are draft agent-specific output formats being iterated on before replacing the current generic/shared formats.

## Status

| Format                   | Target Agent        | Status |
| ------------------------ | ------------------- | ------ |
| `frontend-researcher.md` | frontend-researcher | Draft  |
| `backend-researcher.md`  | backend-researcher  | Draft  |
| `pattern-scout.md`       | pattern-scout       | Draft  |
| `agent-summoner.md`      | agent-summoner      | Draft  |
| `skill-summoner.md`      | skill-summoner      | Draft  |

## Design Principle

Output formats are **contracts between agents**. The key question: **who consumes this output and what do they need to act?**

| Agent               | Consumer              | Key Needs                                       |
| ------------------- | --------------------- | ----------------------------------------------- |
| frontend-researcher | frontend-developer    | Component props, state patterns, styling tokens |
| backend-researcher  | backend-developer     | Route handlers, DB schemas, middleware chains   |
| pattern-scout       | pattern-critique/docs | Exhaustive catalog, not recommendations         |
| agent-summoner      | User/system           | Complete agent definition structure             |
| skill-summoner      | User/system           | Complete skill definition structure             |

## Current Issues with Shared Formats

1. **Generic researcher format** - Same format for frontend and backend, but they research different things
2. **Pattern-scout uses developer format** - But pattern-scout doesn't implement, it catalogs
3. **Meta agents use developer format** - But they create different artifacts (agents vs skills)
