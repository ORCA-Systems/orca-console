// Overview page — Orca Console
// Communicates the state of the fictional compute node at a glance.
// All data comes from the centralised mock-data access layer.

import { useMemo, useState } from 'react';
import {
  getNode,
  getCpus,
  getMemory,
  getAccelerators,
  getUtilisationWindow,
  getLatestUtilisation,
  getWorkloads,
  getActivity,
} from '../lib/mock/access';
import { UtilisationChart } from '../components/overview/UtilisationChart';
import { severityTone } from '../components/activity/format';
import type { NodeStatus } from '../lib/mock/types';

interface TimeRangeOption {
  value: number; // hours
  label: string;
}

const TIME_RANGES: TimeRangeOption[] = [
  { value: 6, label: 'Last 6 hours' },
  { value: 12, label: 'Last 12 hours' },
  { value: 24, label: 'Last 24 hours' },
];

function statusVariant(status: NodeStatus): 'ok' | 'warn' | 'info' | 'error' {
  switch (status) {
    case 'operational':
      return 'ok';
    case 'degraded':
      return 'warn';
    case 'maintenance':
      return 'info';
    case 'offline':
      return 'error';
  }
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function Overview() {
  const node = getNode();
  const cpus = getCpus();
  const memories = getMemory();
  const accelerators = getAccelerators();
  const latest = getLatestUtilisation();
  const workloads = getWorkloads();
  const activity = getActivity();
  const [hours, setHours] = useState<number>(24);

  // Anchor the window to the latest sample so the control always shows data
  // from the simulated dataset, regardless of the real clock.
  const latestTime = latest ? new Date(latest.timestamp).getTime() : Date.now();

  const { samples, intervalMinutes } = useMemo(
    () => getUtilisationWindow(hours),
    [hours]
  );

  const totalThreads = cpus.reduce((sum, c) => sum + c.threads, 0);
  const totalMemoryGB = memories.reduce((sum, m) => sum + m.capacityGB, 0);
  const acceleratorMemoryGB = accelerators.reduce(
    (sum, a) => sum + a.memoryGB,
    0
  );

  const uptimeDays = Math.floor(
    (latestTime - new Date(node.provisionedAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const activeWorkloads = workloads.filter(
    (w) => w.state === 'running' || w.state === 'pending'
  );
  const recentActivity = activity
    .slice()
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 6);

  return (
    <div className="overview-page">
      {/* Page title and description */}
      <header className="overview__header">
        <span className="overview__kicker">Node state</span>
        <h2 className="overview__title">{node.name}</h2>
        <p className="overview__description">
          Current state of{' '}
          <span className="data-mono">{node.name}</span>{' '}
          ({node.location}) and its compute resources. All values are
          simulated for demonstration.
        </p>
      </header>

      <hr className="sep sep--tight" />

      {/* Node status — top of the visual hierarchy */}
      <section className="overview__status" aria-label="Node status">
        <span
          className={`status status--${statusVariant(node.status)}`}
        >
          {node.status}
        </span>
        <span className="data-mono">
          {node.location} · up {uptimeDays} days · provisioned{' '}
          {formatDate(node.provisionedAt)}
        </span>
      </section>

      {/* Resource metrics — grouped by prominence, not identical cards */}
      <section className="overview__metrics" aria-label="Resource utilisation">
        <div className="overview__metric overview__metric--primary">
          <span className="data-label">CPU utilisation</span>
          <span className="overview__value">
            {latest?.cpuPercent ?? '—'}%
          </span>
          <span className="overview__sub">
            {totalThreads} threads across {cpus.length} sockets
          </span>
        </div>
        <div className="overview__metric-row">
          <div className="overview__metric">
            <span className="data-label">Memory usage</span>
            <span className="overview__value">
              {latest?.memoryPercent ?? '—'}%
            </span>
            <span className="overview__sub">{totalMemoryGB} GB total</span>
          </div>
          <div className="overview__metric">
            <span className="data-label">Accelerator utilisation</span>
            <span className="overview__value">
              {latest?.acceleratorPercent ?? '—'}%
            </span>
            <span className="overview__sub">
              {accelerators.length} × {accelerators[0]?.name ?? 'accelerator'} ({acceleratorMemoryGB} GB total)
            </span>
          </div>
        </div>
      </section>

      <hr className="sep" />

      {/* Time-series visualisation with a functional time-range control */}
      <section
        className="overview__chart-section"
        aria-label="Resource utilisation over time"
      >
        <div className="control-group overview__time-range">
          <span className="data-label">Time window</span>
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              className={`overview__range-button ${
                hours === range.value ? 'overview__range-button--active' : ''
              }`}
              onClick={() => setHours(range.value)}
              aria-pressed={hours === range.value}
            >
              {range.label}
            </button>
          ))}
        </div>
        <div className="data-card overview__chart-card">
          <h3 className="overview__chart-title">Resource utilisation</h3>
          <UtilisationChart samples={samples} />
          <p className="overview__chart-caption">
            Window: Last {hours} hours, sampled{' '}
            {intervalMinutes === 60 ? 'hourly' : `every ${intervalMinutes} mins`}.{' '}
            All values simulated.
          </p>
        </div>
      </section>

      <hr className="sep sep--tight" />

      {/* Active workloads — compact list */}
      <section className="overview__workloads" aria-label="Active workloads">
        <div className="overview__section-header">
          <h3 className="overview__section-title">Active workloads</h3>
          <a href="#/workloads" className="overview__section-link">
            View all →
          </a>
        </div>
        {activeWorkloads.length > 0 ? (
          <div className="table-wrap">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Workload</th>
                  <th>State</th>
                  <th>Resources</th>
                  <th>Started</th>
                </tr>
              </thead>
              <tbody>
                {activeWorkloads.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <span className="data-mono">{w.id}</span>{' '}
                      {w.name}
                    </td>
                    <td>
                      <span
                        className={`status ${
                          w.state === 'running' ? 'status--ok' : 'status--neutral'
                        }`}
                      >
                        {w.state}
                      </span>
                    </td>
                    <td className="data-mono">
                      {w.resources.cpuRequest} vCPU /{' '}
                      {w.resources.memoryRequestGB} GB
                    </td>
                    <td className="data-mono">
                      {w.startedAt ? formatTime(w.startedAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="overview__empty">No active workloads.</p>
        )}
      </section>

      <hr className="sep sep--tight" />

      {/* Recent activity — notable system events */}
      <section className="overview__activity" aria-label="Recent activity">
        <div className="overview__section-header">
          <h3 className="overview__section-title">Recent activity</h3>
          <a href="#/activity" className="overview__section-link">
            View all →
          </a>
        </div>
        <div className="activity-list">
          {recentActivity.map((event) => (
            <div key={event.id} className="activity-list__item">
              <span className="data-mono activity-list__time">
                {formatTime(event.timestamp)}
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

      <hr className="sep sep--tight" />

      {/* Quick links — functional navigation to related pages */}
      <section className="overview__links" aria-label="Quick links">
        <h2 className="visually-hidden">Quick links</h2>
        <div className="control-group overview__links-group">
          <a href="#/compute" className="btn btn--secondary">
            Compute
          </a>
          <a href="#/workloads" className="btn btn--secondary">
            Workloads
          </a>
          <a href="#/activity" className="btn btn--secondary">
            Activity
          </a>
        </div>
      </section>
    </div>
  );
}

export default Overview;
