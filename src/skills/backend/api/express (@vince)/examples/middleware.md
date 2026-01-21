# Express.js - Middleware Examples

> Middleware chains, error handling, and request processing. See [SKILL.md](../SKILL.md) for core concepts.

---

## Basic Middleware Chain

### Good Example - Request Logging Middleware

```typescript
// src/middleware/request-logger.ts
import type { Request, Response, NextFunction } from "express";

const LOG_REQUEST_BODY_MAX_LENGTH = 500;

interface RequestLogInfo {
  method: string;
  path: string;
  query: Record<string, unknown>;
  timestamp: string;
}

const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  const logInfo: RequestLogInfo = {
    method: req.method,
    path: req.path,
    query: req.query,
    timestamp: new Date().toISOString(),
  };

  console.log("[Request]", JSON.stringify(logInfo));

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log(
      "[Response]",
      JSON.stringify({
        ...logInfo,
        statusCode: res.statusCode,
        durationMs: duration,
      })
    );
  });

  next();
};

export { requestLogger };
```

**Why good:** Named export, typed parameters, logs both request and response, calculates duration, res.on("finish") for response logging

### Bad Example - Blocking Middleware

```typescript
// WRONG - Forgot to call next()
const middleware = (req, res, next) => {
  console.log("Request:", req.path);
  // Missing next() - request hangs forever!
};
```

**Why bad:** Request hangs until timeout, must always call next() or end response

---

## Error Handling Middleware

### Good Example - Centralized Error Handler

```typescript
// src/middleware/error-handler.ts
import type { Request, Response, NextFunction } from "express";

const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_ERROR = 500;

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

// CRITICAL: Error handlers MUST have 4 arguments
const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Already sent response - delegate to Express default handler
  if (res.headersSent) {
    next(err);
    return;
  }

  // Log error details
  console.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || HTTP_INTERNAL_ERROR;

  // Don't expose internal error details in production
  const message =
    statusCode === HTTP_INTERNAL_ERROR && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  res.status(statusCode).json({
    error: {
      message,
      code: err.code || "INTERNAL_ERROR",
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
};

export { errorHandler };
```

**Why good:** 4 arguments (critical for Express to recognize as error handler), checks headersSent, hides details in production, logs full error

### Bad Example - Wrong Signature

```typescript
// WRONG - Only 3 arguments, treated as regular middleware
const errorHandler = (err, req, res) => {
  res.status(500).json({ error: err.message }); // Magic number
};

// err is actually req, req is res, res is next!
```

**Why bad:** Express calls this as (req, res, next), completely wrong behavior

---

## Async Error Handling

### Good Example - Async Handler Wrapper

```typescript
// src/utils/async-handler.ts
import type { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

const asyncHandler = (fn: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { asyncHandler };
```

**Usage:**

```typescript
// src/routes/user-routes.ts
import { asyncHandler } from "../utils/async-handler";

const HTTP_OK = 200;

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);
    // Errors automatically forwarded to error handler
    res.status(HTTP_OK).json({ data: user });
  })
);
```

**Why good:** Eliminates try/catch boilerplate, errors automatically forwarded, cleaner route definitions

### Bad Example - Missing Error Forwarding

```typescript
// WRONG - Unhandled promise rejection
router.get("/:id", async (req, res) => {
  const user = await getUserById(req.params.id); // If this throws, request hangs
  res.json({ data: user });
});
```

**Why bad:** In Express 4, async errors don't propagate to error handler automatically

---

## Validation Middleware

### Good Example - Request Body Validation

```typescript
// src/middleware/validators.ts
import type { Request, Response, NextFunction } from "express";

const HTTP_BAD_REQUEST = 400;
const MIN_EMAIL_LENGTH = 5;
const MAX_EMAIL_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 8;

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const validateEmail = (email: unknown): boolean => {
  if (typeof email !== "string") return false;
  if (email.length < MIN_EMAIL_LENGTH || email.length > MAX_EMAIL_LENGTH) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password: unknown): boolean => {
  if (typeof password !== "string") return false;
  return password.length >= MIN_PASSWORD_LENGTH;
};

const validateLoginBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!validateEmail(email)) {
    errors.push(`Email must be ${MIN_EMAIL_LENGTH}-${MAX_EMAIL_LENGTH} characters and valid format`);
  }

  if (!validatePassword(password)) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (errors.length > 0) {
    res.status(HTTP_BAD_REQUEST).json({
      error: {
        message: "Validation failed",
        details: errors,
      },
    });
    return;
  }

  next();
};

export { validateLoginBody };
```

**Usage:**

```typescript
router.post("/login", validateLoginBody, async (req, res, next) => {
  try {
    // req.body is now validated
    const result = await loginUser(req.body.email, req.body.password);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});
```

**Why good:** Validation logic separated, named constants for limits, early return with validation errors, reusable across routes

---

## Authentication Middleware

### Good Example - JWT Auth Guard

```typescript
// src/middleware/auth-guard.ts
import type { Request, Response, NextFunction } from "express";

const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const BEARER_PREFIX = "Bearer ";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
    res.status(HTTP_UNAUTHORIZED).json({
      error: { message: "Missing or invalid authorization header" },
    });
    return;
  }

  const token = authHeader.slice(BEARER_PREFIX.length);

  try {
    // Validate token with your auth solution
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(HTTP_UNAUTHORIZED).json({
      error: { message: "Invalid or expired token" },
    });
  }
};

const requireRole = (...allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(HTTP_UNAUTHORIZED).json({
        error: { message: "Authentication required" },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(HTTP_FORBIDDEN).json({
        error: { message: "Insufficient permissions" },
      });
      return;
    }

    next();
  };
};

export { requireAuth, requireRole };
export type { AuthenticatedRequest };
```

**Usage:**

```typescript
// Protect all routes in router
router.use(requireAuth);

// Specific route requires admin
router.delete("/:id", requireRole("admin"), async (req, res, next) => {
  // Only admins reach here
});
```

**Why good:** AuthenticatedRequest extends Request with user, requireRole is configurable, early returns prevent further processing

---

## Middleware Ordering

### Good Example - Correct Order

```typescript
// src/app.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();

const RATE_LIMIT_WINDOW_MS = 900000; // 15 minutes
const RATE_LIMIT_MAX = 100;
const JSON_LIMIT = "10mb";

// 1. Security headers FIRST
app.use(helmet());

// 2. CORS (before body parsing)
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
  credentials: true,
}));

// 3. Rate limiting (before parsing to save resources)
app.use(rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
}));

// 4. Body parsing
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// 5. Request logging
app.use(requestLogger);

// 6. Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

// 7. 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: "Route not found" } });
});

// 8. Error handler LAST
app.use(errorHandler);

export { app };
```

**Why good:** Security first, rate limit before expensive parsing, routes in middle, error handler absolutely last

---

## Quick Reference

| Middleware Type | Signature | Purpose |
|-----------------|-----------|---------|
| Regular | `(req, res, next)` | Request processing |
| Error | `(err, req, res, next)` | Error handling |
| Async wrapper | Returns `RequestHandler` | Auto error forwarding |

| Middleware Order | Reason |
|------------------|--------|
| Security (helmet) | Block attacks early |
| CORS | Must be before routes |
| Rate limit | Before parsing to save CPU |
| Body parsers | Before routes that need body |
| Logging | Before routes for timing |
| Routes | Main logic |
| 404 handler | Catch unmatched routes |
| Error handler | Catch all errors LAST |
