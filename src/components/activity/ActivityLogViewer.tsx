// Log viewer for one activity event — Orca Console
// Shows the synthetic log lines recorded with an event in a bounded,
// scrollable monospace pane so long output stays readable.

import { useState } from 'react';
import type { LogEntry } from '../../lib/mock/types';
import { formatLogTimestamp } from './format';

const VISIBLE_LOG_LIMIT = 50;

interface ActivityLogViewerProps {
  logs: LogEntry[];
}

export function ActivityLogViewer({ logs }: ActivityLogViewerProps) {
  const [showAll, setShowAll] = useState(false);

  if (logs.length === 0) {
    return (
      <p className="activity__logs-empty">
        No log entries were recorded for this event.
      </p>
    );
  }

  const visible = showAll ? logs : logs.slice(-VISIBLE_LOG_LIMIT);
  const hiddenCount = logs.length - visible.length;

  return (
    <div className="activity-log">
      <div className="activity-log__bar">
        <span className="data-label">Log output</span>
        <span className="activity-log__count">
          {logs.length} {logs.length === 1 ? 'line' : 'lines'} · UTC
        </span>
      </div>
      <ol className="activity-log__lines">
        {visible.map((log) => (
          <li key={log.id} className="activity-log__line">
            <time className="activity-log__time" dateTime={log.timestamp}>
              {formatLogTimestamp(log.timestamp)}
            </time>
            <span
              className={`activity-log__level activity-log__level--${log.level}`}
            >
              {log.level.toUpperCase()}
            </span>
            <span className="activity-log__component">{log.component}</span>
            <span className="activity-log__message">{log.message}</span>
          </li>
        ))}
      </ol>
      {hiddenCount > 0 && (
        <button
          type="button"
          className="btn btn--ghost btn--sm activity-log__more"
          onClick={() => setShowAll(true)}
        >
          Show {hiddenCount} earlier {hiddenCount === 1 ? 'line' : 'lines'}
        </button>
      )}
    </div>
  );
}
