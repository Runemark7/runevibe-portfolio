package ports

import (
	"context"
	"errors"

	"github.com/runemark7/runevibe-portfolio/backend/internal/domain"
)

// ErrNotFound is returned when a featured project slug does not exist.
var ErrNotFound = errors.New("not found")

// PortfolioReader loads the portfolio. Implementations live in adapters.
type PortfolioReader interface {
	Profile(ctx context.Context) (domain.Profile, error)
	Projects(ctx context.Context) ([]domain.Project, error)
	ProjectBySlug(ctx context.Context, slug string) (domain.Project, error)
	Skills(ctx context.Context) ([]domain.Skill, error)
	Workflow(ctx context.Context) (domain.Workflow, error)
	Infra(ctx context.Context) ([]domain.InfraNote, error)
}

// Readiness reports whether the outbound dependency can serve reads.
type Readiness interface {
	Ready(ctx context.Context) error
}
