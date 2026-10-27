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
    liveUrl: null,
    repoUrl: null,
    credit: null,
    facts: [],
  }),
);

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
        agents: [
          { slug: "portfolio", name: "Portfolio", owns: "This portfolio", summary: "Owns this site.", sortOrder: 1 },
        ],
        steps: [{ slug: "pr", name: "pr", summary: "A code review happens before merge.", sortOrder: 1 }],
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
