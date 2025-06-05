
"use client";

import { LogEntry, emotions as emotionOptions, activities as activityOptions } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart as RechartsPieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Bar as RechartsBar } from 'recharts';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useMemo } from "react";

interface AnalyticsChartsProps {
  entries: LogEntry[];
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
  'hsl(var(--accent))',
];

export function AnalyticsCharts({ entries }: AnalyticsChartsProps) {
  const angelNumberFrequency = useMemo(() => {
    const counts: { [key: string]: number } = {};
    entries.forEach(entry => {
      counts[entry.angelNumber] = (counts[entry.angelNumber] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10
  }, [entries]);

  const emotionDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    emotionOptions.forEach(e => counts[e] = 0); // Initialize all emotions
    entries.forEach(entry => {
      counts[entry.emotion] = (counts[entry.emotion] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0); // Only show emotions with data
  }, [entries]);

  const activityDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    activityOptions.forEach(a => counts[a] = 0); // Initialize all activities
    entries.forEach(entry => {
      counts[entry.activity] = (counts[entry.activity] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0); // Only show activities with data
  }, [entries]);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    angelNumberFrequency.forEach((item, index) => {
      config[item.name] = { label: item.name, color: CHART_COLORS[index % CHART_COLORS.length] };
    });
    emotionDistribution.forEach((item, index) => {
      config[item.name] = { label: item.name, color: CHART_COLORS[index % CHART_COLORS.length] };
    });
     activityDistribution.forEach((item, index) => {
      config[item.name] = { label: item.name, color: CHART_COLORS[index % CHART_COLORS.length] };
    });
    return config;
  }, [angelNumberFrequency, emotionDistribution, activityDistribution]);

  if (entries.length === 0) {
    return (
      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>No Data Yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Log some entries to see your spiritual patterns.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Angel Number Frequency (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          {angelNumberFrequency.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart accessibilityLayer data={angelNumberFrequency} layout="vertical" margin={{ right: 20, left: 20 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide/>
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <RechartsBar dataKey="value" layout="vertical" radius={5}>
                  {angelNumberFrequency.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </RechartsBar>
              </BarChart>
            </ChartContainer>
          ) : <p className="text-muted-foreground">Not enough data.</p>}
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Emotion Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {emotionDistribution.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full max-w-xs">
              <RechartsPieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={emotionDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {emotionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                 <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </RechartsPieChart>
            </ChartContainer>
          ) : <p className="text-muted-foreground">Not enough data.</p>}
        </CardContent>
      </Card>
      
      <Card className="bg-card/70 backdrop-blur-sm col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Activity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {activityDistribution.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart accessibilityLayer data={activityDistribution} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-45} textAnchor="end" interval={0} height={80}/>
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <RechartsBar dataKey="value" radius={5}>
                    {activityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </RechartsBar>
              </BarChart>
            </ChartContainer>
          ) : <p className="text-muted-foreground">Not enough data.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
