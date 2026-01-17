# Tooling - TypeScript Configuration

> Shared TypeScript configuration with strict mode for monorepo consistency. See [SKILL.md](../SKILL.md) for core concepts and [reference.md](../reference.md) for decision frameworks.

---

## Shared Config Pattern

```javascript
// packages/typescript-config/base.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "incremental": true,
    "moduleResolution": "bundler"
  }
}
```

```json
// apps/client-react/tsconfig.json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Why good:** Shared strict mode prevents any types across entire monorepo, centralized config ensures all packages have same safety guarantees, path aliases eliminate relative import hell, noUncheckedIndexedAccess prevents undefined access bugs

```json
// BAD: Loose TypeScript config per package
// apps/client-react/tsconfig.json
{
  "compilerOptions": {
    "strict": false, // Allows implicit any
    "noImplicitAny": false,
    "strictNullChecks": false,
    "skipLibCheck": true
  }
}
```

**Why bad:** Disabling strict mode allows implicit any types leading to runtime errors, no null checks cause undefined is not a function crashes, inconsistent configs across packages create different safety levels, developers switching packages lose type safety

---

## Strict Mode Options Explained

| Option | Purpose |
|--------|---------|
| `strict: true` | Enables all strict type-checking options |
| `noImplicitAny: true` | Error on expressions with implied `any` |
| `strictNullChecks: true` | `null` and `undefined` are distinct types |
| `noUncheckedIndexedAccess: true` | Add `undefined` to index signature results |
| `exactOptionalPropertyTypes: true` | Optional properties can't be `undefined` |
| `noUnusedLocals: true` | Error on unused local variables |
| `noUnusedParameters: true` | Error on unused parameters |

---

## Path Alias Sync

Path aliases must be configured in both `tsconfig.json` and build tool (Vite/Next):

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"]
    }
  }
}
```

```typescript
// vite.config.ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@components": path.resolve(__dirname, "./src/components"),
  }
}
```

**Gotcha:** Forgetting to sync causes import resolution failures at build time.

---

## Specialized Configs

```
packages/typescript-config/
├── base.json        # Shared strict settings
├── react.json       # React-specific settings
├── node.json        # Node.js-specific settings
└── library.json     # Library publishing settings
```

```json
// packages/typescript-config/react.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["DOM", "DOM.Iterable", "ES2022"]
  }
}
```

---

## See Also

- [vite.md](vite.md) for path alias configuration in Vite
- [eslint.md](eslint.md) for consistent-type-imports rule
- [reference.md](../reference.md) for TypeScript strict mode requirements
