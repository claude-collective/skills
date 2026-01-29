# @defer Lazy Loading Examples

> Deferred loading patterns for Angular 17+ standalone components. See [core.md](core.md) for standalone basics.

---

## Pattern: Comprehensive @defer

### Good Example - Multiple defer triggers

```typescript
// analytics-dashboard.component.ts
import { Component, signal } from "@angular/core";

@Component({
  selector: "app-analytics-dashboard",
  standalone: true,
  template: `
    <div class="dashboard">
      <h1>Analytics Dashboard</h1>

      <!-- Critical content loads immediately -->
      <app-key-metrics />

      <!-- Heavy chart deferred until in viewport -->
      @defer (on viewport) {
        <app-revenue-chart />
      } @placeholder (minimum 200ms) {
        <div class="chart-placeholder" style="height: 400px;">
          <div class="skeleton-chart"></div>
        </div>
      } @loading (after 150ms; minimum 500ms) {
        <div class="chart-loading">
          <div class="spinner"></div>
          <p>Loading revenue data...</p>
        </div>
      } @error {
        <div class="chart-error">
          <p>Failed to load chart. Please refresh.</p>
        </div>
      }

      <!-- User table with prefetch on hover -->
      @defer (on viewport; prefetch on hover) {
        <app-user-activity-table />
      } @placeholder {
        <div class="table-placeholder">
          <div class="skeleton-row"></div>
          <div class="skeleton-row"></div>
          <div class="skeleton-row"></div>
        </div>
      }

      <!-- Feature gated by toggle -->
      @defer (when showAdvancedAnalytics()) {
        <app-advanced-analytics />
      } @placeholder {
        <button (click)="showAdvancedAnalytics.set(true)">
          Show Advanced Analytics
        </button>
      }

      <!-- Interactive section - loads on click -->
      @defer (on interaction) {
        <app-export-options />
      } @placeholder {
        <button class="export-trigger">Export Data</button>
      }

      <!-- Idle loading for non-critical content -->
      @defer (on idle) {
        <app-related-reports />
      } @placeholder {
        <p>Related reports will load shortly...</p>
      }
    </div>
  `,
})
export class AnalyticsDashboardComponent {
  showAdvancedAnalytics = signal(false);
}
```

**Why good:** viewport trigger for below-the-fold content, placeholder matches final layout to prevent CLS, loading delay prevents flicker, error block handles failures, prefetch on hover improves perceived performance, when condition for feature flags

---

## Defer Trigger Reference

| Trigger            | Use Case                             |
| ------------------ | ------------------------------------ |
| `on viewport`      | Below-the-fold content               |
| `on interaction`   | Click-to-load features               |
| `on idle`          | Non-critical background loading      |
| `on immediate`     | Load ASAP after initial render       |
| `on hover`         | Prefetch before user clicks          |
| `on timer(Xms)`    | Delayed loading after X milliseconds |
| `when condition()` | Conditional/feature-flagged content  |
