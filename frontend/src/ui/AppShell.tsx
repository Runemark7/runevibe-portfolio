import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Profile } from "../api/types";
import { Heading, LinkedInPlaceholder, Mark, TextLink, ThemeToggle } from "./components";

const NAV = [
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "workflows", label: "Workflows" },
  { id: "infra", label: "Infra" },
];

export function AppShell({
  profile,
  children,
  showFooter,
}: {
  profile: Profile | null;
  children: ReactNode;
  showFooter: boolean;
}) {
  const location = useLocation();
  const name = profile?.name ?? "Alexander Runemark";
  const github = profile?.githubUrl ?? "https://github.com/Runemark7";

  return (
    <div className="rv-root">
      <a className="rv-skip" href="#content">
        Skip to content
      </a>
      <header className="rv-mast">
        <Link className="rv-brand" to="/">
          <Mark />
          <span>{name}</span>
        </Link>
        <nav className="rv-nav" aria-label="Sections">
          {NAV.map((item) => {
            const href = location.pathname === "/" ? `#${item.id}` : `/#${item.id}`;
            return (
              <a key={item.id} href={href}>
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="rv-mast-actions">
          <TextLink href={github} external>
            GitHub
          </TextLink>
          <LinkedInPlaceholder url={profile?.linkedinUrl} />
          <ThemeToggle />
        </div>
      </header>
      <main id="content" className="rv-main">
        {children}
      </main>
      {showFooter ? (
        <footer className="rv-footer">
          <Heading level="h2" size="section">
            {name}
          </Heading>
          <p>Self-hosted apps, GitOps, and a fleet of specialised AI assistants.</p>
          <p className="rv-footer-links">
            <TextLink href={github} external>
              GitHub
            </TextLink>
            <LinkedInPlaceholder url={profile?.linkedinUrl} />
          </p>
        </footer>
      ) : null}
    </div>
  );
}
