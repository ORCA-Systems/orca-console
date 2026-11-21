interface WordmarkProps {
  className?: string;
}

export function Wordmark({ className = '' }: WordmarkProps) {
  return (
    <a
      href="#/overview"
      className={`wordmark ${className}`}
      aria-label="Orca Systems"
      title="Orca Systems"
    >
      <span className="wordmark__mark">ORCA</span>
      <span className="wordmark__systems">Systems</span>
    </a>
  );
}
