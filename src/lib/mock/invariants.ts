// Data invariant checks for the Orca Console mock dataset.
//
// These functions verify internal consistency of the mock data so it
// remains distinguishable from real telemetry and safe to display:
//   - utilisation values stay within 0-100 bounds
//   - all workloads reference the single mock node
//   - workload states agree with their timestamps
//   - resource requests never exceed limits
//   - activity events reference only known workloads
//
// They return an array of human-readable violation messages. An empty
// array means all invariants hold. Import and call these from a test file
// or a one-off validation script; no test runner is required to use them.

import type { MockData } from './types';
import { MOCK_DATA } from './data';

/* ---------- Individual checks ---------- */

function checkUtilisationBounds(data: MockData): string[] {
  const violations: string[] = [];
  data.utilisationHistory.forEach((sample) => {
    if (sample.cpuPercent < 0 || sample.cpuPercent > 100) {
      violations.push(
        `Utilisation sample ${sample.timestamp}: cpuPercent ${sample.cpuPercent} out of 0-100 range`
      );
    }
    if (sample.memoryPercent < 0 || sample.memoryPercent > 100) {
      violations.push(
        `Utilisation sample ${sample.timestamp}: memoryPercent ${sample.memoryPercent} out of 0-100 range`
      );
    }
    if (
      sample.acceleratorPercent < 0 ||
      sample.acceleratorPercent > 100
    ) {
      violations.push(
        `Utilisation sample ${sample.timestamp}: acceleratorPercent ${sample.acceleratorPercent} out of 0-100 range`
      );
    }
  });
  return violations;
}

function checkWorkloadNodeReference(data: MockData): string[] {
  const violations: string[] = [];
  data.workloads.forEach((w) => {
    if (w.nodeId !== data.node.id) {
      violations.push(
        `Workload ${w.id} references nodeId ${w.nodeId}, expected ${data.node.id}`
      );
    }
  });
  return violations;
}

function checkWorkloadStateConsistency(data: MockData): string[] {
  const violations: string[] = [];
  data.workloads.forEach((w) => {
    const hasStarted = !!w.startedAt;
    const hasCompleted = !!w.completedAt;

    if (w.state === 'pending' && (hasStarted || hasCompleted)) {
      violations.push(
        `Workload ${w.id} is pending but has startedAt=${w.startedAt} completedAt=${w.completedAt}`
      );
    }
    if (w.state === 'running' && (!hasStarted || hasCompleted)) {
      violations.push(
        `Workload ${w.id} is running but startedAt=${w.startedAt} completedAt=${w.completedAt}`
      );
    }
    if (
      (w.state === 'succeeded' || w.state === 'failed' || w.state === 'cancelled') &&
      (!hasStarted || !hasCompleted)
    ) {
      violations.push(
        `Workload ${w.id} is ${w.state} but missing startedAt or completedAt`
      );
    }
  });
  return violations;
}

function checkResourceRequests(data: MockData): string[] {
  const violations: string[] = [];
  data.workloads.forEach((w) => {
    if (w.resources.cpuRequest > w.resources.cpuLimit) {
      violations.push(
        `Workload ${w.id}: cpuRequest ${w.resources.cpuRequest} exceeds cpuLimit ${w.resources.cpuLimit}`
      );
    }
    if (w.resources.memoryRequestGB > w.resources.memoryLimitGB) {
      violations.push(
        `Workload ${w.id}: memoryRequestGB ${w.resources.memoryRequestGB} exceeds memoryLimitGB ${w.resources.memoryLimitGB}`
      );
    }
    if (w.resources.acceleratorRequest < 0) {
      violations.push(
        `Workload ${w.id}: acceleratorRequest ${w.resources.acceleratorRequest} is negative`
      );
    }
  });
  return violations;
}

function checkActivityReferences(data: MockData): string[] {
  const violations: string[] = [];
  const workloadIds = new Set(data.workloads.map((w) => w.id));
  data.activity.forEach((e) => {
    if (e.workloadId !== undefined && !workloadIds.has(e.workloadId)) {
      violations.push(
        `Activity event ${e.id} references unknown workload ${e.workloadId}`
      );
    }
  });
  return violations;
}

function checkLogReferences(data: MockData): string[] {
  const violations: string[] = [];
  const eventIds = new Set(data.activity.map((e) => e.id));
  data.logs.forEach((log) => {
    if (log.eventId !== undefined && !eventIds.has(log.eventId)) {
      violations.push(
        `Log entry ${log.id} references unknown activity event ${log.eventId}`
      );
    }
  });
  return violations;
}

function checkTimestamps(data: MockData): string[] {
  const violations: string[] = [];
  const checkTs = (label: string, ts: string | undefined) => {
    if (ts !== undefined && isNaN(new Date(ts).getTime())) {
      violations.push(`${label}: invalid ISO timestamp "${ts}"`);
    }
  };

  data.workloads.forEach((w) => {
    checkTs(`Workload ${w.id}.submittedAt`, w.submittedAt);
    checkTs(`Workload ${w.id}.startedAt`, w.startedAt);
    checkTs(`Workload ${w.id}.completedAt`, w.completedAt);
  });
  data.activity.forEach((e) => {
    checkTs(`Activity ${e.id}.timestamp`, e.timestamp);
  });
  data.logs.forEach((l) => {
    checkTs(`Log ${l.id}.timestamp`, l.timestamp);
  });
  data.utilisationHistory.forEach((s) => {
    checkTs(`Utilisation sample`, s.timestamp);
  });

  return violations;
}

/* ---------- Aggregate validator ---------- */

export function validateInvariants(data: MockData = MOCK_DATA): string[] {
  return [
    ...checkUtilisationBounds(data),
    ...checkWorkloadNodeReference(data),
    ...checkWorkloadStateConsistency(data),
    ...checkResourceRequests(data),
    ...checkActivityReferences(data),
    ...checkLogReferences(data),
    ...checkTimestamps(data),
  ];
}

export function assertInvariants(data: MockData = MOCK_DATA): void {
  const violations = validateInvariants(data);
  if (violations.length > 0) {
    throw new Error(
      `Mock data invariant violations:\n  - ${violations.join('\n  - ')}`
    );
  }
}
