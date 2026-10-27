package domain

import (
	"errors"
	"sort"
)

var (
	ErrMissingSlug       = errors.New("slug is required")
	ErrMissingName       = errors.New("name is required")
	ErrInvalidKind       = errors.New("invalid project kind")
	ErrInvalidVisibility = errors.New("invalid visibility")
	ErrSortOrder         = errors.New("sort order must be positive")
	ErrPrivateRepo       = errors.New("a private project cannot carry a public repository URL")
)

type Kind string

const (
	KindFlagship Kind = "flagship"
	KindMain     Kind = "main"
	KindStandard Kind = "standard"
	KindSmaller  Kind = "smaller"
)

type Visibility string

const (
	VisibilityPublic  Visibility = "public"
	VisibilityPrivate Visibility = "private"
)

type Fact struct {
	Label string
	Value string
}

type Credit struct {
	Name    string
	URL     string
	License string
}

// Project is one featured piece of work. RepoURL is set only when a public
// repository exists. A private project must not carry one.
type Project struct {
	Slug       string
	Name       string
	Summary    string
	Body       string
	Kind       Kind
	Visibility Visibility
	SortOrder  int
	LiveURL    *string
	RepoURL    *string
	Credit     *Credit
	Facts      []Fact
}

func (p Project) Validate() error {
	if p.Slug == "" {
		return ErrMissingSlug
	}
	if p.Name == "" {
		return ErrMissingName
	}
	switch p.Kind {
	case KindFlagship, KindMain, KindStandard, KindSmaller:
	default:
		return ErrInvalidKind
	}
	switch p.Visibility {
	case VisibilityPublic, VisibilityPrivate:
	default:
		return ErrInvalidVisibility
	}
	if p.SortOrder < 1 {
		return ErrSortOrder
	}
	if p.Visibility == VisibilityPrivate && p.RepoURL != nil {
		return ErrPrivateRepo
	}
	return nil
}

// SortProjects returns a copy ordered by SortOrder ascending.
func SortProjects(projects []Project) []Project {
	out := append([]Project(nil), projects...)
	sort.Slice(out, func(i, j int) bool {
		return out[i].SortOrder < out[j].SortOrder
	})
	return out
}
