// Data access layer for the Orca Console mock data foundation.
//
// Every UI component that needs data imports from this file only. The raw
// dataset in src/lib/mock/data.ts is never imported directly by components.
// This single seam means a future Rust HTTP API can replace the mock
// implementation here without requiring any page to be rewritten.
//
// Functions are synchronous for this prototype; the seam stays the same
// regardless of how the data is fetched.

import type {
  Node,
  NodeDevices,
  UtilisationSample,
  Workload,
  WorkloadState,
  ActivityEvent,
  ActivitySeverity,
  LogEntry,
  DemoSettings,
} from './types';
import { MOCK_DATA } from './data';

/* ---------- Node ---------- */

export function getNode(): Node {
  return MOCK_DATA.node;
}

/* ---------- Devices ---------- */

export function getDevices(): NodeDevices {
  return MOCK_DATA.devices;
}

export function getCpus(): NodeDevices['cpus'] {
  return MOCK_DATA.devices.cpus;
}

export function getMemory(): NodeDevices['memory'] {
  return MOCK_DATA.devices.memory;
}

export function getAccelerators(): NodeDevices['accelerators'] {
  return MOCK_DATA.devices.accelerators;
}

export function getAcceleratorById(id: string): NodeDevices['accelerators'][number] | undefined {
  return MOCK_DATA.devices.accelerators.find((a) => a.id === id);
}

/* ---------- Utilisation ---------- */

export function getUtilisationHistory(limit?: number): UtilisationSample[] {
  const history = MOCK_DATA.utilisationHistory;
  return limit ? history.slice(-limit) : history;
}

export function getLatestUtilisation(): UtilisationSample | undefined {
  const history = MOCK_DATA.utilisationHistory;
  return history.length > 0 ? history[history.length - 1] : undefined;
}

/* ---------- Utilisation time windows ---------- */

export interface UtilisationWindow {
  samples: UtilisationSample[];
  intervalMinutes: number;
}

/* ---------- Utilisation time windows ---------- */

export interface UtilisationWindow {
  samples: UtilisationSample[];
  intervalMinutes: number;
}

// Anchor for every simulated window: 12:00 PM on 2026-11-21.
const NOW_MS = new Date('2026-11-21T12:00:00Z').getTime();

function windowSample(timestampMs: number, windowId: string): UtilisationSample {
  const date = new Date(timestampMs);
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
  // Each window uses a distinct phase so its values are independent of the others.
  const phase = windowId === '6h' ? 0 : windowId === '12h' ? 2 : 4;
  const cpu = Math.round(
    55 + 18 * Math.sin(((hour + phase) / 24) * 2 * Math.PI) + Math.sin(hour * 0.9 + phase) * 5
  );
  const memory = Math.round(
    65 + 14 * Math.sin(((hour + phase) / 12) * Math.PI) + Math.cos(hour * 0.6 + phase) * 4
  );
  return {
    timestamp: new Date(timestampMs).toISOString(),
    cpuPercent: Math.min(75, Math.max(35, cpu)),
    memoryPercent: Math.min(80, Math.max(50, memory)),
    acceleratorPercent: Math.round(40 + 25 * Math.sin((hour / 12) * Math.PI)),
    powerWatts: Math.round(350 + 80 * Math.sin((hour / 8) * Math.PI)),
  };
}

export function getUtilisationWindow(hours: number): UtilisationWindow {
  const intervalMinutes = hours <= 6 ? 15 : hours <= 12 ? 30 : 60;
  const stepMs = intervalMinutes * 60 * 1000;
  const endTime = NOW_MS;
  const startTime = endTime - hours * 3600 * 1000;
  const count = (hours * 60) / intervalMinutes + 1;
  const windowId = `${hours}h`;
  const samples: UtilisationSample[] = [];
  for (let i = 0; i < count; i++) {
    samples.push(windowSample(startTime + i * stepMs, windowId));
  }
  return { samples, intervalMinutes };
}

/* ---------- Workloads ---------- */

export function getWorkloads(): Workload[] {
  return MOCK_DATA.workloads;
}

export function getWorkload(id: string): Workload | undefined {
  return MOCK_DATA.workloads.find((w) => w.id === id);
}

export function getWorkloadsByState(state: Workload['state']): Workload[] {
  return MOCK_DATA.workloads.filter((w) => w.state === state);
}

/* ---------- Workload actions (local simulation only) ----------

   Actions mutate the shared mock dataset so a state change survives
   navigating between pages, and every successful action appends an entry to
   the shared activity feed. Nothing here starts, stops or retries a real job.

   The simulated clock starts where the mock dataset ends, so generated
   timestamps stay after every seeded event and runtime totals stay sensible.
*/

export type WorkloadAction = 'start' | 'stop' | 'retry';

const ALLOWED_WORKLOAD_ACTIONS: Record<WorkloadState, WorkloadAction[]> = {
  pending: ['start'],
  running: ['stop'],
  failed: ['retry'],
  succeeded: [],
  cancelled: ['start'],
};

const SIMULATION_START_MS = new Date('2026-11-21T12:00:00Z').getTime();
let simulationClockMs = SIMULATION_START_MS;

/** Current simulated time, used to calculate runtimes in the UI. */
export function getSimulationNow(): string {
  return new Date(simulationClockMs).toISOString();
}

function advanceSimulationClock(): string {
  simulationClockMs += 60 * 1000;
  return new Date(simulationClockMs).toISOString();
}

export function getAvailableWorkloadActions(
  state: WorkloadState
): WorkloadAction[] {
  return ALLOWED_WORKLOAD_ACTIONS[state];
}

/** Returns an explanation when the action is not valid, otherwise null. */
export function checkWorkloadAction(
  workload: Workload,
  action: WorkloadAction
): string | null {
  if (getAvailableWorkloadActions(workload.state).includes(action)) {
    return null;
  }
  const label = workload.state.charAt(0).toUpperCase() + workload.state.slice(1);
  return `Cannot ${action} ${workload.id}: ${workload.name} is ${label.toLowerCase()}.`;
}

export interface WorkloadActionResult {
  ok: boolean;
  workload: Workload | null;
  message: string;
}

/**
 * Applies a start, stop or retry transition to a workload in the shared mock
 * dataset. Invalid transitions return ok: false and change nothing.
 */
export function applyWorkloadAction(
  id: string,
  action: WorkloadAction
): WorkloadActionResult {
  const workload = MOCK_DATA.workloads.find((w) => w.id === id);
  if (!workload) {
    return { ok: false, workload: null, message: `Unknown workload ${id}.` };
  }

  const blocked = checkWorkloadAction(workload, action);
  if (blocked) {
    return { ok: false, workload, message: blocked };
  }

  const timestamp = advanceSimulationClock();
  let next: Workload;
  let message: string;
  let activityMessage: string;
  let activityDetail: string;
  let activitySeverity: ActivitySeverity;
  let logMessage: string;
  let logLevel: LogEntry['level'];

  switch (action) {
    case 'start':
      next = {
        ...workload,
        state: 'running',
        startedAt: timestamp,
        completedAt: undefined,
      };
      message = `Started ${workload.id} — marked running (simulated).`;
      activityMessage = `Workload ${workload.id} started from the console`;
      activityDetail = `${workload.name} was marked running in the local prototype. No container was launched.`;
      activitySeverity = 'success';
      logMessage = `Simulated start: ${workload.id} marked running; no runtime was created`;
      logLevel = 'info';
      break;
    case 'stop':
      next = { ...workload, state: 'cancelled', completedAt: timestamp };
      message = `Stopped ${workload.id} — marked cancelled (simulated).`;
      activityMessage = `Workload ${workload.id} stopped from the console`;
      activityDetail = `${workload.name} was marked cancelled and its simulated resources were released. No container was stopped.`;
      activitySeverity = 'warning';
      logMessage = `Simulated stop: ${workload.id} marked cancelled; resources released locally`;
      logLevel = 'warn';
      break;
    case 'retry':
      next = {
        ...workload,
        state: 'pending',
        submittedAt: timestamp,
        startedAt: undefined,
        completedAt: undefined,
      };
      message = `Retried ${workload.id} — re-queued as pending (simulated).`;
      activityMessage = `Workload ${workload.id} retried and re-queued`;
      activityDetail = `${workload.name} returned to the pending queue. No job was resubmitted to a real scheduler.`;
      activitySeverity = 'info';
      logMessage = `Simulated retry: ${workload.id} re-queued as pending`;
      logLevel = 'info';
      break;
  }

  MOCK_DATA.workloads = MOCK_DATA.workloads.map((w) =>
    w.id === id ? next : w
  );

  const event = appendActivity({
    timestamp,
    severity: activitySeverity,
    source: 'console',
    message: activityMessage,
    detail: activityDetail,
    workloadId: id,
  });

  appendLog({
    timestamp,
    level: logLevel,
    component: 'console',
    message: logMessage,
    eventId: event.id,
  });

  return { ok: true, workload: next, message };
}

/* ---------- Activity writes (local simulation only) ----------

   The prototype keeps every mutation in the browser. appendActivity lets a
   page record an outcome into the shared activity feed so the Activity page
   (and any future consumer of the access layer) sees it.
*/

let localActivityCounter = 0;

export function appendActivity(event: Omit<ActivityEvent, 'id'>): ActivityEvent {
  localActivityCounter += 1;
  const entry: ActivityEvent = {
    id: `evt-local-${localActivityCounter}`,
    ...event,
  };
  MOCK_DATA.activity.push(entry);
  return entry;
}

let localLogCounter = 0;

export function appendLog(entry: Omit<LogEntry, 'id'>): LogEntry {
  localLogCounter += 1;
  const log: LogEntry = { id: `log-local-${localLogCounter}`, ...entry };
  MOCK_DATA.logs.push(log);
  return log;
}

/* ---------- Activity & logs ---------- */
export function getActivity(limit?: number): ActivityEvent[] {
  const events = MOCK_DATA.activity;
  return limit ? events.slice(-limit) : events;
}

export function getLogs(limit?: number): LogEntry[] {
  const logs = MOCK_DATA.logs;
  return limit ? logs.slice(-limit) : logs;
}

/** Log lines recorded for one activity event, oldest first. */
export function getLogsForEvent(eventId: string): LogEntry[] {
  return MOCK_DATA.logs.filter((log) => log.eventId === eventId);
}

/* ---------- Settings ---------- */

export function getSettings(): DemoSettings {
  return MOCK_DATA.settings;
}
