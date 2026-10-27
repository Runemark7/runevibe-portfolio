package service

import (
	"context"
	"testing"

	"github.com/runemark7/runevibe-portfolio/backend/internal/domain"
	"github.com/runemark7/runevibe-portfolio/backend/internal/ports"
)

type fakeReader struct {
	projects []domain.Project
	skills   []domain.Skill
	err      error
}

func (f fakeReader) Profile(context.Context) (domain.Profile, error) {
	return domain.Profile{}, f.err
}
func (f fakeReader) Projects(context.Context) ([]domain.Project, error) {
	return f.projects, f.err
}
func (f fakeReader) ProjectBySlug(context.Context, string) (domain.Project, error) {
	if len(f.projects) == 0 {
		return domain.Project{}, ports.ErrNotFound
	}
	return f.projects[0], f.err
}
func (f fakeReader) Skills(context.Context) ([]domain.Skill, error) {
	return f.skills, f.err
}
func (f fakeReader) Workflow(context.Context) (domain.Workflow, error) {
	return domain.Workflow{}, f.err
}
func (f fakeReader) Infra(context.Context) ([]domain.InfraNote, error) {
	return nil, f.err
}

func TestProjectsRejectPrivateRepoLink(t *testing.T) {
	repo := "https://github.com/example/private"
	svc := NewPortfolio(fakeReader{projects: []domain.Project{{
		Slug: "dealradar", Name: "DealRadar", Kind: domain.KindMain,
		Visibility: domain.VisibilityPrivate, SortOrder: 2, RepoURL: &repo,
	}}})
	if _, err := svc.Projects(context.Background()); err != domain.ErrPrivateRepo {
		t.Fatalf("got %v", err)
	}
}

func TestProjectsSortAndSkillsDeriveUsedOften(t *testing.T) {
	svc := NewPortfolio(fakeReader{
		projects: []domain.Project{
			{Slug: "b", Name: "B", Kind: domain.KindStandard, Visibility: domain.VisibilityPublic, SortOrder: 2},
			{Slug: "a", Name: "A", Kind: domain.KindFlagship, Visibility: domain.VisibilityPublic, SortOrder: 1},
		},
		skills: []domain.Skill{{
			Name:   "Go",
			Basis:  domain.BasisProjects,
			Usages: []domain.Usage{{ProjectSlug: "a"}, {ProjectSlug: "b"}},
		}},
	})
	projects, err := svc.Projects(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if projects[0].Slug != "a" || projects[1].Slug != "b" {
		t.Fatalf("order: %+v", projects)
	}
	skills, err := svc.Skills(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if !skills[0].UsedOften || skills[0].ProjectCount != 2 {
		t.Fatalf("proficiency: %+v", skills[0])
	}
}

func TestProjectNotFound(t *testing.T) {
	svc := NewPortfolio(fakeReader{})
	_, err := svc.Project(context.Background(), "missing")
	if err != ports.ErrNotFound {
		t.Fatalf("got %v", err)
	}
}
