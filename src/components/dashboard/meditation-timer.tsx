'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { LogIn } from 'lucide-react';

interface MeditationTimerProps {
  userId: string;
}

export function MeditationTimer({ userId }: MeditationTimerProps) {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleLogSession = async () => {
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    const s = parseInt(seconds, 10) || 0;

    const totalSeconds = (h * 3600) + (m * 60) + s;

    if (totalSeconds <= 0) {
      toast({
        title: 'Invalid Time',
        description: 'Please enter a duration greater than zero.',
        variant: 'destructive',
      });
      return;
    }

    if (userId) {
      const sessionsColRef = collection(firestore, 'users', userId, 'meditationSessions');
      
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - totalSeconds * 1000);

      const sessionData = {
        userId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: totalSeconds,
        createdAt: serverTimestamp(),
      };
      
      addDocumentNonBlocking(sessionsColRef, sessionData);

      toast({
        title: 'Session Saved!',
        description: `You logged a session of ${formatDuration(totalSeconds)}. Keep it up!`,
        className: 'bg-accent text-accent-foreground',
      });
      
      // Reset fields
      setHours('');
      setMinutes('');
      setSeconds('');
    }
  };

  const formatDuration = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    
    let parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    
    return parts.join(' ');
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, max: number) => {
    const num = parseInt(value, 10);
    if (value === '' || (num >= 0 && num <= max)) {
      setter(value);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Meditation Session</CardTitle>
        <CardDescription>Enter the duration of your completed meditation session.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6">
        <div className="flex w-full max-w-md items-center justify-center gap-2 sm:gap-4">
          <div className="flex-1 text-center">
            <Input
              type="number"
              value={hours}
              onChange={(e) => handleInputChange(setHours, e.target.value, 99)}
              placeholder="0"
              className="text-center text-lg font-mono"
              aria-label="Hours"
            />
            <label className="text-xs text-muted-foreground">Hours</label>
          </div>
          <div className="flex-1 text-center">
            <Input
              type="number"
              value={minutes}
              onChange={(e) => handleInputChange(setMinutes, e.target.value, 59)}
              placeholder="00"
              className="text-center text-lg font-mono"
              aria-label="Minutes"
            />
             <label className="text-xs text-muted-foreground">Minutes</label>
          </div>
          <div className="flex-1 text-center">
            <Input
              type="number"
              value={seconds}
              onChange={(e) => handleInputChange(setSeconds, e.target.value, 59)}
              placeholder="00"
              className="text-center text-lg font-mono"
              aria-label="Seconds"
            />
             <label className="text-xs text-muted-foreground">Seconds</label>
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-4">
          <Button size="lg" onClick={handleLogSession} aria-label="Log meditation session">
            <LogIn className="mr-2" /> Log Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
