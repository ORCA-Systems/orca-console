interface WordmarkProps {
  className?: string;
}

export function Wordmark({ className = '' }: WordmarkProps) {
  return (
    <a
      href="#/overview"
      className={`wordmark ${className}`}
      aria-label="Orca Console"
      title="Orca Console"
    >
      <span className="wordmark__mark">Orca</span>
      <span className="wordmark__systems">Console</span>
    </a>
  );
}
