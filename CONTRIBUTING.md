# Contributing to DetectResearch

Thanks for helping improve DetectResearch. Keep each contribution focused so it is easy to review, test, and release safely.

## Local setup

1. Install the Node.js version supported by the project.
2. Install dependencies with `npm ci`.
3. Configure the environment variables documented in the project README.
4. Apply the Prisma migrations required for your local database.
5. Start the development server with `npm run dev`.

Do not commit API keys, database credentials, session secrets, or exported user data.

## Before opening a pull request

Run the project checks that apply to your change:

```bash
npm test
npm run lint
npm run build
```

If a change affects Prisma models, include the corresponding migration and verify it against a disposable local database. If it changes an API route, update or add tests for successful requests, invalid input, authorization failures, and error responses.

## Pull requests

- Use a short title that describes the outcome of the change.
- Explain what changed, why it is needed, and how it was validated.
- Keep unrelated refactors in separate pull requests.
- Add screenshots for visible interface changes.
- Call out database, authentication, privacy, and deployment impacts.
- Link the relevant issue when one exists.

By contributing, you agree that your contribution may be distributed under the repository's license.
