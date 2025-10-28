import type { MeditationSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { isToday } from 'date-fns';

interface DailyStatsProps {
  sessions: MeditationSession[];
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

export function DailyStats({ sessions }: DailyStatsProps) {
  const todaySessions = sessions.filter(session => isToday(new Date(session.endTime)));
  
  const totalTimeToday = todaySessions.reduce((total, session) => total + session.duration, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Today's Meditation Time
        </CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatDuration(totalTimeToday)}</div>
        <p className="text-xs text-muted-foreground">
          Total time spent in meditation today
        </p>
      </CardContent>
    </Card>
  );
}
