# Angular Standalone Reference

> Decision frameworks, anti-patterns, and red flags for Angular 17+ standalone development. See [SKILL.md](SKILL.md) for core concepts and [examples/](examples/) for code examples.

---

## Decision Frameworks

### When to Use signal() vs computed()

```
Is this value derived from other signals?
├─ YES → Use computed() ✓
│   (memoized, read-only, recalculates only when deps change)
└─ NO → Is this value that needs to be modified?
    ├─ YES → Use signal() ✓
    │   (writable, use .set() or .update())
    └─ NO → Use a plain constant
```

### When to Use effect()

```
Do you need to perform side effects when signals change?
├─ YES → Is it DOM manipulation?
│   ├─ YES → Use afterNextRender() or afterRender() instead
│   └─ NO → Is it modifying other signals?
│       ├─ YES → AVOID - Consider computed() or restructure
│       └─ NO → Use effect() ✓
│           (logging, analytics, external API calls)
└─ NO → Don't use effect()
```

### When to Use @defer

```
Is the component above the fold (visible on initial load)?
├─ YES → DON'T defer (hurts LCP)
└─ NO → Is it a heavy component (large bundle)?
    ├─ YES → @defer (on viewport) ✓
    └─ NO → Is it triggered by user interaction?
        ├─ YES → @defer (on interaction) ✓
        └─ NO → Is it conditionally shown?
            ├─ YES → @defer (when condition()) ✓
            └─ NO → Consider @defer (on idle) or don't defer
```

### input() vs model() vs inject()

```
Is data coming from parent component?
├─ YES → Does child need to modify the value?
│   ├─ YES → Use model() ✓ (two-way binding)
│   └─ NO → Use input() ✓ (one-way binding)
└─ NO → Is data from a service?
    ├─ YES → Use inject() ✓
    └─ NO → Is it local component state?
        └─ YES → Use signal() ✓
```

### @if vs @switch

```
How many conditions are you checking?
├─ 1-2 conditions → @if / @else ✓
└─ 3+ conditions on same expression → @switch ✓
```

### Control Flow: @for track Strategy

```
Do items have unique IDs?
├─ YES → track item.id ✓ (recommended)
└─ NO → Are items primitive values?
    ├─ YES → track $index (acceptable for small, static lists)
    └─ NO → Add a unique identifier to your data model
```

---

## RED FLAGS

### High Priority Issues

- **Missing `standalone: true`** - Component requires NgModule, loses tree-shaking benefits
- **Using @Input/@Output decorators** - Legacy pattern without signal reactivity
- **Using *ngIf/*ngFor/*ngSwitch** - Legacy directives require CommonModule, worse type narrowing
- **Missing `track` in @for** - Poor performance, unnecessary DOM recreation
- **Constructor injection instead of inject()** - More boilerplate, less flexible
- **Mutating signal values directly** - `signal().push(item)` doesn't trigger updates, use `.update()`
- **Writing to signals inside effect()** - Causes infinite loops or glitches

### Medium Priority Issues

- **@defer above the fold** - Hurts Core Web Vitals (LCP, CLS)
- **Not using @empty with @for** - Missing empty state handling
- **Nested @defer with same trigger** - Causes cascading requests
- **effect() for derived state** - Use computed() instead for better performance
- **toSignal() without initialValue** - Can cause runtime errors if observable hasn't emitted
- **Forgetting `as` in @if** - Repeating signal calls: `@if (user(); as user)` is cleaner

### Common Mistakes

- Using `new EventEmitter()` instead of `output()`
- Using `@ViewChild` instead of template reference variables with signals
- Importing CommonModule for control flow (not needed with @if/@for/@switch)
- Not providing `{ initialValue: [] }` to `toSignal()` for lists
- Using `ngOnChanges` instead of `effect()` to react to input changes
- Calling `this.cdr.detectChanges()` manually with signals (not needed)

### Gotchas & Edge Cases

- **signal() equality**: By default uses `Object.is()`, provide custom equality for objects
- **computed() laziness**: Not evaluated until first read, then memoized
- **effect() cleanup**: Return a cleanup function for subscriptions/timers
- **@defer in SSR**: Always renders @placeholder on server, triggers ignored
- **model() vs input()**: model() creates two-way binding, input() is read-only
- **inject() context**: Must be called in constructor or field initializer, not in methods
- **@for $index**: Zero-based, use `{{ $index + 1 }}` for 1-based display
- **withComponentInputBinding()**: Route params become `undefined` if not present, include in type

---

## Anti-Patterns

### Mutating Signal Values Directly

Signals require immutable updates. Direct mutation doesn't trigger change detection.

```typescript
// WRONG - Direct mutation
items = signal<string[]>([]);

addItem(item: string): void {
  this.items().push(item); // Mutation doesn't trigger updates!
}

// CORRECT - Immutable update
addItem(item: string): void {
  this.items.update((items) => [...items, item]);
}
```

### Writing Signals Inside Effects

Effects should not modify signals they don't own. This can cause infinite loops.

```typescript
// WRONG - Signal write in effect
constructor() {
  effect(() => {
    const count = this.count();
    if (count > 10) {
      this.count.set(10); // Causes re-run of effect!
    }
  });
}

// CORRECT - Use computed for derived values
maxCount = computed(() => Math.min(this.count(), 10));
```

### Using ngOnChanges with Signal Inputs

Signal inputs don't trigger ngOnChanges. Use effect() instead.

```typescript
// WRONG - ngOnChanges won't fire for signal inputs
ngOnChanges(changes: SimpleChanges): void {
  if (changes['userId']) {
    this.loadUser(changes['userId'].currentValue);
  }
}

// CORRECT - Use effect() to react to input changes
userId = input.required<string>();

constructor() {
  effect(() => {
    this.loadUser(this.userId());
  });
}
```

### Deferring Above-the-Fold Content

Deferring visible content hurts Core Web Vitals.

```typescript
// WRONG - Hero section is above the fold
@Component({
  template: `
    @defer (on viewport) {
      <app-hero-section />  <!-- Visible immediately, shouldn't defer -->
    }
  `
})

// CORRECT - Only defer below-the-fold content
@Component({
  template: `
    <app-hero-section />  <!-- Loads immediately -->

    @defer (on viewport) {
      <app-comments />  <!-- Below fold, safe to defer -->
    }
  `
})
```

### Legacy Structural Directives

New control flow syntax is preferred over *ngIf/*ngFor/*ngSwitch.

```typescript
// WRONG - Legacy syntax
@Component({
  imports: [CommonModule], // Required for *ngIf
  template: `
    <div *ngIf="loading; else content">Loading...</div>
    <ng-template #content>
      <li *ngFor="let item of items; trackBy: trackByFn">{{ item }}</li>
    </ng-template>
  `
})

// CORRECT - Built-in control flow
@Component({
  // No CommonModule needed
  template: `
    @if (loading()) {
      <div>Loading...</div>
    } @else {
      @for (item of items(); track item.id) {
        <li>{{ item }}</li>
      }
    }
  `
})
```

### Constructor Injection (Legacy)

Use inject() function for cleaner, more flexible DI.

```typescript
// WRONG - Constructor injection
export class UserService {
  constructor(
    private http: HttpClient,
    @Optional() @Inject(CONFIG_TOKEN) private config: Config
  ) {}
}

// CORRECT - inject() function
export class UserService {
  private http = inject(HttpClient);
  private config = inject(CONFIG_TOKEN, { optional: true });
}
```

### @Input Decorators (Legacy)

Use input() and output() functions for signal-based component communication.

```typescript
// WRONG - Legacy decorators
@Component({ ... })
export class UserCardComponent {
  @Input() user!: User;
  @Output() select = new EventEmitter<User>();
}

// CORRECT - Signal-based functions
@Component({ standalone: true, ... })
export class UserCardComponent {
  user = input.required<User>();
  select = output<User>();
}
```

---

## Quick Reference

### Signal Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `signal(value)` | Create writable signal | `count = signal(0)` |
| `.set(value)` | Replace value | `count.set(5)` |
| `.update(fn)` | Update based on previous | `count.update(n => n + 1)` |
| `.asReadonly()` | Get read-only version | `readonly = count.asReadonly()` |
| `computed(fn)` | Derive from signals | `double = computed(() => count() * 2)` |
| `effect(fn)` | Side effects | `effect(() => console.log(count()))` |

### Input/Output Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `input()` | Optional input | `name = input('')` |
| `input.required()` | Required input | `id = input.required<string>()` |
| `input({ transform })` | Transform input | `age = input(0, { transform: numberAttribute })` |
| `output()` | Event emitter | `click = output<void>()` |
| `output.emit(value)` | Emit event | `click.emit()` |
| `model()` | Two-way binding | `value = model('')` |

### Control Flow Syntax

| Syntax | Purpose | Example |
|--------|---------|---------|
| `@if (cond)` | Conditional | `@if (loading()) { ... }` |
| `@else` | Else branch | `@if (...) { } @else { }` |
| `@else if (cond)` | Else if | `@if (...) { } @else if (...) { }` |
| `@for (item of items; track item.id)` | Loop | `@for (user of users(); track user.id)` |
| `@empty` | Empty state | `@for (...) { } @empty { No items }` |
| `@switch (expr)` | Switch | `@switch (status()) { @case ('ok') { } }` |
| `@case (value)` | Switch case | `@case ('loading') { ... }` |
| `@default` | Default case | `@default { Unknown }` |
| `@defer (trigger)` | Lazy load | `@defer (on viewport) { ... }` |
| `@placeholder` | Before load | `@placeholder { Loading... }` |
| `@loading` | While loading | `@loading { Spinner }` |
| `@error` | On error | `@error { Failed }` |

### @for Context Variables

| Variable | Type | Description |
|----------|------|-------------|
| `$index` | `number` | Zero-based index |
| `$first` | `boolean` | First item |
| `$last` | `boolean` | Last item |
| `$even` | `boolean` | Even index |
| `$odd` | `boolean` | Odd index |
| `$count` | `number` | Total items |

### @defer Triggers

| Trigger | When it loads |
|---------|--------------|
| `on idle` | Browser idle (default) |
| `on viewport` | Element enters viewport |
| `on interaction` | User clicks/taps placeholder |
| `on hover` | User hovers placeholder |
| `on immediate` | Immediately after parent renders |
| `on timer(ms)` | After specified delay |
| `when condition` | When expression becomes true |
| `prefetch on X` | Prefetch on trigger, load on main trigger |

### Component Checklist

- [ ] Uses `standalone: true`
- [ ] Uses `input()` / `input.required()` for inputs
- [ ] Uses `output()` for events
- [ ] Uses `model()` for two-way binding
- [ ] Uses `inject()` for dependency injection
- [ ] Uses `@if`, `@for`, `@switch` control flow
- [ ] Uses `track` in all `@for` loops
- [ ] Uses named constants for magic numbers
- [ ] Uses `computed()` for derived values
- [ ] Uses `effect()` only for side effects
