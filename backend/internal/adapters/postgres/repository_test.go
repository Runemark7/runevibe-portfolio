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
	if len(projects) != 4 {
		t.Fatalf("projects = %d, want 4", len(projects))
	}
	wantOrder := []string{"riksdagskollen", "dealradar", "paper-trading-bot", "halmstad-homes"}
	for i, slug := range wantOrder {
		if projects[i].Slug != slug {
			t.Fatalf("project %d = %s, want %s", i, projects[i].Slug, slug)
		}
		if err := projects[i].Validate(); err != nil {
			t.Fatalf("%s: %v", slug, err)
		}
		if projects[i].SortOrder != i+1 {
			t.Fatalf("%s sort order = %d, want %d", slug, projects[i].SortOrder, i+1)
		}
	}
	if projects[3].Kind != domain.KindSmaller {
		t.Fatalf("halmstad kind = %s", projects[3].Kind)
	}
	if projects[0].Kind != domain.KindFlagship {
		t.Fatalf("flagship = %s", projects[0].Kind)
	}
	if projects[1].RepoURL != nil || projects[1].LiveURL != nil {
		t.Fatal("DealRadar must not expose a repository or a live URL")
	}
	if projects[3].RepoURL != nil {
		t.Fatal("private projects must not expose a repository URL")
	}
	if projects[2].Credit == nil || projects[2].Credit.License != "MIT" {
		t.Fatalf("paper trading credit: %+v", projects[2].Credit)
	}
	if projects[2].RepoURL == nil || *projects[2].RepoURL != "https://github.com/Runemark7/paper-trading-bot" {
		t.Fatalf("paper trading repository: %v", projects[2].RepoURL)
	}
	if projects[2].LiveURL == nil || *projects[2].LiveURL != "https://trading.runevibe.se" {
		t.Fatalf("paper trading live URL: %v", projects[2].LiveURL)
	}
	assertPaperTrading(t, projects[2], paperTradingBatch2)

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
	if _, err := repo.ProjectBySlug(ctx, "warehouse"); !errors.Is(err, ports.ErrNotFound) {
		t.Fatalf("warehouse must not be featured: %v", err)
	}
	profile, err := repo.Profile(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(strings.ToLower(profile.Summary), "pixel-art") {
		t.Fatalf("profile still mentions warehouse: %s", profile.Summary)
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
	if !goSkill.UsedOften || goSkill.ProjectCount != 2 {
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
		"typescript-react": 4,
		"python":           2,
		"postgresql":       3,
		"docker":           3,
		"github-actions":   3,
		"k3s":              4,
		"helm":             4,
		"argocd":           4,
		"cert-manager":     3,
		"openapi":          2,
		"llm":              2,
		"hexagonal":        1,
		"n8n":              1,
	}
	for slug, want := range counts {
		got := domain.ProficiencyFor(bySlug[slug])
		if got.ProjectCount != want {
			t.Fatalf("%s project count = %d, want %d", slug, got.ProjectCount, want)
		}
	}
	for _, skill := range skills {
		for _, usage := range skill.Usages {
			if usage.ProjectSlug == "warehouse" {
				t.Fatalf("%s still links to warehouse", skill.Slug)
			}
		}
	}
	if strings.Contains(bySlug["llm"].Summary, "labelling") {
		t.Fatalf("llm summary still describes warehouse labelling: %s", bySlug["llm"].Summary)
	}

	workflow, err := repo.Workflow(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if len(workflow.Agents) != 6 || len(workflow.Steps) != 6 {
		t.Fatalf("workflow agents=%d steps=%d", len(workflow.Agents), len(workflow.Steps))
	}
	for i, agent := range workflow.Agents {
		if agent.Slug == "warehouse" || agent.SortOrder != i+1 {
			t.Fatalf("agent %d: %+v", i, agent)
		}
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

func TestRemoveWarehouseMigrationRoundTrip(t *testing.T) {
	repo := openSeeded(t)
	ctx := context.Background()
	m, err := migrate.New("file://"+migrationsDir(t), os.Getenv("DATABASE_URL"))
	if err != nil {
		t.Fatalf("migrate: %v", err)
	}
	defer func() {
		_, _ = m.Close()
	}()

	// 000004 sits above the warehouse removal. Roll back to the original seed.
	if err := m.Migrate(2); err != nil {
		t.Fatalf("down to version 2: %v", err)
	}
	projects, err := repo.Projects(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if len(projects) != 5 || projects[3].Slug != "warehouse" || projects[4].SortOrder != 5 {
		t.Fatalf("down did not restore warehouse: %d projects", len(projects))
	}
	workflow, err := repo.Workflow(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if len(workflow.Agents) != 7 || workflow.Agents[3].Slug != "warehouse" {
		t.Fatalf("down did not restore the warehouse agent: %+v", workflow.Agents)
	}

	if err := m.Up(); err != nil {
		t.Fatalf("up: %v", err)
	}
	projects, err = repo.Projects(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if len(projects) != 4 {
		t.Fatalf("up left %d projects", len(projects))
	}
	assertPaperTrading(t, projects[2], paperTradingBatch2)
}

func TestPaperTradingLibraryMigrationRoundTrip(t *testing.T) {
	repo := openSeeded(t)
	ctx := context.Background()
	m, err := migrate.New("file://"+migrationsDir(t), os.Getenv("DATABASE_URL"))
	if err != nil {
		t.Fatalf("migrate: %v", err)
	}
	defer func() {
		_, _ = m.Close()
	}()

	projects, err := repo.Projects(ctx)
	if err != nil {
		t.Fatal(err)
	}
	assertPaperTrading(t, projects[2], paperTradingBatch2)

	if err := m.Steps(-1); err != nil {
		t.Fatalf("down: %v", err)
	}
	projects, err = repo.Projects(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if len(projects) != 4 || projects[2].Slug != "paper-trading-bot" || projects[2].SortOrder != 3 {
		t.Fatalf("down changed project order: %+v", projects)
	}
	assertPaperTrading(t, projects[2], paperTradingLibrary)
	if _, err := repo.ProjectBySlug(ctx, "warehouse"); !errors.Is(err, ports.ErrNotFound) {
		t.Fatalf("paper-trading down restored warehouse: %v", err)
	}

	if err := m.Steps(-1); err != nil {
		t.Fatalf("down to the mint copy: %v", err)
	}
	projects, err = repo.Projects(ctx)
	if err != nil {
		t.Fatal(err)
	}
	assertPaperTrading(t, projects[2], paperTradingMint)

	if err := m.Steps(2); err != nil {
		t.Fatalf("up: %v", err)
	}
	projects, err = repo.Projects(ctx)
	if err != nil {
		t.Fatal(err)
	}
	assertPaperTrading(t, projects[2], paperTradingBatch2)
	if projects[0].Facts[0].Value != "3,957,311 as of 2026-10-24 (about 4 million)" {
		t.Fatalf("riksdag fact changed: %+v", projects[0].Facts)
	}
}

type paperTradingCopy struct {
	summary string
	bodyHas []string
	bodyNot []string
	facts   []domain.Fact
}

func assertPaperTrading(t *testing.T, project domain.Project, want paperTradingCopy) {
	t.Helper()
	if project.Slug != "paper-trading-bot" {
		t.Fatalf("slug = %s", project.Slug)
	}
	if project.Summary != want.summary {
		t.Fatalf("summary = %q", project.Summary)
	}
	for _, phrase := range want.bodyHas {
		if !strings.Contains(project.Body, phrase) {
			t.Fatalf("body missing %q:\n%s", phrase, project.Body)
		}
	}
	for _, phrase := range want.bodyNot {
		if strings.Contains(project.Body, phrase) {
			t.Fatalf("body still contains %q:\n%s", phrase, project.Body)
		}
	}
	if len(project.Facts) != len(want.facts) {
		t.Fatalf("facts = %+v", project.Facts)
	}
	for i, fact := range want.facts {
		if project.Facts[i] != fact {
			t.Fatalf("fact %d = %+v, want %+v", i, project.Facts[i], fact)
		}
	}
}

var paperTradingBatch2 = paperTradingCopy{
	summary: "Paper-only BTC research that scores a library of 32 published strategies and only proposes ones that stay positive after fees out of sample and on a sealed holdout. Six library passes are seated as paper forward tests after a manual approval. No real money.",
	bodyHas: []string{
		"does not handle real money",
		"isolated paper account that starts at 10,000",
		"library of 32 published, cited strategies",
		"A second batch of 17 was added to the original 15.",
		"2017-08-17",
		"v7b, dated 2026-10-29",
		"2018-12-01 to 2025-09-30",
		"2025-10-01 to 2026-10-01",
		"a pass is never seated on its own",
		"all 32 library strategies have been tested and 7 pass",
		"lib.rsi2 (RSI(2)), lib.sma200 (SMA 200), lib.ichimoku (Ichimoku), lib.rsi14 (RSI(14)), lib.tsmom180d (180-day time-series momentum), and lib.rsi2_10 (RSI(2) below 10)",
		"lib.sma100 (SMA 100) is the other pass, and it stays an unproven forward test",
		"35,667 unique strategy candidates",
		"all 127 earlier champions were retested and retired",
		"dip_234b and dip_240b, were admitted afterwards on 2026-10-09",
		"so nine champions run in total",
	},
	bodyNot: []string{
		"ETH",
		"Mint is a deterministic generator",
		"18,867",
		"Sharpe ratio of at least 0.30",
		"library of 15 published",
		"3 of the 15",
		"None of the three beat plain buy-and-hold",
	},
	facts: []domain.Fact{
		{Label: "Discovery", Value: "Library of 32 cited strategies on daily BTC"},
		{Label: "Passed", Value: "7 of 32 as of 2026-10-30"},
		{Label: "Gate", Value: "Positive net P&L after a 0.1% fee + 2 bps, out of sample from 2018-12-01 to 2025-09-30 and on a sealed holdout from 2025-10-01 to 2026-10-01, both still positive at 2x fees + 5 bps; at least 8 out-of-sample round trips and 2 holdout trades"},
		{Label: "Earlier search", Value: "35,667 candidates tested before the library switch"},
		{Label: "Markets", Value: "Paper-only BTC. No real money."},
	},
}

var paperTradingLibrary = paperTradingCopy{
	summary: "Paper-only BTC research that scores a library of published strategies and only proposes ones that stay positive after fees out of sample and on a sealed holdout. No real money.",
	bodyHas: []string{
		"does not handle real money",
		"isolated paper account that starts at 10,000",
		"library of 15 published, cited strategies",
		"2017-08-17",
		"v7b, dated 2026-10-29",
		"2018-12-01 to 2025-09-30",
		"2025-10-01 to 2026-10-01",
		"lib.rsi2, lib.sma100, and lib.sma200",
		"None of the three beat plain buy-and-hold",
		"35,667 unique strategy candidates",
		"all 127 earlier champions were retested and retired",
	},
	bodyNot: []string{
		"ETH",
		"Mint is a deterministic generator",
		"18,867",
		"Sharpe ratio of at least 0.30",
	},
	facts: []domain.Fact{
		{Label: "Discovery", Value: "Library of 15 cited strategies on daily BTC"},
		{Label: "Passed", Value: "3 of 15 as of 2026-10-29"},
		{Label: "Gate", Value: "Positive net P&L after a 0.1% fee + 2 bps, out of sample from 2018-12-01 to 2025-09-30 and on a sealed holdout from 2025-10-01 to 2026-10-01, both still positive at 2x fees + 5 bps; at least 8 out-of-sample round trips and 2 holdout trades"},
		{Label: "Earlier search", Value: "35,667 candidates tested before the library switch"},
		{Label: "Markets", Value: "Paper-only BTC. No real money."},
	},
}

var paperTradingMint = paperTradingCopy{
	summary: "Paper-only BTC and ETH research. Strategies are generated, backtested, and kept only when they clear a frozen walk-forward gate. No real money.",
	bodyHas: []string{
		"The paper trading bot searches for BTC and ETH strategies on paper. It does not place real orders and it does not handle real money.",
		"Mint is a deterministic generator. It builds AND-combinations of indicator conditions, at most seven conditions each, and it only adds a new family of conditions from peer-reviewed research. Farm is a set of stateless workers that lease candidates and backtest them.",
		"A frozen walk-forward gate decides what may be called a pass: 23 out-of-sample windows covering about 5.7 years, at least 30 trades, a Sharpe ratio of at least 0.30, and a result that beats both a moving-average baseline and buy-and-hold.",
		"As of 2026-10-27, 18,867 strategies had been backtested and 122 had passed, about 0.6 percent. When the gate was tightened in early October 2026, all 127 earlier champions were retested and retired. The gate is preferred over a longer list of winners.",
		"The stack is Python (pandas, ccxt), a React dashboard, and k3s with Argo CD. Continuous integration builds the image and the deploy pins the commit. The project is built on virattt/ai-hedge-fund (MIT).",
	},
	facts: []domain.Fact{
		{Label: "Backtested", Value: "18,867 strategies as of 2026-10-27"},
		{Label: "Passed the gate", Value: "122 (about 0.6%)"},
		{Label: "Retired champions", Value: "127 retested and retired when the gate was tightened in early October 2026"},
		{Label: "Gate", Value: "23 out-of-sample windows over about 5.7 years; at least 30 trades; Sharpe at least 0.30; must beat a moving-average baseline and buy-and-hold"},
		{Label: "Markets", Value: "Paper-only BTC and ETH. No real money."},
	},
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
