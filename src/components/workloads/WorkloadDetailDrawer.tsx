// Workload detail drawer — Orca Console
// Shows one workload's specification and the actions that apply to its state.
// Every action is simulated locally; nothing runs on real hardware.

import { useEffect, useRef } from 'react';
import type { Workload } from '../../lib/mock/types';
import {
  getAvailableWorkloadActions,
  getSimulationNow,
  type WorkloadAction,
} from '../../lib/mock/access';
import {
  actionLabel,
  formatTimestamp,
  getRuntimeLabel,
  stateLabel,
  stateTone,
} from './format';

const ALL_ACTIONS: WorkloadAction[] = ['start', 'stop', 'retry'];

const FOCUSABLE_SELECTOR = [
  'button:not(:disabled)',
  'a[href]',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface WorkloadDetailDrawerProps {
  workload: Workload | null;
  feedback: { message: string; type: 'success' | 'error' } | null;
  onClose: () => void;
  onAction: (action: WorkloadAction) => void;
}

export function WorkloadDetailDrawer({
  workload,
  feedback,
  onClose,
  onAction,
}: WorkloadDetailDrawerProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = workload !== null;

  // Escape closes the drawer; focus moves in on open and returns on close.
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!workload) return null;

  const available = getAvailableWorkloadActions(workload.state);
  const now = getSimulationNow();
  const tone = stateTone(workload.state);

  return (
    <>
      <div className="workloads__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Workload detail — ${workload.name}`}
        className="workloads__drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="workloads__drawer-header">
          <div className="workloads__drawer-heading">
            <h2 className="workloads__drawer-title">{workload.name}</h2>
            <span className="data-mono workloads__drawer-id">{workload.id}</span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="btn btn--ghost btn--sm workloads__drawer-close"
            onClick={onClose}
            aria-label="Close workload detail"
          >
            ×
          </button>
        </div>

        <div className="workloads__drawer-content">
          <div className="workloads__kv">
            <div className="workloads__kv-row">
              <span className="workloads__kv-label">Status</span>
              <span className={`workloads__state workloads__state--${tone}`}>
                <span className="workloads__state-dot" aria-hidden="true" />
                {stateLabel(workload.state)}
              </span>
            </div>
            <div className="workloads__kv-row">
              <span className="workloads__kv-label">Runtime</span>
              <span className="workloads__kv-value data-mono">
                {getRuntimeLabel(workload, now)}
              </span>
            </div>
            <div className="workloads__kv-row">
              <span className="workloads__kv-label">Node</span>
              <span className="workloads__kv-value data-mono">
                {workload.nodeId}
              </span>
            </div>
            <div className="workloads__kv-row">
              <span className="workloads__kv-label">Submitted</span>
              <span className="workloads__kv-value data-mono">
                {formatTimestamp(workload.submittedAt)}
              </span>
            </div>
            <div className="workloads__kv-row">
              <span className="workloads__kv-label">Started</span>
              <span className="workloads__kv-value data-mono">
                {workload.startedAt ? formatTimestamp(workload.startedAt) : '—'}
              </span>
            </div>
            <div className="workloads__kv-row">
              <span className="workloads__kv-label">Completed</span>
              <span className="workloads__kv-value data-mono">
                {workload.completedAt
                  ? formatTimestamp(workload.completedAt)
                  : '—'}
              </span>
            </div>
            <div className="workloads__kv-row">
              <span className="workloads__kv-label">vCPU request / limit</span>
              <span className="workloads__kv-value data-mono">
                {workload.resources.cpuRequest} / {workload.resources.cpuLimit}
              </span>
            </div>
            <div className="workloads__kv-row">
              <span className="workloads__kv-label">Memory request / limit</span>
              <span className="workloads__kv-value data-mono">
                {workload.resources.memoryRequestGB} GB /{' '}
                {workload.resources.memoryLimitGB} GB
              </span>
            </div>
            <div className="workloads__kv-row">
              <span className="workloads__kv-label">Accelerators</span>
              <span className="workloads__kv-value data-mono">
                {acceleratorText(workload)}
              </span>
            </div>
          </div>

          <hr className="sep sep--tight" />

          <h3 className="workloads__actions-title">Actions</h3>

          {feedback && (
            <p
              className={`workloads__drawer-feedback workloads__drawer-feedback--${feedback.type}`}
              role={feedback.type === 'error' ? 'alert' : 'status'}
            >
              {feedback.message}
            </p>
          )}

          <div className="workloads__actions">
            {ALL_ACTIONS.map((action) => {
              const isAvailable = available.includes(action);
              return (
                <button
                  key={action}
                  type="button"
                  className={`btn btn--sm ${
                    isAvailable
                      ? action === 'stop'
                        ? 'btn--secondary'
                        : ''
                      : 'btn--ghost workloads__action--unavailable'
                  }`}
                  aria-disabled={!isAvailable}
                  title={
                    isAvailable
                      ? undefined
                      : unavailableReason(action)
                  }
                  onClick={() => onAction(action)}
                >
                  {actionLabel(action)}
                </button>
              );
            })}
          </div>
          <p className="workloads__action-hint">{actionHint(workload)}</p>
          <p className="workloads__action-note">
            Simulated locally — no job or container is launched.
          </p>
        </div>
      </div>
    </>
  );
}

/* ---------- Helpers ---------- */

function acceleratorText(workload: Workload): string {
  const { acceleratorRequest, acceleratorTypes } = workload.resources;
  if (acceleratorRequest <= 0) return '—';
  const kind = acceleratorTypes.join('/') || 'accelerator';
  return `${acceleratorRequest} × ${kind}`;
}

function unavailableReason(action: WorkloadAction): string {
  switch (action) {
    case 'start':
      return 'Start applies to pending or cancelled workloads.';
    case 'stop':
      return 'Stop applies to running workloads.';
    case 'retry':
      return 'Retry applies to failed workloads.';
  }
}

function actionHint(workload: Workload): string {
  switch (workload.state) {
    case 'pending':
      return 'Start moves this workload to running.';
    case 'running':
      return 'Stop cancels this workload after confirmation.';
    case 'failed':
      return 'Retry re-queues this workload as pending.';
    case 'cancelled':
      return 'Start runs this workload again.';
    case 'succeeded':
      return 'This workload has finished; no actions are available.';
  }
}
