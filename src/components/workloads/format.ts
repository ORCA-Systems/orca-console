// Presentation helpers shared by the workload table and detail drawer.

import type {
  Workload,
  WorkloadResources,
  WorkloadState,
} from '../../lib/mock/types';
import type { WorkloadAction } from '../../lib/mock/access';

export type StateTone = 'ok' | 'warn' | 'error' | 'info' | 'muted';

export function stateLabel(state: WorkloadState): string {
  switch (state) {
    case 'pending':
      return 'Pending';
    case 'running':
      return 'Running';
    case 'succeeded':
      return 'Succeeded';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
  }
}

export function stateTone(state: WorkloadState): StateTone {
  switch (state) {
    case 'running':
      return 'info';
    case 'succeeded':
      return 'ok';
    case 'pending':
      return 'warn';
    case 'failed':
      return 'error';
    case 'cancelled':
      return 'muted';
  }
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/** Runtime between start and completion, or up to the simulated "now". */
export function getRuntimeLabel(workload: Workload, nowIso: string): string {
  if (!workload.startedAt) return '—';
  const started = new Date(workload.startedAt).getTime();
  const ended = workload.completedAt
    ? new Date(workload.completedAt).getTime()
    : new Date(nowIso).getTime();
  return formatDuration((ended - started) / 1000);
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatClock(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function summarizeResources(resources: WorkloadResources): string {
  const parts = [
    `${resources.cpuRequest} vCPU`,
    `${resources.memoryRequestGB} GB`,
  ];
  if (resources.acceleratorRequest > 0) {
    const kind = resources.acceleratorTypes.join('/') || 'accelerator';
    parts.push(`${resources.acceleratorRequest} × ${kind}`);
  }
  return parts.join(' · ');
}

export function actionLabel(action: WorkloadAction): string {
  switch (action) {
    case 'start':
      return 'Start';
    case 'stop':
      return 'Stop';
    case 'retry':
      return 'Retry';
  }
}
