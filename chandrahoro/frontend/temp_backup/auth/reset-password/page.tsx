/**
 * Reset Password Page Component
 * 
 * Allows users to reset their password using a secure token.
 * Includes token validation, form validation, and success handling.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/states/LoadingSpinner';

import { resetPasswordSchema, type ResetPasswordFormData, checkPasswordStrength } from '@/lib/validations/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = form.watch('password');
  const passwordStrength = watchedPassword ? checkPasswordStrength(watchedPassword) : null;

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setIsValidating(false);
      return;
    }

    validateToken(token);
  }, [token]);

  const validateToken = async (resetToken: string) => {
    try {
      const response = await fetch(`/api/auth/forgot-password?token=${encodeURIComponent(resetToken)}`);
      const result = await response.json();

      if (!response.ok || !result.valid) {
        throw new Error(result.error?.message || 'Invalid or expired reset token');
      }

      setTokenValid(true);
      setUserEmail(result.email);
      form.setValue('token', resetToken);
    } catch (err: any) {
      setError(err.message);
      setTokenValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-muted-foreground">Validating reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been successfully updated
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                You can now sign in with your new password.
              </p>
            </div>

            <Button asChild className="w-full">
              <Link href="/auth/signin">
                Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (invalid token)
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">
                  Request New Reset Link
                </Link>
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link href="/auth/signin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-orange-600">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password for {userEmail}
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

          {/* Reset Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    
                    {/* Password Strength Indicator */}
                    {passwordStrength && (
                      <div className="space-y-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 w-full rounded ${
                                level <= passwordStrength.score
                                  ? passwordStrength.score <= 2
                                    ? 'bg-red-500'
                                    : passwordStrength.score <= 3
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {passwordStrength.feedback.map((feedback, index) => (
                              <li key={index}>• {feedback}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Confirm New Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
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
                    Resetting password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Button asChild variant="ghost" className="w-full">
              <Link href="/auth/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
