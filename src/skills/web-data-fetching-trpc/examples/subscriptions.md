# tRPC Subscriptions with Server-Sent Events

> Real-time updates using SSE subscriptions. See [core.md](core.md) for setup patterns.

**Prerequisites**: Understand Pattern 1 (Router Setup) from core examples first.

---

## Server-Side Subscription

```typescript
// packages/api/src/routers/notification.ts
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";

// Create typed event emitter
const ee = new EventEmitter();

interface NotificationEvent {
  userId: string;
  message: string;
  type: "info" | "warning" | "error";
  timestamp: Date;
}

export const notificationRouter = router({
  // SSE subscription
  onNotification: protectedProcedure.subscription(({ ctx }) => {
    return observable<NotificationEvent>((emit) => {
      const handler = (data: NotificationEvent) => {
        // Only emit to the subscribed user
        if (data.userId === ctx.user.id) {
          emit.next(data);
        }
      };

      ee.on("notification", handler);

      // Cleanup on unsubscribe
      return () => {
        ee.off("notification", handler);
      };
    });
  }),

  // Trigger notification (for testing)
  send: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        message: z.string(),
        type: z.enum(["info", "warning", "error"]),
      }),
    )
    .mutation(({ input }) => {
      ee.emit("notification", {
        ...input,
        timestamp: new Date(),
      });
      return { sent: true };
    }),
});

// Named export
export { notificationRouter };
```

---

## Client-Side Subscription

```typescript
// apps/client/components/notification-listener.tsx
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

export function NotificationListener() {
  const utils = trpc.useUtils();

  // Subscribe to real-time notifications
  trpc.notification.onNotification.useSubscription(undefined, {
    onData: (notification) => {
      // Show toast for new notifications
      toast[notification.type](notification.message);

      // Optionally invalidate related queries
      utils.notification.list.invalidate();
    },
    onError: (err) => {
      console.error("Subscription error:", err);
    },
  });

  return null; // Renderless component
}

// Named export
export { NotificationListener };
```

---
