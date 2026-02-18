"use client";

import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

type ChartType = "line" | "bar";

type ChartConfig = {
  xField: string;
  yField: string;
  type: ChartType;
  label?: string;
};

type Props = {
  config: ChartConfig;
  data: Record<string, any>[];
};

export function DynamicChart({ config, data }: Props) {
  const { xField, yField, type } = config;

  if (!data?.length) return null;

  const ChartComponent = type === "bar" ? BarChart : LineChart;

  return (
    <div className="w-full h-64 bg-white p-4 border rounded-lg shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xField} />
          <YAxis />
          <Tooltip />

          {type === "bar" ? (
            <Bar dataKey={yField} />
          ) : (
            <Line dataKey={yField} strokeWidth={2} />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
