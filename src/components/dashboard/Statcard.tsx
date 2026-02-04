'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StatCard({ title, value, subtitle }: { title: string, value: string, subtitle: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold capitalize">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
