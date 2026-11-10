# CI and deployment checks

GitHub Actions is defined in `.github/workflows/ci.yml` and `.github/workflows/security-scan.yml`.

## CI workflow

The CI workflow runs for pushes to `main` and `master`, and for pull requests targeting either branch. It installs the frontend and backend dependencies, runs npm and pip dependency audits, runs ESLint, runs the frontend coverage command, runs pytest with an 80% backend coverage gate, and builds the backend Docker image after the test jobs succeed.

The Vite coverage thresholds are currently 70% lines, 65% functions, 70% branches, and 70% statements. The product acceptance targets in the HireLens upgrade brief are higher; the checked-in suite must grow before those goals can be claimed. CI is expected to fail when a configured gate is below threshold.

## Scheduled dependency scan

The security workflow runs npm audit and pip-audit on pushes and pull requests to `main`, plus its scheduled daily scan. Review audit output and update dependencies through reviewed lockfile changes.

## Deployment

CI validates the backend Docker build. This repository does not currently publish a container, apply production migrations, or deploy the frontend/backend automatically. Vercel deployment is configured separately through `vercel.json` and the project’s Vercel settings. Configure production environment variables and deploy only through the selected hosting providers’ release process.

## Local checks

```bash
npm ci
npm run lint
npm run build
npm run coverage
cd backend
python -m pytest --cov=app --cov-report=term-missing
docker build -t hirelens-api:test .
```
