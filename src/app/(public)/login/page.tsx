'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Logo } from '@/components/logo';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Please enter your password.' }),
});

const resetSchema = z.object({
  resetEmail: z.string().email({ message: 'Please enter your email to reset the password.' }),
});

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const loginForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      resetEmail: '',
    }
  });

  async function onLoginSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      let description = 'An unexpected error occurred. Please try again.';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email') {
        description = 'No user found with these credentials. Would you like to sign up instead?';
        setErrorDialogMessage(description);
        setErrorDialogOpen(true);
      } else if (error.code === 'auth/user-disabled') {
        description = 'This account has been disabled. Please contact support for assistance.';
        toast({
            title: 'Login Failed',
            description: description,
            variant: 'destructive',
         });
      } else {
         toast({
            title: 'Login Failed',
            description: error.message || description,
            variant: 'destructive',
         });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function onResetSubmit(values: z.infer<typeof resetSchema>) {
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, values.resetEmail);
      toast({
        title: 'Password Reset Email Sent',
        description: `If an account exists for ${values.resetEmail}, an email has been sent with reset instructions.`,
      });
      setResetDialogOpen(false);
      resetForm.reset();
    } catch (error: any) {
      console.error("Password Reset Error:", error);
       toast({
        title: 'Error Sending Reset Email',
        description: 'There was a problem sending the password reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  }


  return (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Logo />
          <CardTitle className="text-2xl pt-4">Welcome Back</CardTitle>
          <CardDescription>Enter your email and password to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
           <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-sm font-medium text-primary">
                    Forgot Password?
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Forgot Password</DialogTitle>
                    <DialogDescription>
                        Enter your email below. If an account is associated with it, we will send a password reset link.
                    </DialogDescription>
                </DialogHeader>
                <Form {...resetForm}>
                    <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4 pt-4">
                         <FormField
                            control={resetForm.control}
                            name="resetEmail"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                <Input type="email" placeholder="name@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <DialogFooter>
                            <Button type="submit" disabled={isResetting}>
                                {isResetting ? 'Sending...' : 'Send Reset Email'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
           </Dialog>
        </CardFooter>
      </Card>
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Failed</AlertDialogTitle>
            <AlertDialogDescription>
              {errorDialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <Button variant="outline" onClick={() => setErrorDialogOpen(false)}>
              Cancel
            </Button>
            <AlertDialogAction asChild>
              <Link href="/signup">Sign Up</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
