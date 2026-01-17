# Observability Setup - Sentry Configuration Examples

> Sentry configuration files for client, server, and edge runtimes, plus instrumentation setup.

**Navigation:** [Back to SKILL.md](../SKILL.md) | [core.md](core.md) | [pino-logger.md](pino-logger.md) | [axiom-integration.md](axiom-integration.md) | [ci-cd.md](ci-cd.md) | [health-check.md](health-check.md)

---

## Pattern 4: Sentry Configuration Files

### Client Config

**File: `apps/client-next/sentry.client.config.ts`**

```typescript
// Good Example - Client-side Sentry config
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || "development";
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0-local";

const SAMPLE_RATE_DEVELOPMENT = 1.0;
const SAMPLE_RATE_PRODUCTION = 0.1;
const TRACES_SAMPLE_RATE = 0.2;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,
  release: APP_VERSION,

  // Sample rate for error events (1.0 = 100%)
  sampleRate: ENVIRONMENT === "production" ? SAMPLE_RATE_PRODUCTION : SAMPLE_RATE_DEVELOPMENT,

  // Sample rate for performance transactions
  tracesSampleRate: TRACES_SAMPLE_RATE,

  // Enable debug in development
  debug: ENVIRONMENT === "development",

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text for privacy
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Replay settings
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filter out expected errors
  beforeSend(event, hint) {
    // Ignore cancelled requests
    if (event.exception?.values?.[0]?.value?.includes("AbortError")) {
      return null;
    }
    return event;
  },
});
```

**Why good:** Named constants for sample rates, environment-specific configuration, replay integration for debugging user sessions, `beforeSend` filters expected errors to reduce noise

---

### Server Config

**File: `apps/client-next/sentry.server.config.ts`**

```typescript
// Good Example - Server-side Sentry config
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || "development";
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0-local";

const TRACES_SAMPLE_RATE = 0.2;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,
  release: APP_VERSION,

  tracesSampleRate: TRACES_SAMPLE_RATE,

  // Enable debug in development
  debug: ENVIRONMENT === "development",

  // Server-specific: capture more context
  includeLocalVariables: true,
});
```

---

### Edge Config

**File: `apps/client-next/sentry.edge.config.ts`**

```typescript
// Good Example - Edge runtime Sentry config
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || "development";
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0-local";

const TRACES_SAMPLE_RATE = 0.2;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,
  release: APP_VERSION,

  tracesSampleRate: TRACES_SAMPLE_RATE,

  // Edge runtime has limited features
  debug: false,
});
```

---

### Bad Example

```typescript
// Bad Example - Single config for all runtimes
// sentry.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://xxx@sentry.io/123", // Hardcoded DSN
  tracesSampleRate: 1.0, // Magic number, too high for production
});
```

**Why bad:** Single config doesn't handle different runtime requirements, hardcoded DSN is a security risk and prevents environment separation, 100% trace rate overwhelms Sentry quota in production

---

## Pattern 5: Instrumentation File

**File: `apps/client-next/instrumentation.ts`**

```typescript
// Good Example - Instrumentation for Sentry
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Next.js 15+ error handling hook
export const onRequestError = Sentry.captureRequestError;
```

**Why good:** Dynamic imports prevent loading wrong config for runtime, `onRequestError` hook captures Server Component errors automatically (Next.js 15+)
