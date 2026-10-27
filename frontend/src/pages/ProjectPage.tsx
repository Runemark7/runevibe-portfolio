import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ErrorNote, Loading, TextLink } from "../ui";
import { ProjectDetail } from "../features/portfolio/content";
import { usePortfolio } from "../features/portfolio/state";

export function ProjectPage() {
  const { slug } = useParams();
  const portfolio = usePortfolio();
  const project =
    portfolio.status === "ready" ? portfolio.projects.find((item) => item.slug === slug) : undefined;

  useEffect(() => {
    if (!project) return;
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content");
    document.title = `${project.name} — Alexander Runemark`;
    description?.setAttribute("content", project.summary);
    return () => {
      document.title = previousTitle;
      if (previousDescription) description?.setAttribute("content", previousDescription);
    };
  }, [project]);

  if (portfolio.status === "loading") {
    return <Loading label="Loading the project" />;
  }
  if (portfolio.status === "error") {
    return <ErrorNote message={portfolio.message} onRetry={portfolio.reload} />;
  }
  if (!project) {
    return (
      <section className="rv-wrap rv-missing">
        <p className="rv-missing-code">404</p>
        <h1 className="rv-missing-title">Project not found</h1>
        <p>There is no project at this address.</p>
        <p>
          <TextLink href="/#projects" arrow="left">
            All projects
          </TextLink>
        </p>
      </section>
    );
  }
  return <ProjectDetail project={project} />;
}
