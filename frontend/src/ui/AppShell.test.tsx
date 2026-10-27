import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

const profile = {
  name: "Alexander Runemark",
  headline: "Go + TypeScript engineer shipping self-hosted apps with AI agents",
  summary: "Summary",
  githubUrl: "https://github.com/Runemark7",
  linkedinUrl: null,
};

function renderShell(linkedinUrl: string | null) {
  render(
    <MemoryRouter>
      <AppShell profile={{ ...profile, linkedinUrl }} showFooter>
        <p>Body</p>
      </AppShell>
    </MemoryRouter>,
  );
  return screen.getByRole("contentinfo");
}

describe("AppShell footer", () => {
  it("is only the name, GitHub, and the year", () => {
    const footer = renderShell(null);
    expect(within(footer).getByText("Alexander Runemark")).toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "href",
      "https://github.com/Runemark7",
    );
    expect(within(footer).getByText(`© ${new Date().getFullYear()}`)).toBeInTheDocument();
    expect(within(footer).getAllByRole("link")).toHaveLength(1);
    expect(footer).not.toHaveTextContent(/Schibsted|Plex|built with|set in|designed|this site|back to top/i);
    expect(footer).not.toHaveTextContent(profile.headline);
  });

  it("adds LinkedIn when the profile has a URL", () => {
    const footer = renderShell("https://www.linkedin.com/in/example");
    expect(within(footer).getByRole("link", { name: /LinkedIn/ })).toBeInTheDocument();
  });
});
