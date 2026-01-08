'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { format, differenceInYears, parse } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const formSchema = z.object({
  dob: z.date({
    required_error: "Your date of birth is required.",
  }),
  profession: z.string().min(2, { message: 'Please enter your profession.' }),
});

export default function CompleteProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dateInput, setDateInput] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function calculateAge(dob: Date): number {
    return differenceInYears(new Date(), dob);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userProfileUpdate = {
            dob: values.dob.toISOString(),
            profession: values.profession,
            age: calculateAge(values.dob),
        };
        
        updateDocumentNonBlocking(userDocRef, userProfileUpdate);

        toast({
            title: 'Profile Updated!',
            description: 'Your profile has been successfully completed.',
        });

        router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
        form.setValue('dob', date);
        setDateInput(format(date, 'yyyy-MM-dd'));
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInput(value);
    const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
    if (!isNaN(parsedDate.getTime())) {
      form.setValue('dob', parsedDate);
    } else {
      form.setError('dob', { type: 'manual', message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <Logo />
        <CardTitle className="text-2xl pt-4">Complete Your Profile</CardTitle>
        <CardDescription>Please provide a few more details to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="YYYY-MM-DD"
                          value={dateInput}
                          onChange={handleDateInputChange}
                          className="pr-10"
                        />
                      </FormControl>
                      <PopoverTrigger asChild>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                            aria-label="Open calendar"
                         >
                            <CalendarIcon className="h-4 w-4" />
                         </Button>
                      </PopoverTrigger>
                    </div>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={handleDateSelect}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profession</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Software Engineer, Doctor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Continue to Dashboard'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
