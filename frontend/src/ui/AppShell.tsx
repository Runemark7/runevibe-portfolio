import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Profile } from "../api/types";
import { LinkedInPlaceholder, Mark, TextLink, ThemeToggle } from "./components";

const NAV = [
  { id: "projects", index: "01", label: "Work" },
  { id: "skills", index: "02", label: "Practice" },
  { id: "workflows", index: "03", label: "Agents" },
  { id: "infra", index: "04", label: "Hosting" },
];

function useScrollOnNavigate() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView();
      return;
    }
    // Sections render after the API responds, so wait for the target to appear.
    const observer = new MutationObserver(() => {
      const late = document.getElementById(id);
      if (late) {
        observer.disconnect();
        late.scrollIntoView();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = window.setTimeout(() => observer.disconnect(), 3000);
    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [pathname, hash]);
}

export function AppShell({
  profile,
  children,
  showFooter,
}: {
  profile: Profile | null;
  children: ReactNode;
  showFooter: boolean;
}) {
  useScrollOnNavigate();
  const location = useLocation();
  const name = profile?.name ?? "Alexander Runemark";
  const github = profile?.githubUrl ?? "https://github.com/Runemark7";
  const onHome = location.pathname === "/";

  return (
    <div className="rv-root">
      <a className="rv-skip" href="#content">
        Skip to content
      </a>
      <header className="rv-mast">
        <div className="rv-wrap rv-mast-inner">
          <Link className="rv-brand" to="/">
            <Mark />
            <span className="rv-brand-name">{name}</span>
          </Link>
          <nav className="rv-nav" aria-label="Sections">
            {NAV.map((item) =>
              onHome ? (
                <a key={item.id} href={`#${item.id}`}>
                  <span className="rv-nav-num" aria-hidden="true">
                    {item.index}
                  </span>
                  {item.label}
                </a>
              ) : (
                <Link key={item.id} to={`/#${item.id}`}>
                  <span className="rv-nav-num" aria-hidden="true">
                    {item.index}
                  </span>
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <div className="rv-mast-actions">
            <TextLink href={github} external arrow="out" className="rv-mast-link">
              GitHub
            </TextLink>
            <LinkedInPlaceholder url={profile?.linkedinUrl} />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="content" className="rv-main" tabIndex={-1}>
        {children}
      </main>
      {showFooter ? (
        <footer className="rv-footer">
          <div className="rv-wrap rv-footer-inner">
            <p className="rv-footer-name">{name}</p>
            <ul className="rv-footer-links">
              <li>
                <TextLink href={github} external arrow="out">
                  GitHub
                </TextLink>
              </li>
              {profile?.linkedinUrl ? (
                <li>
                  <LinkedInPlaceholder url={profile.linkedinUrl} />
                </li>
              ) : null}
              <li className="rv-footer-year">© {new Date().getFullYear()}</li>
            </ul>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
