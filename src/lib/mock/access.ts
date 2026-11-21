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

function interpolateBetween(
  a: UtilisationSample,
  b: UtilisationSample,
  intervalMinutes: number
): UtilisationSample[] {
  const stepMs = intervalMinutes * 60 * 1000;
  const aTime = new Date(a.timestamp).getTime();
  const bTime = new Date(b.timestamp).getTime();
  const out: UtilisationSample[] = [];
  let t = aTime;
  while (t < bTime) {
    const ratio = (t - aTime) / (bTime - aTime);
    out.push({
      timestamp: new Date(t).toISOString(),
      cpuPercent: Math.round(a.cpuPercent + (b.cpuPercent - a.cpuPercent) * ratio),
      memoryPercent: Math.round(a.memoryPercent + (b.memoryPercent - a.memoryPercent) * ratio),
      acceleratorPercent: Math.round(
        a.acceleratorPercent + (b.acceleratorPercent - a.acceleratorPercent) * ratio
      ),
      powerWatts: Math.round(a.powerWatts + (b.powerWatts - a.powerWatts) * ratio),
    });
    t += stepMs;
  }
  return out;
}

export function getUtilisationWindow(hours: number): UtilisationWindow {
  const history = MOCK_DATA.utilisationHistory;
  const latestTime = new Date(history[history.length - 1].timestamp).getTime();
  const cutoff = latestTime - hours * 3600 * 1000;
  const windowSamples = history.filter(
    (s) => new Date(s.timestamp).getTime() >= cutoff
  );

  const intervalMinutes = hours <= 6 ? 15 : hours <= 12 ? 30 : 60;
  if (intervalMinutes >= 60 || windowSamples.length < 2) {
    return { samples: windowSamples, intervalMinutes };
  }

  const interpolated: UtilisationSample[] = [];
  for (let i = 0; i < windowSamples.length - 1; i++) {
    interpolated.push(
      ...interpolateBetween(windowSamples[i], windowSamples[i + 1], intervalMinutes)
    );
  }
  interpolated.push(windowSamples[windowSamples.length - 1]);
  return { samples: interpolated, intervalMinutes };
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
