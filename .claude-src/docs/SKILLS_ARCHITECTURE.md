# Skills Architecture

## Directory Structure

```
skills/
├── frontend/
│   ├── react.md              # Component architecture, cva, forwardRef, React.memo, optimization
│   ├── api.md                # OpenAPI client, React Query, infinite queries, cache invalidation
│   ├── styling.md            # Tokens, SCSS, cascade layers, dark mode
│   ├── accessibility.md      # WCAG, ARIA, semantic HTML, testing
│   ├── testing.md            # Component testing, E2E with Playwright
│   ├── client-state.md       # useState, Zustand, Context (NOT for API state)
│   ├── mocking.md            # MSW setup, handlers, variants, browser/server workers
│   └── performance.md        # Core Web Vitals, bundle analysis, code splitting, profiling
│
├── backend/
│   ├── api.md                # Hono routes, OpenAPI, Zod, rate limiting, webhooks
│   ├── ci-cd.md              # GitHub Actions, deployment, workflows
│   ├── database.md           # Drizzle ORM, Neon, queries, migrations, indexing, optimization
│   ├── testing.md            # ⏳ PENDING - API testing, database testing, integration
│   └── performance.md        # ⏳ PENDING - Query optimization, caching, indexing
│
├── security/
│   └── security.md           # Secrets, XSS/CSRF/CSP, OAuth/JWT, OWASP, rate limiting
│
├── shared/
│   └── reviewing.md          # Review process, output format, severity levels, actionable feedback
│
└── setup/
    ├── monorepo.md           # Initial monorepo structure, workspace config
    ├── package.md            # Creating new packages/apps, template structure
    ├── env.md                # Environment variable configuration
    ├── tooling.md            # Turborepo, bun, dev tools initial config
```

> **Note:** Each skill is a single comprehensive file. No basic/advanced split - hyper-specialized agents don't need that complexity.

---

## 📊 Skills Status

| Category  | Count  | Status           | Notes                                 |
| --------- | ------ | ---------------- | ------------------------------------- |
| Frontend  | 8      | ✅               | All skills complete                   |
| Backend   | 5      | ⚠️               | testing.md and performance.md pending |
| Security  | 1      | ✅               | Complete                              |
| Shared    | 1      | ✅               | reviewing.md complete                 |
| Setup     | 8      | ⚠️               | 4 new scaffolding skills pending      |
| **Total** | **23** | **17 ✅ / 6 ⏳** | 17 complete, 6 pending                |

### Pending Items

**Backend:**

- ⏳ `backend/testing.md` - API testing, database testing, integration
- ⏳ `backend/performance.md` - Query optimization, caching, indexing

**Setup (scaffolding skills):**

- ⏳ `setup/api.md` - Hono app scaffold, middleware chain, route structure
- ⏳ `setup/database.md` - Drizzle config, connection setup, first schema
- ⏳ `setup/frontend.md` - React app scaffold, provider setup, layout structure
- ⏳ `setup/testing.md` - Vitest/Playwright config, MSW initial setup

---

## 🤖 Agent Ecosystem

### Agent Overview

#### Planning Agents

| Agent          | Purpose                                                    | Invocation                       |
| -------------- | ---------------------------------------------------------- | -------------------------------- |
| **documentor** | Maintains living docs (WHERE things are, HOW they work)    | Ongoing, before pm for new areas |
| **pm**         | Creates specs (WHAT to build + WHERE via doc refs, NO HOW) | Before any new feature           |

#### Implementation Agents

| Agent                  | Purpose                                                       | Invocation                      |
| ---------------------- | ------------------------------------------------------------- | ------------------------------- |
| **architect**          | Scaffolds new apps with full plumbing (DB + API + UI + tests) | When adding new app to monorepo |
| **frontend-developer** | Implements frontend features (React, styling, client state)   | After pm creates spec           |
| **backend-developer**  | Implements backend features (API, database, CI/CD)            | After pm creates spec           |
| **tester**             | Writes ALL tests (frontend + backend) BEFORE implementation   | Before developer implements     |

#### Review Agents

| Agent                 | Purpose                                              | Invocation                |
| --------------------- | ---------------------------------------------------- | ------------------------- |
| **frontend-reviewer** | Reviews frontend code (_.tsx/_.jsx, styling, state)  | After frontend changes    |
| **backend-reviewer**  | Reviews backend code (API, database, configs, CI/CD) | After backend changes     |
| **tester-reviewer**   | Reviews test quality, coverage, patterns             | After tester writes tests |

#### Meta Agents

| Agent                | Purpose                                       | Invocation                       |
| -------------------- | --------------------------------------------- | -------------------------------- |
| **pattern-scout**    | Extracts patterns from new codebases          | For new/unfamiliar codebases     |
| **pattern-critique** | Critiques patterns against industry standards | After pattern-scout              |
| **skill-summoner**   | Creates/improves technology-specific skills   | When skills need creation/update |
| **agent-summoner**   | Creates/improves agents                       | When agents need creation/update |

### Agent Responsibilities

#### Documentation-First Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         documentor                                   │
│  OWNS: "WHERE things are" + "HOW things work" + "WHAT patterns"     │
│  OUTPUT: Living documentation consumed by other agents               │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ maintains docs
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            pm                                        │
│  OWNS: "WHAT to build" + references WHERE from docs                 │
│  DOES NOT OWN: Implementation details (HOW)                         │
│  OUTPUT: High-level spec with doc references                        │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ spec (what + where)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    developer agents                                  │
│  OWNS: "HOW to implement" (via pre-loaded skills)                   │
│  INPUT: PM spec + documentor docs + skills                          │
└─────────────────────────────────────────────────────────────────────┘
```

#### Why This Scales

| Old Model (PM owns HOW)                 | New Model (PM owns WHAT)            |
| --------------------------------------- | ----------------------------------- |
| PM must know all implementation details | PM only needs requirements          |
| PM context grows with codebase          | PM context stays lean               |
| Duplicates skill knowledge              | Skills own implementation knowledge |
| PM researches codebase each time        | Documentor maintains living docs    |

### Agent Workflow

```
                    ┌─────────────────┐
                    │   documentor    │
                    │ (living docs)   │
                    └────────┬────────┘
                             │ docs
                             ▼
                    ┌─────────────────┐
                    │       pm        │
                    │ (WHAT + WHERE)  │
                    └────────┬────────┘
                             │ spec
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   architect   │   │    tester     │   │  developers   │
│ (scaffolding) │   │ (all tests)   │   │ (front+back)  │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
           ┌────────────────┼────────────────┐
           ▼                ▼                ▼
   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
   │frontend-      │ │backend-       │ │tester-        │
   │reviewer       │ │reviewer       │ │reviewer       │
   └───────────────┘ └───────────────┘ └───────────────┘
```

### Test Ownership

| Agent                  | Test Responsibility                      |
| ---------------------- | ---------------------------------------- |
| **tester**             | Writes ALL tests (frontend + backend)    |
| **frontend-developer** | Implements code, does NOT write tests    |
| **backend-developer**  | Implements code, does NOT write tests    |
| **tester-reviewer**    | Reviews test quality, coverage, patterns |
| **frontend-reviewer**  | Reviews implementation, NOT tests        |
| **backend-reviewer**   | Reviews implementation, NOT tests        |

---

## 🔗 Agent-to-Skill Mapping

### Legend

- **📦 Pre-compiled** = Bundled via @include, always in context
- **⚡ Dynamic** = Loaded via Skill tool when needed

---

### architect

> Scaffolds new apps in the monorepo with complete plumbing

| Type            | Skill               | When to Invoke                                 |
| --------------- | ------------------- | ---------------------------------------------- |
| 📦 Pre-compiled | `setup/monorepo`    | Always in context                              |
| 📦 Pre-compiled | `setup/package`     | Always in context                              |
| 📦 Pre-compiled | `setup/tooling`     | Always in context                              |
| 📦 Pre-compiled | `setup/env`         | Always in context                              |
| 📦 Pre-compiled | `setup/api`         | Always in context                              |
| 📦 Pre-compiled | `setup/database`    | Always in context                              |
| 📦 Pre-compiled | `setup/frontend`    | Always in context                              |
| 📦 Pre-compiled | `setup/testing`     | Always in context                              |
| 📦 Pre-compiled | `frontend/react`    | Always in context                              |
| 📦 Pre-compiled | `frontend/styling`  | Always in context                              |
| ⚡ Dynamic      | `backend/api`       | When scaffolding requires complex API patterns |
| ⚡ Dynamic      | `backend/database`  | When scaffolding requires complex DB patterns  |
| ⚡ Dynamic      | `frontend/mocking`  | When scaffolding requires full MSW patterns    |
| ⚡ Dynamic      | `security/security` | When auth scaffolding is needed                |

**Rationale:** Dedicated setup skills (api, database, frontend, testing) provide scaffolding patterns separate from build tooling. Full implementation skills loaded dynamically only when scaffolding requires deeper patterns. 10 pre-compiled skills, but all lean and scaffolding-focused.

---

### frontend-developer

> Implements frontend features on existing codebases (does NOT write tests)

| Type            | Skill                    | When to Invoke                                                  |
| --------------- | ------------------------ | --------------------------------------------------------------- |
| 📦 Pre-compiled | `frontend/react`         | Always in context                                               |
| 📦 Pre-compiled | `frontend/styling`       | Always in context                                               |
| ⚡ Dynamic      | `frontend/api`           | When integrating with REST APIs or GraphQL endpoints            |
| ⚡ Dynamic      | `frontend/client-state`  | When working with React Query, Zustand, or MobX patterns        |
| ⚡ Dynamic      | `frontend/accessibility` | When implementing accessible components, forms, or interactions |
| ⚡ Dynamic      | `frontend/performance`   | When optimizing render performance, bundle size, or runtime     |

**Rationale:** Only react and styling are needed 80%+ of tasks. Other skills loaded based on task requirements from PM spec. NO testing skills - tester agent owns all tests.

---

### backend-developer

> Implements backend features on existing codebases (does NOT write tests)

| Type            | Skill                 | When to Invoke                                 |
| --------------- | --------------------- | ---------------------------------------------- |
| 📦 Pre-compiled | `backend/api`         | Always in context                              |
| ⚡ Dynamic      | `backend/database`    | When working with DB queries, schemas, or ORM  |
| ⚡ Dynamic      | `backend/ci-cd`       | When modifying pipelines or deployment configs |
| ⚡ Dynamic      | `security/security`   | When handling authentication or sensitive data |
| ⚡ Dynamic      | `backend/performance` | When optimizing queries, caching, or indexing  |

**Rationale:** Only backend/api is needed 80%+ of tasks (most backend work is API routes). Other skills loaded based on task requirements from PM spec. NO testing skills - tester agent owns all tests.

---

### pm

> Creates high-level specs (WHAT + WHERE) - does NOT specify implementation details (HOW)

| Type            | Skill                    | When to Invoke                                          |
| --------------- | ------------------------ | ------------------------------------------------------- |
| 📦 Pre-compiled | None                     | Reads documentor output instead                         |
| ⚡ Dynamic      | `frontend/react`         | When spec involves React components or component arch   |
| ⚡ Dynamic      | `frontend/api`           | When spec involves REST APIs, data fetching, or caching |
| ⚡ Dynamic      | `frontend/styling`       | When spec involves styling, theming, or design tokens   |
| ⚡ Dynamic      | `frontend/accessibility` | When spec involves a11y requirements                    |
| ⚡ Dynamic      | `frontend/client-state`  | When spec involves client-side state management         |
| ⚡ Dynamic      | `frontend/performance`   | When spec involves performance requirements             |
| ⚡ Dynamic      | `frontend/mocking`       | When spec involves MSW or mock data patterns            |
| ⚡ Dynamic      | `frontend/testing`       | When spec involves frontend testing requirements        |
| ⚡ Dynamic      | `backend/api`            | When spec involves API routes, middleware, or webhooks  |
| ⚡ Dynamic      | `backend/database`       | When spec involves database schema or queries           |
| ⚡ Dynamic      | `backend/ci-cd`          | When spec involves CI/CD or deployment                  |
| ⚡ Dynamic      | `security/security`      | When spec involves authentication or authorization      |
| ⚡ Dynamic      | `setup/monorepo`         | When spec involves monorepo structure changes           |
| ⚡ Dynamic      | `setup/package`          | When spec involves creating new packages                |
| ⚡ Dynamic      | `setup/env`              | When spec involves environment configuration            |
| ⚡ Dynamic      | `setup/tooling`          | When spec involves build tooling changes                |
| ⚡ Dynamic      | `shared/reviewing`       | When spec needs review process context                  |

**Rationale:** PM owns WHAT to build and WHERE (via documentor's docs). Developer agents own HOW (via their pre-loaded skills). PM loads skills to understand scope (what capabilities exist, what patterns to reference), NOT to specify implementation details. This separation scales as codebase grows.

**PM Spec Format:**

```
## Feature: [Name]
### Requirements (WHAT)
- [Business requirement 1]
- [Business requirement 2]

### Location (WHERE - from documentor docs)
- Frontend: [doc reference to component location]
- Backend: [doc reference to API location]
- Database: [doc reference to schema location]

### Success Criteria
- [Measurable outcome 1]
- [Measurable outcome 2]

### NOT Included (explicitly NO HOW)
- No code examples
- No implementation patterns (skills own this)
- No specific function names
```

---

### tester

> Writes ALL tests (frontend + backend) BEFORE implementation

| Type            | Skill                    | When to Invoke                   |
| --------------- | ------------------------ | -------------------------------- |
| 📦 Pre-compiled | `frontend/testing`       | Always in context                |
| 📦 Pre-compiled | `backend/testing`        | Always in context                |
| 📦 Pre-compiled | `frontend/mocking`       | Always in context                |
| ⚡ Dynamic      | `frontend/accessibility` | When writing accessibility tests |
| ⚡ Dynamic      | `frontend/performance`   | When writing performance tests   |

**Rationale:** Testing skills are core; MSW needed for integration tests. A11y and performance tests are specialized.

---

### frontend-reviewer

> Reviews frontend implementation code (_.tsx/_.jsx, styling, state) - does NOT review tests

| Type            | Skill                    | When to Invoke                           |
| --------------- | ------------------------ | ---------------------------------------- |
| 📦 Pre-compiled | `shared/reviewing`       | Always in context                        |
| 📦 Pre-compiled | `frontend/react`         | Always in context                        |
| 📦 Pre-compiled | `frontend/styling`       | Always in context                        |
| 📦 Pre-compiled | `frontend/accessibility` | Always in context                        |
| ⚡ Dynamic      | `frontend/client-state`  | When reviewing state management code     |
| ⚡ Dynamic      | `frontend/performance`   | When reviewing performance-critical code |

**Rationale:** Reviewing skill provides consistent review process across all reviewers. React, styling, and a11y always relevant for component review; other skills contextual. Does NOT review tests - tester-reviewer handles that.

---

### backend-reviewer

> Reviews backend code (API, database, configs, CI/CD, security) - does NOT review tests

| Type            | Skill               | When to Invoke                                 |
| --------------- | ------------------- | ---------------------------------------------- |
| 📦 Pre-compiled | `shared/reviewing`  | Always in context                              |
| 📦 Pre-compiled | `backend/api`       | Always in context                              |
| 📦 Pre-compiled | `security/security` | Always in context                              |
| ⚡ Dynamic      | `backend/database`  | When reviewing database queries or schema code |
| ⚡ Dynamic      | `backend/ci-cd`     | When reviewing pipeline or deployment configs  |
| ⚡ Dynamic      | `setup/env`         | When reviewing environment variable configs    |

**Rationale:** Reviewing skill provides consistent review process across all reviewers. API and security always relevant for backend review; DB, CI/CD, and env contextual. Does NOT review tests - tester-reviewer handles that.

---

### tester-reviewer

> Reviews test quality, coverage, patterns, and anti-patterns

| Type            | Skill                    | When to Invoke                             |
| --------------- | ------------------------ | ------------------------------------------ |
| 📦 Pre-compiled | `shared/reviewing`       | Always in context                          |
| 📦 Pre-compiled | `frontend/testing`       | Always in context                          |
| 📦 Pre-compiled | `backend/testing`        | Always in context                          |
| 📦 Pre-compiled | `frontend/mocking`       | Always in context                          |
| ⚡ Dynamic      | `frontend/accessibility` | When reviewing accessibility test coverage |
| ⚡ Dynamic      | `frontend/performance`   | When reviewing performance test coverage   |

**Rationale:** Reviewing skill provides consistent review process across all reviewers. Test reviewer needs comprehensive testing knowledge across frontend and backend. Reviews test quality, not implementation.

**Review Focus:**

- Test coverage gaps
- Test anti-patterns (flaky tests, over-mocking, testing implementation details)
- Test organization and naming
- Test performance (slow tests)
- MSW mock accuracy
- E2E vs unit test balance

---

### pattern-scout

> Extracts patterns from codebases (discovery agent)

| Type            | Skill                    | When to Invoke                                          |
| --------------- | ------------------------ | ------------------------------------------------------- |
| 📦 Pre-compiled | None                     | N/A                                                     |
| ⚡ Dynamic      | `frontend/react`         | When extracting and comparing React component patterns  |
| ⚡ Dynamic      | `frontend/api`           | When extracting and comparing API client patterns       |
| ⚡ Dynamic      | `frontend/styling`       | When extracting and comparing CSS/styling patterns      |
| ⚡ Dynamic      | `frontend/accessibility` | When extracting and comparing a11y patterns             |
| ⚡ Dynamic      | `frontend/client-state`  | When extracting and comparing state management patterns |
| ⚡ Dynamic      | `frontend/performance`   | When extracting and comparing performance patterns      |
| ⚡ Dynamic      | `frontend/mocking`       | When extracting and comparing MSW/mock patterns         |
| ⚡ Dynamic      | `frontend/testing`       | When extracting and comparing frontend test patterns    |
| ⚡ Dynamic      | `backend/api`            | When extracting and comparing API route patterns        |
| ⚡ Dynamic      | `backend/database`       | When extracting and comparing database patterns         |
| ⚡ Dynamic      | `backend/ci-cd`          | When extracting and comparing CI/CD patterns            |
| ⚡ Dynamic      | `security/security`      | When extracting and comparing auth/security patterns    |
| ⚡ Dynamic      | `setup/monorepo`         | When extracting and comparing monorepo patterns         |
| ⚡ Dynamic      | `setup/package`          | When extracting and comparing package patterns          |
| ⚡ Dynamic      | `setup/env`              | When extracting and comparing env config patterns       |
| ⚡ Dynamic      | `setup/tooling`          | When extracting and comparing build tooling patterns    |
| ⚡ Dynamic      | `shared/reviewing`       | When extracting and comparing code review patterns      |

**Rationale:** Discovery-based agent. Loads skills dynamically to compare what it finds against documented standards. This enables pattern validation during extraction.

---

### pattern-critique

> Critiques patterns against industry standards

| Type            | Skill                    | When to Invoke                                        |
| --------------- | ------------------------ | ----------------------------------------------------- |
| 📦 Pre-compiled | None                     | N/A                                                   |
| ⚡ Dynamic      | `frontend/react`         | When critiquing React component architecture patterns |
| ⚡ Dynamic      | `frontend/api`           | When critiquing API client usage patterns             |
| ⚡ Dynamic      | `frontend/styling`       | When critiquing CSS/styling patterns                  |
| ⚡ Dynamic      | `frontend/accessibility` | When critiquing accessibility patterns                |
| ⚡ Dynamic      | `frontend/client-state`  | When critiquing state management patterns             |
| ⚡ Dynamic      | `frontend/performance`   | When critiquing frontend performance patterns         |
| ⚡ Dynamic      | `frontend/mocking`       | When critiquing MSW/mock data patterns                |
| ⚡ Dynamic      | `frontend/testing`       | When critiquing frontend testing patterns             |
| ⚡ Dynamic      | `backend/api`            | When critiquing API route and middleware patterns     |
| ⚡ Dynamic      | `backend/database`       | When critiquing database query or schema patterns     |
| ⚡ Dynamic      | `backend/ci-cd`          | When critiquing CI/CD pipeline patterns               |
| ⚡ Dynamic      | `security/security`      | When critiquing authentication or security patterns   |
| ⚡ Dynamic      | `setup/monorepo`         | When critiquing monorepo structure patterns           |
| ⚡ Dynamic      | `setup/package`          | When critiquing package organization patterns         |
| ⚡ Dynamic      | `setup/env`              | When critiquing environment configuration patterns    |
| ⚡ Dynamic      | `setup/tooling`          | When critiquing build tooling patterns                |
| ⚡ Dynamic      | `shared/reviewing`       | When critiquing code review process patterns          |

**Rationale:** Comparison-based agent. Loads relevant skills to compare extracted patterns against documented best practices and provide informed critique.

---

### skill-summoner

> Creates and improves technology-specific skills

| Type            | Skill                    | When to Invoke                                      |
| --------------- | ------------------------ | --------------------------------------------------- |
| 📦 Pre-compiled | None                     | N/A                                                 |
| ⚡ Dynamic      | `frontend/react`         | When creating/improving React-related skills        |
| ⚡ Dynamic      | `frontend/api`           | When creating/improving API client skills           |
| ⚡ Dynamic      | `frontend/styling`       | When creating/improving styling skills              |
| ⚡ Dynamic      | `frontend/accessibility` | When creating/improving accessibility skills        |
| ⚡ Dynamic      | `frontend/client-state`  | When creating/improving state management skills     |
| ⚡ Dynamic      | `frontend/performance`   | When creating/improving frontend performance skills |
| ⚡ Dynamic      | `frontend/mocking`       | When creating/improving mocking/MSW skills          |
| ⚡ Dynamic      | `frontend/testing`       | When creating/improving frontend testing skills     |
| ⚡ Dynamic      | `backend/api`            | When creating/improving backend API skills          |
| ⚡ Dynamic      | `backend/database`       | When creating/improving database skills             |
| ⚡ Dynamic      | `backend/ci-cd`          | When creating/improving CI/CD skills                |
| ⚡ Dynamic      | `security/security`      | When creating/improving security skills             |
| ⚡ Dynamic      | `setup/monorepo`         | When creating/improving monorepo setup skills       |
| ⚡ Dynamic      | `setup/package`          | When creating/improving package setup skills        |
| ⚡ Dynamic      | `setup/env`              | When creating/improving env configuration skills    |
| ⚡ Dynamic      | `setup/tooling`          | When creating/improving build tooling skills        |
| ⚡ Dynamic      | `shared/reviewing`       | When creating/improving review process skills       |

**Rationale:** Research-based agent. Uses WebSearch/WebFetch for external best practices; loads existing skills to understand structure, format, and conventions for consistency.

---

### agent-summoner

> Creates and improves agents

| Type            | Skill                    | When to Invoke                                     |
| --------------- | ------------------------ | -------------------------------------------------- |
| 📦 Pre-compiled | None                     | N/A                                                |
| ⚡ Dynamic      | `frontend/react`         | When creating agents that handle React components  |
| ⚡ Dynamic      | `frontend/api`           | When creating agents that handle API client code   |
| ⚡ Dynamic      | `frontend/styling`       | When creating agents that handle styling           |
| ⚡ Dynamic      | `frontend/accessibility` | When creating agents that handle accessibility     |
| ⚡ Dynamic      | `frontend/client-state`  | When creating agents that handle state management  |
| ⚡ Dynamic      | `frontend/performance`   | When creating agents that handle performance       |
| ⚡ Dynamic      | `frontend/mocking`       | When creating agents that handle mocking/MSW       |
| ⚡ Dynamic      | `frontend/testing`       | When creating agents that handle frontend testing  |
| ⚡ Dynamic      | `backend/api`            | When creating agents that handle backend APIs      |
| ⚡ Dynamic      | `backend/database`       | When creating agents that handle databases         |
| ⚡ Dynamic      | `backend/ci-cd`          | When creating agents that handle CI/CD             |
| ⚡ Dynamic      | `security/security`      | When creating agents that handle security          |
| ⚡ Dynamic      | `setup/monorepo`         | When creating agents that handle monorepo setup    |
| ⚡ Dynamic      | `setup/package`          | When creating agents that handle package setup     |
| ⚡ Dynamic      | `setup/env`              | When creating agents that handle env configuration |
| ⚡ Dynamic      | `setup/tooling`          | When creating agents that handle build tooling     |
| ⚡ Dynamic      | `shared/reviewing`       | When creating agents that handle code review       |

**Rationale:** Meta-agent for agent creation. Loads skills to understand what domain knowledge an agent should have access to and how skills should be mapped.

---

### documentor

> Maintains living documentation (WHERE things are, HOW they work) - foundation for PM specs

| Type            | Skill                    | When to Invoke                             |
| --------------- | ------------------------ | ------------------------------------------ |
| 📦 Pre-compiled | `setup/monorepo`         | Always in context                          |
| 📦 Pre-compiled | `setup/package`          | Always in context                          |
| ⚡ Dynamic      | `frontend/react`         | When documenting React component patterns  |
| ⚡ Dynamic      | `frontend/api`           | When documenting API client usage patterns |
| ⚡ Dynamic      | `frontend/styling`       | When documenting CSS/styling conventions   |
| ⚡ Dynamic      | `frontend/accessibility` | When documenting a11y patterns             |
| ⚡ Dynamic      | `frontend/client-state`  | When documenting state management patterns |
| ⚡ Dynamic      | `frontend/performance`   | When documenting performance patterns      |
| ⚡ Dynamic      | `frontend/mocking`       | When documenting MSW/mock data patterns    |
| ⚡ Dynamic      | `frontend/testing`       | When documenting frontend testing patterns |
| ⚡ Dynamic      | `backend/api`            | When documenting API route patterns        |
| ⚡ Dynamic      | `backend/database`       | When documenting database patterns         |
| ⚡ Dynamic      | `backend/ci-cd`          | When documenting CI/CD patterns            |
| ⚡ Dynamic      | `security/security`      | When documenting auth/security patterns    |
| ⚡ Dynamic      | `setup/env`              | When documenting environment configuration |
| ⚡ Dynamic      | `setup/tooling`          | When documenting build tooling             |
| ⚡ Dynamic      | `shared/reviewing`       | When documenting code review processes     |

**Rationale:** Documentor is the knowledge foundation. Maintains living docs that PM and developers consume. Needs architecture overview pre-loaded; loads domain skills to understand what patterns should be documented for a given area.

**Documentation Scope:**

```
.claude/docs/
├── architecture/
│   ├── overview.md           # High-level system architecture
│   ├── packages.md           # Package structure and responsibilities
│   └── data-flow.md          # How data flows through the system
├── frontend/
│   ├── components.md         # Component locations and patterns
│   ├── state.md              # State management locations
│   └── routing.md            # Route structure
├── backend/
│   ├── api-routes.md         # API endpoint locations
│   ├── database.md           # Schema and query locations
│   └── services.md           # Service layer structure
└── patterns/
    ├── conventions.md        # Coding conventions (from CLAUDE.md)
    └── decisions.md          # Architecture decision records
```

**Documentation Format (AI-optimized):**

```markdown
## [Area Name]

### Location

- Path: `apps/client-react/src/features/auth/`
- Related: `packages/api-client/src/auth.ts`

### Structure

[Directory tree with file purposes]

### Patterns Used

- [Pattern name]: [Brief description]

### Entry Points

- [Primary file for this area]

### Dependencies

- Depends on: [list]
- Depended by: [list]
```

---

## 📋 Skills Loading Matrix

### Planning Agents

| Agent      | Pre-compiled | Dynamic | Notes                               |
| ---------- | ------------ | ------- | ----------------------------------- |
| documentor | 2            | 15      | Foundation for PM, explicit mapping |
| pm         | 0            | 17      | Scope understanding, explicit list  |

### Implementation Agents

| Agent              | Pre-compiled | Dynamic | Notes                                    |
| ------------------ | ------------ | ------- | ---------------------------------------- |
| architect          | 10           | 4       | setup/\* (8) + react + styling, all lean |
| frontend-developer | 2            | 4       | Lean, task-driven                        |
| backend-developer  | 1            | 4       | Lean, task-driven                        |
| tester             | 3            | 2       | ALL tests                                |

### Review Agents

| Agent             | Pre-compiled | Dynamic | Notes                             |
| ----------------- | ------------ | ------- | --------------------------------- |
| frontend-reviewer | 4            | 2       | +shared/reviewing, NO test review |
| backend-reviewer  | 3            | 3       | +shared/reviewing, NO test review |
| tester-reviewer   | 4            | 2       | +shared/reviewing, test quality   |

### Meta Agents

| Agent            | Pre-compiled | Dynamic | Notes                        |
| ---------------- | ------------ | ------- | ---------------------------- |
| pattern-scout    | 0            | 17      | Discovery, explicit mapping  |
| pattern-critique | 0            | 17      | Comparison, explicit mapping |
| skill-summoner   | 0            | 17      | Research, explicit mapping   |
| agent-summoner   | 0            | 17      | Meta, explicit mapping       |

---

## 🔮 Under Consideration

> Future skills and skill splits being evaluated. Items here are not yet implemented but tracked for potential addition.

### New Frontend Skills

| Skill                        | Purpose                                                       | Priority |
| ---------------------------- | ------------------------------------------------------------- | -------- |
| `frontend/forms.md`          | React Hook Form, validation patterns, multi-step forms        | High     |
| `frontend/routing.md`        | Navigation guards, layouts, route-based code splitting        | Medium   |
| `frontend/error-handling.md` | Error boundaries, fallback UIs, retry patterns, recovery      | Medium   |
| `frontend/animation.md`      | Framer Motion, FLIP animations, reduced-motion, orchestration | Low      |

### New Backend Skills

| Skill                 | Purpose                                                        | Priority |
| --------------------- | -------------------------------------------------------------- | -------- |
| `backend/logging.md`  | Structured logging, correlation IDs, log levels, observability | High     |
| `backend/caching.md`  | Redis patterns, cache invalidation, cache-aside strategies     | High     |
| `backend/webhooks.md` | Retry logic, idempotency keys, signature verification          | Medium   |

### New Infrastructure Skills

| Skill                          | Purpose                                       | Priority |
| ------------------------------ | --------------------------------------------- | -------- |
| `infrastructure/docker.md`     | Containerization, multi-stage builds, compose | Medium   |
| `infrastructure/monitoring.md` | APM, metrics collection, alerting, dashboards | Medium   |

### Proposed Skill Splits

#### Backend API Split

Current `backend/api.md` could be split for more granular loading:

| New Skill                   | Content                                | Use Case                   |
| --------------------------- | -------------------------------------- | -------------------------- |
| `backend/api-routes.md`     | Hono patterns, middleware, handlers    | Scaffolding (architect)    |
| `backend/api-validation.md` | Zod schemas, request/response typing   | Implementation (developer) |
| `backend/api-docs.md`       | OpenAPI spec generation, documentation | Implementation (developer) |

#### Security Split

Current `security/security.md` could be split for more granular loading:

| New Skill                    | Content                         | Use Case                   |
| ---------------------------- | ------------------------------- | -------------------------- |
| `security/authentication.md` | OAuth flows, JWT, sessions, MFA | Scaffolding (architect)    |
| `security/authorization.md`  | RBAC, permissions, policies     | Implementation (developer) |
| `security/hardening.md`      | XSS, CSRF, CSP headers, OWASP   | Review (backend-reviewer)  |

### New Agents Under Consideration

| Agent                | Purpose                                             | Rationale                                             |
| -------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| **debugger**         | Traces bugs through logs, stack traces, repro steps | Distinct from development - understanding vs building |
| **refactorer**       | Restructures code without behavior change           | Preserves semantics, improves structure               |
| **security-auditor** | Reviews code for OWASP vulnerabilities specifically | Security deserves dedicated review focus              |

---

> **Note:** Items move from "Under Consideration" to implementation based on actual need demonstrated during development. Avoid premature optimization of the skill system.
