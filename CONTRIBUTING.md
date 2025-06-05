# Contributing to WhisperLog

First off, thanks for taking the time to contribute! 🎉  
The following guidelines help streamline development, ensure high code quality, and make collaboration productive for everyone.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branching Strategy](#branching-strategy)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Requests](#pull-requests)
- [Code Quality & Linting](#code-quality--linting)
- [Testing](#testing)
- [Continuous Integration / Continuous Deployment (CI/CD)](#continuous-integration--continuous-deployment-cicd)
- [AI Coding & Best Practices](#ai-coding--best-practices)
- [Documentation](#documentation)
- [Contact](#contact)

---

## Code of Conduct

By participating, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to the maintainers.

---

## Getting Started

1. **Fork** the repository and clone your fork locally:
   ```bash
   git clone https://github.com/your-username/WhisperLog-Your-Angel-Number-Companion.git
   cd WhisperLog-Your-Angel-Number-Companion
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a new branch** for your fix or feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Branching Strategy

- **main**: Always production-ready. All releases are tagged from here.
- **develop** *(optional)*: Integration branch for features before merging to main.
- **feature/**, **bugfix/**, **hotfix/**: Prefix new branches for clarity:
    - `feature/ai-logging-module`
    - `bugfix/fix-login-error`
    - `hotfix/urgent-patch`

**Never commit directly to `main`.**  
Always branch off `main` (or `develop` if used), and submit a Pull Request.

---

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for clarity and automation:

```
type(scope): short description

[optional body]
```

**Examples:**
- `feat(ai): add support for new angel number interpretation`
- `fix(ui): resolve timeline rendering issue`
- `docs(readme): update installation steps`

**Types:** feat, fix, docs, style, refactor, perf, test, chore

---

## Pull Requests

- Ensure your branch is **up-to-date with `main`** before opening a PR:
    ```bash
    git fetch origin
    git rebase origin/main
    ```
- **Title**: Clear and descriptive, following commit style.
- **Description**: Explain the purpose, relevant issue/feature, and highlight major changes.
- **Checklists**: Ensure all checks pass (CI, lint, tests).
- **Link issues**: Reference related issues (e.g., `Closes #123`).

---

## Code Quality & Linting

- Run the linter before committing:
    ```bash
    npm run lint
    ```
- Follow project style guides (Prettier, ESLint).
- Address all linter warnings/errors before submitting.

---

## Testing

- Write and update tests relevant to your changes.
- Run tests before committing:
    ```bash
    npm test
    ```
- For AI features, include test cases for both typical and edge-case inputs.

---

## Continuous Integration / Continuous Deployment (CI/CD)

- All Pull Requests trigger CI checks (lint, test, build).
- Only merge when all checks pass.
- The deployment pipeline is managed via GitHub Actions in `.github/workflows/`.

---

## AI Coding & Best Practices

- When using Copilot, Cursor, or similar AI tools, always review generated code for:
    - Security risks
    - Bias or hallucinations
    - Code clarity and maintainability
- Document AI model usage, training data, and prompt design in [`docs/blueprint.md`](docs/blueprint.md).
- Avoid committing sensitive data or credentials.

---

## Documentation

- Update relevant documentation for any code or feature changes.
- Major features should be described in [`docs/blueprint.md`](docs/blueprint.md).
- Add or update code comments where necessary.

---

## Contact

For questions or support, open an [issue](https://github.com/your-username/WhisperLog-Your-Angel-Number-Companion/issues) or contact the maintainers directly.

---

Happy contributing! 🚀