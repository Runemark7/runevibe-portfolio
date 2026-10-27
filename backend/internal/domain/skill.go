package domain

import (
	"errors"
	"sort"
)

// UsedOftenMinProjects is the number of featured projects at or above which
// a skill counts as used often. The count is the number of Usages. It is not
// a percentage, a score, or years of experience.
const UsedOftenMinProjects = 2

type Basis string

const (
	BasisProjects    Basis = "projects"
	BasisDailyDriver Basis = "daily_driver"
)

var (
	ErrInvalidBasis     = errors.New("invalid skill basis")
	ErrDailyDriverUsage = errors.New("a daily driver skill cannot be linked to a featured project")
)

type Usage struct {
	ProjectSlug string
	ProjectName string
}

type Skill struct {
	Slug      string
	Name      string
	Summary   string
	Category  string
	Basis     Basis
	SortOrder int
	Usages    []Usage
}

func (s Skill) Validate() error {
	switch s.Basis {
	case BasisProjects, BasisDailyDriver:
	default:
		return ErrInvalidBasis
	}
	if s.Basis == BasisDailyDriver && len(s.Usages) > 0 {
		return ErrDailyDriverUsage
	}
	return nil
}

// Proficiency is a Skill plus the standing derived from its Usages.
type Proficiency struct {
	Skill        Skill
	ProjectCount int
	UsedOften    bool
}

func ProficiencyFor(skill Skill) Proficiency {
	n := len(skill.Usages)
	return Proficiency{
		Skill:        skill,
		ProjectCount: n,
		UsedOften:    n >= UsedOftenMinProjects,
	}
}

func Proficiencies(skills []Skill) []Proficiency {
	out := make([]Proficiency, len(skills))
	for i, skill := range skills {
		out[i] = ProficiencyFor(skill)
	}
	return out
}

// UsedOften returns proficiencies that clear the threshold, highest count
// first, then name.
func UsedOften(skills []Skill) []Proficiency {
	var out []Proficiency
	for _, skill := range skills {
		p := ProficiencyFor(skill)
		if p.UsedOften {
			out = append(out, p)
		}
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].ProjectCount != out[j].ProjectCount {
			return out[i].ProjectCount > out[j].ProjectCount
		}
		return out[i].Skill.Name < out[j].Skill.Name
	})
	return out
}
