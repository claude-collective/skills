# Skill Rename Tracker

## Purpose

Track the renaming of all skills to the new domain taxonomy:

- `frontend/` → `web/`
- `backend/` → `api/`
- `setup/{analytics,email,observability}/` → `api/{analytics,email,observability}/`
- `setup/{monorepo,env,tooling}/` → `infra/{monorepo,env,tooling}/`
- `methodology/`, `reviewing/`, `research/` → `meta/{methodology,reviewing,research}/`

## Naming Convention

```
{domain}/{category}/{library} (@{author})
```

| Part         | Purpose             | Examples                                                    |
| ------------ | ------------------- | ----------------------------------------------------------- |
| **domain**   | Platform/vertical   | `web`, `mobile`, `api`, `cli`, `meta`, `infra`, `security`  |
| **category** | What kind of thing  | `framework`, `testing`, `styling`, `state`, `observability` |
| **library**  | The actual tool/lib | `react`, `vitest`, `hono`, `turborepo`                      |

## Rules

1. Rename the folder to match new path
2. Update `name:` field in SKILL.md frontmatter
3. Update all stack config references
4. Update any metadata.yaml cross-references

## Status Legend

- [ ] Pending
- [~] In Progress
- [x] Completed

---

## API Skills (16 total, was backend + setup moves)

### Framework (was backend/api)

| Status | Old Path                       | New Path                         |
| ------ | ------------------------------ | -------------------------------- |
| [x]    | `backend/api/hono (@vince)`    | `api/framework/hono (@vince)`    |
| [x]    | `backend/api/express (@vince)` | `api/framework/express (@vince)` |
| [x]    | `backend/api/fastify (@vince)` | `api/framework/fastify (@vince)` |

### Database (was backend/database)

| Status | Old Path                            | New Path                        |
| ------ | ----------------------------------- | ------------------------------- |
| [x]    | `backend/database/drizzle (@vince)` | `api/database/drizzle (@vince)` |
| [x]    | `backend/database/prisma (@vince)`  | `api/database/prisma (@vince)`  |

### Auth (was backend/auth)

| Status | Old Path                                         | New Path                                     |
| ------ | ------------------------------------------------ | -------------------------------------------- |
| [x]    | `backend/auth/better-auth+drizzle+hono (@vince)` | `api/auth/better-auth+drizzle+hono (@vince)` |

### Analytics (was backend/analytics + setup/analytics)

| Status | Old Path                                       | New Path                                   |
| ------ | ---------------------------------------------- | ------------------------------------------ |
| [x]    | `backend/analytics/posthog-analytics (@vince)` | `api/analytics/posthog-analytics (@vince)` |
| [x]    | `setup/analytics/setup-posthog (@vince)`       | `api/analytics/setup-posthog (@vince)`     |

### Flags (was backend/flags)

| Status | Old Path                               | New Path                           |
| ------ | -------------------------------------- | ---------------------------------- |
| [x]    | `backend/flags/posthog-flags (@vince)` | `api/flags/posthog-flags (@vince)` |

### Email (was backend/email + setup/email)

| Status | Old Path                                    | New Path                                |
| ------ | ------------------------------------------- | --------------------------------------- |
| [x]    | `backend/email/resend+react-email (@vince)` | `api/email/resend+react-email (@vince)` |
| [x]    | `setup/email/setup-resend (@vince)`         | `api/email/setup-resend (@vince)`       |

### Observability (was backend/observability + setup/observability)

| Status | Old Path                                               | New Path                                             |
| ------ | ------------------------------------------------------ | ---------------------------------------------------- |
| [x]    | `backend/observability/axiom+pino+sentry (@vince)`     | `api/observability/axiom+pino+sentry (@vince)`       |
| [x]    | `setup/observability/setup-axiom+pino+sentry (@vince)` | `api/observability/setup-axiom+pino+sentry (@vince)` |

### CI/CD (was backend/ci-cd)

| Status | Old Path                                | New Path                            |
| ------ | --------------------------------------- | ----------------------------------- |
| [x]    | `backend/ci-cd/github-actions (@vince)` | `api/ci-cd/github-actions (@vince)` |

### Performance (was backend/performance)

| Status | Old Path                                           | New Path                                   |
| ------ | -------------------------------------------------- | ------------------------------------------ |
| [x]    | `backend/performance/backend-performance (@vince)` | `api/performance/api-performance (@vince)` |

### Testing (was backend/testing)

| Status | Old Path                                   | New Path                           |
| ------ | ------------------------------------------ | ---------------------------------- |
| [x]    | `backend/testing/backend-testing (@vince)` | `api/testing/api-testing (@vince)` |

---

## Web Skills (50 total, was frontend)

### Framework

| Status | Old Path                                            | New Path                                       |
| ------ | --------------------------------------------------- | ---------------------------------------------- |
| [x]    | `frontend/framework/react (@vince)`                 | `web/framework/react (@vince)`                 |
| [x]    | `frontend/framework/react+mobx (@vince)`            | `web/framework/react+mobx (@vince)`            |
| [x]    | `frontend/framework/vue-composition-api (@vince)`   | `web/framework/vue-composition-api (@vince)`   |
| [x]    | `frontend/framework/angular-standalone (@vince)`    | `web/framework/angular-standalone (@vince)`    |
| [x]    | `frontend/framework/solidjs (@vince)`               | `web/framework/solidjs (@vince)`               |
| [x]    | `frontend/framework/nextjs-app-router (@vince)`     | `web/framework/nextjs-app-router (@vince)`     |
| [x]    | `frontend/framework/nextjs-server-actions (@vince)` | `web/framework/nextjs-server-actions (@vince)` |
| [x]    | `frontend/framework/nuxt (@vince)`                  | `web/framework/nuxt (@vince)`                  |
| [x]    | `frontend/framework/remix (@vince)`                 | `web/framework/remix (@vince)`                 |

### Styling

| Status | Old Path                                 | New Path                            |
| ------ | ---------------------------------------- | ----------------------------------- |
| [x]    | `frontend/styling/scss-modules (@vince)` | `web/styling/scss-modules (@vince)` |
| [x]    | `frontend/styling/tailwind (@vince)`     | `web/styling/tailwind (@vince)`     |
| [x]    | `frontend/styling/cva (@vince)`          | `web/styling/cva (@vince)`          |

### Client State

| Status | Old Path                                                     | New Path                              |
| ------ | ------------------------------------------------------------ | ------------------------------------- |
| [x]    | `frontend/client-state-management/zustand (@vince)`          | `web/state/zustand (@vince)`          |
| [x]    | `frontend/client-state-management/mobx (@vince)`             | `web/state/mobx (@vince)`             |
| [x]    | `frontend/client-state-management/pinia (@vince)`            | `web/state/pinia (@vince)`            |
| [x]    | `frontend/client-state-management/redux-toolkit (@vince)`    | `web/state/redux-toolkit (@vince)`    |
| [x]    | `frontend/client-state-management/jotai (@vince)`            | `web/state/jotai (@vince)`            |
| [x]    | `frontend/client-state-management/ngrx-signalstore (@vince)` | `web/state/ngrx-signalstore (@vince)` |

### Server State

| Status | Old Path                                                          | New Path                                          |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------- |
| [x]    | `frontend/server-state-management/react-query (@vince)`           | `web/server-state/react-query (@vince)`           |
| [x]    | `frontend/server-state-management/react-query+axios+zod (@vince)` | `web/server-state/react-query+axios+zod (@vince)` |

### Data Fetching

| Status | Old Path                                         | New Path                                    |
| ------ | ------------------------------------------------ | ------------------------------------------- |
| [x]    | `frontend/data-fetching/trpc (@vince)`           | `web/data-fetching/trpc (@vince)`           |
| [x]    | `frontend/data-fetching/swr (@vince)`            | `web/data-fetching/swr (@vince)`            |
| [x]    | `frontend/data-fetching/graphql-apollo (@vince)` | `web/data-fetching/graphql-apollo (@vince)` |
| [x]    | `frontend/data-fetching/graphql-urql (@vince)`   | `web/data-fetching/graphql-urql (@vince)`   |

### Forms

| Status | Old Path                                  | New Path                             |
| ------ | ----------------------------------------- | ------------------------------------ |
| [x]    | `frontend/forms/react-hook-form (@vince)` | `web/forms/react-hook-form (@vince)` |
| [x]    | `frontend/forms/vee-validate (@vince)`    | `web/forms/vee-validate (@vince)`    |
| [x]    | `frontend/forms/zod-validation (@vince)`  | `web/forms/zod-validation (@vince)`  |

### Testing

| Status | Old Path                                          | New Path                                     |
| ------ | ------------------------------------------------- | -------------------------------------------- |
| [x]    | `frontend/testing/vitest (@vince)`                | `web/testing/vitest (@vince)`                |
| [x]    | `frontend/testing/playwright-e2e (@vince)`        | `web/testing/playwright-e2e (@vince)`        |
| [x]    | `frontend/testing/cypress-e2e (@vince)`           | `web/testing/cypress-e2e (@vince)`           |
| [x]    | `frontend/testing/react-testing-library (@vince)` | `web/testing/react-testing-library (@vince)` |
| [x]    | `frontend/testing/vue-test-utils (@vince)`        | `web/testing/vue-test-utils (@vince)`        |
| [x]    | `frontend/testing/karma+playwright (@vince)`      | `web/testing/karma+playwright (@vince)`      |

### Mocks

| Status | Old Path                                 | New Path                       |
| ------ | ---------------------------------------- | ------------------------------ |
| [x]    | `frontend/mocks/msw (@vince)`            | `web/mocks/msw (@vince)`       |
| [x]    | `frontend/mocks/frontend-mocks (@vince)` | `web/mocks/web-mocks (@vince)` |

### UI

| Status | Old Path                              | New Path                         |
| ------ | ------------------------------------- | -------------------------------- |
| [x]    | `frontend/ui/shadcn-ui (@vince)`      | `web/ui/shadcn-ui (@vince)`      |
| [x]    | `frontend/ui/radix-ui (@vince)`       | `web/ui/radix-ui (@vince)`       |
| [x]    | `frontend/ui/tanstack-table (@vince)` | `web/ui/tanstack-table (@vince)` |

### Animation

| Status | Old Path                                       | New Path                                  |
| ------ | ---------------------------------------------- | ----------------------------------------- |
| [x]    | `frontend/animation/framer-motion (@vince)`    | `web/animation/framer-motion (@vince)`    |
| [x]    | `frontend/animation/css-animations (@vince)`   | `web/animation/css-animations (@vince)`   |
| [x]    | `frontend/animation/view-transitions (@vince)` | `web/animation/view-transitions (@vince)` |

### Accessibility

| Status | Old Path                                                 | New Path                                       |
| ------ | -------------------------------------------------------- | ---------------------------------------------- |
| [x]    | `frontend/accessibility/frontend-accessibility (@vince)` | `web/accessibility/web-accessibility (@vince)` |

### Performance

| Status | Old Path                                             | New Path                                    |
| ------ | ---------------------------------------------------- | ------------------------------------------- |
| [x]    | `frontend/performance/frontend-performance (@vince)` | `web/performance/web-performance (@vince)`  |
| [x]    | `frontend/performance/performance+mobx (@vince)`     | `web/performance/performance+mobx (@vince)` |

### I18n

| Status | Old Path                            | New Path                       |
| ------ | ----------------------------------- | ------------------------------ |
| [x]    | `frontend/i18n/react-intl (@vince)` | `web/i18n/react-intl (@vince)` |
| [x]    | `frontend/i18n/vue-i18n (@vince)`   | `web/i18n/vue-i18n (@vince)`   |
| [x]    | `frontend/i18n/next-intl (@vince)`  | `web/i18n/next-intl (@vince)`  |

### Realtime

| Status | Old Path                                | New Path                           |
| ------ | --------------------------------------- | ---------------------------------- |
| [x]    | `frontend/realtime/websockets (@vince)` | `web/realtime/websockets (@vince)` |
| [x]    | `frontend/realtime/socket-io (@vince)`  | `web/realtime/socket-io (@vince)`  |
| [x]    | `frontend/realtime/sse (@vince)`        | `web/realtime/sse (@vince)`        |

### PWA

| Status | Old Path                                | New Path                           |
| ------ | --------------------------------------- | ---------------------------------- |
| [x]    | `frontend/pwa/offline-first (@vince)`   | `web/pwa/offline-first (@vince)`   |
| [x]    | `frontend/pwa/service-workers (@vince)` | `web/pwa/service-workers (@vince)` |

### Error Handling

| Status | Old Path                                            | New Path                                       |
| ------ | --------------------------------------------------- | ---------------------------------------------- |
| [x]    | `frontend/error-handling/error-boundaries (@vince)` | `web/error-handling/error-boundaries (@vince)` |
| [x]    | `frontend/error-handling/result-types (@vince)`     | `web/error-handling/result-types (@vince)`     |

### Files

| Status | Old Path                                             | New Path                                  |
| ------ | ---------------------------------------------------- | ----------------------------------------- |
| [x]    | `frontend/file-upload/file-upload-patterns (@vince)` | `web/files/file-upload-patterns (@vince)` |
| [x]    | `frontend/files/image-handling (@vince)`             | `web/files/image-handling (@vince)`       |

### Utilities

| Status | Old Path                                | New Path                           |
| ------ | --------------------------------------- | ---------------------------------- |
| [x]    | `frontend/utilities/date-fns (@vince)`  | `web/utilities/date-fns (@vince)`  |
| [x]    | `frontend/utilities/native-js (@vince)` | `web/utilities/native-js (@vince)` |

### Tooling

| Status | Old Path                              | New Path                         |
| ------ | ------------------------------------- | -------------------------------- |
| [x]    | `frontend/tooling/storybook (@vince)` | `web/tooling/storybook (@vince)` |

---

## Mobile Skills (2 total)

| Status | Old Path                       | New Path                                 |
| ------ | ------------------------------ | ---------------------------------------- |
| [x]    | `mobile/react-native (@vince)` | `mobile/framework/react-native (@vince)` |
| [x]    | `mobile/expo (@vince)`         | `mobile/framework/expo (@vince)`         |

---

## CLI Skills (1 total)

| Status | Old Path                     | New Path                               |
| ------ | ---------------------------- | -------------------------------------- |
| [x]    | `cli/cli-commander (@vince)` | `cli/framework/cli-commander (@vince)` |

---

## Infra Skills (3 total, was setup minus moves)

| Status | Old Path                               | New Path                               |
| ------ | -------------------------------------- | -------------------------------------- |
| [x]    | `setup/monorepo/turborepo (@vince)`    | `infra/monorepo/turborepo (@vince)`    |
| [x]    | `setup/setup-env (@vince)`             | `infra/env/setup-env (@vince)`         |
| [x]    | `setup/tooling/setup-tooling (@vince)` | `infra/tooling/setup-tooling (@vince)` |

---

## Meta Skills (9 total, combines methodology + reviewing + research)

### Methodology

| Status | Old Path                                                    | New Path                                               |
| ------ | ----------------------------------------------------------- | ------------------------------------------------------ |
| [x]    | `methodology/universal/anti-over-engineering (@vince)`      | `meta/methodology/anti-over-engineering (@vince)`      |
| [x]    | `methodology/universal/investigation-requirements (@vince)` | `meta/methodology/investigation-requirements (@vince)` |
| [x]    | `methodology/universal/success-criteria (@vince)`           | `meta/methodology/success-criteria (@vince)`           |
| [x]    | `methodology/implementation/write-verification (@vince)`    | `meta/methodology/write-verification (@vince)`         |
| [x]    | `methodology/implementation/improvement-protocol (@vince)`  | `meta/methodology/improvement-protocol (@vince)`       |
| [x]    | `methodology/extended-session/context-management (@vince)`  | `meta/methodology/context-management (@vince)`         |

### Reviewing

| Status | Old Path                           | New Path                                |
| ------ | ---------------------------------- | --------------------------------------- |
| [x]    | `reviewing/reviewing (@vince)`     | `meta/reviewing/reviewing (@vince)`     |
| [x]    | `reviewing/cli-reviewing (@vince)` | `meta/reviewing/cli-reviewing (@vince)` |

### Research

| Status | Old Path                                                      | New Path                                      |
| ------ | ------------------------------------------------------------- | --------------------------------------------- |
| [x]    | `research/research-methodology/research-methodology (@vince)` | `meta/research/research-methodology (@vince)` |

---

## Security Skills (1 total)

| Status | Old Path                     | New Path                          |
| ------ | ---------------------------- | --------------------------------- |
| [x]    | `security/security (@vince)` | `security/auth/security (@vince)` |

---

## Stack Configs to Update

| Status | File                                           |
| ------ | ---------------------------------------------- |
| [x]    | `src/stacks/fullstack-react/config.yaml`       |
| [x]    | `src/stacks/cli-stack/config.yaml`             |
| [x]    | `src/stacks/minimal-backend/config.yaml`       |
| [x]    | `src/stacks/mobile-stack/config.yaml`          |
| [x]    | `src/stacks/modern-react/config.yaml`          |
| [x]    | `src/stacks/modern-react-tailwind/config.yaml` |
| [x]    | `src/stacks/enterprise-react/config.yaml`      |
| [x]    | `src/stacks/vue-stack/config.yaml`             |
| [x]    | `src/stacks/nuxt-stack/config.yaml`            |
| [x]    | `src/stacks/angular-stack/config.yaml`         |
| [x]    | `src/stacks/solidjs-stack/config.yaml`         |
| [x]    | `src/stacks/remix-stack/config.yaml`           |
| [x]    | `src/stacks/full-observability/config.yaml`    |
| [x]    | `src/stacks/work-stack/config.yaml`            |

---

## Summary Statistics

- **Total Skills:** 82
- **Domain Renames:** 7 (frontend→web, backend→api, setup splits, methodology/reviewing/research→meta)
- **Completed:** 0
- **In Progress:** 0

---

## Agent Assignment

| Agent   | Domain                                            | Skills Count |
| ------- | ------------------------------------------------- | ------------ |
| Agent 1 | `api/`                                            | 16           |
| Agent 2 | `web/` (framework, styling, state)                | 18           |
| Agent 3 | `web/` (testing, mocks, ui, animation)            | 15           |
| Agent 4 | `web/` (remaining)                                | 17           |
| Agent 5 | `mobile/`, `cli/`, `infra/`, `meta/`, `security/` | 16           |
| Agent 6 | Stack configs                                     | 14           |
