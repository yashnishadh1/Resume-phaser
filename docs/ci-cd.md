# CI/CD Documentation

We enforce code quality and stability via automated Continuous Integration (CI) and Continuous Deployment (CD) pipelines. Currently, this relies on GitHub Actions.

## Continuous Integration (CI)

Every Pull Request against the `main` branch triggers the CI pipeline. The pipeline executes two parallel jobs:

### 1. Frontend Job
- Uses a `node:20` environment.
- **Linting**: Executes `npm run lint` utilizing ESLint to enforce React and TypeScript best practices.
- **Unit & Integration Tests**: Executes `npm run test -- --coverage`.
- **Quality Gates**: The Vitest configuration explicitly defines thresholds in `vite.config.ts`:
  - `lines`: 70%
  - `functions`: 65%
  - `branches`: 70%
  - `statements`: 70%
- If coverage falls below these thresholds, the pipeline **fails** and the PR cannot be merged.

### 2. Backend Job
- Uses a `python:3.13` environment.
- Provisions ephemeral PostgreSQL and Redis service containers for integration testing.
- **Testing**: Executes `pytest tests/ --cov=app --cov-fail-under=80`.
- **Quality Gates**: Backend coverage must remain above `80%`.

## Continuous Deployment (CD)

Once code is successfully merged into `main` and all CI checks pass, a deployment pipeline triggers.

### Frontend CD
1. The pipeline checks out the repository.
2. Runs `npm run build` to generate the Vite production bundle.
3. Syncs the resulting `dist/` directory to the production static host (e.g., S3, Vercel).

### Backend CD
1. Triggers a web-hook to the production server or builds a new Docker Image.
2. Pushes the Docker Image to an Elastic Container Registry (ECR).
3. Restarts the Docker Compose cluster (or Kubernetes Pods) via a rolling update to avoid downtime.
4. Executes Alembic migrations (`alembic upgrade head`) automatically.
