'use client';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { format, parseISO } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { MeditationSession } from '@/lib/types';
import { useMemo } from 'react';

interface MeditationChartProps {
  sessions: MeditationSession[];
  title?: string;
  description?: string;
}

export function MeditationChart({
  sessions,
  title = "Your Progress",
  description = "Time meditated over the last 7 days."
}: MeditationChartProps) {
  const chartData = useMemo(() => {
    const dataByDay: { [key: string]: number } = {};

    sessions.forEach(session => {
      const day = format(parseISO(session.endTime), 'yyyy-MM-dd');
      if (!dataByDay[day]) {
        dataByDay[day] = 0;
      }
      dataByDay[day] += session.duration;
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'yyyy-MM-dd');
    }).reverse();

    return last7Days.map(day => ({
      date: format(parseISO(day), 'MMM d'),
      minutes: Math.round((dataByDay[day] || 0) / 60),
    }));
  }, [sessions]);
  
  const chartConfig = {
    minutes: {
      label: "Minutes",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} accessibilityLayer>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickFormatter={(value) => `${value} min`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={50}
              fontSize={12}
            />
             <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="minutes"
              fill="var(--color-minutes)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
