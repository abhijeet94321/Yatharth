'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Please enter your username.' }),
  password: z.string().min(1, { message: 'Please enter your password.' }),
});

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const user = login(values.username, values.password);
    if (!user) {
      toast({
        title: 'Login Failed',
        description: 'Invalid username or password. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <Logo />
        <CardTitle className="text-2xl pt-4">Welcome Back</CardTitle>
        <CardDescription>Enter your username and password to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="user-1" {...field} />
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
         <p className="text-muted-foreground text-xs">
          (Hint: use user-1/pass or admin-1/pass)
        </p>
      </CardFooter>
    </Card>
  );
}
