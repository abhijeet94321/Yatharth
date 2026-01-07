'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

const formSchema = z.object({
  newEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required to confirm your identity.' }),
});

interface UpdateEmailDialogProps {
  user: User;
}

export function UpdateEmailDialog({ user }: UpdateEmailDialogProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newEmail: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your email.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Re-authenticate the user for security
      const credential = EmailAuthProvider.credential(user.email!, values.password);
      await reauthenticateWithCredential(user, credential);

      // 2. Update email in Firebase Authentication
      await updateEmail(user, values.newEmail);

      // 3. Update email in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { email: values.newEmail });

      toast({
        title: 'Success!',
        description: 'Your email address has been updated.',
        className: 'bg-accent text-accent-foreground',
      });

      setIsOpen(false); // Close dialog on success
    } catch (error: any) {
      console.error('Email update error:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/wrong-password') {
        description = 'The password you entered is incorrect. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        description = 'This email address is already in use by another account.';
      } else if (error.code === 'auth/requires-recent-login') {
        description = 'For security, please log out and log back in before updating your email.';
      }
      
      form.setError('password', { message: ' ' });
      form.setError('newEmail', { message: ' '});
      
      toast({
        title: 'Update Failed',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Update Your Email Address</DialogTitle>
          <DialogDescription>
            To enable password resets and secure your account, please provide a valid email address.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update and Continue'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
