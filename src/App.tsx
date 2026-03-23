import { useLayoutEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AgentSidebar } from './components/AgentSidebar';
import { EmailAgentPage } from './pages/EmailAgentPage';
import { GithubIssuesAgentPage } from './pages/GithubIssuesAgentPage';
import { TravelAgentPage } from './pages/TravelAgentPage';
import { WeatherAgentPage } from './pages/WeatherAgentPage';

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppLayout() {
  return (
    <div className="flex h-full flex-col bg-slate-100 md:flex-row">
      <AgentSidebar />

      <section className="min-h-0 flex-1">
        <Outlet />
      </section>
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTopOnRouteChange />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/agents/weather" replace />} />
          <Route path="agents/weather" element={<WeatherAgentPage />} />
          <Route path="agents/email" element={<EmailAgentPage />} />
          <Route path="agents/travel" element={<TravelAgentPage />} />
          <Route
            path="agents/github-issues"
            element={<GithubIssuesAgentPage />}
          />
          <Route path="*" element={<Navigate to="/agents/weather" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
