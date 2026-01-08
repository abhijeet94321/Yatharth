'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';
import { parseISO } from 'date-fns';

interface BirthdayGreeterProps {
  userProfile: UserProfile;
}

export function BirthdayGreeter({ userProfile }: BirthdayGreeterProps) {
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    if (!userProfile.dob) return;

    const today = new Date();
    // Parse the ISO string to a Date object. `parseISO` handles timezones correctly.
    const birthDate = parseISO(userProfile.dob);

    // Get month and day in UTC to avoid timezone issues
    const todayMonth = today.getUTCMonth();
    const todayDate = today.getUTCDate();
    const birthMonth = birthDate.getUTCMonth();
    const birthDay = birthDate.getUTCDate();
    
    const isBirthday = todayMonth === birthMonth && todayDate === birthDay;

    if (isBirthday) {
      const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const greetingShownKey = `birthdayGreetingShown_${userProfile.id}_${todayString}`;

      // Use sessionStorage to only show the greeting once per session
      if (!sessionStorage.getItem(greetingShownKey)) {
        setShowGreeting(true);
        sessionStorage.setItem(greetingShownKey, 'true');
      }
    }
  }, [userProfile.dob, userProfile.id]);

  return (
    <AlertDialog open={showGreeting} onOpenChange={setShowGreeting}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
            <Gift className="h-12 w-12" />
          </div>
          <AlertDialogTitle className="text-2xl">Happy Birthday, {userProfile.name}!</AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-base">
            Wishing you a day filled with peace, joy, and mindful moments. Have a wonderful celebration!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-4">
          <AlertDialogAction asChild className="w-full">
            <Button onClick={() => setShowGreeting(false)}>Thank You!</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
