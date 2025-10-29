'use client';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { format, parseISO, subDays, differenceInDays, eachDayOfInterval } from 'date-fns';
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
    const dataByDay: { [key: string]: number } = {};

    sessions.forEach(session => {
      const day = format(parseISO(session.endTime), 'yyyy-MM-dd');
      if (!dataByDay[day]) {
        dataByDay[day] = 0;
      }
      dataByDay[day] += session.duration;
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

    return interval.map(day => ({
      date: format(day, 'MMM d'),
      minutes: Math.round((dataByDay[format(day, 'yyyy-MM-dd')] || 0) / 60),
    }));

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
