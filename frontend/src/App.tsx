import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PortfolioProvider } from "./features/portfolio/state";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectPage } from "./pages/ProjectPage";
import { SiteLayout } from "./pages/SiteLayout";

export function App() {
  return (
    <BrowserRouter>
      <PortfolioProvider>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="projects/:slug" element={<ProjectPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </PortfolioProvider>
    </BrowserRouter>
  );
}
