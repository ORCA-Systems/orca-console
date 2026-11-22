// Workloads page — Orca Console
// Inspect and manage AI compute jobs on the fictional compute node.
//
// Every transition is simulated in the browser: actions update the shared
// mock dataset so changes survive navigation, and successful actions append
// an entry to the shared activity feed. No real job or container is started.

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  applyWorkloadAction,
  checkWorkloadAction,
  getActivity,
  getAvailableWorkloadActions,
  getSimulationNow,
  getWorkloads,
  type WorkloadAction,
} from '../lib/mock/access';
import type { WorkloadState } from '../lib/mock/types';
import { severityTone } from '../components/activity/format';
import { WorkloadDetailDrawer } from '../components/workloads/WorkloadDetailDrawer';
import {
  actionLabel,
  formatClock,
  getRuntimeLabel,
  stateLabel,
  stateTone,
  summarizeResources,
} from '../components/workloads/format';

type Filter = 'all' | WorkloadState;

type Feedback = {
  message: string;
  type: 'success' | 'error';
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const FEEDBACK_TIMEOUT_MS = 6000;

export function Workloads() {
  // The mock access layer owns workload state; this counter simply asks React
  // to re-read it after an action.
  const [, refresh] = useReducer((version: number) => version + 1, 0);

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingStopId, setPendingStopId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const cancelStopRef = useRef<HTMLButtonElement>(null);

  const workloads = getWorkloads();
  const activity = getActivity();
  const simulationNow = getSimulationNow();

  const selected = selectedId
    ? workloads.find((workload) => workload.id === selectedId) ?? null
    : null;
  const pendingStop = pendingStopId
    ? workloads.find((workload) => workload.id === pendingStopId) ?? null
    : null;

  // Auto-dismiss feedback. A new message replaces the timer.
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(
      () => setFeedback(null),
      FEEDBACK_TIMEOUT_MS
    );
    return () => window.clearTimeout(timer);
  }, [feedback]);

  // Escape cancels the stop confirmation; focus starts on Cancel.
  useEffect(() => {
    if (!pendingStopId) return;
    cancelStopRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPendingStopId(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [pendingStopId]);

  const counts = useMemo(() => {
    const next: Record<Filter, number> = {
      all: workloads.length,
      pending: 0,
      running: 0,
      succeeded: 0,
      failed: 0,
      cancelled: 0,
    };
    workloads.forEach((workload) => {
      next[workload.state] += 1;
    });
    return next;
  }, [workloads]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workloads.filter((workload) => {
      const matchesState = filter === 'all' || workload.state === filter;
      const matchesQuery =
        query.length === 0 ||
        workload.name.toLowerCase().includes(query) ||
        workload.id.toLowerCase().includes(query);
      return matchesState && matchesQuery;
    });
  }, [workloads, filter, search]);

  // The activity feed is appended to in place, so sort a copy on each render
  // instead of memoising on the array reference.
  const recentActivity = activity
    .slice()
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 8);

  const openDetail = useCallback((id: string) => {
    setFeedback(null);
    setSelectedId(id);
  }, []);

  const closeDetail = useCallback(() => setSelectedId(null), []);

  const handleAction = useCallback((action: WorkloadAction, id: string) => {
    const workload = getWorkloads().find((entry) => entry.id === id);
    if (!workload) return;

    const blocked = checkWorkloadAction(workload, action);
    if (blocked) {
      setFeedback({ message: blocked, type: 'error' });
      return;
    }

    if (action === 'stop') {
      // Stopping is destructive: close the detail view and ask for confirmation.
      setSelectedId(null);
      setPendingStopId(id);
      return;
    }

    const result = applyWorkloadAction(id, action);
    refresh();
    setFeedback({
      message: result.message,
      type: result.ok ? 'success' : 'error',
    });
  }, []);

  const confirmStop = useCallback(() => {
    if (!pendingStopId) return;
    const result = applyWorkloadAction(pendingStopId, 'stop');
    refresh();
    setPendingStopId(null);
    setFeedback({
      message: result.message,
      type: result.ok ? 'success' : 'error',
    });
  }, [pendingStopId]);

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  const clearFilters = useCallback(() => {
    setFilter('all');
    setSearch('');
  }, []);

  return (
    <div className="workloads-page">
      <header className="workloads__header">
        <span className="workloads__kicker">Compute jobs</span>
        <h2 className="workloads__title">Workloads</h2>
        <p className="workloads__description">
          Inspect and manage AI compute jobs scheduled on{' '}
          <span className="data-mono">orca-node-01</span>.
        </p>
        <p className="workloads__note">
          Actions update this prototype's local state only — no job or
          container is started, stopped, or retried.
        </p>
      </header>

      {feedback && !selected && (
        <div
          className={`workloads__feedback workloads__feedback--${feedback.type}`}
          role={feedback.type === 'error' ? 'alert' : 'status'}
          aria-live={feedback.type === 'error' ? 'assertive' : 'polite'}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            className="workloads__feedback-dismiss"
            onClick={dismissFeedback}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <section className="workloads__toolbar" aria-label="Filter workloads">
        <div
          className="workloads__filter-group"
          role="group"
          aria-label="Filter by status"
        >
          <span className="data-label">Status</span>
          {FILTERS.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={`workloads__filter-chip ${
                  active ? 'workloads__filter-chip--active' : ''
                }`}
                onClick={() => setFilter(option.value)}
                aria-pressed={active}
              >
                {option.label}
                <span className="workloads__filter-count">
                  {counts[option.value]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="workloads__search">
          <label className="data-label" htmlFor="workload-search">
            Search
          </label>
          <input
            id="workload-search"
            type="search"
            className="field-input"
            placeholder="Name or ID"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            autoComplete="off"
          />
        </div>
      </section>

      <section aria-label="Workload list">
        <div className="table-wrap">
          <table className="table table--compact workloads__table">
            <caption className="visually-hidden">
              Workloads on orca-node-01,{' '}
              {filter === 'all' ? 'all states' : stateLabel(filter)}
              {search.trim() ? `, matching “${search.trim()}”` : ''}
            </caption>
            <thead>
              <tr>
                <th scope="col">Workload</th>
                <th scope="col">Status</th>
                <th scope="col">Runtime</th>
                <th scope="col">Resources</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="workloads__empty">
                    <p>
                      {search.trim()
                        ? `No workloads match “${search.trim()}”.`
                        : filter === 'all'
                          ? 'No workloads to show.'
                          : `No ${stateLabel(filter).toLowerCase()} workloads.`}
                    </p>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((workload) => {
                  const tone = stateTone(workload.state);
                  const available = getAvailableWorkloadActions(
                    workload.state
                  );
                  return (
                    <tr key={workload.id}>
                      <td className="workloads__cell-workload">
                        <span className="workloads__name">
                          {workload.name}
                        </span>
                        <span className="data-mono workloads__id">
                          {workload.id}
                        </span>
                      </td>
                      <td data-label="Status">
                        <span
                          className={`workloads__state workloads__state--${tone}`}
                        >
                          <span
                            className="workloads__state-dot"
                            aria-hidden="true"
                          />
                          {stateLabel(workload.state)}
                        </span>
                      </td>
                      <td data-label="Runtime" className="workloads__num">
                        {getRuntimeLabel(workload, simulationNow)}
                      </td>
                      <td data-label="Resources" className="workloads__resources">
                        {summarizeResources(workload.resources)}
                      </td>
                      <td
                        data-label="Actions"
                        className="workloads__cell-actions"
                      >
                        <div className="workloads__row-actions">
                          {available.map((action) => (
                            <button
                              key={action}
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => handleAction(action, workload.id)}
                              aria-label={`${actionLabel(action)} ${workload.name}`}
                            >
                              {actionLabel(action)}
                            </button>
                          ))}
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => openDetail(workload.id)}
                            aria-label={`View details for ${workload.name}`}
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="workloads__count">
          Showing {filtered.length} of {workloads.length} workload
          {workloads.length === 1 ? '' : 's'}
          {filter !== 'all' ? ` · ${stateLabel(filter)}` : ''}
          {search.trim() ? ` · “${search.trim()}”` : ''}
        </p>
      </section>

      <hr className="sep" />

      <section aria-label="Activity feed">
        <div className="workloads__section-header">
          <h3 className="workloads__section-title">Recent activity</h3>
        </div>
        <div className="activity-list">
          {recentActivity.map((event) => (
            <div key={event.id} className="activity-list__item">
              <span className="data-mono activity-list__time">
                {formatClock(event.timestamp)}
              </span>
              <span
                className={`status status--${severityTone(
                  event.severity
                )} activity-list__badge`}
              >
                {event.severity}
              </span>
              <span className="activity-list__message">{event.message}</span>
            </div>
          ))}
        </div>
      </section>

      <WorkloadDetailDrawer
        workload={selected}
        feedback={feedback}
        onClose={closeDetail}
        onAction={(action) => {
          if (selected) handleAction(action, selected.id);
        }}
      />

      {pendingStop && (
        <>
          <div
            className="workloads__backdrop"
            onClick={() => setPendingStopId(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="workloads-stop-title"
            className="workloads__confirm"
          >
            <h2 id="workloads-stop-title" className="workloads__confirm-title">
              Stop workload?
            </h2>
            <p className="workloads__confirm-target">
              <span className="data-mono">{pendingStop.id}</span> ·{' '}
              {pendingStop.name}
            </p>
            <p className="workloads__confirm-message">
              Stopping marks this workload cancelled and releases its
              simulated resources. This cannot be undone.
            </p>
            <div className="workloads__confirm-actions">
              <button
                ref={cancelStopRef}
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setPendingStopId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={confirmStop}
              >
                Stop workload
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Workloads;
