.PHONY: dev test generate generate-go generate-ts check-generated lint

COMPOSE = docker compose

dev:
	$(COMPOSE) up --build

test:
	cd backend && go test ./...
	cd frontend && npm test

lint:
	cd backend && go vet ./...
	cd frontend && npm run lint && npm run typecheck

generate: generate-go generate-ts

generate-go:
	cd backend && go tool oapi-codegen -config oapi-codegen.yaml ../api/openapi.yaml

generate-ts:
	cd frontend && npm run generate:api

check-generated: generate
	git diff --exit-code -- backend/internal/adapters/http/openapi/server.gen.go frontend/src/api/schema.d.ts
