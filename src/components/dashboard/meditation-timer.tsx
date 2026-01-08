'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import useSound from 'use-sound';

interface MeditationTimerProps {
  userId: string;
}

export function MeditationTimer({ userId }: MeditationTimerProps) {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('15');
  const [seconds, setSeconds] = useState('');

  const [initialDuration, setInitialDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);


  const { toast } = useToast();
  const firestore = useFirestore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [playAlarm] = useSound('/alarm.mp3');

  useEffect(() => {
    const newDuration = (parseInt(hours, 10) || 0) * 3600 + (parseInt(minutes, 10) || 0) * 60 + (parseInt(seconds, 10) || 0);
    setInitialDuration(newDuration);
    if (!isActive) {
      setTimeLeft(newDuration);
    }
  }, [hours, minutes, seconds, isActive]);

  const handleSessionEnd = useCallback((duration: number, completed: boolean) => {
    if (userId && duration > 0) {
      const sessionsColRef = collection(firestore, 'users', userId, 'meditationSessions');
      const endTime = new Date();
      const sessionStartTime = new Date(endTime.getTime() - duration * 1000);

      const sessionData = {
        userId,
        startTime: sessionStartTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: duration,
        createdAt: serverTimestamp(),
      };
      
      addDocumentNonBlocking(sessionsColRef, sessionData);
      
      const formatDurationToast = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        
        let parts = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0) parts.push(`${m}m`);
        if (s > 0 || parts.length === 0) parts.push(`${s}s`);
        
        return parts.join(' ');
      };

      if (completed) {
        playAlarm();
        toast({
          title: 'Session Complete!',
          description: `Great job! You completed a ${formatDurationToast(duration)} session.`,
          className: 'bg-accent text-accent-foreground',
        });
      } else {
         toast({
            title: 'Session Saved!',
            description: `You logged a session of ${formatDurationToast(duration)}.`,
        });
      }
    }
    
    setIsActive(false);
    setIsPaused(false);
    setStartTime(null);
    setSessionCompleted(false);
    // Reset timer to initial duration after session ends
    const newDuration = (parseInt(hours, 10) || 0) * 3600 + (parseInt(minutes, 10) || 0) * 60 + (parseInt(seconds, 10) || 0);
    setTimeLeft(newDuration);
  }, [userId, firestore, playAlarm, toast, hours, minutes, seconds]);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            setSessionCompleted(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isActive, isPaused]);

  useEffect(() => {
    if (sessionCompleted) {
      handleSessionEnd(initialDuration, true);
    }
  }, [sessionCompleted, initialDuration, handleSessionEnd]);

  const handleStart = () => {
    if (initialDuration <= 0) {
      toast({
        title: 'Invalid Duration',
        description: 'Please set a duration greater than zero.',
        variant: 'destructive',
      });
      return;
    }
    setIsActive(true);
    setIsPaused(false);
    setStartTime(new Date());
    setTimeLeft(initialDuration);
    setSessionCompleted(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };
  
  const handleReset = () => {
      setIsActive(false);
      setIsPaused(false);
      setTimeLeft(initialDuration);
      setStartTime(null);
      setSessionCompleted(false);
  }

  const handleEndSession = () => {
    const endTime = new Date();
    if (startTime) {
      const elapsedSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      // We call the callback version here directly and reset state
      handleSessionEnd(elapsedSeconds, false);
    } else {
       // If session ended without starting, just reset.
       handleReset();
    }
  };


  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600).toString().padStart(2, '0');
    const m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, max: number) => {
    const num = parseInt(value, 10);
    if (value === '' || (num >= 0 && num <= max)) {
      setter(value);
    }
  };

  const progress = initialDuration > 0 ? (timeLeft / initialDuration) * 100 : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Meditation Timer</CardTitle>
        <CardDescription>Set your desired duration and start your session.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-6">
        {isActive ? (
          <div className="relative flex h-48 w-48 items-center justify-center rounded-full sm:h-56 sm:w-56">
            <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="339.292"
                strokeDashoffset={339.292 - (progress / 100) * 339.292}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="relative text-center">
              <span className="block text-4xl font-bold font-mono tracking-tighter sm:text-5xl">{formatTime(timeLeft)}</span>
              <span className="text-sm text-muted-foreground">Time Remaining</span>
            </div>
          </div>
        ) : (
          <div className="flex w-full max-w-md flex-col items-center justify-center gap-4">
              <div className="flex w-full items-center justify-center gap-2 sm:gap-4">
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
                      placeholder="15"
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
          </div>
        )}

        <div className="flex w-full items-center justify-center gap-4">
          {!isActive ? (
            <Button size="lg" onClick={handleStart} aria-label="Start meditation session">
              <Play className="mr-2" /> Start Session
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button size="lg" onClick={handleResume} aria-label="Resume meditation session">
                  <Play className="mr-2" /> Resume
                </Button>
              ) : (
                <Button size="lg" onClick={handlePause} aria-label="Pause meditation session">
                  <Pause className="mr-2" /> Pause
                </Button>
              )}
              <Button size="lg" variant="destructive" onClick={handleEndSession} aria-label="End meditation session">
                <Square className="mr-2" /> End Session
              </Button>
               <Button size="lg" variant="outline" onClick={handleReset} aria-label="Reset timer">
                <RotateCcw />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

