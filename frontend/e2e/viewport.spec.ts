import { expect, test } from "@playwright/test";

const projects = ["Riksdagskollen", "DealRadar", "Paper Trading Bot", "Warehouse", "Halmstad homes map"].map(
  (name, index) => ({
    slug: name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, ""),
    name,
    summary: "Summary",
    body: "Body",
    kind: index === 0 ? "flagship" : "standard",
    visibility: "public",
    sortOrder: index + 1,
    liveUrl: index === 1 ? null : `https://${index}.example.test`,
    repoUrl: null,
    credit: null,
    facts: [{ label: "Individual member votes", value: "3,957,311 as of 2026-10-24 (about 4 million)" }],
  }),
);

const agents = ["Chief of Staff", "Paper Trader", "Democracy Tracker", "Warehouse", "Apartment Finder", "Parking watcher", "Portfolio"].map(
  (name, index) => ({
    slug: index === 0 ? "chief-of-staff" : name.toLowerCase().replace(/\s+/g, "-"),
    name,
    owns: index === 0 ? "The fleet" : name,
    summary: index === 0 ? "Coordinates the other agents." : `Owns ${name}.`,
    sortOrder: index + 1,
  }),
);

const steps = ["grill-me", "to-spec", "to-tickets", "implement-tdd", "code-review", "pr"].map((slug, index) => ({
  slug,
  name: slug === "implement-tdd" ? "implement/tdd" : slug,
  summary: "Cursor cloud agents open the pull request. A code review, by Alexander or a review agent, happens before merge.",
  sortOrder: index + 1,
}));

test("document width matches the viewport at 390px", async ({ page }) => {
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const payloads: Record<string, unknown> = {
      "/api/v1/profile": {
        name: "Alexander Runemark",
        headline: "Go + TypeScript engineer shipping self-hosted apps with AI agents",
        summary: "Self-hosted apps and the assistants that work on them.",
        githubUrl: "https://github.com/Runemark7",
        linkedinUrl: null,
      },
      "/api/v1/projects": { projects },
      "/api/v1/skills": {
        usedOftenMinProjects: 2,
        skills: [
          {
            slug: "go",
            name: "Go",
            summary: "Backend language.",
            category: "language",
            basis: "projects",
            sortOrder: 1,
            projectCount: 3,
            usedOften: true,
            usages: projects.slice(0, 3).map((project) => ({
              projectSlug: project.slug,
              projectName: project.name,
            })),
          },
          {
            slug: "typescript-react",
            name: "TypeScript/React",
            summary: "TypeScript user interfaces, including React apps.",
            category: "frontend",
            basis: "projects",
            sortOrder: 2,
            projectCount: 5,
            usedOften: true,
            usages: projects.map((project) => ({ projectSlug: project.slug, projectName: project.name })),
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
        ],
      },
      "/api/v1/workflow": {
        summary: "Each pull request gets a code review before merge.",
        agents,
        steps,
      },
      "/api/v1/infra": {
        notes: [{ slug: "k3s", title: "k3s", summary: "Single-node k3s on Hetzner.", sortOrder: 1 }],
      },
    };
    const body = payloads[path];
    if (!body) {
      await route.fulfill({ status: 404, contentType: "application/json", body: '{"error":"not found"}' });
      return;
    }
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(body) });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Alexander Runemark" })).toBeVisible();
  await expect(page.getByText("Daily driver")).toBeVisible();
  await expect(page.getByRole("link", { name: /See the work/ })).toBeVisible();
  await expect(page.getByRole("list", { name: "Coding workflow" }).getByRole("listitem")).toHaveCount(6);
  await expect(page.getByText("TODO")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /LinkedIn/ })).toHaveCount(0);

  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  // scrollbar-gutter: stable can make scrollWidth a few pixels under clientWidth.
  // The failure is content wider than the viewport.
  expect(metrics.innerWidth).toBe(390);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
});
