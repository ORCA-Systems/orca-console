import { useState, useEffect, useCallback } from 'react';
import { Shell } from './components/shell/Shell';
import { PagePlaceholder } from './components/PagePlaceholder';
import { ROUTES, RoutePath } from './lib/routes';

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

  const activeRoute = ROUTES.find((r) => r.path === path) || ROUTES[0];

  return (
    <Shell currentPath={path} navigate={navigate}>
      <PagePlaceholder route={activeRoute} />
    </Shell>
  );
}

export default App;
