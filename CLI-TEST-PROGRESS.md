# CLI Test Progress Tracker

## Test Overview

Testing `bun src/cli/index.ts init` for all permutations of stacks and skills.

## Test Status Legend

- [ ] Not tested
- [x] Tested and working
- [!] Issue found and fixed
- [?] Needs investigation

---

## 1. Pre-built Stacks Testing

| Stack ID              | Stack Name                    | Status | Notes                                  |
| --------------------- | ----------------------------- | ------ | -------------------------------------- |
| modern-react          | Modern React Stack            | [x]    | Valid with 14 skills                   |
| modern-react-tailwind | Modern React + Tailwind Stack | [x]    | Valid with 13 skills                   |
| vue-stack             | Modern Vue Stack              | [x]    | Valid with 8 skills (removed vue-i18n) |
| angular-stack         | Modern Angular Stack          | [x]    | Valid with 5 skills                    |
| minimal-backend       | Minimal Backend               | [x]    | Valid with 2 skills                    |
| mobile-stack          | React Native Mobile Stack     | [x]    | Valid with 5 skills                    |
| full-observability    | Full Observability Stack      | [x]    | Valid with 10 skills                   |
| enterprise-react      | Enterprise React Stack        | [x]    | Valid with 14 skills                   |
| solidjs-stack         | SolidJS Stack                 | [x]    | Valid with 5 skills                    |
| remix-stack           | Remix Full-Stack              | [x]    | Valid with 10 skills                   |
| nuxt-stack            | Nuxt Full-Stack               | [x]    | Valid with 9 skills (removed vue-i18n) |

---

## 2. Automated Test Results

### Test Summary (as of 2026-01-21)

| Test Suite           | Total | Passed | Failed | Pass Rate |
| -------------------- | ----- | ------ | ------ | --------- |
| Permutation Tests    | 210   | 209    | 1      | 99.5%     |
| Selection Path Tests | 60    | 60     | 0      | 100%      |

**Note:** The single "failure" is the empty i18n category which has no skills yet (expected).

### Category Navigation Status

| Category | Subcategory    | Skills Found                                              | Status                    |
| -------- | -------------- | --------------------------------------------------------- | ------------------------- |
| Frontend | Framework      | 5 (React, Vue, Angular, SolidJS, React+MobX)              | [x] Working               |
| Frontend | Meta-Framework | 4 (Next.js, Remix, Nuxt, Next.js Server Actions)          | [x] Working               |
| Frontend | Styling        | 3 (SCSS Modules, Tailwind, CVA)                           | [x] Working               |
| Frontend | Client State   | 5 (Zustand, Redux Toolkit, MobX, Pinia, NgRx SignalStore) | [x] Working               |
| Frontend | Server State   | 6 (React Query, SWR, GraphQL Apollo, GraphQL URQL, tRPC)  | [x] Working               |
| Frontend | Forms          | 3 (React Hook Form, VeeValidate, Zod)                     | [x] Working               |
| Frontend | Testing        | 7 (Vitest, Playwright, Cypress, RTL, Vue Test Utils)      | [x] Working               |
| Frontend | UI Components  | 2 (shadcn/ui, TanStack Table)                             | [x] Working               |
| Frontend | i18n           | 0                                                         | [ ] Empty (no skills yet) |
| Frontend | Mocking        | 2 (MSW)                                                   | [x] Working               |
| Backend  | API            | 3 (Hono, Express, Fastify)                                | [x] Working               |
| Backend  | Database       | 2 (Drizzle, Prisma)                                       | [x] Working               |
| Backend  | Auth           | 1 (Better Auth)                                           | [x] Working               |
| Backend  | Observability  | 1 (Axiom + Pino + Sentry)                                 | [x] Working               |
| Backend  | Analytics      | 2 (PostHog Analytics, PostHog Flags)                      | [x] Working               |
| Backend  | Email          | 1 (Resend)                                                | [x] Working               |
| Mobile   | Framework      | 1 (React Native)                                          | [x] Working               |
| Setup    | Monorepo       | 1 (Turborepo)                                             | [x] Working               |
| Setup    | Tooling        | 2 (Tooling, Storybook)                                    | [x] Working               |

---

## 3. Skill Requirement Tests (All Passing)

| Skill                 | Disabled Without Requirement          | Enabled With Requirement              |
| --------------------- | ------------------------------------- | ------------------------------------- |
| Zustand               | [x] Disabled without React            | [x] Enabled with React                |
| Redux Toolkit         | [x] Disabled without React            | [x] Enabled with React                |
| MobX                  | [x] Disabled without React            | [x] Enabled with React                |
| React Query           | [x] Disabled without React            | [x] Enabled with React                |
| React Hook Form       | [x] Disabled without React            | [x] Enabled with React                |
| React Testing Library | [x] Disabled without React            | [x] Enabled with React                |
| Pinia                 | [x] Disabled without Vue              | [x] Enabled with Vue                  |
| VeeValidate           | [x] Disabled without Vue              | [x] Enabled with Vue                  |
| Vue Test Utils        | [x] Disabled without Vue              | [x] Enabled with Vue                  |
| NgRx SignalStore      | [x] Disabled without Angular          | [x] Enabled with Angular              |
| Drizzle               | [x] Disabled without API              | [x] Enabled with Hono/Express/Fastify |
| Prisma                | [x] Disabled without API              | [x] Enabled with Hono/Express/Fastify |
| Better Auth           | [x] Disabled without Drizzle          | [x] Enabled with Drizzle              |
| shadcn/ui             | [x] Disabled without React + Tailwind | [x] Enabled with both                 |

---

## 4. Conflict Detection Tests (All Passing)

| Conflict                | Status                 |
| ----------------------- | ---------------------- |
| React + Vue             | [x] Correctly rejected |
| React + Angular         | [x] Correctly rejected |
| React + SolidJS         | [x] Correctly rejected |
| SCSS Modules + Tailwind | [x] Correctly rejected |
| Zustand + Redux Toolkit | [x] Correctly rejected |
| Hono + Express          | [x] Correctly rejected |
| Hono + Fastify          | [x] Correctly rejected |
| Drizzle + Prisma        | [x] Correctly rejected |
| Playwright + Cypress    | [x] Correctly rejected |

---

## 5. Stack Path Tests (All Passing)

### React Ecosystem

| Path                      | Status    |
| ------------------------- | --------- |
| React minimal             | [x] Valid |
| React + Zustand           | [x] Valid |
| React + React Query       | [x] Valid |
| React + Forms             | [x] Valid |
| React + Testing           | [x] Valid |
| React + MSW               | [x] Valid |
| React + Playwright        | [x] Valid |
| React + Next.js           | [x] Valid |
| React + Tailwind + shadcn | [x] Valid |
| React + Backend           | [x] Valid |
| React + Backend + Auth    | [x] Valid |

### Vue Ecosystem

| Path          | Status    |
| ------------- | --------- |
| Vue minimal   | [x] Valid |
| Vue + Pinia   | [x] Valid |
| Vue + Forms   | [x] Valid |
| Vue + Testing | [x] Valid |
| Vue + Nuxt    | [x] Valid |
| Vue + Backend | [x] Valid |

### Angular Ecosystem

| Path              | Status    |
| ----------------- | --------- |
| Angular minimal   | [x] Valid |
| Angular + NgRx    | [x] Valid |
| Angular + Testing | [x] Valid |
| Angular + Backend | [x] Valid |

### SolidJS Ecosystem

| Path               | Status    |
| ------------------ | --------- |
| SolidJS minimal    | [x] Valid |
| SolidJS + Tailwind | [x] Valid |
| SolidJS + Testing  | [x] Valid |
| SolidJS + Backend  | [x] Valid |

### Backend-Only

| Path                  | Status    |
| --------------------- | --------- |
| Hono only             | [x] Valid |
| Hono + Drizzle        | [x] Valid |
| Hono + Drizzle + Auth | [x] Valid |
| Hono + Prisma         | [x] Valid |
| Express + Drizzle     | [x] Valid |
| Express + Prisma      | [x] Valid |
| Fastify + Drizzle     | [x] Valid |
| Fastify + Prisma      | [x] Valid |
| Hono + Observability  | [x] Valid |

### Mobile

| Path                       | Status    |
| -------------------------- | --------- |
| React Native only          | [x] Valid |
| React Native + Zustand     | [x] Valid |
| React Native + React Query | [x] Valid |
| React Native + Forms       | [x] Valid |

---

## 6. Issues Fixed

| #   | Description                                                    | Fix Applied                                     |
| --- | -------------------------------------------------------------- | ----------------------------------------------- |
| 1   | Skill aliases didn't match actual SKILL.md IDs                 | Updated all aliases in skills-matrix.yaml       |
| 2   | Skill categories in metadata.yaml didn't match subcategory IDs | Updated all categories                          |
| 3   | Stacks referenced non-existent skills (vue-i18n)               | Removed from stacks                             |
| 4   | Better-auth required non-existent backend/database             | Changed to require drizzle alias                |
| 5   | Meta-frameworks (Next.js, Remix, Nuxt) in wrong category       | Moved to meta-framework category                |
| 6   | Redundant conflicts_with in metadata.yaml using old IDs        | Removed (skills-matrix.yaml is source of truth) |
| 7   | References to non-existent skills (jotai, expo, i18n)          | Removed from relationships                      |

---

## 7. Skills Not Yet Implemented

| Skill      | Category             | Notes                        |
| ---------- | -------------------- | ---------------------------- |
| Jotai      | Client State (React) | Atomic state management      |
| Expo       | Mobile               | React Native with Expo       |
| next-intl  | i18n (Next.js)       | Next.js internationalization |
| react-intl | i18n (React)         | FormatJS for React           |
| vue-i18n   | i18n (Vue)           | Vue internationalization     |
| radix-ui   | UI Components        | Headless UI primitives       |

---

## Notes

- All 11 pre-built stacks validate correctly
- 76 skills loaded successfully
- 99.5% of tests pass (only expected empty category fails)
- Do not complete final submission (MVP mode prevents this)
- Go back and start again when reaching confirmation
