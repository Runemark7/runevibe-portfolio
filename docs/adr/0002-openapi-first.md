# OpenAPI is the contract

`api/openapi.yaml` is the source of truth. The Go server types and the TypeScript client are generated from it, and CI fails if the generated files drift. Hand-written types on each side would diverge the first time a field was renamed. GraphQL was not a fit for a read-only content API with one consumer.
