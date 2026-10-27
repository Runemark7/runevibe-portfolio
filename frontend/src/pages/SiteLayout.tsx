import { Outlet } from "react-router-dom";
import { AppShell } from "../ui";
import { usePortfolio } from "../features/portfolio/state";

export function SiteLayout() {
  const portfolio = usePortfolio();
  const profile = portfolio.status === "ready" ? portfolio.profile : null;
  return (
    <AppShell profile={profile} showFooter={portfolio.status === "ready"}>
      <Outlet />
    </AppShell>
  );
}
