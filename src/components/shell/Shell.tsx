import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RoutePath } from '../../lib/routes';

interface ShellProps {
  children: ReactNode;
  currentPath: RoutePath;
  navigate: (path: RoutePath) => void;
}

export function Shell({ children, currentPath, navigate }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Sidebar currentPath={currentPath} navigate={navigate} />

      <div className="shell__body">
        <Header
          currentPath={currentPath}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main id="main-content" className="shell__main">
          <div className="page-container">{children}</div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="shell__overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
