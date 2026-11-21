export const ROUTES = [
  { path: '#/overview', label: 'Overview' },
  { path: '#/compute', label: 'Compute' },
  { path: '#/workloads', label: 'Workloads' },
  { path: '#/activity', label: 'Activity' },
  { path: '#/settings', label: 'Settings' },
] as const;

export type RoutePath = (typeof ROUTES)[number]['path'];

export function routeLabel(path: string): string {
  const found = ROUTES.find((r) => r.path === path);
  return found ? found.label : 'Overview';
}
