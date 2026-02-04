'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { EcoStats } from '@/lib/types';

const PALETTE = ["#15b54a", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#6b7280"];

// Define props type
interface WasteDistributionChartProps {
  stats: EcoStats;
}

export function WasteDistributionChart({ stats }: WasteDistributionChartProps) {
  const data = Object.entries(stats.scansByType).map(([name, value], index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: value,
    fill: PALETTE[index % PALETTE.length],
  }));

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
            <YAxis allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="count" name="Items" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
