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

// Chronological (oldest first). Each event describes a simulated lifecycle
// change, readiness signal, resource warning or configuration change.
export const ACTIVITY: ActivityEvent[] = [
  {
    id: 'evt-001',
    timestamp: '2026-11-21T05:35:00Z',
    severity: 'info',
    source: 'config',
    message: 'Node orca-node-01 registered with the console',
    detail:
      'Registration imported the node inventory: 2 CPU sockets, 256 GB of memory and 4 accelerators.',
  },
  {
    id: 'evt-002',
    timestamp: '2026-11-21T05:40:00Z',
    severity: 'info',
    source: 'node-01',
    message: 'Node passed startup health checks',
    detail:
      'Both CPU sockets, the memory modules and all four accelerators reported healthy.',
  },
  {
    id: 'evt-003',
    timestamp: '2026-11-21T05:52:00Z',
    severity: 'success',
    source: 'node-01',
    message: 'Node marked ready for scheduling',
    detail:
      'Readiness probes completed, so the scheduler began assigning workloads to node-01.',
  },
  {
    id: 'evt-004',
    timestamp: '2026-11-21T06:00:00Z',
    severity: 'info',
    source: 'scheduler',
    message: 'Workload wk-101 submitted for scheduling',
    detail: 'Requested 8 vCPU, 32 GB of memory and 2 GPUs.',
    workloadId: 'wk-101',
  },
  {
    id: 'evt-005',
    timestamp: '2026-11-21T06:00:00Z',
    severity: 'info',
    source: 'scheduler',
    message: 'Workload wk-102 submitted for scheduling',
    detail: 'Requested 4 vCPU, 16 GB of memory and 1 GPU.',
    workloadId: 'wk-102',
  },
  {
    id: 'evt-006',
    timestamp: '2026-11-21T06:00:00Z',
    severity: 'info',
    source: 'scheduler',
    message: 'Workload wk-104 submitted for scheduling',
    detail: 'Requested 4 vCPU, 16 GB of memory and 1 GPU.',
    workloadId: 'wk-104',
  },
  {
    id: 'evt-007',
    timestamp: '2026-11-21T06:15:00Z',
    severity: 'info',
    source: 'node-01',
    message: 'Workload wk-101 started',
    detail: 'Allocated 8 vCPU, 32 GB of memory and 2 GPUs on node-01.',
    workloadId: 'wk-101',
  },
  {
    id: 'evt-008',
    timestamp: '2026-11-21T06:30:00Z',
    severity: 'info',
    source: 'node-01',
    message: 'Workload wk-102 started',
    detail: 'Allocated 4 vCPU, 16 GB of memory and 1 GPU on node-01.',
    workloadId: 'wk-102',
  },
  {
    id: 'evt-009',
    timestamp: '2026-11-21T07:00:00Z',
    severity: 'info',
    source: 'node-01',
    message: 'Workload wk-104 started',
    detail: 'Allocated 4 vCPU, 16 GB of memory and 1 GPU on node-01.',
    workloadId: 'wk-104',
  },
  {
    id: 'evt-010',
    timestamp: '2026-11-21T07:22:00Z',
    severity: 'error',
    source: 'node-01',
    message: 'Workload wk-104 failed: exit code 137 (OOM)',
    detail:
      'The container exceeded its 32 GB memory limit during validation and was terminated by the kubelet.',
    workloadId: 'wk-104',
  },
  {
    id: 'evt-011',
    timestamp: '2026-11-21T09:10:00Z',
    severity: 'info',
    source: 'config',
    message: 'Log retention set to 24 hours',
    detail:
      'Configuration change: synthetic log entries older than 24 hours are now discarded.',
  },
  {
    id: 'evt-012',
    timestamp: '2026-11-21T09:40:00Z',
    severity: 'warning',
    source: 'node-01',
    message: 'Accelerator acc-03 clock reduced to 90%',
    detail:
      'Thermal headroom fell below the configured threshold. The device remains available at a reduced clock.',
  },
  {
    id: 'evt-013',
    timestamp: '2026-11-21T09:45:00Z',
    severity: 'info',
    source: 'config',
    message: 'Console auto-refresh interval set to 30 seconds',
    detail: 'Configuration change: the console now re-reads simulated data every 30 seconds.',
  },
  {
    id: 'evt-014',
    timestamp: '2026-11-21T10:45:00Z',
    severity: 'success',
    source: 'node-01',
    message: 'Workload wk-102 completed successfully',
    detail: 'Finished in 4h 15m. Its 4 vCPU, 16 GB and 1 GPU were released back to node-01.',
    workloadId: 'wk-102',
  },
  {
    id: 'evt-015',
    timestamp: '2026-11-21T11:00:00Z',
    severity: 'info',
    source: 'scheduler',
    message: 'Workload wk-103 queued; awaiting 2 vCPU',
    detail:
      'The scheduler is holding wk-103 until enough CPU and memory are free on node-01.',
    workloadId: 'wk-103',
  },
  {
    id: 'evt-016',
    timestamp: '2026-11-21T11:05:00Z',
    severity: 'warning',
    source: 'node-01',
    message: 'Memory utilisation above 80%',
    detail:
      'node-01 has sustained memory use above the 80% warning threshold for five minutes.',
  },
  {
    id: 'evt-017',
    timestamp: '2026-11-21T11:20:00Z',
    severity: 'success',
    source: 'node-01',
    message: 'Memory utilisation returned below 75%',
    detail: 'Memory pressure cleared; no workloads were evicted.',
  },
  {
    id: 'evt-018',
    timestamp: '2026-11-21T11:50:00Z',
    severity: 'info',
    source: 'scheduler',
    message: 'Workload wk-103 still pending',
    detail:
      'No capacity change yet. The scheduler will re-evaluate the queue on its next cycle.',
    workloadId: 'wk-103',
  },
];

/* ---------- Synthetic log entries ----------

   Lines are linked to the activity event that produced them, so the
   Activity page can show the log context for a single event. Timestamps
   stay within the event's minute.
*/
export const LOGS: LogEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-11-21T05:35:10Z',
    level: 'info',
    component: 'registry',
    message: 'Added node-01 (orca-node-01) to the node inventory',
    eventId: 'evt-001',
  },
  {
    id: 'log-002',
    timestamp: '2026-11-21T05:40:02Z',
    level: 'info',
    component: 'node-01',
    message: 'cpu0, cpu1 online; 256 GiB memory detected',
    eventId: 'evt-002',
  },
  {
    id: 'log-003',
    timestamp: '2026-11-21T05:40:06Z',
    level: 'info',
    component: 'node-01',
    message: 'acc-01..acc-04 present; accelerator driver ready',
    eventId: 'evt-002',
  },
  {
    id: 'log-004',
    timestamp: '2026-11-21T05:52:00Z',
    level: 'info',
    component: 'kubelet',
    message: 'node-01 status changed: NotReady -> Ready',
    eventId: 'evt-003',
  },
  {
    id: 'log-005',
    timestamp: '2026-11-21T06:15:03Z',
    level: 'info',
    component: 'scheduler',
    message: 'Bound wk-101 to node-01 (8 vCPU, 32Gi, 2 GPU)',
    eventId: 'evt-007',
  },
  {
    id: 'log-006',
    timestamp: '2026-11-21T06:30:01Z',
    level: 'info',
    component: 'scheduler',
    message: 'Bound wk-102 to node-01 (4 vCPU, 16Gi, 1 GPU)',
    eventId: 'evt-008',
  },
  {
    id: 'log-007',
    timestamp: '2026-11-21T07:00:02Z',
    level: 'info',
    component: 'scheduler',
    message: 'Bound wk-104 to node-01 (4 vCPU, 16Gi, 1 GPU)',
    eventId: 'evt-009',
  },
  {
    id: 'log-008',
    timestamp: '2026-11-21T07:21:58Z',
    level: 'warn',
    component: 'kubelet',
    message: 'Pod wk-104-container memory usage 31.6Gi; limit 32Gi',
    eventId: 'evt-010',
  },
  {
    id: 'log-009',
    timestamp: '2026-11-21T07:22:01Z',
    level: 'error',
    component: 'kubelet',
    message: 'Pod wk-104-container OOMKilled (exit code 137)',
    eventId: 'evt-010',
  },
  {
    id: 'log-010',
    timestamp: '2026-11-21T07:22:04Z',
    level: 'info',
    component: 'node-01',
    message: 'Released 4 vCPU, 16Gi and 1 GPU from wk-104',
    eventId: 'evt-010',
  },
  {
    id: 'log-011',
    timestamp: '2026-11-21T09:10:00Z',
    level: 'info',
    component: 'config',
    message: 'settings.logRetentionHours = 24',
    eventId: 'evt-011',
  },
  {
    id: 'log-012',
    timestamp: '2026-11-21T09:40:12Z',
    level: 'warn',
    component: 'node-01',
    message: 'acc-03 thermal headroom 4C; clock limited to 90%',
    eventId: 'evt-012',
  },
  {
    id: 'log-013',
    timestamp: '2026-11-21T09:45:00Z',
    level: 'info',
    component: 'config',
    message: 'settings.autoRefreshSeconds = 30',
    eventId: 'evt-013',
  },
  {
    id: 'log-014',
    timestamp: '2026-11-21T10:45:00Z',
    level: 'info',
    component: 'kubelet',
    message: 'Pod wk-102-container terminated with exit code 0',
    eventId: 'evt-014',
  },
  {
    id: 'log-015',
    timestamp: '2026-11-21T10:45:02Z',
    level: 'info',
    component: 'scheduler',
    message: 'Workload wk-102 completed; released 4 vCPU, 16Gi, 1 GPU',
    eventId: 'evt-014',
  },
  {
    id: 'log-016',
    timestamp: '2026-11-21T11:00:00Z',
    level: 'info',
    component: 'scheduler',
    message: 'Scheduling request wk-103 queued (2 vCPU, 8Gi requested)',
    eventId: 'evt-015',
  },
  {
    id: 'log-017',
    timestamp: '2026-11-21T11:05:00Z',
    level: 'warn',
    component: 'node-01',
    message: 'memory.available 18.7% (warning threshold 20%)',
    eventId: 'evt-016',
  },
  {
    id: 'log-018',
    timestamp: '2026-11-21T11:20:00Z',
    level: 'info',
    component: 'node-01',
    message: 'memory.available 26.4%; pressure cleared',
    eventId: 'evt-017',
  },
  {
    id: 'log-019',
    timestamp: '2026-11-21T11:50:00Z',
    level: 'info',
    component: 'scheduler',
    message: 'wk-103 remains queued; insufficient free vCPU on node-01',
    eventId: 'evt-018',
  },
  {
    id: 'log-020',
    timestamp: '2026-11-21T11:50:01Z',
    level: 'debug',
    component: 'scheduler',
    message: 'Next scheduling evaluation in 30s',
    eventId: 'evt-018',
  },
];

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
