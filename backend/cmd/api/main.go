package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5/pgxpool"

	httpadapter "github.com/runemark7/runevibe-portfolio/backend/internal/adapters/http"
	"github.com/runemark7/runevibe-portfolio/backend/internal/adapters/postgres"
	"github.com/runemark7/runevibe-portfolio/backend/internal/service"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	dbURL := mustEnv("DATABASE_URL")
	port := envOr("PORT", "8080")
	allowedOrigin := envOr("CORS_ALLOWED_ORIGIN", "http://localhost:5173")
	migrationsPath := envOr("MIGRATIONS_PATH", "file://migrations")

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	pool, err := connectDB(ctx, dbURL)
	if err != nil {
		slog.Error("database unavailable", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	m, err := migrate.New(migrationsPath, dbURL)
	if err != nil {
		slog.Error("failed to create migrator", "error", err)
		os.Exit(1)
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		slog.Error("migration failed", "error", err)
		os.Exit(1)
	}
	srcErr, dbErr := m.Close()
	if srcErr != nil || dbErr != nil {
		slog.Warn("migrator close", "source", srcErr, "database", dbErr)
	}
	slog.Info("migrations applied")

	repo := postgres.NewRepository(pool)
	handler := httpadapter.NewHandler(service.NewPortfolio(repo), repo)

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Logger)
	r.Use(corsMiddleware(allowedOrigin))
	handler.Mount(r)

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		slog.Info("listening", "addr", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server stopped", "error", err)
			os.Exit(1)
		}
	}()

	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		slog.Error("shutdown", "error", err)
		os.Exit(1)
	}
}

func connectDB(ctx context.Context, url string) (*pgxpool.Pool, error) {
	var last error
	for attempt := 1; attempt <= 15; attempt++ {
		pool, err := pgxpool.New(ctx, url)
		if err == nil {
			pingCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
			err = pool.Ping(pingCtx)
			cancel()
			if err == nil {
				return pool, nil
			}
			pool.Close()
		}
		last = err
		slog.Info("waiting for database", "attempt", attempt, "error", err)
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(time.Second):
		}
	}
	return nil, last
}

func mustEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		slog.Error("missing environment variable", "name", key)
		os.Exit(1)
	}
	return value
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
