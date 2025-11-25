/**
 * Authentication Test Page
 * 
 * Comprehensive testing interface for all authentication components,
 * hooks, and flows. Includes interactive demos and status displays.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  LogOut, 
  Settings, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

import { 
  useAuth, 
  useUserProfile, 
  useUserEntitlement,
  AuthStatus,
  AuthConditional,
  ProtectedRoute 
} from '@/components/auth';

export default function AuthTestPage() {
  const { 
    user, 
    session, 
    isLoading, 
    isAuthenticated, 
    isOnboardingComplete,
    hasActiveSubscription,
    refreshSession 
  } = useAuth();
  
  const { profile, updateProfile, isUpdating } = useUserProfile();
  const { 
    entitlement, 
    quotaUsed, 
    quotaLimit, 
    quotaRemaining, 
    quotaPercentage,
    isQuotaExceeded,
    isQuotaWarning,
    planType,
    resetAt 
  } = useUserEntitlement();

  const [testResult, setTestResult] = useState<string>('');

  const handleTestProfileUpdate = async () => {
    const result = await updateProfile({
      name: `${user?.name} (Updated)`,
    });
    
    setTestResult(result.success ? 'Profile updated successfully!' : 'Profile update failed');
    setTimeout(() => setTestResult(''), 3000);
  };

  const handleRefreshSession = async () => {
    await refreshSession();
    setTestResult('Session refreshed!');
    setTimeout(() => setTestResult(''), 3000);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">🔐 Authentication Test Suite</h1>
          <p className="text-muted-foreground">
            Comprehensive testing interface for ChandraHoro V2.1 authentication system
          </p>
        </div>

        {/* Test Result Alert */}
        {testResult && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{testResult}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="status" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="status">Auth Status</TabsTrigger>
            <TabsTrigger value="user">User Data</TabsTrigger>
            <TabsTrigger value="quota">Quota & Plans</TabsTrigger>
            <TabsTrigger value="flows">Auth Flows</TabsTrigger>
            <TabsTrigger value="protection">Route Protection</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
          </TabsList>

          {/* Authentication Status */}
          <TabsContent value="status" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Onboarding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {isOnboardingComplete ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      {isOnboardingComplete ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {hasActiveSubscription ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-sm">
                      {hasActiveSubscription ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Loading State
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm">
                      {isLoading ? 'Loading' : 'Ready'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session Data */}
            <Card>
              <CardHeader>
                <CardTitle>Session Information</CardTitle>
                <CardDescription>Current session and user data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">User ID:</span>
                      <p className="text-muted-foreground">{user?.id || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-muted-foreground">{user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Name:</span>
                      <p className="text-muted-foreground">{user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email Verified:</span>
                      <p className="text-muted-foreground">
                        {user?.emailVerified ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleRefreshSession} size="sm">
                      Refresh Session
                    </Button>
                    <Button onClick={() => signOut()} variant="destructive" size="sm">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Data */}
          <TabsContent value="user" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Profile information and management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Full Name:</span>
                      <p className="text-muted-foreground">{profile?.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date of Birth:</span>
                      <p className="text-muted-foreground">
                        {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Time of Birth:</span>
                      <p className="text-muted-foreground">{profile?.timeOfBirth || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Place of Birth:</span>
                      <p className="text-muted-foreground">{profile?.placeOfBirth || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleTestProfileUpdate} 
                    disabled={isUpdating}
                    size="sm"
                  >
                    {isUpdating ? 'Updating...' : 'Test Profile Update'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quota & Plans */}
          <TabsContent value="quota" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Quota Usage</CardTitle>
                  <CardDescription>Current usage and limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used</span>
                      <span>{quotaUsed} / {quotaLimit}</span>
                    </div>
                    <Progress value={quotaPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{quotaRemaining} remaining</span>
                      <span>{quotaPercentage.toFixed(1)}% used</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isQuotaExceeded && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Quota Exceeded
                      </Badge>
                    )}
                    {isQuotaWarning && !isQuotaExceeded && (
                      <Badge variant="secondary">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Quota Warning
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Information</CardTitle>
                  <CardDescription>Current subscription details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Plan Type:</span>
                      <Badge variant={planType === 'free' ? 'secondary' : 'default'}>
                        {planType?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={entitlement?.isActive ? 'default' : 'destructive'}>
                        {entitlement?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Reset At:</span>
                      <span className="text-sm text-muted-foreground">
                        {resetAt ? new Date(resetAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Auth Flows */}
          <TabsContent value="flows" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sign Up</CardTitle>
                  <CardDescription>User registration flow</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/auth/signup">Test Sign Up</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sign In</CardTitle>
                  <CardDescription>User login flow</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/auth/signin">Test Sign In</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Forgot Password</CardTitle>
                  <CardDescription>Password reset request</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/auth/forgot-password">Test Reset</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Route Protection */}
          <TabsContent value="protection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Protected Route Testing</CardTitle>
                <CardDescription>Test authentication-protected routes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild>
                    <Link href="/dashboard">Dashboard (Protected)</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/onboarding">Onboarding (Auth Required)</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/profile">Profile (Protected)</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/settings">Settings (Protected)</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components */}
          <TabsContent value="components" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auth Components Demo</CardTitle>
                <CardDescription>Interactive component demonstrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AuthConditional Demo */}
                <div className="space-y-2">
                  <h4 className="font-medium">AuthConditional Component:</h4>
                  <AuthConditional
                    authenticated={
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>You are authenticated!</AlertDescription>
                      </Alert>
                    }
                    unauthenticated={
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>You are not authenticated.</AlertDescription>
                      </Alert>
                    }
                    loading={
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>Loading authentication status...</AlertDescription>
                      </Alert>
                    }
                  />
                </div>

                {/* ProtectedRoute Demo */}
                <div className="space-y-2">
                  <h4 className="font-medium">ProtectedRoute Component:</h4>
                  <ProtectedRoute>
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        This content is only visible to authenticated users!
                      </AlertDescription>
                    </Alert>
                  </ProtectedRoute>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Auth Status Debug Component */}
        <AuthStatus />
      </div>
    </div>
  );
}
