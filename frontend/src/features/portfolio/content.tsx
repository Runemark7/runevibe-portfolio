import { Badge, LinkedInPlaceholder, Panel, TextLink } from "../../ui";
import type { InfraNote, Profile, Project, Skill, Workflow } from "../../api/types";

function paragraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function kindLabel(kind: Project["kind"]): string | null {
  if (kind === "flagship") return "Flagship";
  if (kind === "main") return "Main project";
  if (kind === "smaller") return "Smaller project";
  return null;
}

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section className="rv-hero" aria-labelledby="hero-title">
      <div>
        <p className="rv-kicker">Portfolio</p>
        <h1 id="hero-title" className="rv-heading rv-heading--display">
          {profile.name}
        </h1>
        <p className="rv-lede">{profile.headline}</p>
        <p className="rv-summary">{profile.summary}</p>
        <div className="rv-hero-actions">
          <TextLink href={profile.githubUrl} external>
            GitHub
          </TextLink>
          <LinkedInPlaceholder url={profile.linkedinUrl} />
        </div>
      </div>
      <svg className="rv-mark" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="12" className="rv-mark-bg" />
        <path d="M16 10v28M24 10l12 28M24 10L12 38" className="rv-mark-stroke" />
      </svg>
    </section>
  );
}

function ProjectFacts({ project }: { project: Project }) {
  const limit = project.kind === "flagship" ? project.facts.length : project.kind === "smaller" ? 1 : 3;
  const facts = project.facts.slice(0, limit);
  if (facts.length === 0) return null;
  return (
    <dl className="rv-facts">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProjectLinks({ project, showRead = false }: { project: Project; showRead?: boolean }) {
  return (
    <div className="rv-project-links">
      {project.liveUrl ? (
        <TextLink href={project.liveUrl} external>
          Live site
        </TextLink>
      ) : (
        <span className="rv-quiet">No public deployment</span>
      )}
      {project.repoUrl ? (
        <TextLink href={project.repoUrl} external>
          Repository
        </TextLink>
      ) : (
        <span className="rv-quiet">Private repository</span>
      )}
      {showRead ? <TextLink href={`/projects/${project.slug}`}>Read</TextLink> : null}
    </div>
  );
}

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="rv-projects">
      {projects.map((project) => {
        const label = kindLabel(project.kind);
        return (
          <Panel
            key={project.slug}
            label={project.name}
            className={`rv-project rv-project--${project.kind}`}
          >
            {label ? <Badge tone={project.kind === "standard" ? "neutral" : project.kind}>{label}</Badge> : null}
            <h3 className="rv-heading rv-heading--section">
              <TextLink href={`/projects/${project.slug}`}>{project.name}</TextLink>
            </h3>
            <p className="rv-project-summary">{project.summary}</p>
            <ProjectFacts project={project} />
            <ProjectLinks project={project} showRead />
            {project.credit ? (
              <p className="rv-credit">
                Built on{" "}
                <TextLink href={project.credit.url} external>
                  {project.credit.name}
                </TextLink>{" "}
                ({project.credit.license}).
              </p>
            ) : null}
          </Panel>
        );
      })}
    </div>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const label = kindLabel(project.kind);
  return (
    <article className="rv-section">
      <p className="rv-kicker">
        <TextLink href="/#projects">Projects</TextLink>
      </p>
      {label ? <Badge tone={project.kind === "standard" ? "neutral" : project.kind}>{label}</Badge> : null}
      <h1 className="rv-heading rv-heading--display">{project.name}</h1>
      <p className="rv-lede">{project.summary}</p>
      <ProjectLinks project={project} />
      {project.facts.length > 0 ? (
        <dl className="rv-facts">
          {project.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <div className="rv-prose">
        {paragraphs(project.body).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {project.credit ? (
        <p>
          Built on{" "}
          <TextLink href={project.credit.url} external>
            {project.credit.name}
          </TextLink>{" "}
          ({project.credit.license}).
        </p>
      ) : null}
    </article>
  );
}

export function SkillMatrix({
  skills,
  projects,
  usedOftenMinProjects,
}: {
  skills: Skill[];
  projects: Project[];
  usedOftenMinProjects: number;
}) {
  const often = skills
    .filter((skill) => skill.usedOften)
    .slice()
    .sort((a, b) => b.projectCount - a.projectCount || a.name.localeCompare(b.name));

  return (
    <div className="rv-skill-block">
      <h3 className="rv-heading rv-heading--section">Used often</h3>
      <p className="rv-note">
        A skill is used often when it is linked to at least {usedOftenMinProjects} featured projects.
        The number is that count. There is no score and no years.
      </p>
      <ul className="rv-often" aria-label="Used often">
        {often.map((skill) => (
          <li key={skill.slug}>
            <span className="rv-often-name">{skill.name}</span>
            <span className="rv-often-count">Used in {skill.projectCount} projects</span>
          </li>
        ))}
      </ul>
      <div className="rv-table-wrap">
        <table className="rv-matrix">
          <caption>What I know, marked by the featured projects that use each skill</caption>
          <thead>
            <tr>
              <th scope="col">Skill</th>
              {projects.map((project) => (
                <th key={project.slug} scope="col">
                  {project.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill.slug}>
                <th scope="row">
                  <span className="rv-skill-name">{skill.name}</span>
                  <span className="rv-skill-summary">{skill.summary}</span>
                </th>
                {skill.basis === "daily_driver" ? (
                  <td className="is-driver" colSpan={projects.length}>
                    Daily driver
                  </td>
                ) : (
                  projects.map((project) => {
                    const used = skill.usages.some((usage) => usage.projectSlug === project.slug);
                    return (
                      <td key={project.slug} className={used ? "is-used" : "is-unused"}>
                        <span className="rv-sr">
                          {used ? `${skill.name} is used in ${project.name}` : `${skill.name} is not linked to ${project.name}`}
                        </span>
                        <span aria-hidden="true">{used ? "Yes" : "—"}</span>
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rv-note">Each Yes is a link recorded on that project. A dash is not a link.</p>
    </div>
  );
}

export function WorkflowDiagram({ workflow }: { workflow: Workflow }) {
  return (
    <div>
      <p className="rv-intro">{workflow.summary}</p>
      <h3 className="rv-heading rv-heading--section">Fleet</h3>
      <ol className="rv-fleet" aria-label="Agent fleet">
        {workflow.agents.map((agent) => (
          <li key={agent.slug}>
            <h3>{agent.name}</h3>
            <p className="rv-owns">Owns {agent.owns}</p>
            <p>{agent.summary}</p>
          </li>
        ))}
      </ol>
      <h3 className="rv-heading rv-heading--section">Coding workflow</h3>
      <ol className="rv-flow" aria-label="Coding workflow">
        {workflow.steps.map((step, index) => (
          <li key={step.slug}>
            <span className="rv-flow-index">{index + 1}</span>
            <h3>{step.name}</h3>
            <p>{step.summary}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function InfraList({ notes }: { notes: InfraNote[] }) {
  return (
    <dl className="rv-infra">
      {notes.map((note) => (
        <div key={note.slug}>
          <dt>{note.title}</dt>
          <dd>{note.summary}</dd>
        </div>
      ))}
    </dl>
  );
}
