# syntax=docker/dockerfile:1.7
FROM golang:1.26.1-alpine AS builder

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -trimpath -o /app ./cmd/api

FROM alpine:3.21 AS dev

RUN addgroup -g 1000 appgroup \
 && adduser -D -u 1000 -G appgroup appuser \
 && apk add --no-cache wget

COPY --from=builder /app /app
COPY --chown=appuser:appgroup migrations /migrations

USER appuser:appgroup
EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
    CMD wget -qO- http://localhost:8080/healthz || exit 1

ENTRYPOINT ["/app"]

FROM gcr.io/distroless/static-debian12:nonroot AS production

COPY --from=builder /app /app
COPY --chown=nonroot:nonroot migrations /migrations

USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/app"]
