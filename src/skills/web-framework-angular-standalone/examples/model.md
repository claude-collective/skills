# Two-Way Binding with model() Examples

> Two-way binding patterns using model() for Angular 17+ standalone components. See [core.md](core.md) for standalone and signal basics.

---

## Pattern: model() for Two-Way Binding

### Good Example - model() creates two-way bindable signals

```typescript
// color-picker.component.ts
import { Component, input, model, signal, computed } from "@angular/core";

type ColorFormat = "hex" | "rgb" | "hsl";

@Component({
  selector: "app-color-picker",
  standalone: true,
  template: `
    <div class="color-picker">
      <div class="preview" [style.background-color]="color()"></div>

      <input type="color" [value]="color()" (input)="onColorInput($event)" />

      <input
        type="text"
        [value]="color()"
        (input)="onColorInput($event)"
        [placeholder]="placeholder()"
      />

      @if (showAlpha()) {
        <input
          type="range"
          min="0"
          max="100"
          [value]="alpha()"
          (input)="onAlphaInput($event)"
        />
        <span>{{ alpha() }}%</span>
      }
    </div>
  `,
})
export class ColorPickerComponent {
  // Two-way bound value
  color = model("#000000");

  // Two-way bound alpha
  alpha = model(100);

  // Optional inputs
  placeholder = input("Enter color...");
  showAlpha = input(false);

  onColorInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.color.set(target.value);
  }

  onAlphaInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.alpha.set(Number(target.value));
  }
}
```

**Usage in parent:**

```html
<app-color-picker
  [(color)]="themeColor"
  [(alpha)]="themeAlpha"
  [showAlpha]="true"
/>
```

**Why good:** model() creates two-way bindable signals, parent uses [(color)] syntax, component can read and write the value, no boilerplate for @Input + @Output combo

---

## model() vs input() + output()

| Use Case                                | Approach   |
| --------------------------------------- | ---------- |
| Parent controls value, child only reads | `input()`  |
| Child emits events, parent handles      | `output()` |
| Both can read AND write the value       | `model()`  |
| Form-like components (pickers, inputs)  | `model()`  |
