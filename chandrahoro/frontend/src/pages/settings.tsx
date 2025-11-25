import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Moon, Sun, Lock, User, Bell, Shield } from 'lucide-react';
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';
import { SaffronButton } from '@/components/SaffronButton';
import { apiClient, UserInfo } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!apiClient.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Get user info
    const userInfo = apiClient.getUserInfo();
    if (userInfo) {
      setUser(userInfo);
      setFullName(userInfo.full_name || '');
      setEmail(userInfo.email);
    }
    setIsLoading(false);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      // In a real app, you would call an API endpoint to update the profile
      // For now, we'll just show a success message
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update profile';
      setErrorMessage(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setIsSaving(true);

    try {
      // In a real app, you would call an API endpoint to change the password
      // For now, we'll just show a success message
      setSuccessMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to change password';
      setErrorMessage(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Settings - ChandraHoro</title>
          <meta name="description" content="Manage your ChandraHoro preferences and settings" />
        </Head>
        <div className="min-h-screen bg-gradient-to-b from-sand to-offwhite dark:from-ink-80 dark:to-charcoal">
          <MainNav />
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Settings - ChandraHoro</title>
        <meta name="description" content="Manage your ChandraHoro preferences and settings" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-sand to-offwhite dark:from-ink-80 dark:to-charcoal">
        <MainNav />

        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-saffron-500 dark:text-saffron-400" />
              <h1 className="font-poppins text-4xl font-bold text-charcoal dark:text-white">Settings</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Manage your account and application preferences</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-saffron-500" />
                  <div>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your account information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-white mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-saffron-200 dark:border-saffron-800 bg-white dark:bg-ink-90 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-saffron-200 dark:border-saffron-800 bg-gray-100 dark:bg-ink-80 text-charcoal dark:text-white opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                  <SaffronButton
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </SaffronButton>
                </form>
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-saffron-500" />
                  <div>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!showPasswordForm ? (
                  <SaffronButton
                    variant="primary"
                    size="md"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Change Password
                  </SaffronButton>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-white mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-saffron-200 dark:border-saffron-800 bg-white dark:bg-ink-90 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500"
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-white mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-saffron-200 dark:border-saffron-800 bg-white dark:bg-ink-90 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500"
                        placeholder="Enter new password (min 8 characters)"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-white mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-saffron-200 dark:border-saffron-800 bg-white dark:bg-ink-90 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <SaffronButton
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={isSaving}
                      >
                        {isSaving ? 'Updating...' : 'Update Password'}
                      </SaffronButton>
                      <SaffronButton
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                      >
                        Cancel
                      </SaffronButton>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-saffron-500" />
                  <div>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how the application looks</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === 'light' ? (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-blue-400" />
                    )}
                    <div>
                      <p className="font-medium">Theme</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {theme === 'light' ? 'Light mode' : 'Dark mode'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <SaffronButton
                      variant={theme === 'light' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setTheme('light')}
                    >
                      Light
                    </SaffronButton>
                    <SaffronButton
                      variant={theme === 'dark' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                    >
                      Dark
                    </SaffronButton>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-saffron-500" />
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage notification preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive updates about your charts
                    </p>
                  </div>
                  <SaffronButton
                    variant={notifications ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setNotifications(!notifications)}
                  >
                    {notifications ? 'Enabled' : 'Disabled'}
                  </SaffronButton>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-saffron-500" />
                  <div>
                    <CardTitle>Privacy & Security</CardTitle>
                    <CardDescription>Manage your privacy settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Make Charts Public</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow others to view your charts via shared links
                    </p>
                  </div>
                  <SaffronButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                  >
                    Disabled
                  </SaffronButton>
                </div>
                <div className="pt-4 border-t border-saffron-200 dark:border-saffron-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Data Management
                  </p>
                  <div className="flex gap-2">
                    <SaffronButton
                      variant="ghost"
                      size="sm"
                    >
                      Export Data
                    </SaffronButton>
                    <SaffronButton
                      variant="ghost"
                      size="sm"
                      className="text-red-600 dark:text-red-400"
                    >
                      Delete Account
                    </SaffronButton>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>Application information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Version</p>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Built with</p>
                  <p className="font-medium">Next.js, React, and FastAPI</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
