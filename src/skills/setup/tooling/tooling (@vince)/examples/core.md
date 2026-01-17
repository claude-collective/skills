# Tooling - Core Examples

> Essential patterns for build tooling. See [SKILL.md](../SKILL.md) for core concepts and [reference.md](../reference.md) for decision frameworks.

**Additional Examples:**
- [vite.md](vite.md) - Vite path aliases, vendor chunks, environment builds
- [eslint.md](eslint.md) - ESLint 9 flat config, shared configs, custom rules
- [typescript.md](typescript.md) - Shared TypeScript strict config
- [git-hooks.md](git-hooks.md) - Husky, lint-staged, VS Code integration

---

## Prettier Configuration

### Shared Config Pattern

```javascript
// packages/prettier-config/prettier.config.mjs
const config = {
  printWidth: 100,
  useTabs: false,
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",
};

export default config;
```

```json
// apps/client-react/package.json
{
  "name": "client-react",
  "prettier": "@repo/prettier-config",
  "devDependencies": {
    "@repo/prettier-config": "*"
  }
}
```

**Why good:** Single source of truth prevents formatting inconsistencies across team, 100 char line width balances readability with screen space, double quotes match JSON format reducing escaping in JSX, trailing commas create cleaner git diffs when adding items

```json
// BAD: Duplicated config in each package
// apps/client-react/.prettierrc
{
  "printWidth": 80,
  "semi": true,
  "singleQuote": true
}

// apps/client-next/.prettierrc
{
  "printWidth": 120,
  "semi": false,
  "singleQuote": true
}
```

**Why bad:** Different configs per package creates inconsistent formatting across monorepo, manually syncing changes is error-prone, developers switching between packages see formatting churn, code reviews show formatting noise instead of logic changes

---

## Quick Reference

### Shared Config Packages

| Package | Purpose | Usage |
|---------|---------|-------|
| `@repo/prettier-config` | Formatting | `"prettier": "@repo/prettier-config"` |
| `@repo/eslint-config` | Linting | `import { baseConfig } from "@repo/eslint-config"` |
| `@repo/typescript-config` | TypeScript | `"extends": "@repo/typescript-config/base.json"` |

### Key Files to Create

```
packages/
├── eslint-config/
│   └── base.js           # ESLint 9 flat config
├── prettier-config/
│   └── prettier.config.mjs
└── typescript-config/
    └── base.json         # Strict TypeScript settings
```

---

## See Also

- [vite.md](vite.md) for build configuration with path aliases
- [eslint.md](eslint.md) for linting configuration
- [typescript.md](typescript.md) for strict type checking
- [git-hooks.md](git-hooks.md) for pre-commit quality gates
