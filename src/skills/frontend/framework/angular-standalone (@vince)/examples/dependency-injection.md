# Dependency Injection Examples

> Modern DI patterns with inject() for Angular 17+ standalone components. See [core.md](core.md) for standalone basics.

---

## Pattern: inject() with Services and Configuration

### Good Example - InjectionToken and inject()

```typescript
// notification.service.ts
import { Injectable, InjectionToken, inject, signal } from "@angular/core";

// Injection token for configuration
export const NOTIFICATION_CONFIG = new InjectionToken<NotificationConfig>(
  "NotificationConfig"
);

export type NotificationConfig = {
  maxVisible: number;
  defaultDuration: number;
};

export type Notification = {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration: number;
};

@Injectable({ providedIn: "root" })
export class NotificationService {
  // Inject optional configuration with defaults
  private config = inject(NOTIFICATION_CONFIG, {
    optional: true,
  }) ?? { maxVisible: 5, defaultDuration: 5000 };

  private notifications = signal<Notification[]>([]);
  private nextId = 0;

  getNotifications() {
    return this.notifications.asReadonly();
  }

  show(
    message: string,
    type: Notification["type"] = "info",
    duration = this.config.defaultDuration
  ): string {
    const id = `notification-${this.nextId++}`;

    this.notifications.update((notifications) => {
      const updated = [...notifications, { id, message, type, duration }];
      // Limit to max visible
      return updated.slice(-this.config.maxVisible);
    });

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  dismiss(id: string): void {
    this.notifications.update((n) => n.filter((item) => item.id !== id));
  }
}
```

```typescript
// notification-container.component.ts
import { Component, inject } from "@angular/core";
import { NotificationService } from "./notification.service";

@Component({
  selector: "app-notification-container",
  standalone: true,
  template: `
    <div class="notification-container">
      @for (notification of notifications(); track notification.id) {
        <div
          class="notification"
          [class]="notification.type"
          (click)="dismiss(notification.id)"
        >
          {{ notification.message }}
        </div>
      }
    </div>
  `,
})
export class NotificationContainerComponent {
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.getNotifications();

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
```

```typescript
// app.config.ts - Providing configuration
import { ApplicationConfig } from "@angular/core";
import { NOTIFICATION_CONFIG } from "./notification.service";

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: NOTIFICATION_CONFIG,
      useValue: { maxVisible: 3, defaultDuration: 4000 },
    },
  ],
};
```

**Why good:** InjectionToken for type-safe configuration, optional: true with fallback defaults, signal for reactive state, asReadonly() prevents external mutation, inject() in field initializer

### Bad Example - Constructor injection and manual state

```typescript
// notification.service.ts
@Injectable({ providedIn: "root" })
export class NotificationService {
  private notifications: Notification[] = [];

  constructor(@Optional() @Inject(NOTIFICATION_CONFIG) config: any) {
    // Config typing lost
  }

  getNotifications(): Notification[] {
    return [...this.notifications]; // Creates new array every call
  }

  show(message: string): void {
    this.notifications.push({ message }); // Direct mutation
  }
}
```

**Why bad:** constructor injection is more verbose, @Optional/@Inject decorators required for optional deps, no signal reactivity means manual change detection, direct mutation doesn't trigger updates
