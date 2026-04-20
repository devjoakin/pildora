import { useLayoutEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AgentSidebar } from './components/AgentSidebar';
import { CvAgentPage } from './pages/CvAgentPage';
import { IntroductionPage } from './pages/IntroductionPage';
import { LandingPage } from './pages/LandingPage';
import { OccupationMcpAgentPage } from './pages/OccupationMcpAgentPage';
import { TravelAgentPage } from './pages/TravelAgentPage';
import { SimpleAgentPage } from './pages/SimpleAgentPage';
import { WebAgentPage } from './pages/WebAgentPage';
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/agents" element={<AppLayout />}>
          <Route index element={<Navigate to="introduction" replace />} />
          <Route path="introduction" element={<IntroductionPage />} />
          <Route path="simple" element={<SimpleAgentPage />} />
          <Route path="weather" element={<WeatherAgentPage />} />
          <Route path="web" element={<WebAgentPage />} />
          <Route path="cv" element={<CvAgentPage />} />
          <Route path="travel" element={<TravelAgentPage />} />
          <Route path="occupation-mcp" element={<OccupationMcpAgentPage />} />
          <Route path="*" element={<Navigate to="/agents/simple" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
