import { useState, type CSSProperties } from "react";
import {
  Badge,
  ButtonLink,
  Frame,
  LinkedInPlaceholder,
  Sheet,
  TextLink,
  Toggle,
} from "../../ui";
import type { InfraNote, Profile, Project, Skill, Workflow } from "../../api/types";
import { DealRadarSchematic, FleetDiagram, WorkflowRail } from "./diagrams";
import { frameLabel, hostOf, mediaFor } from "./media";

function paragraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function kindLabel(kind: Project["kind"]): string | null {
  if (kind === "flagship") return "Flagship";
  if (kind === "main") return "Main project";
  if (kind === "smaller") return "Smaller project";
  return null;
}

function KindBadge({ project }: { project: Project }) {
  const label = kindLabel(project.kind);
  if (!label) return null;
  return <Badge tone={project.kind === "standard" ? "neutral" : project.kind}>{label}</Badge>;
}

export function Hero({
  profile,
  projects = [],
  workflow,
}: {
  profile: Profile;
  projects?: Project[];
  workflow?: Workflow;
}) {
  const live = projects.filter((project) => project.liveUrl);
  const glance = [
    { label: "Featured projects", value: projects.length },
    { label: "Public deployments", value: live.length },
    ...(workflow
      ? [
          { label: "Agents in the fleet", value: workflow.agents.length },
          { label: "Workflow steps", value: workflow.steps.length },
        ]
      : []),
  ];
  const words = profile.name.split(/\s+/).filter(Boolean);

  return (
    <section className="rv-hero" aria-labelledby="hero-title">
      <div className="rv-wrap rv-hero-grid">
        <h1 id="hero-title" className="rv-hero-name">
          {words.map((word, index) => (
            <span key={`${word}-${index}`} className="rv-hero-word">
              {word}
              {index < words.length - 1 ? " " : null}
            </span>
          ))}
        </h1>
        <div className="rv-hero-copy">
          <p className="rv-hero-lede">{profile.headline}</p>
          <p className="rv-hero-summary">{profile.summary}</p>
          <div className="rv-hero-actions">
            <ButtonLink href="#projects" arrow="down">
              See the work
            </ButtonLink>
            <ButtonLink href={profile.githubUrl} variant="secondary" arrow="out" external>
              GitHub
            </ButtonLink>
            <LinkedInPlaceholder url={profile.linkedinUrl} />
          </div>
        </div>
        {projects.length > 0 ? (
          <aside className="rv-glance" aria-label="At a glance">
            <dl className="rv-glance-list">
              {glance.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{pad(item.value)}</dd>
                </div>
              ))}
            </dl>
            {live.length > 0 ? (
              <ul className="rv-glance-live" aria-label="Live sites">
                {live.map((project) => (
                  <li key={project.slug}>
                    <TextLink href={project.liveUrl as string} external arrow="out">
                      {hostOf(project.liveUrl as string)}
                    </TextLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </aside>
        ) : null}
      </div>
    </section>
  );
}

const LEADING_NUMBER = /^(\d{1,3}(?:,\d{3})+|\d{3,})(?=\s|$)\s*(.*)$/;

function FactValue({ value }: { value: string }) {
  const match = LEADING_NUMBER.exec(value);
  if (!match) return <span className="rv-fact-text">{value}</span>;
  return (
    <>
      <span className="rv-fact-num">{match[1]}</span>
      {match[2] ? (
        <>
          {" "}
          <span className="rv-fact-rest">{match[2]}</span>
        </>
      ) : null}
    </>
  );
}

function Facts({ facts, className }: { facts: Project["facts"]; className?: string }) {
  if (facts.length === 0) return null;
  return (
    <dl className={className ? `rv-facts ${className}` : "rv-facts"}>
      {facts.map((fact) => (
        <div key={fact.label} className="rv-fact">
          <dt>{fact.label}</dt>
          <dd>
            <FactValue value={fact.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Credit({ project }: { project: Project }) {
  if (!project.credit) return null;
  return (
    <p className="rv-credit">
      Built on{" "}
      <TextLink href={project.credit.url} external>
        {project.credit.name}
      </TextLink>{" "}
      ({project.credit.license}).
    </p>
  );
}

export function ProjectLinks({ project, showRead = false }: { project: Project; showRead?: boolean }) {
  return (
    <ul className="rv-project-links">
      <li>
        {project.liveUrl ? (
          <TextLink href={project.liveUrl} external arrow="out">
            Live site
          </TextLink>
        ) : (
          <span className="rv-quiet">No public deployment</span>
        )}
      </li>
      <li>
        {project.repoUrl ? (
          <TextLink href={project.repoUrl} external arrow="out">
            Repository
          </TextLink>
        ) : (
          <span className="rv-quiet">Private repository</span>
        )}
      </li>
      {showRead ? (
        <li>
          <TextLink href={`/projects/${project.slug}`} arrow="right">
            Details
          </TextLink>
        </li>
      ) : null}
    </ul>
  );
}

type Variant = "feature" | "split" | "compact";

function ProjectMedia({
  project,
  variant,
  priority = false,
}: {
  project: Project;
  variant: Variant | "detail";
  priority?: boolean;
}) {
  const media = mediaFor(project.slug);
  if (!media) return null;
  if (media.kind === "schematic") {
    return (
      <Sheet
        label={`${project.slug} / pipeline`}
        caption={`Schematic of the pipeline. ${project.name} is private and has no public deployment.`}
      >
        <DealRadarSchematic />
      </Sheet>
    );
  }
  const primarySizes =
    variant === "feature" || variant === "detail"
      ? "(min-width: 88rem) 80rem, 94vw"
      : variant === "split"
        ? "(min-width: 760px) 56vw, 94vw"
        : "(min-width: 760px) 44vw, 94vw";
  return (
    <div className={`rv-shots rv-shots--${variant}`}>
      <Frame
        image={media.primary}
        label={frameLabel(project.liveUrl, media.primary.path)}
        sizes={primarySizes}
        priority={priority}
        className="rv-shot-primary"
      />
      {media.secondary && (variant === "feature" || variant === "detail") ? (
        <Frame
          image={media.secondary}
          label={frameLabel(project.liveUrl, media.secondary.path)}
          sizes="(min-width: 760px) 44vw, 70vw"
          className="rv-shot-secondary"
        />
      ) : null}
    </div>
  );
}

function EntryMeta({ project, index, total }: { project: Project; index: number; total: number }) {
  return (
    <p className="rv-entry-meta">
      <span className="rv-entry-num">
        {pad(index + 1)} <span aria-hidden="true">/</span>
        <span className="rv-sr"> of </span> {pad(total)}
      </span>
      <KindBadge project={project} />
      <span className="rv-entry-host">{project.liveUrl ? hostOf(project.liveUrl) : "private"}</span>
    </p>
  );
}

function factLimit(variant: Variant, project: Project): number {
  if (variant === "feature") return project.facts.length;
  if (variant === "compact") return 0;
  return 3;
}

function Entry({
  project,
  index,
  total,
  variant,
  flipped,
}: {
  project: Project;
  index: number;
  total: number;
  variant: Variant;
  flipped: boolean;
}) {
  const titleId = `project-${project.slug}-title`;
  const facts = project.facts.slice(0, factLimit(variant, project));
  const classes = ["rv-entry", `rv-entry--${variant}`, flipped ? "is-flipped" : null].filter(Boolean).join(" ");

  if (variant === "feature") {
    return (
      <article className={classes} aria-labelledby={titleId}>
        <EntryMeta project={project} index={index} total={total} />
        <div className="rv-entry-head">
          <h3 id={titleId} className="rv-entry-title">
            <TextLink href={`/projects/${project.slug}`}>{project.name}</TextLink>
          </h3>
          <div className="rv-entry-aside">
            <p className="rv-entry-summary">{project.summary}</p>
            <ProjectLinks project={project} showRead />
          </div>
        </div>
        <div className="rv-entry-media">
          <ProjectMedia project={project} variant="feature" priority />
        </div>
        <Facts facts={facts} className="rv-facts--band" />
        <Credit project={project} />
      </article>
    );
  }

  return (
    <article className={classes} aria-labelledby={titleId}>
      <div className="rv-entry-text">
        <EntryMeta project={project} index={index} total={total} />
        <h3 id={titleId} className="rv-entry-title">
          <TextLink href={`/projects/${project.slug}`}>{project.name}</TextLink>
        </h3>
        <p className="rv-entry-summary">{project.summary}</p>
        <Facts facts={facts} />
        <ProjectLinks project={project} showRead />
        <Credit project={project} />
      </div>
      <div className="rv-entry-media">
        <ProjectMedia project={project} variant={variant} />
      </div>
    </article>
  );
}

export function ProjectList({ projects }: { projects: Project[] }) {
  let splitCount = 0;
  return (
    <div className="rv-projects">
      {projects.map((project, index) => {
        const variant: Variant =
          project.kind === "flagship" ? "feature" : project.kind === "smaller" ? "compact" : "split";
        const flipped = variant === "split" && splitCount++ % 2 === 1;
        return (
          <Entry
            key={project.slug}
            project={project}
            index={index}
            total={projects.length}
            variant={variant}
            flipped={flipped}
          />
        );
      })}
    </div>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const titleId = `detail-${project.slug}-title`;
  return (
    <article className="rv-detail" aria-labelledby={titleId}>
      <div className="rv-wrap rv-detail-head">
        <p className="rv-detail-back">
          <TextLink href="/#projects" arrow="left">
            All projects
          </TextLink>
        </p>
        <p className="rv-entry-meta">
          <KindBadge project={project} />
          <span className="rv-entry-host">{project.liveUrl ? hostOf(project.liveUrl) : "private"}</span>
        </p>
        <h1 id={titleId} className="rv-detail-title">
          {project.name}
        </h1>
        <div className="rv-detail-intro">
          <p className="rv-detail-lede">{project.summary}</p>
          <ProjectLinks project={project} />
        </div>
      </div>
      <div className="rv-wrap rv-detail-media">
        <ProjectMedia project={project} variant="detail" priority />
      </div>
      <div className="rv-wrap rv-detail-body">
        <Facts facts={project.facts} className="rv-facts--side" />
        <div className="rv-prose">
          {paragraphs(project.body).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <Credit project={project} />
        </div>
      </div>
    </article>
  );
}

const GROUPS: { key: string; label: string }[] = [
  { key: "language", label: "Languages" },
  { key: "frontend", label: "Frontend" },
  { key: "architecture", label: "Architecture" },
  { key: "data", label: "Data" },
  { key: "ai", label: "AI and automation" },
  { key: "infra", label: "Infrastructure and delivery" },
  { key: "desktop", label: "Desktop" },
];

function groupSkills(skills: Skill[]): { key: string; label: string; skills: Skill[] }[] {
  const known = new Set(GROUPS.map((group) => group.key));
  const byCount = (a: Skill, b: Skill) => b.projectCount - a.projectCount || a.sortOrder - b.sortOrder;
  const groups = GROUPS.map((group) => ({
    ...group,
    skills: skills.filter((skill) => skill.category === group.key).sort(byCount),
  }));
  const other = skills.filter((skill) => !known.has(skill.category)).sort(byCount);
  if (other.length > 0) groups.push({ key: "other", label: "Other", skills: other });
  return groups.filter((group) => group.skills.length > 0);
}

function weightStyle(count: number, total: number): CSSProperties {
  return { ["--rv-weight" as string]: total > 0 ? Math.min(count / total, 1).toFixed(2) : "0" };
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
  const [focus, setFocus] = useState<string | null>(null);
  const total = projects.length;
  const uses = (skill: Skill, slug: string) => skill.usages.some((usage) => usage.projectSlug === slug);
  const dimmed = (skill: Skill) => focus !== null && !uses(skill, focus);
  const often = skills
    .filter((skill) => skill.usedOften)
    .slice()
    .sort((a, b) => b.projectCount - a.projectCount || a.name.localeCompare(b.name));
  const groups = groupSkills(skills);

  return (
    <div className={focus ? "rv-skills has-focus" : "rv-skills"}>
      <div className="rv-often-block">
        <div className="rv-often-label">
          <h3 className="rv-subhead">Used often</h3>
          <p className="rv-note">
            Used in at least {usedOftenMinProjects} of the {total} projects. Larger type means more projects.
          </p>
        </div>
        <ul className="rv-often" aria-label="Used often">
          {often.map((skill) => (
            <li
              key={skill.slug}
              className={dimmed(skill) ? "rv-chip is-dim" : "rv-chip"}
              style={weightStyle(skill.projectCount, total)}
            >
              <span className="rv-chip-name">{skill.name}</span>
              <span className="rv-chip-count" aria-hidden="true">
                {skill.projectCount}
              </span>
              <span className="rv-sr">Used in {skill.projectCount} projects</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rv-heat">
        <div className="rv-heat-legend">
          <h3 className="rv-subhead">By area</h3>
          <p className="rv-note" id="rv-heat-hint">
            Each square is one project. Pick a project to see what it uses.
          </p>
          <ul className="rv-heat-projects" aria-describedby="rv-heat-hint">
            {projects.map((project, index) => (
              <li key={project.slug}>
                <Toggle
                  pressed={focus === project.slug}
                  onClick={() => setFocus((current) => (current === project.slug ? null : project.slug))}
                >
                  <span className="rv-toggle-num" aria-hidden="true">
                    {pad(index + 1)}
                  </span>
                  <span>{project.name}</span>
                </Toggle>
              </li>
            ))}
          </ul>
        </div>
        <div className="rv-heat-groups">
          {groups.map((group) => (
            <section key={group.key} className="rv-heat-group" aria-labelledby={`skills-${group.key}`}>
              <div className="rv-heat-head">
                <h4 id={`skills-${group.key}`} className="rv-heat-title">
                  {group.label}
                </h4>
                <span className="rv-heat-cols" aria-hidden="true">
                  {projects.map((project, index) => (
                    <span key={project.slug} className={focus === project.slug ? "is-focus" : undefined}>
                      {pad(index + 1)}
                    </span>
                  ))}
                </span>
              </div>
              <ul className="rv-heat-rows">
                {group.skills.map((skill) => {
                  const driver = skill.basis === "daily_driver";
                  const usedIn = projects.filter((project) => uses(skill, project.slug)).map((project) => project.name);
                  return (
                    <li
                      key={skill.slug}
                      className={dimmed(skill) ? "rv-heat-row is-dim" : "rv-heat-row"}
                      style={weightStyle(skill.projectCount, total)}
                    >
                      <span className="rv-heat-name">{skill.name}</span>
                      {driver ? (
                        <span className="rv-heat-driver">Daily driver</span>
                      ) : (
                        <>
                          <span className="rv-heat-cells" aria-hidden="true">
                            {projects.map((project) => {
                              const on = uses(skill, project.slug);
                              const cls = [on ? "is-on" : null, focus === project.slug ? "is-focus" : null]
                                .filter(Boolean)
                                .join(" ");
                              return <span key={project.slug} className={cls || undefined} />;
                            })}
                          </span>
                          <span className="rv-sr">
                            {usedIn.length > 0
                              ? `Used in ${usedIn.length} of ${total} projects: ${usedIn.join(", ")}.`
                              : "Not linked to a featured project."}
                          </span>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WorkflowDiagram({ workflow }: { workflow: Workflow }) {
  return (
    <div className="rv-agents">
      <div className="rv-agents-block">
        <h3 className="rv-subhead">Fleet</h3>
        <FleetDiagram agents={workflow.agents} />
      </div>
      <div className="rv-agents-block">
        <h3 className="rv-subhead">Coding workflow</h3>
        <WorkflowRail steps={workflow.steps} />
      </div>
    </div>
  );
}

export function InfraList({ notes }: { notes: InfraNote[] }) {
  return (
    <dl className="rv-spec">
      {notes.map((note, index) => (
        <div key={note.slug} className="rv-spec-row">
          <dt>
            <span className="rv-spec-num" aria-hidden="true">
              {pad(index + 1)}
            </span>
            {note.title}
          </dt>
          <dd>{note.summary}</dd>
        </div>
      ))}
    </dl>
  );
}
