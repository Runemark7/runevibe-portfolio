import { act, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { Project, Skill, Workflow } from "../../api/types";
import { Hero, ProjectList, SkillMatrix } from "./content";

const projects: Project[] = [
  {
    slug: "riksdagskollen",
    name: "Riksdagskollen",
    summary: "Civic transparency site",
    body: "One.\n\nTwo.",
    kind: "flagship",
    visibility: "public",
    sortOrder: 1,
    liveUrl: "https://sdt.runevibe.se",
    repoUrl: "https://github.com/Runemark7/swedish-democratic-tracker",
    credit: null,
    facts: [{ label: "Individual member votes", value: "3,957,311 as of 2026-10-24 (about 4 million)" }],
  },
  {
    slug: "dealradar",
    name: "DealRadar",
    summary: "Private deal finder",
    body: "Body",
    kind: "main",
    visibility: "private",
    sortOrder: 2,
    liveUrl: null,
    repoUrl: null,
    facts: [],
  },
];

const skills: Skill[] = [
  {
    slug: "go",
    name: "Go",
    summary: "Backend language.",
    category: "language",
    basis: "projects",
    sortOrder: 1,
    projectCount: 2,
    usedOften: true,
    usages: [
      { projectSlug: "riksdagskollen", projectName: "Riksdagskollen" },
      { projectSlug: "dealradar", projectName: "DealRadar" },
    ],
  },
  {
    slug: "arch",
    name: "Arch Linux",
    summary: "Daily desktop.",
    category: "desktop",
    basis: "daily_driver",
    sortOrder: 2,
    projectCount: 0,
    usedOften: false,
    usages: [],
  },
];

const workflow: Workflow = {
  summary: "Summary",
  agents: [
    { slug: "chief-of-staff", name: "Chief of Staff", owns: "The fleet", summary: "Coordinates.", sortOrder: 1 },
    { slug: "portfolio", name: "Portfolio", owns: "This portfolio", summary: "Owns this site.", sortOrder: 2 },
  ],
  steps: [
    { slug: "grill-me", name: "grill-me", summary: "Question the idea.", sortOrder: 1 },
    { slug: "pr", name: "pr", summary: "Open the pull request.", sortOrder: 2 },
  ],
};

describe("Hero", () => {
  it("hides LinkedIn while the URL is null and links to the work and GitHub", () => {
    render(
      <Hero
        profile={{
          name: "Alexander Runemark",
          headline: "Go + TypeScript engineer shipping self-hosted apps with AI agents",
          summary: "Summary",
          githubUrl: "https://github.com/Runemark7",
          linkedinUrl: null,
        }}
        projects={projects}
        workflow={workflow}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName("Alexander Runemark");
    expect(screen.getByRole("link", { name: /See the work/ })).toHaveAttribute("href", "#projects");
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/Runemark7");
    expect(screen.queryByText(/LinkedIn/)).toBeNull();
    expect(screen.queryByText("TODO")).toBeNull();

    const glance = screen.getByRole("complementary", { name: "At a glance" });
    expect(within(glance).getByText("Public deployments").nextSibling).toHaveTextContent("01");
    expect(within(glance).getByRole("link", { name: /sdt\.runevibe\.se/ })).toHaveAttribute(
      "href",
      "https://sdt.runevibe.se",
    );
  });
});

describe("ProjectList", () => {
  it("keeps featured order and does not link a private repository", () => {
    render(
      <MemoryRouter>
        <ProjectList projects={projects} />
      </MemoryRouter>,
    );

    const articles = screen.getAllByRole("article");
    expect(articles[0]).toHaveAccessibleName("Riksdagskollen");
    expect(articles[1]).toHaveAccessibleName("DealRadar");
    expect(within(articles[0]).getByRole("link", { name: /Repository/ })).toHaveAttribute(
      "href",
      "https://github.com/Runemark7/swedish-democratic-tracker",
    );
    expect(within(articles[1]).queryByRole("link", { name: /Repository/ })).toBeNull();
    expect(within(articles[1]).getByText("Private repository")).toBeInTheDocument();
    expect(within(articles[1]).getByText("No public deployment")).toBeInTheDocument();
    const votes = within(articles[0]).getByText("Individual member votes").nextSibling;
    expect(votes).toHaveTextContent("3,957,311 as of 2026-10-24 (about 4 million)");
    expect(within(articles[0]).getByRole("img", { name: /Riksdagskollen home page/ })).toBeInTheDocument();
    expect(within(articles[1]).queryByRole("img")).toBeNull();
    expect(within(articles[1]).getByText(/DealRadar is private and has no public deployment/)).toBeInTheDocument();
  });
});

describe("SkillMatrix", () => {
  it("derives used often from project links and does not render a score", () => {
    render(
      <SkillMatrix skills={skills} projects={projects} usedOftenMinProjects={2} />,
    );

    const often = screen.getByRole("list", { name: "Used often" });
    expect(within(often).getByText("Go")).toBeInTheDocument();
    expect(within(often).getByText("Used in 2 projects")).toBeInTheDocument();
    expect(within(often).queryByText("Arch Linux")).toBeNull();
    expect(screen.getByText("Daily driver")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Languages" })).toBeInTheDocument();
    expect(screen.getByText("Used in 2 of 2 projects: Riksdagskollen, DealRadar.")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByText(/%/)).toBeNull();
  });
});

describe("SkillMatrix focus", () => {
  it("dims skills that the selected project does not use", async () => {
    const { container } = render(
      <SkillMatrix skills={skills} projects={projects} usedOftenMinProjects={2} />,
    );
    const toggle = screen.getByRole("button", { name: /DealRadar/ });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await act(async () => toggle.click());
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    const rows = container.querySelectorAll(".rv-heat-row");
    expect(rows[0]).not.toHaveClass("is-dim");
    expect(rows[1]).toHaveClass("is-dim");
  });
});
