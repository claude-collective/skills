# Tooling - Git Hooks

> Husky pre-commit hooks with lint-staged and VS Code integration for consistent code quality. See [SKILL.md](../SKILL.md) for core concepts and [reference.md](../reference.md) for decision frameworks.

---

## Pre-commit Hook Setup

```bash
# .husky/pre-commit
bunx lint-staged
```

```javascript
// apps/client-react/lint-staged.config.mjs
export default {
  "*.{ts,tsx,scss}": "eslint --fix",
};
```

**Why good:** Only lints staged files keeping commits fast, auto-fix applies corrections automatically reducing manual work, blocking bad code before commit prevents build failures in CI, running on pre-commit catches issues immediately while context is fresh

```bash
// BAD: Full lint on every commit
# .husky/pre-commit
cd apps/client-react && bun run lint
```

**Why bad:** Linting entire codebase on every commit is slow reducing developer productivity, unrelated files failing lint blocks unrelated commits, long-running hooks encourage using --no-verify defeating the purpose, no auto-fix means developers manually fix issues

---

## VS Code Integration

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "editorconfig.editorconfig"
  ]
}
```

**Why good:** Format on save prevents unformatted code from being committed, auto-fix on save applies ESLint corrections automatically, per-language formatters ensure consistent tooling, recommended extensions help team setup

```json
// BAD: No editor integration
// No .vscode/settings.json

// Developers manually run:
// bun run lint:fix
// bun run format
```

**Why bad:** Manual formatting is forgotten leading to inconsistent code, lint errors discovered late instead of immediately on save, new team members don't know which extensions to install, each developer configures editor differently

---

## Husky Setup Steps

```bash
# 1. Install Husky
bun add -D husky

# 2. Initialize Husky
bunx husky init

# 3. Install lint-staged
bun add -D lint-staged

# 4. Create pre-commit hook
echo "bunx lint-staged" > .husky/pre-commit
```

---

## lint-staged Patterns

```javascript
// lint-staged.config.mjs - Multiple patterns
export default {
  // TypeScript and React files
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],

  // Stylesheets
  "*.{css,scss}": ["prettier --write"],

  // JSON files
  "*.json": ["prettier --write"],

  // Run type check on all TS files when any TS file changes
  "*.{ts,tsx}": () => "tsc --noEmit",
};
```

---

## Pre-commit Timing Guidelines

| Task | Time | Pre-commit? |
|------|------|-------------|
| lint-staged (staged files only) | < 5s | Yes |
| Prettier format | < 2s | Yes |
| Type check (--noEmit) | < 10s | Yes |
| Full test suite | > 30s | No (CI) |
| E2E tests | > 60s | No (CI) |
| Full build | > 30s | No (CI) |

**Rule of thumb:** Pre-commit should take < 10 seconds. Anything slower goes to pre-push or CI.

---

## See Also

- [eslint.md](eslint.md) for ESLint configuration
- [core.md](core.md) for Prettier configuration
- [reference.md](../reference.md) for when to use git hooks decision framework
