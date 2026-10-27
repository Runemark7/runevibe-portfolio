package postgres

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/runemark7/runevibe-portfolio/backend/internal/domain"
	"github.com/runemark7/runevibe-portfolio/backend/internal/ports"
)

// Repository is the Postgres adapter for the portfolio read model.
type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) Ready(ctx context.Context) error {
	return r.pool.Ping(ctx)
}

func (r *Repository) Profile(ctx context.Context) (domain.Profile, error) {
	var profile domain.Profile
	err := r.pool.QueryRow(ctx, `
		SELECT name, headline, summary, github_url, linkedin_url
		FROM profile
		WHERE id
	`).Scan(&profile.Name, &profile.Headline, &profile.Summary, &profile.GithubURL, &profile.LinkedInURL)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Profile{}, ports.ErrNotFound
	}
	return profile, err
}

func (r *Repository) Projects(ctx context.Context) ([]domain.Project, error) {
	rows, err := r.pool.Query(ctx, projectSelect+` ORDER BY sort_order`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []domain.Project
	for rows.Next() {
		project, err := scanProject(rows)
		if err != nil {
			return nil, err
		}
		projects = append(projects, project)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if err := r.attachFacts(ctx, projects); err != nil {
		return nil, err
	}
	return projects, nil
}

func (r *Repository) ProjectBySlug(ctx context.Context, slug string) (domain.Project, error) {
	rows, err := r.pool.Query(ctx, projectSelect+` WHERE slug = $1`, slug)
	if err != nil {
		return domain.Project{}, err
	}
	defer rows.Close()
	if !rows.Next() {
		if err := rows.Err(); err != nil {
			return domain.Project{}, err
		}
		return domain.Project{}, ports.ErrNotFound
	}
	project, err := scanProject(rows)
	if err != nil {
		return domain.Project{}, err
	}
	projects := []domain.Project{project}
	if err := r.attachFacts(ctx, projects); err != nil {
		return domain.Project{}, err
	}
	return projects[0], nil
}

const projectSelect = `
	SELECT slug, name, summary, body, kind, visibility, sort_order,
	       live_url, repo_url, credit_name, credit_url, credit_license
	FROM projects
`

type scannable interface {
	Scan(dest ...any) error
}

func scanProject(row scannable) (domain.Project, error) {
	var (
		project                          domain.Project
		kind, visibility                 string
		creditName, creditURL, creditLic *string
	)
	err := row.Scan(
		&project.Slug,
		&project.Name,
		&project.Summary,
		&project.Body,
		&kind,
		&visibility,
		&project.SortOrder,
		&project.LiveURL,
		&project.RepoURL,
		&creditName,
		&creditURL,
		&creditLic,
	)
	if err != nil {
		return domain.Project{}, err
	}
	project.Kind = domain.Kind(kind)
	project.Visibility = domain.Visibility(visibility)
	if creditName != nil {
		project.Credit = &domain.Credit{
			Name:    *creditName,
			URL:     *creditURL,
			License: *creditLic,
		}
	}
	project.Facts = []domain.Fact{}
	return project, nil
}

func (r *Repository) attachFacts(ctx context.Context, projects []domain.Project) error {
	if len(projects) == 0 {
		return nil
	}
	rows, err := r.pool.Query(ctx, `
		SELECT project_slug, label, value
		FROM project_facts
		ORDER BY project_slug, sort_order
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	bySlug := make(map[string][]domain.Fact, len(projects))
	for rows.Next() {
		var slug, label, value string
		if err := rows.Scan(&slug, &label, &value); err != nil {
			return err
		}
		bySlug[slug] = append(bySlug[slug], domain.Fact{Label: label, Value: value})
	}
	if err := rows.Err(); err != nil {
		return err
	}
	for i := range projects {
		if facts, ok := bySlug[projects[i].Slug]; ok {
			projects[i].Facts = facts
		}
	}
	return nil
}

func (r *Repository) Skills(ctx context.Context) ([]domain.Skill, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT slug, name, summary, category, basis, sort_order
		FROM skills
		ORDER BY sort_order
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var skills []domain.Skill
	index := map[string]int{}
	for rows.Next() {
		var skill domain.Skill
		var basis string
		if err := rows.Scan(&skill.Slug, &skill.Name, &skill.Summary, &skill.Category, &basis, &skill.SortOrder); err != nil {
			return nil, err
		}
		skill.Basis = domain.Basis(basis)
		skill.Usages = []domain.Usage{}
		index[skill.Slug] = len(skills)
		skills = append(skills, skill)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	usageRows, err := r.pool.Query(ctx, `
		SELECT u.skill_slug, p.slug, p.name
		FROM skill_usages u
		JOIN projects p ON p.slug = u.project_slug
		ORDER BY p.sort_order
	`)
	if err != nil {
		return nil, err
	}
	defer usageRows.Close()
	for usageRows.Next() {
		var skillSlug string
		var usage domain.Usage
		if err := usageRows.Scan(&skillSlug, &usage.ProjectSlug, &usage.ProjectName); err != nil {
			return nil, err
		}
		i, ok := index[skillSlug]
		if !ok {
			continue
		}
		skills[i].Usages = append(skills[i].Usages, usage)
	}
	return skills, usageRows.Err()
}

func (r *Repository) Workflow(ctx context.Context) (domain.Workflow, error) {
	var workflow domain.Workflow
	err := r.pool.QueryRow(ctx, `SELECT value FROM site_copy WHERE key = 'workflow_summary'`).Scan(&workflow.Summary)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Workflow{}, ports.ErrNotFound
	}
	if err != nil {
		return domain.Workflow{}, err
	}

	agentRows, err := r.pool.Query(ctx, `
		SELECT slug, name, owns, summary, sort_order
		FROM agents
		ORDER BY sort_order
	`)
	if err != nil {
		return domain.Workflow{}, err
	}
	defer agentRows.Close()
	for agentRows.Next() {
		var agent domain.Agent
		if err := agentRows.Scan(&agent.Slug, &agent.Name, &agent.Owns, &agent.Summary, &agent.SortOrder); err != nil {
			return domain.Workflow{}, err
		}
		workflow.Agents = append(workflow.Agents, agent)
	}
	if err := agentRows.Err(); err != nil {
		return domain.Workflow{}, err
	}

	stepRows, err := r.pool.Query(ctx, `
		SELECT slug, name, summary, sort_order
		FROM workflow_steps
		ORDER BY sort_order
	`)
	if err != nil {
		return domain.Workflow{}, err
	}
	defer stepRows.Close()
	for stepRows.Next() {
		var step domain.WorkflowStep
		if err := stepRows.Scan(&step.Slug, &step.Name, &step.Summary, &step.SortOrder); err != nil {
			return domain.Workflow{}, err
		}
		workflow.Steps = append(workflow.Steps, step)
	}
	return workflow, stepRows.Err()
}

func (r *Repository) Infra(ctx context.Context) ([]domain.InfraNote, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT slug, title, summary, sort_order
		FROM infra_notes
		ORDER BY sort_order
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var notes []domain.InfraNote
	for rows.Next() {
		var note domain.InfraNote
		if err := rows.Scan(&note.Slug, &note.Title, &note.Summary, &note.SortOrder); err != nil {
			return nil, err
		}
		notes = append(notes, note)
	}
	return notes, rows.Err()
}
