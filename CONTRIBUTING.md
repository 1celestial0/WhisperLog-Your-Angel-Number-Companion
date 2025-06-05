# Contributing

Thank you for helping improve WhisperLog.

## Branch workflow

- Create a new branch from `master` for every change.
- Keep your branch up to date with the latest `master`.
- Open a pull request once your branch is ready for review.

## Commit style

- Use short, present-tense commit messages like `Add speech playback`.
- Include additional detail in the body when needed.
- Separate logical changes into individual commits.

## Code quality

Run the following commands before pushing changes:

```bash
npm run lint
npm run typecheck
```

Fix any reported issues before opening a pull request.

## Tests

Tests are not yet included, but once they are you will be able to run them with:

```bash
npm test
```

Please run the test suite and ensure it passes before submitting your PR.
