'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { add, format, parse } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';
import { TimePicker } from '@/components/ui/time-picker';

const formSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:MM format."),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:MM format."),
}).refine(data => {
    // Combine date and time to create full Date objects for comparison
    const startDate = parse(data.startTime, 'HH:mm', data.date);
    const endDate = parse(data.endTime, 'HH:mm', data.date);
    return endDate > startDate;
}, {
    message: "End time must be after start time.",
    path: ["endTime"],
});

interface ManualSessionFormProps {
  onSessionLogged: () => void;
}

export function ManualSessionForm({ onSessionLogged }: ManualSessionFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      startTime: '08:00',
      endTime: '09:00',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive'});
      return;
    }
    
    setIsLoading(true);

    try {
      const { date, startTime, endTime } = values;

      // Create full Date objects from form values
      const startDateTime = parse(startTime, 'HH:mm', date);
      let endDateTime = parse(endTime, 'HH:mm', date);

      // Handle overnight sessions (end time is on the next day)
      if (endDateTime <= startDateTime) {
        endDateTime = add(endDateTime, { days: 1 });
      }

      const durationInSeconds = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 1000);

      const sessionsColRef = collection(firestore, 'users', user.uid, 'meditationSessions');
      const sessionData = {
        userId: user.uid,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: durationInSeconds,
        createdAt: serverTimestamp(),
      };

      addDocumentNonBlocking(sessionsColRef, sessionData);

      toast({
        title: 'Session Logged!',
        description: 'Your meditation session has been successfully saved.',
      });
      
      onSessionLogged(); // Close the dialog
      form.reset();

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Log Failed',
        description: error.message || 'Could not save your session.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <TimePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <TimePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Saving...' : 'Log Session'}
        </Button>
      </form>
    </Form>
  );
}
