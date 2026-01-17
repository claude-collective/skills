# Tooling - ESLint 9 Configuration

> ESLint 9 flat config patterns with shared configurations and only-warn plugin for better developer experience. See [SKILL.md](../SKILL.md) for core concepts and [reference.md](../reference.md) for decision frameworks.

---

## Shared Config Pattern

```javascript
// packages/eslint-config/base.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import { plugin as onlyWarn } from "eslint-plugin-only-warn";

export const baseConfig = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,

  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },

  // Convert all errors to warnings for better DX
  {
    plugins: {
      onlyWarn,
    },
  },

  {
    ignores: ["dist/**", "generated/**", ".next/**"],
  },
];
```

**Why good:** Flat config is simpler than legacy .eslintrc format, only-warn plugin prevents developers being blocked by errors during development, Prettier conflict resolution prevents formatting fights, Turbo plugin validates environment variables preventing runtime errors

```javascript
// BAD: Legacy .eslintrc format
// .eslintrc.json (DON'T USE THIS)
{
  "extends": ["eslint:recommended", "prettier"],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "no-unused-vars": "error" // Blocks developers
  },
  "ignorePatterns": ["dist/"]
}
```

**Why bad:** Legacy .eslintrc format is being phased out in ESLint 9+, error severity blocks developers during development reducing productivity, no only-warn plugin means disruptive error messages, harder to compose and extend configs

---

## Custom ESLint Rules for Monorepo

```javascript
// packages/eslint-config/custom-rules.js
export const customRules = {
  rules: {
    "import/no-default-export": "warn",
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@repo/*/src/**"],
            message: "Import from package exports, not internal paths",
          },
        ],
      },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixable: "code",
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
  },
};
```

**Why good:** Named exports enable better tree-shaking reducing bundle size, preventing internal imports maintains package API boundaries, consistent type imports improve build performance, unused variable warnings catch dead code early

```javascript
// BAD: No custom rules
export const config = [
  js.configs.recommended,
  // Missing project-specific rules
];
```

**Why bad:** No enforcement of named exports allows default exports reducing tree-shaking effectiveness, no internal import restrictions breaks package encapsulation, no type import consistency slows builds, unused variables clutter codebase

---

## Using Shared Config in Apps

```javascript
// apps/client-react/eslint.config.mjs
import { baseConfig } from "@repo/eslint-config";
import { customRules } from "@repo/eslint-config/custom-rules";

export default [
  ...baseConfig,
  customRules,
  {
    // App-specific overrides
    rules: {
      "no-console": "warn",
    },
  },
];
```

---

## Key Points

| Requirement | Implementation |
|-------------|----------------|
| Use flat config | `export default [...]` array syntax |
| Convert errors to warnings | Include `eslint-plugin-only-warn` |
| Prevent Prettier conflicts | Include `eslint-config-prettier` |
| Ignore build outputs | `ignores: ["dist/**", ".next/**"]` |

---

## See Also

- [core.md](core.md) for Prettier configuration
- [typescript.md](typescript.md) for TypeScript integration
- [reference.md](../reference.md) for ESLint vs Biome decision framework
