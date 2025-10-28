'use client';

import type { MeditationSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { isToday } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TodaysSessionsProps {
  sessions: MeditationSession[];
  userId: string;
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export function TodaysSessions({ sessions, userId }: TodaysSessionsProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const todaySessions = sessions
    .filter(session => isToday(new Date(session.endTime)))
    .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());

  const handleDelete = (sessionId: string) => {
    const sessionDocRef = doc(firestore, 'users', userId, 'meditationSessions', sessionId);
    deleteDocumentNonBlocking(sessionDocRef);
    toast({
        title: 'Session Deleted',
        description: 'The meditation session has been removed.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Sessions</CardTitle>
        <CardDescription>A list of meditation sessions you've logged today.</CardDescription>
      </CardHeader>
      <CardContent>
        {todaySessions.length > 0 ? (
          <ul className="space-y-3">
            {todaySessions.map((session) => (
              <li key={session.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="font-medium">{formatDuration(session.duration)}</div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(session.id)}
                        aria-label="Delete session"
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-muted-foreground">No sessions logged today.</p>
        )}
      </CardContent>
    </Card>
  );
}
