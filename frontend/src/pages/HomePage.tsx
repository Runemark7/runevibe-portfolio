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
      <Hero profile={portfolio.profile} projects={portfolio.projects} workflow={portfolio.workflow} />
      <Section
        id="projects"
        index="01"
        kicker="Work"
        title="Projects"
      >
        <ProjectList projects={portfolio.projects} />
      </Section>
      <Section
        id="skills"
        index="02"
        kicker="Practice"
        title="What I use, weighted by the work"
        intro="Every skill is tied to the projects above that use it."
      >
        <SkillMatrix
          skills={portfolio.skills.skills}
          projects={portfolio.projects}
          usedOftenMinProjects={portfolio.skills.usedOftenMinProjects}
        />
      </Section>
      <Section id="workflows" index="03" kicker="Agents" title="AI workflows" intro={portfolio.workflow.summary}>
        <WorkflowDiagram workflow={portfolio.workflow} />
      </Section>
      <Section id="infra" index="04" kicker="Hosting" title="Infrastructure" intro="Where the projects above run.">
        <InfraList notes={portfolio.infra} />
      </Section>
    </>
  );
}
