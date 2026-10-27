# runevibe-portfolio

Alexander Runemark's portfolio for [runevibe.se](https://runevibe.se). It lists the featured projects, the skills those projects actually use, and the AI assistants and coding workflow around the work.

The page is a React client. Content is served by a Go API from PostgreSQL. `api/openapi.yaml` is the contract: Go server types and the TypeScript client are generated from it.

## Local development

Requires Docker.

```bash
make dev
```

That starts Postgres 18, the API on [http://localhost:8080](http://localhost:8080), and the Vite app on [http://localhost:5173](http://localhost:5173). Compose uses `sslmode=disable`. That password and that database are local only.

```bash
make test
make lint
make generate
make check-generated
```

`make test` for the Postgres adapter needs `DATABASE_URL`. Compose publishes Postgres on `localhost:5432` with the URL in `.env.example`. CI sets `REQUIRE_DB=1` so a missing database fails the job instead of skipping.

## Layout

- `api/openapi.yaml` — contract
- `backend/internal/domain` — portfolio rules, no infrastructure imports
- `backend/internal/ports` — reader and readiness ports
- `backend/internal/adapters/http` — chi adapter over the generated server
- `backend/internal/adapters/postgres` — pgx adapter; migrations in `backend/migrations`
- `frontend/src/ui` — the only PatternFly imports
- `frontend/src/features` and `frontend/src/pages` — portfolio UI
- `GLOSSARY.md`, `docs/adr/`, `AGENTS.md` — language and decisions
- `deploy/charts/runevibe-portfolio` — Helm chart
- `deploy/argocd/application.yaml` — Argo CD Application, not applied by this repo

## Deploy

Images publish to `ghcr.io/runemark7/runevibe-portfolio-api` and `ghcr.io/runemark7/runevibe-portfolio-frontend` when CI runs on `main`. A follow-up commit writes the SHA into `deploy/charts/runevibe-portfolio/values-prod.yaml` with `[skip ci]`.

Nothing in this repository applies the chart, creates DNS records, or creates cluster secrets. Those steps are manual:

1. On the external Postgres VPS, create a database and a role for this site. The role must be a member of the shared `apps` group and must own the database, because the API runs migrations at startup. The connection string must use `sslmode=require`. Put it in a Kubernetes Secret named `runevibe-portfolio-db` in the `runevibe` namespace, key `DATABASE_URL`. Create the secret before the Application syncs. Do not commit the value.
2. Create `ghcr-pull-secret` in the `runevibe` namespace so the node can pull the images. If the GHCR packages are public, remove `imagePullSecrets` from `values-prod.yaml` instead of creating a dummy secret.
3. Apply the Application once: `kubectl apply -f deploy/argocd/application.yaml`. Sync is automated after that (`prune`, `selfHeal`, `CreateNamespace=true`, `ServerSideApply=true`, retry limit 5).
4. Point DNS A records for `runevibe.se` and `www.runevibe.se` at the ingress load balancer. cert-manager (issuer `letsencrypt-prod`) issues `runevibe-portfolio-tls`. HTTP redirects to HTTPS.
5. Add a real LinkedIn URL to the profile row when one should be public. Until then the site hides the LinkedIn link.
