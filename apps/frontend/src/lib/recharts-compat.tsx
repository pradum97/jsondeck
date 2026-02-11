"use client";

import type { ReactNode } from "react";

interface BaseProps {
  children?: ReactNode;
  className?: string;
}

interface ChartProps extends BaseProps {
  data?: Array<Record<string, unknown>>;
}

interface AxisProps {
  dataKey?: string;
}

interface TooltipProps {
  formatter?: (value: number | string) => string;
}

export const ResponsiveContainer = ({ children, className }: BaseProps) => (
  <div className={className} style={{ width: "100%", height: "100%" }}>
    {children}
  </div>
);

export const CartesianGrid = () => null;
export const Legend = () => null;
export const XAxis = (_props: AxisProps) => null;
export const YAxis = () => null;
export const Tooltip = (_props: TooltipProps) => null;

export const LineChart = ({ children }: ChartProps) => (
  <div className="h-full w-full rounded-xl border border-slate-800/70 bg-slate-950/40 p-2">{children}</div>
);

export const BarChart = ({ children }: ChartProps) => (
  <div className="h-full w-full rounded-xl border border-slate-800/70 bg-slate-950/40 p-2">{children}</div>
);

export const Line = () => null;
export const Bar = () => null;
