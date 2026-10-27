import { ErrorNote, Loading, Section } from "../ui";
import { Hero, InfraList, ProjectList, SkillMatrix, WorkflowDiagram } from "../features/portfolio/content";
import { usePortfolio } from "../features/portfolio/state";

export function HomePage() {
  const portfolio = usePortfolio();
  if (portfolio.status === "loading") {
    return <Loading label="Loading the portfolio" />;
  }
  if (portfolio.status === "error") {
    return <ErrorNote message={portfolio.message} onRetry={portfolio.reload} />;
  }
  return (
    <>
      <Hero profile={portfolio.profile} />
      <Section
        id="projects"
        kicker="Work"
        title="Projects"
        intro="Five projects, in the order they should be read. Private repositories are not linked."
      >
        <ProjectList projects={portfolio.projects} />
      </Section>
      <Section
        id="skills"
        kicker="Practice"
        title="What I use, and what I know"
        intro="Used often is derived from the projects above. Nothing here is a percentage or a count of years."
      >
        <SkillMatrix
          skills={portfolio.skills.skills}
          projects={portfolio.projects}
          usedOftenMinProjects={portfolio.skills.usedOftenMinProjects}
        />
      </Section>
      <Section id="workflows" kicker="Assistants" title="AI workflows">
        <WorkflowDiagram workflow={portfolio.workflow} />
      </Section>
      <Section
        id="infra"
        kicker="Hosting"
        title="Infrastructure"
        intro="The shape of the setup. No addresses."
      >
        <InfraList notes={portfolio.infra} />
      </Section>
    </>
  );
}
