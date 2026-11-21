import { Wordmark } from './Wordmark';
import { ROUTES, RoutePath } from '../../lib/routes';

interface SidebarProps {
  currentPath: RoutePath;
  navigate: (path: RoutePath) => void;
}

export function Sidebar({ currentPath, navigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Wordmark className="wordmark--sidebar" />
      </div>
      <nav aria-label="Main navigation">
        <ul className="sidebar__nav">
          {ROUTES.map((route) => {
            const isActive = currentPath === route.path;
            return (
              <li key={route.path} className="sidebar__item">
                <a
                  href={route.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(route.path);
                  }}
                  className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {route.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="sidebar__footer">
        <span className="prototype-badge">Prototype · Simulated data</span>
      </div>
    </aside>
  );
}
