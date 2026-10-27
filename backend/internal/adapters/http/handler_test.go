package httpadapter

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/runemark7/runevibe-portfolio/backend/internal/domain"
	"github.com/runemark7/runevibe-portfolio/backend/internal/ports"
	"github.com/runemark7/runevibe-portfolio/backend/internal/service"
)

type fakeReader struct {
	profile  domain.Profile
	projects []domain.Project
	skills   []domain.Skill
	workflow domain.Workflow
	infra    []domain.InfraNote
}

func (f fakeReader) Profile(context.Context) (domain.Profile, error) { return f.profile, nil }
func (f fakeReader) Projects(context.Context) ([]domain.Project, error) {
	return f.projects, nil
}
func (f fakeReader) ProjectBySlug(_ context.Context, slug string) (domain.Project, error) {
	for _, project := range f.projects {
		if project.Slug == slug {
			return project, nil
		}
	}
	return domain.Project{}, ports.ErrNotFound
}
func (f fakeReader) Skills(context.Context) ([]domain.Skill, error) { return f.skills, nil }
func (f fakeReader) Workflow(context.Context) (domain.Workflow, error) {
	return f.workflow, nil
}
func (f fakeReader) Infra(context.Context) ([]domain.InfraNote, error) { return f.infra, nil }

func TestListProjectsOmitsPrivateRepoAndKeepsOrder(t *testing.T) {
	repo := "https://github.com/Runemark7/swedish-democratic-tracker"
	live := "https://sdt.runevibe.se"
	h := NewHandler(service.NewPortfolio(fakeReader{
		projects: []domain.Project{
			{
				Slug: "dealradar", Name: "DealRadar", Summary: "private", Body: "b",
				Kind: domain.KindMain, Visibility: domain.VisibilityPrivate, SortOrder: 2,
			},
			{
				Slug: "riksdagskollen", Name: "Riksdagskollen", Summary: "flagship", Body: "b",
				Kind: domain.KindFlagship, Visibility: domain.VisibilityPublic, SortOrder: 1,
				LiveURL: &live, RepoURL: &repo,
				Facts: []domain.Fact{{Label: "Individual member votes", Value: "3,957,311 as of 2026-10-24 (about 4 million)"}},
			},
		},
	}), readyOK{})

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/projects", nil)
	router(h).ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d body %s", rec.Code, rec.Body.String())
	}

	var body struct {
		Projects []struct {
			Slug    string  `json:"slug"`
			RepoURL *string `json:"repoUrl"`
			LiveURL *string `json:"liveUrl"`
			Facts   []struct {
				Value string `json:"value"`
			} `json:"facts"`
		} `json:"projects"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.Projects[0].Slug != "riksdagskollen" || body.Projects[1].Slug != "dealradar" {
		t.Fatalf("order: %+v", body.Projects)
	}
	if body.Projects[1].RepoURL != nil || body.Projects[1].LiveURL != nil {
		t.Fatalf("private project leaked a link: %+v", body.Projects[1])
	}
	if body.Projects[0].Facts[0].Value == "" {
		t.Fatal("missing vote fact")
	}
}

func TestGetProjectNotFound(t *testing.T) {
	h := NewHandler(service.NewPortfolio(fakeReader{}), readyOK{})
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/projects/nope", nil)
	router(h).ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("status %d", rec.Code)
	}
}

func TestSkillsExposeDerivedProficiency(t *testing.T) {
	h := NewHandler(service.NewPortfolio(fakeReader{
		skills: []domain.Skill{
			{Slug: "go", Name: "Go", Basis: domain.BasisProjects, SortOrder: 1, Usages: []domain.Usage{
				{ProjectSlug: "riksdagskollen", ProjectName: "Riksdagskollen"},
				{ProjectSlug: "warehouse", ProjectName: "Warehouse"},
			}},
			{Slug: "arch", Name: "Arch Linux", Basis: domain.BasisDailyDriver, SortOrder: 2},
		},
	}), readyOK{})
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills", nil)
	router(h).ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d %s", rec.Code, rec.Body.String())
	}
	var body struct {
		UsedOftenMinProjects int `json:"usedOftenMinProjects"`
		Skills               []struct {
			Slug         string `json:"slug"`
			ProjectCount int    `json:"projectCount"`
			UsedOften    bool   `json:"usedOften"`
		} `json:"skills"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.UsedOftenMinProjects != domain.UsedOftenMinProjects {
		t.Fatalf("threshold %d", body.UsedOftenMinProjects)
	}
	if !body.Skills[0].UsedOften || body.Skills[0].ProjectCount != 2 {
		t.Fatalf("go: %+v", body.Skills[0])
	}
	if body.Skills[1].UsedOften || body.Skills[1].ProjectCount != 0 {
		t.Fatalf("arch: %+v", body.Skills[1])
	}
}

func TestReadyz(t *testing.T) {
	h := NewHandler(service.NewPortfolio(fakeReader{}), readyFail{})
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/readyz", nil)
	router(h).ServeHTTP(rec, req)
	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("status %d", rec.Code)
	}

	ok := NewHandler(service.NewPortfolio(fakeReader{}), readyOK{})
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/healthz", nil)
	router(ok).ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("health %d", rec.Code)
	}
}

func TestProfileKeepsLinkedInNull(t *testing.T) {
	h := NewHandler(service.NewPortfolio(fakeReader{
		profile: domain.Profile{
			Name: "Alexander Runemark", Headline: "h", Summary: "s",
			GithubURL: "https://github.com/Runemark7",
		},
	}), readyOK{})
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/profile", nil)
	router(h).ServeHTTP(rec, req)
	var body struct {
		GithubURL   string  `json:"githubUrl"`
		LinkedInURL *string `json:"linkedinUrl"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.GithubURL != "https://github.com/Runemark7" || body.LinkedInURL != nil {
		t.Fatalf("%+v", body)
	}
}

type readyOK struct{}

func (readyOK) Ready(context.Context) error { return nil }

type readyFail struct{}

func (readyFail) Ready(context.Context) error { return errors.New("down") }

func router(h *Handler) http.Handler {
	r := chi.NewRouter()
	h.Mount(r)
	return r
}
