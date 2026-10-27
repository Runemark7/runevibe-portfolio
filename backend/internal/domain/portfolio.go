package domain

// Profile is the public introduction. LinkedInURL is nil until a real URL
// is supplied. Callers must not invent one.
type Profile struct {
	Name        string
	Headline    string
	Summary     string
	GithubURL   string
	LinkedInURL *string
}

// Agent is one specialised assistant in the fleet. It owns a single project
// or a single job.
type Agent struct {
	Slug      string
	Name      string
	Owns      string
	Summary   string
	SortOrder int
}

// WorkflowStep is one stage of the coding workflow, in SortOrder.
type WorkflowStep struct {
	Slug      string
	Name      string
	Summary   string
	SortOrder int
}

// Workflow is the agent fleet plus the ordered coding steps.
type Workflow struct {
	Summary string
	Agents  []Agent
	Steps   []WorkflowStep
}

// InfraNote is one public, high-level fact about how the work is hosted.
type InfraNote struct {
	Slug      string
	Title     string
	Summary   string
	SortOrder int
}
