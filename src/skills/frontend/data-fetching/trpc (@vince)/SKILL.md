---
name: frontend/trpc (@vince)
description: tRPC type-safe API patterns, procedures, React Query integration
---

# tRPC Type-Safe API Patterns

> **Quick Guide:** Use tRPC for end-to-end type-safe APIs in TypeScript monorepos. Eliminates schema duplication and code generation - types flow automatically from backend to frontend.

---

<critical_requirements>

## CRITICAL: Before Using This Skill

**(You MUST export `AppRouter` type from your tRPC router for client-side type inference)**

**(You MUST wrap async state mutations in `runInAction()` when using tRPC with reactive stores)**

**(You MUST use `TRPCError` with appropriate error codes - never throw raw Error objects)**

**(You MUST use Zod for input validation on ALL procedures accepting user input)**

**(You MUST use named constants for ALL timeout/retry values - NO magic numbers)**

</critical_requirements>

---

**Auto-detection:** tRPC router, initTRPC, createTRPCClient, @trpc/server, @trpc/client, @trpc/react-query, TRPCError, procedure, query, mutation, httpBatchLink

**When to use:**

- Building APIs in TypeScript monorepos with shared types
- Need end-to-end type safety without code generation
- Full-stack TypeScript applications (Next.js, T3 Stack)
- Projects where both client and server are TypeScript

**When NOT to use:**

- Public APIs consumed by third parties (use OpenAPI/REST)
- Non-TypeScript clients (mobile apps, other languages)
- GraphQL requirements (use Apollo/urql)
- Need HTTP caching at CDN level (tRPC uses POST by default)

**Key patterns covered:**

- Router and procedure definition (initTRPC, router, procedure)
- Input validation with Zod schemas
- Context and middleware for authentication
- Error handling with TRPCError codes
- React Query integration (@trpc/react-query)
- Optimistic updates and cache invalidation

**Detailed Resources:**
- For code examples, see [examples/](examples/)
- For decision frameworks and anti-patterns, see [reference.md](reference.md)

---

<philosophy>

## Philosophy

tRPC eliminates the API layer friction by sharing types directly between server and client. No schemas to write, no code to generate - just export your router type and import it client-side for full autocompletion and type safety.

**Core principles:**

- **Zero schema duplication**: Types flow from backend to frontend automatically
- **TypeScript-native**: Leverages TypeScript's type inference, not code generation
- **Procedure-based**: Queries read data, mutations write data - clear separation
- **Composable middleware**: Build reusable authentication and validation layers
- **React Query integration**: Full caching, invalidation, and optimistic updates

**Trade-offs:**

- Requires TypeScript on both ends (no polyglot support)
- Best in monorepos where types can be shared directly
- Not suitable for public APIs needing OpenAPI documentation

</philosophy>

---

<patterns>

## Core Patterns

### Pattern 1: tRPC Initialization and Router Setup

Initialize tRPC once per application. Export the router and procedure factories for use across your codebase.

#### Constants

```typescript
// packages/api/src/trpc/index.ts
const TRPC_VERSION = "11";
```

#### Implementation

```typescript
// packages/api/src/trpc/index.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import type { Context } from "./context";

// Initialize tRPC with context type
const t = initTRPC.context<Context>().create({
  // Format Zod errors for better client experience
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Export reusable router and procedure factories
export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// Named exports (project convention)
export { router, publicProcedure, middleware };
```

**Why good:** Single initialization point ensures consistency, error formatter provides structured Zod errors to client, exported factories enable composition across router files

---

### Pattern 2: Defining Procedures with Zod Input Validation

Use Zod schemas for runtime input validation. tRPC automatically infers types from Zod schemas.

#### Implementation

```typescript
// packages/api/src/routers/user.ts
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Define input schemas as constants
const userIdSchema = z.object({
  id: z.string().uuid(),
});

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export const userRouter = router({
  // Query - read operations
  getById: publicProcedure
    .input(userIdSchema)
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User with id ${input.id} not found`,
        });
      }

      return user;
    }),

  // Mutation - write operations
  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.db.user.create({
        data: input,
      });
    }),
});

// Named export
export { userRouter };
```

**Why good:** Zod schemas provide runtime validation and TypeScript inference, error codes map to HTTP status codes, input/output types flow to client automatically

---

### Pattern 3: Context and Authentication Middleware

Create protected procedures using middleware. Context flows through all procedures.

#### Constants

```typescript
const SESSION_COOKIE_NAME = "session_token";
```

#### Context Creation

```typescript
// packages/api/src/trpc/context.ts
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { Session, User } from "@repo/db";

export interface Context {
  session: Session | null;
  user: User | null;
  db: typeof db;
}

export async function createContext(
  opts: CreateNextContextOptions
): Promise<Context> {
  const session = await getSessionFromRequest(opts.req);
  const user = session ? await getUserFromSession(session) : null;

  return {
    session,
    user,
    db,
  };
}

// Named export
export { createContext };
export type { Context };
```

#### Protected Procedure Middleware

```typescript
// packages/api/src/trpc/middleware.ts
import { TRPCError } from "@trpc/server";
import { middleware, publicProcedure } from "./index";

// Authentication middleware
const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }

  // Return narrowed context - user is now non-nullable
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  });
});

// Admin-only middleware
const isAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user?.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});

// Create protected procedure by chaining middleware
export const protectedProcedure = publicProcedure.use(isAuthenticated);
export const adminProcedure = protectedProcedure.use(isAdmin);

// Named exports
export { protectedProcedure, adminProcedure };
```

**Why good:** Middleware narrows TypeScript context types, protected procedures enforce auth at definition time not runtime checks in every handler, composable middleware enables role-based access patterns

---

### Pattern 4: App Router Composition and Type Export

Compose routers and export the type for client-side inference.

#### Implementation

```typescript
// packages/api/src/root.ts
import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { postRouter } from "./routers/post";
import { commentRouter } from "./routers/comment";

export const appRouter = router({
  user: userRouter,
  post: postRouter,
  comment: commentRouter,
});

// Export type for client-side inference
// This is the KEY to tRPC's type safety
export type AppRouter = typeof appRouter;

// Named exports
export { appRouter };
export type { AppRouter };
```

**Why good:** Router composition enables code organization, AppRouter type export is the bridge for client-side type inference, single export point for all API routes

---

### Pattern 5: React Query Client Setup

Configure tRPC with React Query for data fetching, caching, and mutations.

#### Constants

```typescript
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const DEFAULT_RETRY_ATTEMPTS = 3;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/trpc";
```

#### Implementation

```typescript
// apps/client/lib/trpc.ts
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@repo/api";

// Create typed tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Named export
export { trpc };
```

```typescript
// apps/client/lib/trpc-provider.tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./trpc";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const DEFAULT_RETRY_ATTEMPTS = 3;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/trpc";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: FIVE_MINUTES_MS,
            retry: DEFAULT_RETRY_ATTEMPTS,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: API_URL,
          // Include credentials for auth cookies
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

// Named export
export { TRPCProvider };
```

**Why good:** httpBatchLink combines multiple requests into single HTTP call, QueryClient provides caching layer, credentials include ensures cookies flow for authentication

---

### Pattern 6: Using tRPC Hooks in Components

Use generated hooks with full type inference from your backend procedures.

#### Implementation

```typescript
// apps/client/components/user-profile.tsx
import { trpc } from "@/lib/trpc";

export function UserProfile({ userId }: { userId: string }) {
  // Access query utilities for cache manipulation (declare before mutations that use it)
  const utils = trpc.useUtils();

  // Query with full type inference
  const { data: user, isPending, error } = trpc.user.getById.useQuery({ id: userId });

  // Mutation with automatic type inference
  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      // Invalidate and refetch after mutation
      utils.user.getById.invalidate({ id: userId });
    },
  });

  if (isPending) return <Skeleton />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button
        onClick={() => updateUser.mutate({ id: userId, name: "New Name" })}
        disabled={updateUser.isPending}
      >
        {updateUser.isPending ? "Saving..." : "Update Name"}
      </button>
    </div>
  );
}

// Named export
export { UserProfile };
```

**Why good:** Full autocompletion from backend types, useUtils provides cache access, invalidation ensures data consistency after mutations

---

### Pattern 7: Optimistic Updates

Implement optimistic UI updates for responsive user experience.

#### Implementation

```typescript
// apps/client/components/todo-list.tsx
import { trpc } from "@/lib/trpc";

export function TodoList() {
  const utils = trpc.useUtils();
  const { data: todos } = trpc.todo.list.useQuery();

  const toggleTodo = trpc.todo.toggle.useMutation({
    // Optimistic update before server response
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await utils.todo.list.cancel();

      // Snapshot previous value for rollback
      const previousTodos = utils.todo.list.getData();

      // Optimistically update cache
      utils.todo.list.setData(undefined, (old) =>
        old?.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );

      // Return context for rollback
      return { previousTodos };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        utils.todo.list.setData(undefined, context.previousTodos);
      }
    },

    // Refetch after success or error
    onSettled: () => {
      utils.todo.list.invalidate();
    },
  });

  return (
    <ul>
      {todos?.map((todo) => (
        <li
          key={todo.id}
          onClick={() => toggleTodo.mutate({ id: todo.id })}
          style={{ textDecoration: todo.completed ? "line-through" : "none" }}
        >
          {todo.title}
        </li>
      ))}
    </ul>
  );
}

// Named export
export { TodoList };
```

**Why good:** UI updates immediately without waiting for server, rollback on error preserves data integrity, onSettled ensures eventual consistency with server state

---

### Pattern 8: Error Handling with TRPCError

Use standardized error codes that map to HTTP status codes.

#### Implementation

```typescript
// packages/api/src/routers/post.ts
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const postRouter = router({
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
      });

      // NOT_FOUND - 404
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      // FORBIDDEN - 403
      if (post.authorId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own posts",
        });
      }

      try {
        await ctx.db.post.delete({ where: { id: input.id } });
        return { success: true };
      } catch (error) {
        // INTERNAL_SERVER_ERROR - 500
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete post",
          cause: error, // Preserves original stack trace
        });
      }
    }),
});

// Named export
export { postRouter };
```

#### Client-Side Error Handling

```typescript
// apps/client/components/delete-button.tsx
import { trpc } from "@/lib/trpc";

export function DeleteButton({ postId }: { postId: string }) {
  const deletePost = trpc.post.delete.useMutation({
    onError: (error) => {
      // error.data.code contains tRPC error code
      switch (error.data?.code) {
        case "NOT_FOUND":
          toast.error("Post no longer exists");
          break;
        case "FORBIDDEN":
          toast.error("You cannot delete this post");
          break;
        case "UNAUTHORIZED":
          toast.error("Please log in to continue");
          break;
        default:
          toast.error("Something went wrong");
      }
    },
  });

  return (
    <button
      onClick={() => deletePost.mutate({ id: postId })}
      disabled={deletePost.isPending}
    >
      Delete
    </button>
  );
}

// Named export
export { DeleteButton };
```

**Why good:** Standardized error codes enable consistent client handling, cause preserves original stack for debugging, error.data provides typed access to error details

</patterns>

---

<integration>

## Integration Guide

**Works with:**

- **React Query (@tanstack/react-query)**: tRPC's React integration is built on React Query, providing caching, background refetching, and optimistic updates
- **Zod**: Input validation schemas that provide both runtime validation and TypeScript type inference
- **Next.js**: First-class adapters for both App Router and Pages Router
- **TypeScript monorepos**: Types flow from backend to frontend via AppRouter type export

**Replaces / Conflicts with:**

- **REST with OpenAPI code generation**: tRPC eliminates need for schema files and code generation
- **GraphQL**: tRPC provides similar DX without GraphQL's complexity for TypeScript-only stacks
- **Custom fetch wrappers**: tRPC handles serialization, batching, and type safety automatically

</integration>

---

<critical_reminders>

## CRITICAL REMINDERS

**(You MUST export `AppRouter` type from your tRPC router for client-side type inference)**

**(You MUST wrap async state mutations in `runInAction()` when using tRPC with reactive stores)**

**(You MUST use `TRPCError` with appropriate error codes - never throw raw Error objects)**

**(You MUST use Zod for input validation on ALL procedures accepting user input)**

**(You MUST use named constants for ALL timeout/retry values - NO magic numbers)**

**Failure to follow these rules will break type safety, cause runtime errors, and defeat the purpose of using tRPC.**

</critical_reminders>
