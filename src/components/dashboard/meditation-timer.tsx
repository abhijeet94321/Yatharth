'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pause, Play, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


interface MeditationTimerProps {
  userId: string;
}

export function MeditationTimer({ userId }: MeditationTimerProps) {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    setStartTime(new Date());
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (time > 0 && userId && startTime) {
      const sessionsColRef = collection(firestore, 'users', userId, 'meditationSessions');
      const sessionData = {
        userId,
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString(),
        duration: time,
        createdAt: serverTimestamp(),
      };
      
      addDocumentNonBlocking(sessionsColRef, sessionData);

      toast({
        title: 'Session Saved!',
        description: `You meditated for ${formatTime(time)}. Great work!`,
        className: 'bg-accent text-accent-foreground',
      });
    }
    
    setIsActive(false);
    setTime(0);
    setStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meditation Session</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6">
        <div
          className="font-mono text-7xl sm:text-8xl md:text-9xl font-bold tabular-nums"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatTime(time)}
        </div>
        <div className="flex w-full items-center justify-center gap-4">
          {!isActive ? (
            <Button size="lg" onClick={handleStart} aria-label="Start meditation session">
              <Play className="mr-2" /> Start
            </Button>
          ) : (
            <>
              <Button size="lg" variant="outline" onClick={handlePauseResume} aria-label={isPaused ? "Resume meditation session" : "Pause meditation session"}>
                {isPaused ? <Play className="mr-2" /> : <Pause className="mr-2" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button size="lg" variant="destructive" onClick={handleStop} aria-label="Stop meditation session">
                <StopCircle className="mr-2" /> Stop
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
