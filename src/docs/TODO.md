# Outstanding Tasks

> **Generated**: 2026-01-21 | **Updated**: 2026-01-29 | **Completed**: [TODO-COMPLETED.md](./TODO-COMPLETED.md)
>
> **Architecture**: Dual-repo complete. CLI at `/home/vince/dev/cli`. See [DUAL-REPO-ARCHITECTURE.md](./.claude/research/findings/v2/DUAL-REPO-ARCHITECTURE.md).

---

## Related Files

| File                                | Status         | Location                        |
| ----------------------------------- | -------------- | ------------------------------- |
| `DUAL-REPO-ARCHITECTURE.md`         | ✅ Implemented | `.claude/research/findings/v2/` |
| `SIMPLIFIED-PLUGIN-MIGRATION.md`    | ✅ Complete    | `.claude/tasks/`                |
| `SKILLS-MATRIX-VERIFICATION.md`     | ✅ Complete    | `.claude/research/`             |
| `SIMPLIFIED-PLUGIN-ARCHITECTURE.md` | ✅ Complete    | `.claude/research/findings/v2/` |
| `CLI-AGENT-INVOCATION-RESEARCH.md`  | 📌 Key ref     | `src/docs/cli/`                 |

---

## Counts

| Do Now | After Migration | Backlog | Triad |
| ------ | --------------- | ------- | ----- |
| 10     | 2               | 19      | 4     |

---

## 0. Triad (Human + AI Collaboration Required)

> Tasks the AI should NOT execute autonomously. Require human review at each step.

| Pri | Task                             | Status | Description                                           |
| --- | -------------------------------- | ------ | ----------------------------------------------------- |
| H   | Finish CLI skills & subagents    | DONE   | Complete setup of CLI skills and subagent definitions |
| H   | Meta-review CLI skills & agents  | DONE   | Review CLI skills/agents with meta agents before use  |
| H   | Audit CLI repo with CLI reviewer | DONE   | Run CLI reviewer subagent on `/home/vince/dev/cli`    |
| H   | Implement refactors via CLI dev  | DONE   | Execute approved refactors using CLI developer agent  |

**Workflow**: Task 1 → Task 2 (meta-review must pass) → Task 3 → Task 4

---

## 1. Do Now

| Pri | Task                        | Status  | Description                                              |
| --- | --------------------------- | ------- | -------------------------------------------------------- |
| H   | Rename agents domain prefix | DONE    | `frontend-developer` → `web-frontend-developer` etc [^6] |
| H   | Update stack agent refs     | DONE    | Update all stack configs with new agent names            |
| H   | Update agent compilation    | DONE    | Ensure compiler uses domain-prefixed agent names         |
| H   | Update agent partials       | DONE    | Update partials to reference new agent names             |
| H   | CLI skill name refs         | DONE    | Update CLI TypeScript refs to new skill paths [^7]       |
| H   | A7 Inline agent test        | PARTIAL | Needs: `model`/`tools` fields, large prompt test [^1]    |
| H   | E2E flow tests              | PARTIAL | 385 unit pass. Missing E2E wizard + flow tests [^2]      |
| H   | Manual skill testing        | TODO    | Test all 82 skills + 14 stacks                           |
| H   | Update all documentation    | TODO    | Bibles reference non-existent CLI commands, wrong paths  |
| M   | Re-add schema to skills     | TODO    | Inject schema path once CLI bundles it                   |

---

## 2. After Migration

| Pri | Task                   | Description                                     |
| --- | ---------------------- | ----------------------------------------------- |
| H   | C1 Schema Distribution | GitHub raw URLs + SchemaStore PR                |
| M   | C6 `cc doctor`         | Diagnose connectivity/auth issues (new command) |

---

## 3. Backlog

### Skills & Content

| Pri | Task                       | Description                                   |
| --- | -------------------------- | --------------------------------------------- |
| H   | Skill optimization suite   | Eval existing tools + build meta-skills [^3]  |
| M   | Skill granularity refactor | Split into `examples/` + `patterns/` folders  |
| L   | New skills (Critical)      | nx, docker, k8s, vite, svelte, supabase, AI   |
| L   | New skills (High)          | astro, firebase, clerk, cloudflare, terraform |
| L   | Roadmap Phase 3-5          | background-jobs, caching, i18n, payments      |

### CLI & Infrastructure

| Pri | Task                     | Description                                            |
| --- | ------------------------ | ------------------------------------------------------ |
| M   | Multi-stack merging      | Compile + merge multiple stacks with agent rename [^5] |
| M   | Advanced wizard UI       | Migrate @clack → Ink [^4]                              |
| M   | Output styles research   | Concise mode for agent cross-communication             |
| L   | Template refactoring     | Split agent.liquid into partials                       |
| L   | Marketplace foundation   | Stack Marketplace Phase 1-2                            |
| L   | Community submission     | `cc submit` flow                                       |
| L   | External skill sources   | `cc add --source github:user/repo`                     |
| L   | Claude simplifier hook   | Hook to simplify Claude responses                      |
| L   | CLI branding             | ASCII art logo + animated mascot                       |
| L   | Agent partials refactor  | Improve naming/modularity of workflow.md, intro.md     |
| L   | Configurable thinking    | `--thinking <tokens>`, `--agent-thinking <agent>:<n>`  |
| L   | Metadata auto-generation | Generate metadata.yaml from SKILL.md frontmatter       |
| L   | Project agent-hooks      | `.claude/agent-hooks.yaml` → package.json scripts      |

### Documentation

| Pri | Task                    | Description                            |
| --- | ----------------------- | -------------------------------------- |
| L   | GitHub raw URLs         | Update yaml-language-server references |
| L   | SchemaStore PR          | Automatic IDE detection                |
| L   | Platform support docs   | GitHub, GitLab, GitHub Enterprise      |
| L   | Unsupported platforms   | Bitbucket private, Azure DevOps        |
| L   | Generalize MobX skill   | Remove PhotoRoom-specific patterns     |
| L   | Generalize Tailwind     | Remove PhotoRoom-specific patterns     |
| L   | Contribution guidelines | For community skills                   |
| L   | Private skill guide     | For company-specific skills            |

### Testing

| Pri | Task                  | Description                          |
| --- | --------------------- | ------------------------------------ |
| L   | Private repo blockers | Document Bitbucket, Azure DevOps     |
| L   | Content linting       | Skills can omit sections             |
| L   | Skill structure valid | Missing required sections undetected |

---

## Footnotes

[^1]: **A7 Inline agent test** - Basic `--agents` JSON tested. Still needs: `model` and `tools` fields verification, large prompt test (~2000 lines), tool restrictions enforcement.

[^2]: **E2E flow tests** - Missing: E2E wizard tests, local→plugin flow, plugin→local flow, plugin→plugin flow. See `CLI-TEST-PROGRESS.md`.

[^3]: **Skill optimization suite** - Combined effort:

1. Try existing tools: [johnlindquist gist](https://gist.github.com/johnlindquist/849b813e76039a908d962b2f0923dc9a), [ClaudeSkills-Optimizer-GEFA](https://github.com/rartzi/ClaudeSkills-Optimizer-GEFA), [prompt-optimization-analyzer](https://github.com/Exploration-labs/Nates-Substack-Skills/tree/main/prompt-optimization-analyzer)
2. Create Rolf Wiggins-inspired prompt compaction skill
3. Build meta-skills for diagnosing skill issues, improving prompts, validating quality

[^4]: **Advanced wizard UI** - Migrate `cc init` wizard from @clack to Ink. Enables: horizontal tabs, arrow key navigation, single-view skill selection with expand/collapse, horizontal dividers. See `CLI-FRAMEWORK-RESEARCH.md`. Options: **Ink** (React for CLI, recommended), **blessed/neo-blessed** (widget-based TUI), **terminal-kit** (low-level + widgets), **Textual** (Python, rewrite required).

[^5]: **Multi-stack merging** - Combine multiple stacks (web + mobile + backend) into one plugin. **Problem**: Agent name collisions (`frontend-developer` exists in both `nextjs-fullstack` and `react-native-stack` with different skills). **Solution**: Domain-prefixed agent names:

- `web-frontend-developer`, `web-backend-developer` (web stacks)
- `mobile-frontend-developer` (mobile stacks)
- `api-backend-developer` (API-only stacks)
- Meta agents (`pm`, `skill-summoner`, `documentor`) stay unchanged (stack-agnostic)

Requires renaming agents across all 14 stacks and updating `agent_skills` mappings.

[^6]: **Rename agents domain prefix** - Rename all agents with domain prefixes to enable multi-stack installation without collisions:

- `frontend-developer` → `web-frontend-developer`
- `frontend-reviewer` → `web-frontend-reviewer`
- `backend-developer` → `api-backend-developer`
- `backend-reviewer` → `api-backend-reviewer`
- Mobile stack: `mobile-developer`, `mobile-reviewer`, `mobile-pm`
- Meta agents stay unprefixed: `pm`, `skill-summoner`, `agent-summoner`, `documentor`
- Update: agent definitions in `src/agents/`, stack configs, agent_skills mappings, partials

[^7]: **CLI skill name refs** - The CLI has TypeScript files that reference skill names (e.g., skill-to-agent mapping). These need updating to use new paths (`web/framework/react` instead of `frontend/framework/react`, `api/framework/hono` instead of `backend/api/hono`). Check `/home/vince/dev/cli/src/` for hardcoded skill references.

---

## Decision Log

| Date       | Decision                         | Rationale                                                                             |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| 2026-01-29 | One plugin per domain            | Each domain (web, mobile, api) = one stack = one plugin. Enables multi-domain install |
| 2026-01-29 | Skill taxonomy: domain/cat/lib   | Renamed 82 skills: frontend→web, backend→api, setup splits, methodology→meta          |
| 2026-01-29 | Domain-prefixed agents           | `web-frontend-developer`, `api-backend-developer` to avoid collision across domains   |
| 2026-01-28 | Agents are NOT plugins           | Agents are compiled output, not marketplace artifacts. Only Skills/Stacks distribute  |
| 2026-01-26 | Custom skills: no schema comment | Official skills get strict validation; custom skills relaxed                          |
| 2026-01-26 | Expert Mode in wizard            | Toggle disables conflict checking for advanced users                                  |
| 2026-01-25 | Simplified plugin architecture   | One plugin per project. Stacks → templates. No `cc switch`                            |
| 2026-01-25 | Version deprecated in metadata   | Version in `plugin.json` only; `content_hash` for change detection                    |
| 2026-01-25 | Summoners as local agents        | `cc add` installs locally, works offline                                              |
| 2026-01-25 | Thinking budget: use defaults    | Claude Code defaults to max thinking (31,999 tokens)                                  |
| 2026-01-25 | Core principles in template      | Embedded in agent.liquid, not a skill                                                 |
| 2026-01-24 | Plugin-based versioning          | Version in `plugin.json`, not `metadata.yaml`                                         |
| 2026-01-23 | Architecture finalized           | Marketplace is source of truth; CLI is thin                                           |
| 2026-01-22 | Inline agent invocation via CLI  | `--agents` JSON flag verified working                                                 |
| 2026-01-21 | Integer versioning               | Zero friction; semver overkill for markdown skills                                    |

---

## Quick Reference

### Compile Plugins

```bash
bun src/cli/index.ts compile-plugins           # Compile all skills
bun src/cli/index.ts compile-stack -s nextjs-fullstack  # Compile stack
bun src/cli/index.ts generate-marketplace      # Generate marketplace
bun src/cli/index.ts validate dist/plugins --all  # Validate plugins
```

### Test Inline Agent Invocation

See `CLI-AGENT-INVOCATION-RESEARCH.md` for full details.

```bash
bun src/cli/index.ts test-agent  # Basic test via CLI
claude --agents '{"test": {"description": "Test agent", "prompt": "You are a test agent."}}' --agent test -p "Hello"
```

---

## Exit Codes

| Code | Meaning            |
| ---- | ------------------ |
| 0    | Success            |
| 1    | General error      |
| 2    | Invalid arguments  |
| 3    | Network/auth error |
| 4    | User cancelled     |
