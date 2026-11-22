// Activity page — Orca Console
// Chronological feed of synthetic infrastructure events with severity and
// source filtering, search, bounded paging and an expandable detail view that
// includes the log lines recorded for the event.
//
// Events shown here come from the shared mock-data access layer, including
// those appended by workload actions on the Workloads page and by other parts
// of the prototype. Nothing is read from a real host.

import { useEffect, useMemo, useState } from 'react';
import { getActivity, getLogsForEvent } from '../lib/mock/access';
import type { ActivityEvent, ActivitySeverity } from '../lib/mock/types';
import { ActivityLogViewer } from '../components/activity/ActivityLogViewer';
import {
  SEVERITIES,
  formatFeedTime,
  formatFullTimestamp,
  severityGlyph,
  severityLabel,
  severityTone,
  sourceLabel,
} from '../components/activity/format';

type SeverityFilter = 'all' | ActivitySeverity;

const PAGE_SIZE = 12;

function matchesQuery(event: ActivityEvent, query: string): boolean {
  if (query.length === 0) return true;
  return [
    event.message,
    event.detail ?? '',
    event.source,
    event.workloadId ?? '',
    event.id,
  ].some((value) => value.toLowerCase().includes(query));
}

export function Activity() {
  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const [source, setSource] = useState('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const events = getActivity();

  // Newest first; keep the seeded order for events sharing a timestamp.
  const newestFirst = useMemo(
    () =>
      events
        .slice()
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
    [events]
  );

  const counts = useMemo(() => {
    const next: Record<SeverityFilter, number> = {
      all: newestFirst.length,
      info: 0,
      success: 0,
      warning: 0,
      error: 0,
    };
    newestFirst.forEach((event) => {
      next[event.severity] += 1;
    });
    return next;
  }, [newestFirst]);

  const sources = useMemo(
    () => Array.from(new Set(newestFirst.map((event) => event.source))).sort(),
    [newestFirst]
  );

  const logCounts = useMemo(() => {
    const map = new Map<string, number>();
    newestFirst.forEach((event) => {
      map.set(event.id, getLogsForEvent(event.id).length);
    });
    return map;
  }, [newestFirst]);

  const filtered = useMemo(() => {
    const normalised = query.trim().toLowerCase();
    return newestFirst.filter((event) => {
      if (severity !== 'all' && event.severity !== severity) return false;
      if (source !== 'all' && event.source !== source) return false;
      return matchesQuery(event, normalised);
    });
  }, [newestFirst, severity, source, query]);

  // A new filter starts from the top of its result set.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setExpandedId(null);
  }, [severity, source, query]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;

  const clearFilters = () => {
    setSeverity('all');
    setSource('all');
    setQuery('');
  };

  const toggleEvent = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const filtersActive =
    severity !== 'all' || source !== 'all' || query.trim().length > 0;

  return (
    <div className="activity-page">
      <header className="activity__header">
        <span className="activity__kicker">System events</span>
        <h2 className="activity__title">Activity</h2>
        <p className="activity__description">
          Chronological record of workload lifecycle changes, node readiness,
          resource warnings and configuration changes on{' '}
          <span className="data-mono">orca-node-01</span>.
        </p>
        <p className="activity__note">
          All events and log lines are synthetic and recorded in this browser
          session. Nothing is read from a real host.
        </p>
      </header>

      {events.length === 0 ? (
        <section className="activity__empty" aria-label="Activity feed">
          <h3 className="activity__empty-title">No activity recorded yet</h3>
          <p className="activity__empty-text">
            Events appear here as simulated workloads and configuration changes.
          </p>
        </section>
      ) : (
        <>
          <section className="activity__toolbar" aria-label="Filter activity">
            <div
              className="activity__severity-group"
              role="group"
              aria-label="Filter by severity"
            >
              <span className="data-label">Severity</span>
              <button
                type="button"
                className={`activity__chip ${
                  severity === 'all' ? 'activity__chip--active' : ''
                }`}
                onClick={() => setSeverity('all')}
                aria-pressed={severity === 'all'}
              >
                All
                <span className="activity__chip-count">{counts.all}</span>
              </button>
              {SEVERITIES.map((value) => {
                const active = severity === value;
                return (
                  <button
                    key={value}
                    type="button"
                    className={`activity__chip ${
                      active ? 'activity__chip--active' : ''
                    }`}
                    onClick={() => setSeverity(value)}
                    aria-pressed={active}
                  >
                    {severityLabel(value)}
                    <span className="activity__chip-count">
                      {counts[value]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="activity__controls">
              <div className="activity__field">
                <label className="data-label" htmlFor="activity-source">
                  Source
                </label>
                <select
                  id="activity-source"
                  className="field-select"
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                >
                  <option value="all">All sources</option>
                  {sources.map((value) => (
                    <option key={value} value={value}>
                      {sourceLabel(value)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="activity__field activity__field--search">
                <label className="data-label" htmlFor="activity-search">
                  Search
                </label>
                <input
                  id="activity-search"
                  type="search"
                  className="field-input"
                  placeholder="Message, source, or ID"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          </section>

          <section aria-label="Activity feed">
            <div className="activity__feed-header">
              <h3 className="activity__feed-title">Event feed</h3>
              <span className="activity__feed-meta">
                Newest first · times in UTC
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="activity__empty">
                <h3 className="activity__empty-title">
                  No events match these filters
                </h3>
                <p className="activity__empty-text">
                  Try a different severity, source, or search term.
                </p>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <ol className="activity__feed">
                  {visible.map((event) => {
                    const expanded = expandedId === event.id;
                    const detailId = `activity-detail-${event.id}`;
                    const tone = severityTone(event.severity);
                    return (
                      <li key={event.id} className="activity__item">
                        <button
                          type="button"
                          className="activity__summary"
                          onClick={() => toggleEvent(event.id)}
                          aria-expanded={expanded}
                          aria-controls={expanded ? detailId : undefined}
                        >
                          <time
                            className="activity__time data-mono"
                            dateTime={event.timestamp}
                            title={formatFullTimestamp(event.timestamp)}
                          >
                            {formatFeedTime(event.timestamp)}
                          </time>
                          <span
                            className={`status status--${tone} activity__badge`}
                          >
                            <span
                              className="activity__glyph"
                              aria-hidden="true"
                            >
                              {severityGlyph(event.severity)}
                            </span>
                            {severityLabel(event.severity)}
                          </span>
                          <span className="activity__body">
                            <span className="activity__message">
                              {event.message}
                            </span>
                            <span className="activity__sub">
                              {sourceLabel(event.source)}
                              {event.workloadId && (
                                <>
                                  {' · '}
                                  <span className="data-mono">
                                    {event.workloadId}
                                  </span>
                                </>
                              )}
                              {logCounts.get(event.id) ? (
                                <>
                                  {' · '}
                                  {logCounts.get(event.id)} log{' '}
                                  {logCounts.get(event.id) === 1
                                    ? 'line'
                                    : 'lines'}
                                </>
                              ) : null}
                            </span>
                          </span>
                          <span
                            className={`activity__chevron ${
                              expanded ? 'activity__chevron--open' : ''
                            }`}
                            aria-hidden="true"
                          >
                            ▾
                          </span>
                        </button>

                        {expanded && (
                          <div
                            id={detailId}
                            className="activity__detail"
                            role="region"
                            aria-label={`Detail for ${event.id}`}
                          >
                            {event.detail && (
                              <p className="activity__detail-text">
                                {event.detail}
                              </p>
                            )}
                            <dl className="activity__detail-grid">
                              <div className="activity__detail-item">
                                <dt>Timestamp</dt>
                                <dd className="data-mono">
                                  {formatFullTimestamp(event.timestamp)}
                                </dd>
                              </div>
                              <div className="activity__detail-item">
                                <dt>Source</dt>
                                <dd>{sourceLabel(event.source)}</dd>
                              </div>
                              <div className="activity__detail-item">
                                <dt>Event ID</dt>
                                <dd className="data-mono">{event.id}</dd>
                              </div>
                              <div className="activity__detail-item">
                                <dt>Workload</dt>
                                <dd>
                                  {event.workloadId ? (
                                    <a
                                      href="#/workloads"
                                      className="activity__workload-link data-mono"
                                    >
                                      {event.workloadId}
                                    </a>
                                  ) : (
                                    '—'
                                  )}
                                </dd>
                              </div>
                            </dl>

                            <ActivityLogViewer
                              key={event.id}
                              logs={getLogsForEvent(event.id)}
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>

                <div className="activity__feed-footer">
                  <p className="activity__result-count" role="status">
                    Showing {visible.length} of {filtered.length} event
                    {filtered.length === 1 ? '' : 's'}
                    {filtersActive ? ' matching the current filters' : ''}.
                  </p>
                  {remaining > 0 && (
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() =>
                        setVisibleCount((count) => count + PAGE_SIZE)
                      }
                    >
                      Show {Math.min(PAGE_SIZE, remaining)} more
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Activity;
