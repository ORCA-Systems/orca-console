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
