'use client';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns';
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
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MeditationSession } from '@/lib/types';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';


interface MeditationChartProps {
  sessions: MeditationSession[];
  title?: string;
  description?: string;
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}


export function MeditationChart({
  sessions,
  title = "Your Progress",
  description = "Time meditated over the last period."
}: MeditationChartProps) {
  const [range, setRange] = useState('15');
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 14),
    to: new Date(),
  });

  const chartData = useMemo(() => {
    const dataByDay: { [key: string]: { total: number, sessions: { startTime: string, endTime: string, duration: number }[] } } = {};

    sessions.forEach(session => {
      const day = format(parseISO(session.endTime), 'yyyy-MM-dd');
      if (!dataByDay[day]) {
        dataByDay[day] = { total: 0, sessions: [] };
      }
      dataByDay[day].total += session.duration;
      dataByDay[day].sessions.push({
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
      });
    });

    let startDate: Date;
    let endDate = new Date();

    if (range === 'custom' && date?.from) {
      startDate = date.from;
      endDate = date.to || date.from;
    } else {
       startDate = subDays(new Date(), parseInt(range, 10) - 1);
    }
    
    const interval = eachDayOfInterval({ start: startDate, end: endDate });

    return interval.map(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const dayData = dataByDay[dayKey];
      return {
        date: format(day, 'MMM d'),
        minutes: Math.round((dayData?.total || 0) / 60),
        sessions: dayData?.sessions || []
      }
    });

  }, [sessions, range, date]);

  const handleRangeChange = (value: string) => {
    setRange(value);
    if (value !== 'custom') {
      setDate({
        from: subDays(new Date(), parseInt(value) -1),
        to: new Date()
      });
    }
  }
  
  const chartConfig = {
    minutes: {
      label: "Minutes",
      color: "hsl(var(--primary))",
    },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
              <span className="font-bold text-muted-foreground">{label}</span>
            </div>
            <div className="flex flex-col space-y-1">
               <span className="text-[0.70rem] uppercase text-muted-foreground">Total Time</span>
              <span className="font-bold">{data.minutes} min</span>
            </div>
          </div>
          {data.sessions.length > 0 && (
            <>
                <div className="my-2 h-px w-full shrink-0 bg-border" />
                <div className="space-y-1">
                    {data.sessions.map((s: any, i: number) => (
                         <div key={i} className="flex justify-between text-xs">
                           <span>{formatDuration(s.duration)}</span>
                           <span className="text-muted-foreground">{format(parseISO(s.startTime), 'p')}</span>
                         </div>
                    ))}
                </div>
            </>
          )}
        </div>
      );
    }
  
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
           <Tabs value={range} onValueChange={handleRangeChange} className="w-full sm:w-auto">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="15" className="flex-1 sm:flex-none">15 Days</TabsTrigger>
              <TabsTrigger value="30" className="flex-1 sm:flex-none">1 Month</TabsTrigger>
              <TabsTrigger value="60" className="flex-1 sm:flex-none">2 Months</TabsTrigger>
            </TabsList>
          </Tabs>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal sm:w-[240px]",
                  !date && "text-muted-foreground"
                )}
                onClick={() => setRange('custom')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} accessibilityLayer barSize={12}>
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
              content={<CustomTooltip />}
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
