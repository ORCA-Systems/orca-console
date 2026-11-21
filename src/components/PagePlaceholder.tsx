

interface PagePlaceholderProps {
  route: { path: string; label: string };
}

export function PagePlaceholder({ route }: PagePlaceholderProps) {
  return (
    <section className="page-placeholder" aria-label={route.label}>
      <div className="page-placeholder__content">
        <h1 className="page-placeholder__title">{route.label}</h1>
        <p className="page-placeholder__subtitle">Page content coming soon.</p>
      </div>
    </section>
  );
}
