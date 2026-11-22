// Compute page — Orca Console
// Hardware specifications and resource availability for the fictional compute node.
// All data comes from the centralised mock-data access layer. No real hardware
// is probed; all values are simulated examples.

import { useState, useCallback } from 'react';
import {
  getNode,
  getCpus,
  getMemory,
  getAccelerators,
  getLatestUtilisation,
} from '../lib/mock/access';
import { DeviceDetailDrawer } from '../components/compute/DeviceDetailDrawer';
import type { NodeStatus, Accelerator } from '../lib/mock/types';

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

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function Compute() {
  const node = getNode();
  const cpus = getCpus();
  const memories = getMemory();
  const accelerators = getAccelerators();
  const latest = getLatestUtilisation();

  const [selectedDevice, setSelectedDevice] = useState<Accelerator | null>(null);

  const openDevice = useCallback((device: Accelerator) => {
    setSelectedDevice(device);
  }, []);
  const closeDevice = useCallback(() => {
    setSelectedDevice(null);
  }, []);

  const totalThreads = cpus.reduce((sum, c) => sum + c.threads, 0);
  const totalMemoryGB = memories.reduce((sum, m) => sum + m.capacityGB, 0);
  const totalAcceleratorMemoryGB = accelerators.reduce(
    (sum, a) => sum + a.memoryGB,
    0
  );

  const cpuPercent = latest?.cpuPercent ?? 0;
  const memoryPercent = latest?.memoryPercent ?? 0;
  const acceleratorPercent = latest?.acceleratorPercent ?? 0;
  const memoryUsedGB = Math.round((memoryPercent / 100) * totalMemoryGB);

  return (
    <div className="compute-page">
      {/* Page title and description */}
      <header className="compute__header">
        <span className="compute__kicker">Compute resources</span>
        <h2 className="compute__title">{node.name}</h2>
        <p className="compute__description">
          Hardware specifications and resource availability for{' '}
          <span className="data-mono">{node.name}</span>. All values are
          simulated for demonstration.
        </p>
      </header>

      <hr className="sep sep--tight" />

      {/* Node identification and overall status */}
      <section aria-label="Node identification">
        <div className="compute__section-header">
          <h3 className="compute__section-title">Node</h3>
        </div>
        <div className="compute__meta">
          <div className="compute__meta-item">
            <span className="compute__meta-label">Name</span>
            <span className="compute__meta-value data-mono">{node.name}</span>
          </div>
          <div className="compute__meta-item">
            <span className="compute__meta-label">ID</span>
            <span className="compute__meta-value data-mono">{node.id}</span>
          </div>
          <div className="compute__meta-item">
            <span className="compute__meta-label">Location</span>
            <span className="compute__meta-value">{node.location}</span>
          </div>
          <div className="compute__meta-item">
            <span className="compute__meta-label">Status</span>
            <span
              className={`status status--${statusVariant(node.status)}`}
            >
              {node.status}
            </span>
          </div>
          <div className="compute__meta-item">
            <span className="compute__meta-label">Provisioned</span>
            <span className="compute__meta-value">
              {formatDate(node.provisionedAt)}
            </span>
          </div>
        </div>
      </section>

      <hr className="sep" />

      {/* CPU information and utilisation */}
      <section aria-label="CPU">
        <div className="compute__section-header">
          <h3 className="compute__section-title">CPU</h3>
          <span className="compute__summary">
            {cpuPercent}% utilisation · {totalThreads} threads across{' '}
            {cpus.length} sockets
          </span>
        </div>
        <div className="table-wrap">
          <table className="table table--compact">
            <thead>
              <tr>
                <th>Socket</th>
                <th>Model</th>
                <th>Cores</th>
                <th>Threads</th>
                <th>Base clock</th>
              </tr>
            </thead>
            <tbody>
              {cpus.map((cpu) => (
                <tr key={cpu.id}>
                  <td className="data-mono">{cpu.socket}</td>
                  <td>{cpu.model}</td>
                  <td className="data-mono">{cpu.cores}</td>
                  <td className="data-mono">{cpu.threads}</td>
                  <td className="data-mono">{cpu.baseClockGHz} GHz</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="sep" />

      {/* System memory capacity and usage */}
      <section aria-label="Memory">
        <div className="compute__section-header">
          <h3 className="compute__section-title">Memory</h3>
          <span className="compute__summary">
            {memoryPercent}% used · {memoryUsedGB} GB of {totalMemoryGB} GB
          </span>
        </div>
        <div className="table-wrap">
          <table className="table table--compact">
            <thead>
              <tr>
                <th>ID</th>
                <th>Capacity</th>
                <th>Type</th>
                <th>Channels</th>
              </tr>
            </thead>
            <tbody>
              {memories.map((mem) => (
                <tr key={mem.id}>
                  <td className="data-mono">{mem.id}</td>
                  <td className="data-mono">{mem.capacityGB} GB</td>
                  <td>{mem.type}</td>
                  <td className="data-mono">{mem.channels}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="sep" />

      {/* Available accelerator devices and their status */}
      <section aria-label="Accelerators">
        <div className="compute__section-header">
          <h3 className="compute__section-title">Accelerators</h3>
          <span className="compute__summary">
            {acceleratorPercent}% utilisation · {accelerators.length} ×{' '}
            {accelerators[0]?.name ?? 'accelerator'} ({totalAcceleratorMemoryGB} GB total)
          </span>
        </div>
        <div className="table-wrap">
          <table className="table table--compact">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Vendor</th>
                <th>Memory</th>
                <th>PCIe</th>
                <th>Status</th>
                <th className="compute__th-action">Detail</th>
              </tr>
            </thead>
            <tbody>
              {accelerators.map((device) => (
                <tr key={device.id}>
                  <td>
                    <span className="data-mono">{device.id}</span>{' '}
                    {device.name}
                  </td>
                  <td className="data-mono">{device.type}</td>
                  <td>{device.vendor}</td>
                  <td className="data-mono">{device.memoryGB} GB</td>
                  <td className="data-mono">{device.pcie}</td>
                  <td>
                    <span className="status status--ok">Operational</span>
                  </td>
                  <td className="compute__td-action">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => openDevice(device)}
                      aria-label={`View details for ${device.name}`}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="compute__caption">
          Utilisation is reported at node level. All specifications are
          simulated examples.
        </p>
      </section>

      <DeviceDetailDrawer
        open={selectedDevice !== null}
        onClose={closeDevice}
        title={`Device detail — ${selectedDevice?.name ?? ''}`}
      >
        {selectedDevice && (
          <div className="compute__kv">
            <div className="compute__kv-row">
              <span className="compute__kv-label">Name</span>
              <span className="compute__kv-value">{selectedDevice.name}</span>
            </div>
            <div className="compute__kv-row">
              <span className="compute__kv-label">ID</span>
              <span className="compute__kv-value data-mono">
                {selectedDevice.id}
              </span>
            </div>
            <div className="compute__kv-row">
              <span className="compute__kv-label">Type</span>
              <span className="compute__kv-value data-mono">
                {selectedDevice.type}
              </span>
            </div>
            <div className="compute__kv-row">
              <span className="compute__kv-label">Vendor</span>
              <span className="compute__kv-value">{selectedDevice.vendor}</span>
            </div>
            <div className="compute__kv-row">
              <span className="compute__kv-label">Status</span>
              <span className="status status--ok">Operational</span>
            </div>
            <div className="compute__kv-row">
              <span className="compute__kv-label">Memory capacity</span>
              <span className="compute__kv-value data-mono">
                {selectedDevice.memoryGB} GB
              </span>
            </div>
            <div className="compute__kv-row">
              <span className="compute__kv-label">PCIe</span>
              <span className="compute__kv-value data-mono">
                {selectedDevice.pcie}
              </span>
            </div>
            <div className="compute__kv-row">
              <span className="compute__kv-label">Accelerator utilisation</span>
              <span className="compute__kv-value data-mono">
                {acceleratorPercent}%
              </span>
            </div>
          </div>
        )}
      </DeviceDetailDrawer>
    </div>
  );
}

export default Compute;
