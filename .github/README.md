# GitHub Actions CI/CD

This directory contains the GitHub Actions configuration for the CI/CD process of the Fiszki project.

## Structure

- **Workflows**:
  - `master.yml` - main workflow that runs after pushing to the master branch, performs unit tests, build, and E2E tests
  - `deploy.yml` - deployment workflow that runs after the successful completion of the main workflow or manually

- **Composite Actions**:
  - `actions/setup-node-js` - configures the Node.js environment based on the .nvmrc file
  - `actions/setup-supabase` - configures and runs a local Supabase instance
  - `actions/setup-playwright` - configures Playwright for E2E tests

## Environment Variables

### Secrets

Configure the following secrets in your GitHub repository settings:

- `PUBLIC_SUPABASE_ANON_KEY` - anonymous key for Supabase
- `DIGITALOCEAN_ACCESS_TOKEN` - access token for DigitalOcean API
- `DIGITALOCEAN_APP_ID` - ID of the application on DigitalOcean App Platform
- `E2E_USERNAME` - username for E2E tests
- `E2E_PASSWORD` - password for E2E tests
- `E2E_USERNAME_ID` - user ID for E2E tests

### Variables

Configure the following variables in your GitHub repository settings:

- `PUBLIC_SUPABASE_URL` - URL to Supabase
- `PRODUCTION_URL` - URL of the production application

## Running Workflows

The `Build and Test` workflow runs automatically after each push to the master branch and can be triggered manually.

The `Deploy to Production` workflow runs automatically after the successful completion of the `Build and Test` workflow on the master branch and can be triggered manually.
