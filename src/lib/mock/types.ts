// Strict TypeScript types for the Orca Console mock data foundation.
// All data is fictional and clearly distinguishable from real hardware telemetry.

/* ---------- Compute node ---------- */

export type NodeStatus = 'operational' | 'degraded' | 'maintenance' | 'offline';

export interface Node {
  id: string;
  name: string;
  status: NodeStatus;
  location: string;
  provisionedAt: string; // ISO 8601 timestamp
}

/* ---------- Compute devices ---------- */

export interface Cpu {
  id: string;
  socket: number;
  cores: number;
  threads: number;
  model: string;
  baseClockGHz: number;
}

export interface Memory {
  id: string;
  capacityGB: number;
  type: string; // e.g. "DDR5-4800"
  channels: number;
}

export type AcceleratorType = 'gpu' | 'tpu' | 'npu' | 'fpga';

export interface Accelerator {
  id: string;
  name: string;
  type: AcceleratorType;
  vendor: string;
  memoryGB: number;
  pcie: string;
}

export interface NodeDevices {
  cpus: Cpu[];
  memory: Memory[];
  accelerators: Accelerator[];
}

/* ---------- Utilisation samples ---------- */

export interface UtilisationSample {
  timestamp: string; // ISO 8601 timestamp
  cpuPercent: number;      // 0-100
  memoryPercent: number;   // 0-100
  acceleratorPercent: number; // 0-100
  powerWatts: number;
}

/* ---------- Workloads ---------- */

export type WorkloadState = 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface WorkloadResources {
  cpuRequest: number;      // vCPU cores
  cpuLimit: number;        // vCPU cores
  memoryRequestGB: number;
  memoryLimitGB: number;
  acceleratorRequest: number;
  acceleratorTypes: AcceleratorType[];
}

export interface Workload {
  id: string;
  name: string;
  state: WorkloadState;
  resources: WorkloadResources;
  submittedAt: string;     // ISO 8601 timestamp
  startedAt?: string;      // ISO 8601 timestamp
  completedAt?: string;    // ISO 8601 timestamp
  nodeId: string;
}

/* ---------- Activity events & logs ---------- */

export type ActivitySeverity = 'info' | 'success' | 'warning' | 'error';

export interface ActivityEvent {
  id: string;
  timestamp: string; // ISO 8601 timestamp
  severity: ActivitySeverity;
  source: string; // e.g. "node-01", "scheduler", "config"
  message: string;
  detail?: string; // longer context shown in the expanded event view
  workloadId?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string; // ISO 8601 timestamp
  level: LogLevel;
  component: string;
  message: string;
  eventId?: string; // activity event these lines were recorded for
}

/* ---------- Demonstration settings ---------- */

export interface DemoSettings {
  simulatedLatencyMs: number;
  autoRefreshSeconds: number;
  theme: 'light' | 'dark';
  dataRetentionHours: number;
}

/* ---------- Root container ---------- */

export interface MockData {
  node: Node;
  devices: NodeDevices;
  utilisationHistory: UtilisationSample[];
  workloads: Workload[];
  activity: ActivityEvent[];
  logs: LogEntry[];
  settings: DemoSettings;
}
