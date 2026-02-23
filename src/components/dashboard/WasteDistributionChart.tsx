"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { EcoStats } from "@/lib/types";

const PALETTE = ["#15b54a", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#6b7280"];

// Allow stats to be possibly undefined to be defensive (if your code always passes stats, you can keep it non-optional)
interface WasteDistributionChartProps {
  stats?: EcoStats | null;
}

export function WasteDistributionChart({ stats }: WasteDistributionChartProps) {
  const categoryStats = stats?.categoryStats ?? {};

  // Convert entries to chart data
  const data = Object.entries(categoryStats)
    .map(([name, value], index) => {
      const count = typeof value === "number" ? value : Number(value ?? 0);
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count: Number.isFinite(count) ? count : 0,
        fill: PALETTE[index % PALETTE.length],
      };
    })
    .filter((d) => d.count > 0) 
    .sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waste Distribution</CardTitle>
          <CardDescription>Start scanning to see a breakdown of your waste types.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data yet</p>
        </CardContent>
      </Card>
    );
  }

  // compute a nice max for the Y axis (avoid flat bars when all values are small/large)
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const yDomain = [0, Math.ceil(maxCount * 1.1)]; // 10% headroom

  return (
    <Card>
      <CardHeader>
        <CardTitle>Waste Distribution</CardTitle>
        <CardDescription>A breakdown of the waste you've classified.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} domain={yDomain} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="count" name="Items">
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
