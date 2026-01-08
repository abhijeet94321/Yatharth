'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

interface BirthdayGreeterProps {
  userProfile: UserProfile;
}

export function BirthdayGreeter({ userProfile }: BirthdayGreeterProps) {
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    if (!userProfile.dob) return;

    const today = new Date();
    // DOB is stored as ISO string, so we need to parse it correctly
    // The date part of the ISO string is YYYY-MM-DD, so we can split and parse
    const dobParts = userProfile.dob.split('T')[0].split('-');
    const birthDate = new Date(parseInt(dobParts[0]), parseInt(dobParts[1]) - 1, parseInt(dobParts[2]));

    const isBirthday =
      today.getMonth() === birthDate.getMonth() &&
      today.getDate() === birthDate.getDate();

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
