// Presentation helpers shared by the Activity page and the compact activity
// feeds on Overview and Workloads. Keeping the tone mapping here means every
// page renders the same severity the same way.

import type { ActivitySeverity } from '../../lib/mock/types';

export type ActivityTone = 'ok' | 'warn' | 'error' | 'info';

export const SEVERITIES: ActivitySeverity[] = [
  'info',
  'success',
  'warning',
  'error',
];

export function severityTone(severity: ActivitySeverity): ActivityTone {
  switch (severity) {
    case 'success':
      return 'ok';
    case 'warning':
      return 'warn';
    case 'error':
      return 'error';
    case 'info':
      return 'info';
  }
}

export function severityLabel(severity: ActivitySeverity): string {
  switch (severity) {
    case 'info':
      return 'Info';
    case 'success':
      return 'Success';
    case 'warning':
      return 'Warning';
    case 'error':
      return 'Error';
  }
}

/** Small text glyph that reinforces the status without relying on colour. */
export function severityGlyph(severity: ActivitySeverity): string {
  switch (severity) {
    case 'info':
      return 'i';
    case 'success':
      return '✓';
    case 'warning':
      return '!';
    case 'error':
      return '×';
  }
}

const feedTimeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const logTimeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatFeedTime(timestamp: string): string {
  return feedTimeFormat.format(new Date(timestamp));
}

export function formatLogTimestamp(timestamp: string): string {
  return logTimeFormat.format(new Date(timestamp));
}

export function formatFeedDay(timestamp: string): string {
  return dayFormat.format(new Date(timestamp));
}

export function formatFullTimestamp(timestamp: string): string {
  return `${dayFormat.format(new Date(timestamp))}, ${logTimeFormat.format(
    new Date(timestamp)
  )} UTC`;
}

/** Node IDs stay technical; named components get a readable capital. */
export function sourceLabel(source: string): string {
  if (/^[a-z]+-\d+$/.test(source)) return source;
  return source.charAt(0).toUpperCase() + source.slice(1);
}
