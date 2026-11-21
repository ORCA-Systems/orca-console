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
  ActivityEvent,
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

/* ---------- Activity & logs ---------- */

export function getActivity(limit?: number): ActivityEvent[] {
  const events = MOCK_DATA.activity;
  return limit ? events.slice(-limit) : events;
}

export function getLogs(limit?: number): LogEntry[] {
  const logs = MOCK_DATA.logs;
  return limit ? logs.slice(-limit) : logs;
}

/* ---------- Settings ---------- */

export function getSettings(): DemoSettings {
  return MOCK_DATA.settings;
}
