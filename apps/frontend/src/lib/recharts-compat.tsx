"use client";

import type { ReactNode } from "react";

interface BaseProps {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}

interface ChartProps extends BaseProps {
  data?: Array<Record<string, unknown>>;
}

interface AxisProps {
  dataKey?: string;
  [key: string]: unknown;
}

interface TooltipProps {
  formatter?: (value: number | string) => string;
  [key: string]: unknown;
}

export const ResponsiveContainer = ({ children, className }: BaseProps) => (
  <div className={className} style={{ width: "100%", height: "100%" }}>
    {children}
  </div>
);

export const CartesianGrid = (_props: BaseProps) => null;
export const Legend = (_props: BaseProps) => null;
export const XAxis = (_props: AxisProps) => null;
export const YAxis = (_props: AxisProps) => null;
export const Tooltip = (_props: TooltipProps) => null;

export const LineChart = ({ children }: ChartProps) => (
  <div className="h-full w-full rounded-xl border border-slate-800/70 bg-slate-950/40 p-2">{children}</div>
);

export const BarChart = ({ children }: ChartProps) => (
  <div className="h-full w-full rounded-xl border border-slate-800/70 bg-slate-950/40 p-2">{children}</div>
);

export const Line = (_props: BaseProps) => null;
export const Bar = (_props: BaseProps) => null;
