// Centralised mock dataset for the Orca Console prototype.
// All values are fictional and internally consistent:
//   - utilisation values stay within sensible 0-100 bounds
//   - device names match across pages (single source of truth)
//   - workload states agree with their timestamps and events
//
// This is the only file that holds raw mock values. Consumers must use
// the access layer in src/lib/mock/access.ts.

import type {
  MockData,
  Node,
  NodeDevices,
  Cpu,
  Memory,
  Accelerator,
  UtilisationSample,
  Workload,
  ActivityEvent,
  LogEntry,
  DemoSettings,
} from './types';

const NODE_ID = 'node-01';

/* ---------- Node ---------- */

export const NODE: Node = {
  id: NODE_ID,
  name: 'orca-node-01',
  status: 'operational',
  location: 'Rack A, Row 3',
  provisionedAt: '2026-01-15T08:00:00Z',
};

/* ---------- Devices ---------- */

export const CPUS: Cpu[] = [
  {
    id: 'cpu-01',
    socket: 0,
    cores: 32,
    threads: 64,
    model: 'Intel Xeon Platinum 8480+',
    baseClockGHz: 2.0,
  },
  {
    id: 'cpu-02',
    socket: 1,
    cores: 32,
    threads: 64,
    model: 'Intel Xeon Platinum 8480+',
    baseClockGHz: 2.0,
  },
];

export const MEMORY: Memory[] = [
  {
    id: 'mem-01',
    capacityGB: 256,
    type: 'DDR5-4800',
    channels: 8,
  },
];

export const ACCELERATORS: Accelerator[] = [
  {
    id: 'acc-01',
    name: 'Orca X100',
    type: 'gpu',
    vendor: 'Orca Systems',
    memoryGB: 80,
    pcie: 'PCIe 5.0 x16',
  },
  {
    id: 'acc-02',
    name: 'Orca X100',
    type: 'gpu',
    vendor: 'Orca Systems',
    memoryGB: 80,
    pcie: 'PCIe 5.0 x16',
  },
  {
    id: 'acc-03',
    name: 'Orca X100',
    type: 'gpu',
    vendor: 'Orca Systems',
    memoryGB: 80,
    pcie: 'PCIe 5.0 x16',
  },
  {
    id: 'acc-04',
    name: 'Orca X100',
    type: 'gpu',
    vendor: 'Orca Systems',
    memoryGB: 80,
    pcie: 'PCIe 5.0 x16',
  },
];

export const DEVICES: NodeDevices = {
  cpus: CPUS,
  memory: MEMORY,
  accelerators: ACCELERATORS,
};

/* ---------- Utilisation history (last 24 hours, hourly) ---------- */

const now = new Date('2026-11-21T12:00:00Z');

function iso(offsetHours: number): string {
  return new Date(now.getTime() + offsetHours * 3600 * 1000).toISOString();
}

// Deterministic pseudo-random values in sensible bounds, no spikes or noise.
function utilSample(offsetHours: number): UtilisationSample {
  const hour = ((offsetHours % 24) + 24) % 24;
  // Gentle sine waves with modest jitter so utilisation stays within realistic bounds.
  const cpu = Math.round(55 + 18 * Math.sin((hour / 24) * 2 * Math.PI) + Math.sin(hour * 0.7) * 4);
  const memory = Math.round(65 + 14 * Math.sin((hour / 12) * Math.PI) + Math.cos(hour * 0.5) * 3);
  return {
    timestamp: iso(-offsetHours),
    cpuPercent: Math.min(75, Math.max(35, cpu)),
    memoryPercent: Math.min(80, Math.max(50, memory)),
    acceleratorPercent: Math.round(40 + 25 * Math.sin((hour / 12) * Math.PI)),
    powerWatts: Math.round(350 + 80 * Math.sin((hour / 8) * Math.PI)),
  };
}

export const UTILISATION_HISTORY: UtilisationSample[] = Array.from(
  { length: 25 },
  (_, i) => utilSample(-i)
).reverse(); // oldest first

/* ---------- Workloads ---------- */

const SUBMITTED = '2026-11-21T06:00:00Z';
const STARTED_101 = '2026-11-21T06:15:00Z';
const STARTED_102 = '2026-11-21T06:30:00Z';
const COMPLETED_102 = '2026-11-21T10:45:00Z';
const STARTED_104 = '2026-11-21T07:00:00Z';
const FAILED_104 = '2026-11-21T07:22:00Z';

export const WORKLOADS: Workload[] = [
  {
    id: 'wk-101',
    name: 'LLM Fine-tune (7B)',
    state: 'running',
    resources: {
      cpuRequest: 8,
      cpuLimit: 16,
      memoryRequestGB: 32,
      memoryLimitGB: 64,
      acceleratorRequest: 2,
      acceleratorTypes: ['gpu'],
    },
    submittedAt: SUBMITTED,
    startedAt: STARTED_101,
    nodeId: NODE_ID,
  },
  {
    id: 'wk-102',
    name: 'Batch Inference v2',
    state: 'succeeded',
    resources: {
      cpuRequest: 4,
      cpuLimit: 8,
      memoryRequestGB: 16,
      memoryLimitGB: 32,
      acceleratorRequest: 1,
      acceleratorTypes: ['gpu'],
    },
    submittedAt: SUBMITTED,
    startedAt: STARTED_102,
    completedAt: COMPLETED_102,
    nodeId: NODE_ID,
  },
  {
    id: 'wk-103',
    name: 'Data Preprocessing',
    state: 'pending',
    resources: {
      cpuRequest: 2,
      cpuLimit: 4,
      memoryRequestGB: 8,
      memoryLimitGB: 16,
      acceleratorRequest: 0,
      acceleratorTypes: [],
    },
    submittedAt: '2026-11-21T11:00:00Z',
    nodeId: NODE_ID,
  },
  {
    id: 'wk-104',
    name: 'Model Validation',
    state: 'failed',
    resources: {
      cpuRequest: 4,
      cpuLimit: 8,
      memoryRequestGB: 16,
      memoryLimitGB: 32,
      acceleratorRequest: 1,
      acceleratorTypes: ['gpu'],
    },
    submittedAt: SUBMITTED,
    startedAt: STARTED_104,
    completedAt: FAILED_104,
    nodeId: NODE_ID,
  },
] as const;

/* ---------- Activity events ---------- */

export const ACTIVITY: ActivityEvent[] = [
  {
    id: 'evt-001',
    timestamp: '2026-11-21T08:00:00Z',
    severity: 'info',
    source: 'scheduler',
    message: 'Workload wk-101 scheduled on node-01',
    workloadId: 'wk-101',
  },
  {
    id: 'evt-002',
    timestamp: '2026-11-21T08:05:00Z',
    severity: 'info',
    source: 'scheduler',
    message: 'Workload wk-102 scheduled on node-01',
    workloadId: 'wk-102',
  },
  {
    id: 'evt-003',
    timestamp: '2026-11-21T08:15:00Z',
    severity: 'info',
    source: 'node-01',
    message: 'Workload wk-101 started',
    workloadId: 'wk-101',
  },
  {
    id: 'evt-004',
    timestamp: '2026-11-21T08:30:00Z',
    severity: 'info',
    source: 'node-01',
    message: 'Workload wk-102 started',
    workloadId: 'wk-102',
  },
  {
    id: 'evt-005',
    timestamp: '2026-11-21T10:45:00Z',
    severity: 'info',
    source: 'node-01',
    message: 'Workload wk-102 completed successfully',
    workloadId: 'wk-102',
  },
  {
    id: 'evt-006',
    timestamp: '2026-11-21T11:00:00Z',
    severity: 'info',
    source: 'scheduler',
    message: 'Workload wk-103 queued (awaiting resources)',
    workloadId: 'wk-103',
  },
  {
    id: 'evt-007',
    timestamp: '2026-11-21T11:05:00Z',
    severity: 'warning',
    source: 'node-01',
    message: 'Memory utilisation above 80%',
  },
  {
    id: 'evt-008',
    timestamp: '2026-11-21T11:15:00Z',
    severity: 'error',
    source: 'node-01',
    message: 'Workload wk-104 failed: exit code 137 (OOM)',
    workloadId: 'wk-104',
  },
] as const;

/* ---------- Synthetic log entries ---------- */

export const LOGS: LogEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-11-21T11:50:00Z',
    level: 'info',
    component: 'scheduler',
    message: 'Received scheduling request for wk-103',
  },
  {
    id: 'log-002',
    timestamp: '2026-11-21T11:48:00Z',
    level: 'info',
    component: 'kubelet',
    message: 'Pod wk-101-container healthy on node-01',
  },
  {
    id: 'log-003',
    timestamp: '2026-11-21T11:45:00Z',
    level: 'debug',
    component: 'containerd',
    message: 'Pulling image orca-registry/internal/validation:latest',
  },
  {
    id: 'log-004',
    timestamp: '2026-11-21T11:42:00Z',
    level: 'warn',
    component: 'node-01',
    message: 'Memory pressure detected on socket 1',
  },
  {
    id: 'log-005',
    timestamp: '2026-11-21T11:40:00Z',
    level: 'error',
    component: 'kubelet',
    message: 'Pod wk-104-container OOMKilled',
  },
  {
    id: 'log-006',
    timestamp: '2026-11-21T11:38:00Z',
    level: 'info',
    component: 'scheduler',
    message: 'Workload wk-102 completed, releasing resources',
  },
] as const;

/* ---------- Demonstration settings ---------- */

export const SETTINGS: DemoSettings = {
  simulatedLatencyMs: 350,
  autoRefreshSeconds: 30,
  theme: 'light',
  dataRetentionHours: 24,
};

/* ---------- Root mock dataset ---------- */

export const MOCK_DATA: MockData = {
  node: NODE,
  devices: DEVICES,
  utilisationHistory: UTILISATION_HISTORY,
  workloads: WORKLOADS,
  activity: ACTIVITY,
  logs: LOGS,
  settings: SETTINGS,
};
