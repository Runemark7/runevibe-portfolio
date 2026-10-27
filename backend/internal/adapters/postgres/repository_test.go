package postgres

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/runemark7/runevibe-portfolio/backend/internal/domain"
	"github.com/runemark7/runevibe-portfolio/backend/internal/ports"
)

func TestSeedMatchesPortfolioRules(t *testing.T) {
	repo := openSeeded(t)
	ctx := context.Background()

	projects, err := repo.Projects(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if len(projects) != 5 {
		t.Fatalf("projects = %d, want 5", len(projects))
	}
	wantOrder := []string{"riksdagskollen", "dealradar", "paper-trading-bot", "warehouse", "halmstad-homes"}
	for i, slug := range wantOrder {
		if projects[i].Slug != slug {
			t.Fatalf("project %d = %s, want %s", i, projects[i].Slug, slug)
		}
		if err := projects[i].Validate(); err != nil {
			t.Fatalf("%s: %v", slug, err)
		}
	}
	if projects[0].Kind != domain.KindFlagship {
		t.Fatalf("flagship = %s", projects[0].Kind)
	}
	if projects[1].RepoURL != nil || projects[1].LiveURL != nil {
		t.Fatal("DealRadar must not expose a repository or a live URL")
	}
	if projects[3].RepoURL != nil || projects[4].RepoURL != nil {
		t.Fatal("private projects must not expose a repository URL")
	}
	if projects[2].Credit == nil || projects[2].Credit.License != "MIT" {
		t.Fatalf("paper trading credit: %+v", projects[2].Credit)
	}

	var votes string
	for _, fact := range projects[0].Facts {
		if fact.Label == "Individual member votes" {
			votes = fact.Value
		}
	}
	if votes != "3,957,311 as of 2026-10-24 (about 4 million)" {
		t.Fatalf("vote fact = %q", votes)
	}
	if strings.Contains(projects[0].Body, "complete history") {
		t.Fatal("vote history must not be described as complete")
	}
	if !strings.Contains(projects[0].Body, "Ingestion runs daily") || !strings.Contains(projects[0].Body, "freshness alerting") || !strings.Contains(projects[0].Body, "2002/03") {
		t.Fatalf("riksdagskollen body missing ingestion wording: %s", projects[0].Body)
	}
	if !strings.Contains(projects[3].Body, "PixiJS") {
		t.Fatal("warehouse frontend is PixiJS; the live bundle includes pixi.js")
	}

	skills, err := repo.Skills(ctx)
	if err != nil {
		t.Fatal(err)
	}
	bySlug := map[string]domain.Skill{}
	for _, skill := range skills {
		bySlug[skill.Slug] = skill
	}
	goSkill := domain.ProficiencyFor(bySlug["go"])
	if !goSkill.UsedOften || goSkill.ProjectCount != 3 {
		t.Fatalf("go proficiency: %+v", goSkill)
	}
	arch := domain.ProficiencyFor(bySlug["arch"])
	if err := bySlug["arch"].Validate(); err != nil {
		t.Fatal(err)
	}
	if arch.UsedOften || arch.ProjectCount != 0 || bySlug["arch"].Basis != domain.BasisDailyDriver {
		t.Fatalf("arch proficiency: %+v", arch)
	}
	counts := map[string]int{
		"docker":         4,
		"github-actions": 4,
		"k3s":            5,
		"helm":           5,
		"argocd":         5,
		"cert-manager":   4,
		"openapi":        3,
		"hexagonal":      1,
	}
	for slug, want := range counts {
		got := domain.ProficiencyFor(bySlug[slug])
		if got.ProjectCount != want {
			t.Fatalf("%s project count = %d, want %d", slug, got.ProjectCount, want)
		}
	}

	workflow, err := repo.Workflow(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if len(workflow.Agents) != 7 || len(workflow.Steps) != 6 {
		t.Fatalf("workflow agents=%d steps=%d", len(workflow.Agents), len(workflow.Steps))
	}
	if workflow.Steps[0].Name != "grill-me" || workflow.Steps[5].Name != "pr" {
		t.Fatalf("steps: %+v", workflow.Steps)
	}
	if strings.Contains(workflow.Steps[5].Summary, "Alexander reviews it") || !strings.Contains(workflow.Steps[5].Summary, "code review") {
		t.Fatalf("pr step: %s", workflow.Steps[5].Summary)
	}
	if strings.Contains(workflow.Summary, "Alexander reviews") || !strings.Contains(workflow.Summary, "code review") {
		t.Fatalf("workflow summary: %s", workflow.Summary)
	}

	missing, err := repo.ProjectBySlug(ctx, "not-a-project")
	if !errors.Is(err, ports.ErrNotFound) || missing.Slug != "" {
		t.Fatalf("missing project: %+v %v", missing, err)
	}

	_, err = repo.pool.Exec(ctx, `
		INSERT INTO projects (slug, name, summary, body, kind, visibility, sort_order, repo_url)
		VALUES ('secret-tool', 'Secret', 's', 'b', 'standard', 'private', 99, 'https://github.com/example/no')
	`)
	if err == nil {
		t.Fatal("private project accepted a repository URL")
	}
}

func openSeeded(t *testing.T) *Repository {
	t.Helper()
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		if os.Getenv("REQUIRE_DB") == "1" {
			t.Fatal("DATABASE_URL is required")
		}
		t.Skip("DATABASE_URL not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	t.Cleanup(cancel)
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(pool.Close)
	if _, err := pool.Exec(ctx, `DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`); err != nil {
		t.Fatal(err)
	}

	m, err := migrate.New("file://"+migrationsDir(t), url)
	if err != nil {
		t.Fatalf("migrate: %v", err)
	}
	defer func() {
		_, _ = m.Close()
	}()
	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		t.Fatalf("migrate up: %v", err)
	}
	return NewRepository(pool)
}

func migrationsDir(t *testing.T) string {
	t.Helper()
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	return filepath.Join(filepath.Dir(file), "..", "..", "..", "migrations")
}
