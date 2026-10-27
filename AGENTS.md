# Agent conventions

Read `GLOSSARY.md` before naming a domain concept. Use its words in code, API fields, and UI copy. If a term is vague, sharpen the glossary instead of inventing a synonym.

## Architecture

- `backend/internal/domain` imports only the standard library. No HTTP, no Postgres, no generated API types.
- Ports live in `backend/internal/ports`. Adapters live in `backend/internal/adapters`. `cmd/api` wires them.
- Change the API by editing `api/openapi.yaml`, then run `make generate`. Do not hand-edit `backend/internal/adapters/http/openapi/server.gen.go` or `frontend/src/api/schema.d.ts`.
- Only `frontend/src/ui/` may import `@patternfly/*`. Pages and features import `src/ui`.

## Content

- Portfolio claims, numbers, and links come from the seed migration. Do not invent metrics, years, proficiency bars, live URLs, or repository URLs.
- Featured projects are only Riksdagskollen, DealRadar, Paper Trading Bot, Warehouse, and the Halmstad homes map, in that order.
- Private projects have no repository link. Do not add one.
- The LinkedIn URL stays null until a real URL is provided. Do not guess it.
- Do not put hostnames, IP addresses, or credentials in the repo. Production database access is `DATABASE_URL` from the environment or the Kubernetes Secret named in the Helm values.
- Riksdagskollen ingestion runs daily, with automated freshness alerting. Vote history starts in 2002/03. Do not call that history complete.
- The paper-trading bot is paper-only. Do not claim profits.

## Tests and deploy

- Domain rules get unit tests. The Postgres adapter test runs when `DATABASE_URL` is set. CI sets `REQUIRE_DB=1`.
- Keep backend memory at 32Mi request / 128Mi limit and frontend nginx at 16Mi / 64Mi unless a measured failure says otherwise.
- The Helm chart and the Argo CD Application are prepared in-repo. Do not apply them, and do not change DNS or the registry, beyond what CI does on merge to main.
- Image-tag commits on main are the CI bot's job and include `[skip ci]`. Do not add that trailer to other commits.

## Decisions

Record an ADR in `docs/adr/` only when a choice is hard to reverse, surprising without the context, and the result of a real trade-off. Keep it to a short paragraph.
