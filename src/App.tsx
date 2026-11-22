import { useState, useEffect, useCallback } from 'react';
import { Shell } from './components/shell/Shell';
import { Overview } from './pages/Overview';
import { Compute } from './pages/Compute';
import { Workloads } from './pages/Workloads';
import { PagePlaceholder } from './components/PagePlaceholder';
import { ROUTES, RoutePath, routeLabel } from './lib/routes';

export function App() {
  const [path, setPath] = useState<RoutePath>(() => {
    const hash = window.location.hash as RoutePath;
    return ROUTES.find((r) => r.path === hash)?.path || '#/overview';
  });

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash as RoutePath;
      setPath(ROUTES.find((r) => r.path === hash)?.path || '#/overview');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((nextPath: RoutePath) => {
    setPath(nextPath);
    window.location.hash = nextPath;
  }, []);

  // Ensure a hash is present on initial load
  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '#/overview';
    }
  }, []);

  return (
    <Shell currentPath={path} navigate={navigate}>
      {path === '#/overview' ? <Overview /> : path === '#/compute' ? <Compute /> : path === '#/workloads' ? <Workloads /> : <PagePlaceholder route={{ path, label: routeLabel(path) }} />}
    </Shell>
  );
}

export default App;
