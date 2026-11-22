import { ROUTES, RoutePath } from '../../lib/routes';

interface HeaderProps {
  currentPath: RoutePath;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ currentPath, sidebarOpen, setSidebarOpen }: HeaderProps) {
  const label = ROUTES.find((r) => r.path === currentPath)?.label || 'Overview';

  return (
    <header className="shell__header">
      <button
        type="button"
        className="shell__menu-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-expanded={sidebarOpen}
        aria-label="Toggle navigation"
        aria-controls="main-navigation"
      >
        <span className="visually-hidden">Toggle navigation</span>
        <span className="menu-icon" aria-hidden="true">
          ☰
        </span>
      </button>
      <h1 className="shell__title">{label}</h1>
      <div className="shell__actions" aria-label="Contextual actions">
        {/* Reserved for page-level actions */}
      </div>
    </header>
  );
}
