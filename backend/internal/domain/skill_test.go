package domain

import "testing"

func skillWith(name string, projects ...string) Skill {
	s := Skill{Name: name, Slug: name}
	for _, p := range projects {
		s.Usages = append(s.Usages, Usage{ProjectSlug: p, ProjectName: p})
	}
	return s
}

func TestProficiencyIsDerivedFromUsages(t *testing.T) {
	none := ProficiencyFor(skillWith("Arch Linux"))
	if none.ProjectCount != 0 || none.UsedOften {
		t.Fatalf("zero usages: %+v", none)
	}

	once := ProficiencyFor(skillWith("n8n", "dealradar"))
	if once.ProjectCount != 1 || once.UsedOften {
		t.Fatalf("one usage is not used often: %+v", once)
	}

	twice := ProficiencyFor(skillWith("Python", "dealradar", "paper-trading-bot"))
	if twice.ProjectCount != 2 || !twice.UsedOften {
		t.Fatalf("two usages are used often: %+v", twice)
	}
}

func TestUsedOftenRanksByCountThenName(t *testing.T) {
	skills := []Skill{
		skillWith("Helm", "a", "b"),
		skillWith("Go", "a", "b", "c"),
		skillWith("Argo CD GitOps", "a", "b", "c", "d"),
		skillWith("n8n", "a"),
		skillWith("cert-manager"),
	}
	got := UsedOften(skills)
	if len(got) != 3 {
		t.Fatalf("len = %d, want 3", len(got))
	}
	want := []string{"Argo CD GitOps", "Go", "Helm"}
	for i, name := range want {
		if got[i].Skill.Name != name {
			t.Fatalf("rank %d: got %s want %s", i, got[i].Skill.Name, name)
		}
	}
}

func TestDailyDriverHasNoProjectLink(t *testing.T) {
	skill := Skill{Name: "Arch Linux", Basis: BasisDailyDriver, Usages: []Usage{{ProjectSlug: "halmstad-homes"}}}
	if err := skill.Validate(); err != ErrDailyDriverUsage {
		t.Fatalf("got %v", err)
	}
	plain := Skill{Name: "Arch Linux", Basis: BasisDailyDriver}
	if err := plain.Validate(); err != nil {
		t.Fatal(err)
	}
	got := ProficiencyFor(plain)
	if got.UsedOften || got.ProjectCount != 0 {
		t.Fatalf("daily driver: %+v", got)
	}
}

func TestProficienciesPreserveCatalogOrder(t *testing.T) {
	skills := []Skill{
		skillWith("Go", "a"),
		skillWith("Arch Linux"),
	}
	got := Proficiencies(skills)
	if got[0].Skill.Name != "Go" || got[1].Skill.Name != "Arch Linux" {
		t.Fatalf("order changed: %+v", got)
	}
	if got[1].UsedOften {
		t.Fatal("Arch Linux has no usages and must not be used often")
	}
}
