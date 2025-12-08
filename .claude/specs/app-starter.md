# App Starter Template Specification

> **Purpose:** Proving ground template that exercises every infrastructure pattern. Minimal business logic, maximum pattern coverage.

---

## Overview

| Attribute | Value |
|-----------|-------|
| App Name | `app-starter` |
| Type | Next.js App Router |
| Auth | Better Auth |
| Database | Drizzle + Neon Postgres |
| API | Hono + OpenAPI |
| Analytics | PostHog |
| Observability | Pino + Sentry + Axiom |

---

## Directory Structure

```
apps/app-starter/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── [...route]/
│   │   │   │   └── route.ts
│   │   │   └── auth/
│   │   │       └── [...all]/
│   │   │           └── route.ts
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── toast.tsx
│   │   ├── error-boundary.tsx
│   │   ├── auth-form.tsx
│   │   └── user-nav.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── index.ts              # Hono app factory
│   │   │   ├── middleware.ts         # Correlation ID, logging, error handling
│   │   │   ├── error-handler.ts      # Standardized error responses
│   │   │   └── routes/
│   │   │       ├── health.ts
│   │   │       └── user.ts
│   │   ├── auth/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   ├── schema.ts
│   │   │   ├── seed.ts               # Development seed script
│   │   │   └── migrations/
│   │   ├── analytics/
│   │   │   ├── client.ts             # PostHog browser client
│   │   │   ├── server.ts             # PostHog server client
│   │   │   ├── events.ts             # Typed event definitions
│   │   │   └── identify.ts           # User identification helper
│   │   ├── client/
│   │   │   ├── index.ts              # API client factory
│   │   │   ├── fetcher.ts            # Fetch wrapper with error handling
│   │   │   └── queries/
│   │   │       ├── user.ts           # React Query hooks for user
│   │   │       └── preferences.ts    # React Query hooks for preferences
│   │   ├── logger.ts
│   │   └── env.ts
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-user.ts
│   ├── types/
│   │   ├── api.ts                    # API response types
│   │   └── errors.ts                 # Error types
│   └── middleware.ts
├── tests/
│   ├── setup.ts                      # Test setup (MSW, etc.)
│   ├── mocks/
│   │   ├── handlers.ts               # MSW request handlers
│   │   ├── server.ts                 # MSW server setup
│   │   └── data.ts                   # Mock data factories
│   ├── unit/
│   │   ├── components/
│   │   │   └── auth-form.test.tsx
│   │   ├── hooks/
│   │   │   └── use-user.test.ts
│   │   └── lib/
│   │       └── api-client.test.ts
│   ├── integration/
│   │   └── api/
│   │       ├── health.test.ts
│   │       └── user.test.ts
│   └── e2e/
│       ├── auth.spec.ts              # Playwright: signup, login, logout
│       └── settings.spec.ts          # Playwright: update preferences
├── public/
├── .env.example
├── drizzle.config.ts
├── next.config.js
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── tsconfig.json
├── vitest.config.ts
└── SCAFFOLD-PROGRESS.md
```

---

## Database Schema

### Tables

```typescript
// src/lib/db/schema.ts

import { pgTable, text, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";

// Better Auth manages this table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  email_verified: boolean("email_verified").default(false),
  image: text("image"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// App-specific preferences
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").default("system").notNull(), // light | dark | system
  notifications_enabled: boolean("notifications_enabled").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Audit log for debugging and observability
export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(), // e.g., "user:signed_up", "preferences:updated"
  metadata: jsonb("metadata"), // Additional context
  correlation_id: text("correlation_id"), // Links to request logs
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Better Auth sessions table
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Better Auth accounts table (for OAuth)
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  provider_account_id: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
```

### Indexes

```typescript
// Add after table definitions
import { index } from "drizzle-orm/pg-core";

export const auditLogUserIdx = index("audit_log_user_id_idx").on(auditLog.user_id);
export const auditLogCorrelationIdx = index("audit_log_correlation_id_idx").on(auditLog.correlation_id);
export const auditLogCreatedAtIdx = index("audit_log_created_at_idx").on(auditLog.created_at);
export const userPreferencesUserIdx = index("user_preferences_user_id_idx").on(userPreferences.user_id);
```

### Seed Script

```typescript
// src/lib/db/seed.ts

import { db } from "./index";
import { users, userPreferences } from "./schema";

const TEST_USER = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  email_verified: true,
};

export async function seed() {
  console.log("Seeding database...");

  // Create test user
  await db.insert(users).values(TEST_USER).onConflictDoNothing();

  // Create preferences for test user
  await db.insert(userPreferences).values({
    user_id: TEST_USER.id,
    theme: "system",
    notifications_enabled: true,
  }).onConflictDoNothing();

  console.log("Seeding complete.");
}

// Run if executed directly
seed().catch(console.error);
```

---

## API Layer

### Standardized Error Response

```typescript
// src/lib/api/error-handler.ts

import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { logger } from "../logger";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
    correlationId: string;
  };
}

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export function createErrorResponse(
  code: keyof typeof ERROR_CODES,
  message: string,
  correlationId: string,
  details?: Array<{ field: string; message: string }>
): ApiErrorResponse {
  return {
    error: {
      code: ERROR_CODES[code],
      message,
      details,
      correlationId,
    },
  };
}

export function errorHandler(err: Error, c: Context) {
  const correlationId = c.get("correlationId") || "unknown";

  // Log the error
  logger.error({
    err,
    correlationId,
    path: c.req.path,
    method: c.req.method,
  }, "API error");

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      createErrorResponse(
        "VALIDATION_ERROR",
        "Validation failed",
        correlationId,
        err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      ),
      400
    );
  }

  // HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json(
      createErrorResponse(
        err.status === 401 ? "UNAUTHORIZED" :
        err.status === 403 ? "FORBIDDEN" :
        err.status === 404 ? "NOT_FOUND" : "INTERNAL_ERROR",
        err.message,
        correlationId
      ),
      err.status
    );
  }

  // Unknown errors
  return c.json(
    createErrorResponse(
      "INTERNAL_ERROR",
      "An unexpected error occurred",
      correlationId
    ),
    500
  );
}
```

### Correlation ID Middleware

```typescript
// src/lib/api/middleware.ts

import type { MiddlewareHandler } from "hono";
import { nanoid } from "nanoid";
import { logger } from "../logger";

const CORRELATION_ID_HEADER = "x-correlation-id";

export const correlationIdMiddleware: MiddlewareHandler = async (c, next) => {
  const correlationId = c.req.header(CORRELATION_ID_HEADER) || nanoid();
  c.set("correlationId", correlationId);
  c.header(CORRELATION_ID_HEADER, correlationId);
  await next();
};

export const requestLoggingMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const correlationId = c.get("correlationId");
  const userId = c.get("userId"); // Set by auth middleware

  logger.info({
    correlationId,
    userId,
    method: c.req.method,
    path: c.req.path,
    userAgent: c.req.header("user-agent"),
  }, "Request started");

  await next();

  const duration = Date.now() - start;

  logger.info({
    correlationId,
    userId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
  }, "Request completed");
};
```

### Health Route

```typescript
// src/lib/api/routes/health.ts

import { createRoute, z } from "@hono/zod-openapi";
import type { AppType } from "../index";

const healthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string().datetime(),
  version: z.string(),
  correlationId: z.string(),
});

export const healthRoute = createRoute({
  method: "get",
  path: "/health",
  operationId: "getHealth",
  tags: ["Health"],
  responses: {
    200: {
      description: "Service is healthy",
      content: {
        "application/json": {
          schema: healthResponseSchema,
        },
      },
    },
  },
});

export function registerHealthRoutes(app: AppType) {
  app.openapi(healthRoute, (c) => {
    return c.json({
      status: "ok" as const,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.0.0",
      correlationId: c.get("correlationId"),
    });
  });
}
```

### User Routes

```typescript
// src/lib/api/routes/user.ts

import { createRoute, z } from "@hono/zod-openapi";
import type { AppType } from "../index";
import { db } from "../../db";
import { userPreferences } from "../../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware";

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  notificationsEnabled: z.boolean(),
});

const getPreferencesRoute = createRoute({
  method: "get",
  path: "/user/preferences",
  operationId: "getUserPreferences",
  tags: ["User"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "User preferences",
      content: {
        "application/json": {
          schema: preferencesSchema,
        },
      },
    },
    401: { description: "Unauthorized" },
  },
});

const updatePreferencesRoute = createRoute({
  method: "patch",
  path: "/user/preferences",
  operationId: "updateUserPreferences",
  tags: ["User"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: preferencesSchema.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Updated preferences",
      content: {
        "application/json": {
          schema: preferencesSchema,
        },
      },
    },
    401: { description: "Unauthorized" },
  },
});

export function registerUserRoutes(app: AppType) {
  app.use("/user/*", requireAuth);

  app.openapi(getPreferencesRoute, async (c) => {
    const userId = c.get("userId");
    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.user_id, userId),
    });

    return c.json({
      theme: prefs?.theme || "system",
      notificationsEnabled: prefs?.notifications_enabled ?? true,
    });
  });

  app.openapi(updatePreferencesRoute, async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");

    const updated = await db
      .update(userPreferences)
      .set({
        theme: body.theme,
        notifications_enabled: body.notificationsEnabled,
        updated_at: new Date(),
      })
      .where(eq(userPreferences.user_id, userId))
      .returning();

    return c.json({
      theme: updated[0].theme,
      notificationsEnabled: updated[0].notifications_enabled,
    });
  });
}
```

---

## Frontend API Client

### Fetcher with Error Handling

```typescript
// src/lib/client/fetcher.ts

import type { ApiErrorResponse } from "../api/error-handler";

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public correlationId: string,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new ApiError(
      errorData.error.message,
      errorData.error.code,
      response.status,
      errorData.error.correlationId,
      errorData.error.details
    );
  }

  return response.json();
}
```

### React Query Hooks

```typescript
// src/lib/client/queries/preferences.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "../fetcher";

interface Preferences {
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
}

export const preferencesKeys = {
  all: ["preferences"] as const,
  detail: () => [...preferencesKeys.all, "detail"] as const,
};

export function usePreferences() {
  return useQuery({
    queryKey: preferencesKeys.detail(),
    queryFn: () => fetcher<Preferences>("/api/user/preferences"),
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Preferences>) =>
      fetcher<Preferences>("/api/user/preferences", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(preferencesKeys.detail(), data);
    },
  });
}
```

---

## Analytics

### Typed Events

```typescript
// src/lib/analytics/events.ts

export const ANALYTICS_EVENTS = {
  // Auth events
  AUTH_USER_SIGNED_UP: "auth:user_signed_up",
  AUTH_USER_LOGGED_IN: "auth:user_logged_in",
  AUTH_USER_LOGGED_OUT: "auth:user_logged_out",

  // Settings events
  SETTINGS_PREFERENCES_UPDATED: "settings:preferences_updated",

  // Page views
  PAGE_VIEWED: "page:viewed",
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

export interface EventProperties {
  [ANALYTICS_EVENTS.AUTH_USER_SIGNED_UP]: { method: "email" | "oauth" };
  [ANALYTICS_EVENTS.AUTH_USER_LOGGED_IN]: { method: "email" | "oauth" };
  [ANALYTICS_EVENTS.AUTH_USER_LOGGED_OUT]: Record<string, never>;
  [ANALYTICS_EVENTS.SETTINGS_PREFERENCES_UPDATED]: { fields: string[] };
  [ANALYTICS_EVENTS.PAGE_VIEWED]: { path: string; title: string };
}
```

### User Identification

```typescript
// src/lib/analytics/identify.ts

import { posthog } from "./client";

export function identifyUser(userId: string, properties?: {
  email?: string;
  name?: string;
  createdAt?: string;
}) {
  // Link anonymous session to user
  posthog.identify(userId, properties);
}

export function resetIdentity() {
  // Call on logout to reset anonymous ID
  posthog.reset();
}
```

---

## Testing

### MSW Handlers

```typescript
// tests/mocks/handlers.ts

import { http, HttpResponse } from "msw";

export const handlers = [
  // Health endpoint
  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      correlationId: "test-correlation-id",
    });
  }),

  // User preferences
  http.get("/api/user/preferences", () => {
    return HttpResponse.json({
      theme: "system",
      notificationsEnabled: true,
    });
  }),

  http.patch("/api/user/preferences", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      theme: body.theme ?? "system",
      notificationsEnabled: body.notificationsEnabled ?? true,
    });
  }),
];
```

### MSW Server Setup

```typescript
// tests/mocks/server.ts

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

### Test Setup

```typescript
// tests/setup.ts

import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Example Unit Test

```typescript
// tests/unit/lib/api-client.test.ts

import { describe, it, expect } from "vitest";
import { fetcher, ApiError } from "@/lib/client/fetcher";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";

describe("fetcher", () => {
  it("returns data on success", async () => {
    const data = await fetcher("/api/health");
    expect(data).toHaveProperty("status", "ok");
  });

  it("throws ApiError on failure", async () => {
    server.use(
      http.get("/api/health", () => {
        return HttpResponse.json(
          {
            error: {
              code: "INTERNAL_ERROR",
              message: "Something went wrong",
              correlationId: "test-id",
            },
          },
          { status: 500 }
        );
      })
    );

    await expect(fetcher("/api/health")).rejects.toThrow(ApiError);
  });
});
```

### Example Component Test

```typescript
// tests/unit/components/auth-form.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "@/components/auth-form";

describe("AuthForm", () => {
  it("renders login form", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### Example Integration Test

```typescript
// tests/integration/api/health.test.ts

import { describe, it, expect } from "vitest";
import { app } from "@/lib/api";

describe("GET /api/health", () => {
  it("returns health status", async () => {
    const res = await app.request("/health");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data).toHaveProperty("correlationId");
  });
});
```

### Example E2E Test (Playwright)

```typescript
// tests/e2e/auth.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can sign up", async ({ page }) => {
    await page.goto("/signup");

    await page.fill('input[name="email"]', "newuser@example.com");
    await page.fill('input[name="password"]', "securepassword123");
    await page.fill('input[name="name"]', "New User");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("Welcome, New User")).toBeVisible();
  });

  test("user can log in", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "testpassword");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
  });

  test("user can log out", async ({ page }) => {
    // Assume logged in state
    await page.goto("/dashboard");

    await page.click('[data-testid="user-menu"]');
    await page.click('button:has-text("Log out")');

    await expect(page).toHaveURL("/");
  });
});
```

### E2E Settings Test

```typescript
// tests/e2e/settings.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "testpassword");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");
  });

  test("user can update theme preference", async ({ page }) => {
    await page.goto("/settings");

    await page.click('[data-testid="theme-select"]');
    await page.click('text=Dark');

    await page.click('button:has-text("Save")');

    await expect(page.getByText("Preferences saved")).toBeVisible();
  });

  test("user can toggle notifications", async ({ page }) => {
    await page.goto("/settings");

    await page.click('[data-testid="notifications-toggle"]');
    await page.click('button:has-text("Save")');

    await expect(page.getByText("Preferences saved")).toBeVisible();
  });
});
```

---

## Pages

### Landing Page (Unauthenticated)

```typescript
// src/app/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">App Starter</h1>
      <p className="mt-4 text-muted-foreground">
        A proving ground for monorepo patterns
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </main>
  );
}
```

### Error Page (500)

```typescript
// src/app/error.tsx

"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        We've been notified and are working on it.
      </p>
      {error.digest && (
        <p className="mt-2 text-sm text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
      <Button className="mt-4" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
```

### Not Found Page (404)

```typescript
// src/app/not-found.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-muted-foreground">Page not found</p>
      <Button className="mt-8" asChild>
        <Link href="/">Go home</Link>
      </Button>
    </main>
  );
}
```

### Loading State

```typescript
// src/app/(dashboard)/dashboard/loading.tsx

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-4 p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
```

---

## Feature Flags

| Flag Name | Purpose | Default |
|-----------|---------|---------|
| `beta-banner` | Show beta badge on dashboard | `false` |
| `new-settings-ui` | Enable redesigned settings page | `false` |

### Usage Example

```typescript
// src/app/(dashboard)/dashboard/page.tsx

import { posthog } from "@/lib/analytics/server";

export default async function DashboardPage() {
  const showBetaBanner = await posthog.isFeatureEnabled("beta-banner");

  return (
    <main>
      {showBetaBanner && (
        <div className="bg-primary text-primary-foreground p-2 text-center text-sm">
          You're using the beta version
        </div>
      )}
      {/* ... */}
    </main>
  );
}
```

---

## Environment Variables

```bash
# .env.example

# Database (Neon)
DATABASE_URL=                        # Get from Neon console or MCP

# Authentication (Better Auth)
BETTER_AUTH_SECRET=                  # Generate: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=             # From PostHog project settings
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Error Tracking (Sentry)
SENTRY_DSN=                          # From Sentry project settings
NEXT_PUBLIC_SENTRY_DSN=              # Same as above (for client)

# Logging (Axiom) - Optional
AXIOM_TOKEN=                         # From Axiom settings
AXIOM_DATASET=                       # Dataset name

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "bun run src/lib/db/seed.ts"
  }
}
```

---

## Success Criteria

The template is complete when:

- [ ] User can sign up with email/password
- [ ] User can log in and see dashboard
- [ ] User can update preferences in settings
- [ ] Health endpoint returns 200
- [ ] Feature flag controls beta banner visibility
- [ ] Errors are captured in Sentry
- [ ] Requests are logged with correlation IDs
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] `bun tsc --noEmit` passes
- [ ] `bun lint` passes
- [ ] `bun build` succeeds
