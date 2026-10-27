/* The provider and the hook share one context. Fast Refresh wants a single component export. */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getInfra, getProfile, getProjects, getSkills, getWorkflow } from "../../api/client";
import type { InfraNote, Profile, Project, SkillList, Workflow } from "../../api/types";

export type PortfolioState =
  | { status: "loading"; reload: () => void }
  | { status: "error"; message: string; reload: () => void }
  | {
      status: "ready";
      profile: Profile;
      projects: Project[];
      skills: SkillList;
      workflow: Workflow;
      infra: InfraNote[];
      reload: () => void;
    };

const PortfolioContext = createContext<PortfolioState | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  const [state, setState] = useState<PortfolioState>({ status: "loading", reload });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", reload });
    Promise.all([getProfile(), getProjects(), getSkills(), getWorkflow(), getInfra()])
      .then(([profile, projects, skills, workflow, infra]) => {
        if (cancelled) return;
        setState({
          status: "ready",
          profile,
          projects: projects.projects,
          skills,
          workflow,
          infra: infra.notes,
          reload,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Could not load the portfolio.",
          reload,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, reload]);

  return <PortfolioContext.Provider value={state}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): PortfolioState {
  const state = useContext(PortfolioContext);
  if (!state) {
    throw new Error("usePortfolio must be used inside PortfolioProvider");
  }
  return state;
}
