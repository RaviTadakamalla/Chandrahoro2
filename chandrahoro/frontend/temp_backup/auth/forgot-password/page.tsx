/**
 * Forgot Password Page Component
 * 
 * Allows users to request a password reset email.
 * Includes form validation and success/error handling.
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/states/LoadingSpinner';

import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send reset email');
      }

      setEmail(data.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We've sent password reset instructions to your email
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to:
              </p>
              <p className="font-medium text-foreground">{email}</p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
            </div>

            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-orange-500 hover:underline"
                    onClick={() => {
                      setSuccess(false);
                      form.reset();
                    }}
                  >
                    Try again
                  </Button>
                </p>
              </div>
            </div>

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Check your spam folder</strong> if you don't see the email in your inbox.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-orange-600">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Forgot Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center space-y-4">
            <Button asChild variant="ghost" className="w-full">
              <Link href="/auth/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>

            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link href="/auth/signin" className="text-orange-500 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
