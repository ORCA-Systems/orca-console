// Resource utilisation line chart built with Recharts.
// Renders CPU and memory utilisation over a selected time window with a
// minimal, flat aesthetic matching the ORCA Console design system.

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { UtilisationSample } from '../../lib/mock/types';

interface UtilisationChartProps {
  samples: UtilisationSample[];
}

interface SamplePoint extends UtilisationSample {
  x: string;
}

function mapSamples(samples: UtilisationSample[]): SamplePoint[] {
  return samples.map((s) => ({ ...s, x: s.timestamp }));
}

export function UtilisationChart({ samples }: UtilisationChartProps) {
  if (samples.length === 0) {
    return null;
  }

  const data = mapSamples(samples);
  const latest = data[data.length - 1];

  const strokeCpu = 'var(--color-accent)';
  const strokeMemory = 'var(--color-border-hover)';

  return (
    <div className="utilisation-chart">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, bottom: 30, left: 56 }}
          layout="horizontal"
        >
          <defs>
            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-border-hover)" stopOpacity={0.1} />
              <stop offset="100%" stopColor="var(--color-border-hover)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="2 2" stroke="var(--color-border)" />

          <XAxis
            dataKey="x"
            tickFormatter={(value: string) =>
              new Date(value).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            }
            tick={{ fontSize: 'var(--text-xs)', fill: 'var(--color-text-muted)' }}
            tickMargin={10}
            type="category"
            tickCount={3}
            domain={['dataMin', 'dataMax']}
          />

          <YAxis
            domain={[0, 100]}
            tickFormatter={(value: number) => `${value}%`}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fontSize: 'var(--text-xs)', fill: 'var(--color-text-muted)', textAnchor: 'end' }}
            tickMargin={-10}
            width={56}
          />

          <Tooltip
            content={({ active, payload }: any) => {
              if (active && payload && payload.length) {
                const cpu = payload.find((p: any) => p.dataKey === 'cpuPercent');
                const mem = payload.find((p: any) => p.dataKey === 'memoryPercent');
                return (
                  <div className="utilisation-chart__tooltip">
                    <div className="utilisation-chart__tooltip-time">
                      {new Date(
                        (cpu ?? mem)?.payload?.timestamp ?? ''
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {cpu && (
                      <div className="utilisation-chart__tooltip-row">
                        <span
                          className="utilisation-chart__tooltip-marker"
                          style={{ backgroundColor: strokeCpu }}
                        />
                        <span>CPU {cpu.value}%</span>
                      </div>
                    )}
                    {mem && (
                      <div className="utilisation-chart__tooltip-row">
                        <span
                          className="utilisation-chart__tooltip-marker"
                          style={{ backgroundColor: strokeMemory }}
                        />
                        <span>Memory {mem.value}%</span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          <Line
            type="monotone"
            dataKey="cpuPercent"
            stroke={strokeCpu}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            animationDuration={700}
            animationEasing="ease-out"
          />

          <Line
            type="monotone"
            dataKey="memoryPercent"
            stroke={strokeMemory}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3 }}
            animationDuration={700}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="utilisation-chart__legend">
        <span className="utilisation-chart__legend-item">
          <span
            className="utilisation-chart__legend-color"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
          <span className="utilisation-chart__legend-label">CPU</span>
          <span className="utilisation-chart__legend-value">{latest.cpuPercent}%</span>
        </span>
        <span className="utilisation-chart__legend-item">
          <span
            className="utilisation-chart__legend-color"
            style={{ backgroundColor: 'var(--color-border-hover)' }}
          />
          <span className="utilisation-chart__legend-label">Memory</span>
          <span className="utilisation-chart__legend-value">{latest.memoryPercent}%</span>
        </span>
      </div>
    </div>
  );
}
