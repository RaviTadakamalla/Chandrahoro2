import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { BrandMark } from '@/components/BrandMark';
import { SaffronButton } from '@/components/SaffronButton';
import { Field } from '@/components/Field';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email || !password || !confirmPassword || !fullName) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        setIsLoading(false);
        return;
      }

      // Call register API
      await register({
        email,
        password,
        full_name: fullName,
      });

      setSuccess('Registration successful! Redirecting...');

      // Redirect to home page after 1 second
      setTimeout(() => {
        router.push('/home');
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - ChandraHoro</title>
        <meta name="description" content="Create a new ChandraHoro account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Full Viewport Two Column Layout: Image Left (50%), Registration Form Right (50%) */}
      <div className="flex flex-col lg:flex-row min-h-screen w-full">
        {/* Left Section: Registration Page Image - 50% Width */}
        <div className="flex-1 w-full lg:w-1/2 h-64 lg:h-screen overflow-hidden relative bg-gradient-to-br from-saffron-50 to-orange-50 dark:from-saffron-900/20 dark:to-orange-900/20">
          <Image
            src="/images/register.png"
            alt="ChandraHoro - Registration Page"
            width={800}
            height={600}
            className="w-full h-full object-cover object-center"
            priority
          />
        </div>

        {/* Right Section: Registration Form - 50% Width */}
        <div className="flex-1 w-full lg:w-1/2 h-auto lg:h-screen flex items-center justify-center p-6 lg:p-10 bg-white dark:bg-gray-900">
          <div className="w-full max-w-lg">
            {/* Logo */}
            <div className="mb-8 text-center lg:text-left">
              <Link href="/">
                <BrandMark size="md" showText={true} />
              </Link>
            </div>

            {/* Registration Form Container */}
            <div className="space-y-6">
              <h1 className="font-poppins text-2xl md:text-3xl font-bold text-charcoal dark:text-white mb-2">
                Create Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Join ChandraHoro to save your charts and access advanced features
              </p>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                </div>
              )}

              {/* Register form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Field
                  label="Full Name"
                  type="text"
                  placeholder="Your Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />

                <Field
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <Field
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                {/* Sign up button */}
                <SaffronButton
                  variant="primary"
                  size="lg"
                  className="w-full mt-6"
                  isLoading={isLoading}
                  type="submit"
                >
                  Create Account
                </SaffronButton>
              </form>

              {/* Sign in link */}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
                Already have an account?{' '}
                <Link href="/login" className="text-saffron-600 dark:text-saffron-400 font-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

