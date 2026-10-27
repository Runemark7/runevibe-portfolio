import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { Project, Skill } from "../../api/types";
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

describe("Hero", () => {
  it("hides LinkedIn while the URL is null", () => {
    render(
      <Hero
        profile={{
          name: "Alexander Runemark",
          headline: "Go + TypeScript engineer shipping self-hosted apps with AI agents",
          summary: "Summary",
          githubUrl: "https://github.com/Runemark7",
          linkedinUrl: null,
        }}
      />,
    );
    expect(screen.queryByText(/LinkedIn/)).toBeNull();
    expect(screen.queryByText("TODO")).toBeNull();
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
    expect(screen.getByText("3,957,311 as of 2026-10-24 (about 4 million)")).toBeInTheDocument();
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
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByText(/%/)).toBeNull();
  });
});
