package httpadapter

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/runemark7/runevibe-portfolio/backend/internal/adapters/http/openapi"
	"github.com/runemark7/runevibe-portfolio/backend/internal/domain"
	"github.com/runemark7/runevibe-portfolio/backend/internal/ports"
	"github.com/runemark7/runevibe-portfolio/backend/internal/service"
)

// Handler is the inbound HTTP adapter. It implements the generated server
// interface and maps domain values onto the OpenAPI models.
type Handler struct {
	portfolio *service.Portfolio
	ready     ports.Readiness
}

func NewHandler(portfolio *service.Portfolio, ready ports.Readiness) *Handler {
	return &Handler{portfolio: portfolio, ready: ready}
}

func (h *Handler) Mount(r chi.Router) {
	openapi.HandlerFromMux(h, r)
}

func (h *Handler) GetHealthz(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, openapi.Health{Status: openapi.Ok}, false)
}

func (h *Handler) GetReadyz(w http.ResponseWriter, r *http.Request) {
	if err := h.ready.Ready(r.Context()); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, openapi.Health{Status: openapi.Unavailable}, false)
		return
	}
	writeJSON(w, http.StatusOK, openapi.Health{Status: openapi.Ok}, false)
}

func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	profile, err := h.portfolio.Profile(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, openapi.Profile{
		Name:        profile.Name,
		Headline:    profile.Headline,
		Summary:     profile.Summary,
		GithubUrl:   profile.GithubURL,
		LinkedinUrl: profile.LinkedInURL,
	}, true)
}

func (h *Handler) ListProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := h.portfolio.Projects(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	out := make([]openapi.Project, 0, len(projects))
	for _, project := range projects {
		out = append(out, toProject(project))
	}
	writeJSON(w, http.StatusOK, openapi.ProjectList{Projects: out}, true)
}

func (h *Handler) GetProject(w http.ResponseWriter, r *http.Request, slug string) {
	project, err := h.portfolio.Project(r.Context(), slug)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, toProject(project), true)
}

func (h *Handler) ListSkills(w http.ResponseWriter, r *http.Request) {
	proficiencies, err := h.portfolio.Skills(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	out := make([]openapi.Skill, 0, len(proficiencies))
	for _, proficiency := range proficiencies {
		usages := make([]openapi.Usage, 0, len(proficiency.Skill.Usages))
		for _, usage := range proficiency.Skill.Usages {
			usages = append(usages, openapi.Usage{
				ProjectSlug: usage.ProjectSlug,
				ProjectName: usage.ProjectName,
			})
		}
		out = append(out, openapi.Skill{
			Slug:         proficiency.Skill.Slug,
			Name:         proficiency.Skill.Name,
			Summary:      proficiency.Skill.Summary,
			Category:     proficiency.Skill.Category,
			SortOrder:    proficiency.Skill.SortOrder,
			Usages:       usages,
			ProjectCount: proficiency.ProjectCount,
			UsedOften:    proficiency.UsedOften,
		})
	}
	writeJSON(w, http.StatusOK, openapi.SkillList{
		Skills:               out,
		UsedOftenMinProjects: domain.UsedOftenMinProjects,
	}, true)
}

func (h *Handler) GetWorkflow(w http.ResponseWriter, r *http.Request) {
	workflow, err := h.portfolio.Workflow(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	agents := make([]openapi.Agent, 0, len(workflow.Agents))
	for _, agent := range workflow.Agents {
		agents = append(agents, openapi.Agent{
			Slug:      agent.Slug,
			Name:      agent.Name,
			Owns:      agent.Owns,
			Summary:   agent.Summary,
			SortOrder: agent.SortOrder,
		})
	}
	steps := make([]openapi.WorkflowStep, 0, len(workflow.Steps))
	for _, step := range workflow.Steps {
		steps = append(steps, openapi.WorkflowStep{
			Slug:      step.Slug,
			Name:      step.Name,
			Summary:   step.Summary,
			SortOrder: step.SortOrder,
		})
	}
	writeJSON(w, http.StatusOK, openapi.Workflow{
		Summary: workflow.Summary,
		Agents:  agents,
		Steps:   steps,
	}, true)
}

func (h *Handler) ListInfra(w http.ResponseWriter, r *http.Request) {
	notes, err := h.portfolio.Infra(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	out := make([]openapi.InfraNote, 0, len(notes))
	for _, note := range notes {
		out = append(out, openapi.InfraNote{
			Slug:      note.Slug,
			Title:     note.Title,
			Summary:   note.Summary,
			SortOrder: note.SortOrder,
		})
	}
	writeJSON(w, http.StatusOK, openapi.InfraList{Notes: out}, true)
}

func toProject(project domain.Project) openapi.Project {
	facts := make([]openapi.Fact, 0, len(project.Facts))
	for _, fact := range project.Facts {
		facts = append(facts, openapi.Fact{Label: fact.Label, Value: fact.Value})
	}
	var credit *openapi.Credit
	if project.Credit != nil {
		credit = &openapi.Credit{
			Name:    project.Credit.Name,
			Url:     project.Credit.URL,
			License: project.Credit.License,
		}
	}
	return openapi.Project{
		Slug:       project.Slug,
		Name:       project.Name,
		Summary:    project.Summary,
		Body:       project.Body,
		Kind:       openapi.ProjectKind(project.Kind),
		Visibility: openapi.ProjectVisibility(project.Visibility),
		SortOrder:  project.SortOrder,
		LiveUrl:    project.LiveURL,
		RepoUrl:    project.RepoURL,
		Credit:     credit,
		Facts:      facts,
	}
}

func writeError(w http.ResponseWriter, err error) {
	if errors.Is(err, ports.ErrNotFound) {
		writeJSON(w, http.StatusNotFound, openapi.Error{Error: "not found"}, false)
		return
	}
	writeJSON(w, http.StatusInternalServerError, openapi.Error{Error: "internal error"}, false)
}

func writeJSON(w http.ResponseWriter, status int, body any, cache bool) {
	w.Header().Set("Content-Type", "application/json")
	if cache {
		w.Header().Set("Cache-Control", "public, max-age=60")
	} else {
		w.Header().Set("Cache-Control", "no-store")
	}
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
