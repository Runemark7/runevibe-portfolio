package service

import (
	"context"

	"github.com/runemark7/runevibe-portfolio/backend/internal/domain"
	"github.com/runemark7/runevibe-portfolio/backend/internal/ports"
)

// Portfolio is the application service. It validates domain rules on the way
// out so a bad seed fails a request instead of shipping an invalid project.
type Portfolio struct {
	reader ports.PortfolioReader
}

func NewPortfolio(reader ports.PortfolioReader) *Portfolio {
	return &Portfolio{reader: reader}
}

func (p *Portfolio) Profile(ctx context.Context) (domain.Profile, error) {
	return p.reader.Profile(ctx)
}

func (p *Portfolio) Projects(ctx context.Context) ([]domain.Project, error) {
	projects, err := p.reader.Projects(ctx)
	if err != nil {
		return nil, err
	}
	for _, project := range projects {
		if err := project.Validate(); err != nil {
			return nil, err
		}
	}
	return domain.SortProjects(projects), nil
}

func (p *Portfolio) Project(ctx context.Context, slug string) (domain.Project, error) {
	project, err := p.reader.ProjectBySlug(ctx, slug)
	if err != nil {
		return domain.Project{}, err
	}
	if err := project.Validate(); err != nil {
		return domain.Project{}, err
	}
	return project, nil
}

func (p *Portfolio) Skills(ctx context.Context) ([]domain.Proficiency, error) {
	skills, err := p.reader.Skills(ctx)
	if err != nil {
		return nil, err
	}
	return domain.Proficiencies(skills), nil
}

func (p *Portfolio) Workflow(ctx context.Context) (domain.Workflow, error) {
	return p.reader.Workflow(ctx)
}

func (p *Portfolio) Infra(ctx context.Context) ([]domain.InfraNote, error) {
	return p.reader.Infra(ctx)
}
