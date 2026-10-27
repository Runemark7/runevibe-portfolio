package domain

import "testing"

func TestProjectValidate(t *testing.T) {
	repo := "https://github.com/Runemark7/swedish-democratic-tracker"
	ok := Project{
		Slug:       "riksdagskollen",
		Name:       "Riksdagskollen",
		Kind:       KindFlagship,
		Visibility: VisibilityPublic,
		SortOrder:  1,
		RepoURL:    &repo,
	}
	if err := ok.Validate(); err != nil {
		t.Fatalf("valid public project: %v", err)
	}

	private := ok
	private.Visibility = VisibilityPrivate
	private.RepoURL = &repo
	if err := private.Validate(); err != ErrPrivateRepo {
		t.Fatalf("private project with a repo URL: got %v", err)
	}

	private.RepoURL = nil
	if err := private.Validate(); err != nil {
		t.Fatalf("private project without a repo URL: %v", err)
	}

	missing := ok
	missing.Slug = ""
	if err := missing.Validate(); err != ErrMissingSlug {
		t.Fatalf("missing slug: got %v", err)
	}

	badKind := ok
	badKind.Kind = "side-project"
	if err := badKind.Validate(); err != ErrInvalidKind {
		t.Fatalf("bad kind: got %v", err)
	}
}

func TestSortProjects(t *testing.T) {
	got := SortProjects([]Project{
		{Slug: "b", SortOrder: 2},
		{Slug: "a", SortOrder: 1},
		{Slug: "c", SortOrder: 3},
	})
	want := []string{"a", "b", "c"}
	for i, slug := range want {
		if got[i].Slug != slug {
			t.Fatalf("position %d: got %s want %s", i, got[i].Slug, slug)
		}
	}
	if got[0].Slug == "b" {
		t.Fatal("SortProjects mutated the input order into the result unexpectedly")
	}
}
