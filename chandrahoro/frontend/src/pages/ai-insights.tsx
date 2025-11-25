import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Settings, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { MyLlmSettingsCard } from '@/components/ai/MyLlmSettingsCard';
import { AdminControls } from '@/components/ai/AdminControls';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminLlm } from '@/hooks/useAdminLlm';

export default function AiInsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const { defaults, loadDefaults } = useAdminLlm();
  const [activeTab, setActiveTab] = useState('settings');

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  useEffect(() => {
    if (isAdmin) {
      loadDefaults();
    }
  }, [isAdmin, loadDefaults]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-saffron-500" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground">
                Please sign in to access AI Insights settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-saffron-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-saffron-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
              <p className="text-muted-foreground">
                Configure your AI model settings and manage access
              </p>
            </div>
          </div>

          {/* Status Banner */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-white">
              <Settings className="h-3 w-3 mr-1" />
              LLM Configuration
            </Badge>
            {isAdmin && (
              <Badge variant="outline" className="bg-white">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
            )}
            {defaults?.enforced && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                BYOK Disabled
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              My LLM Settings
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Controls
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="settings" className="mt-6">
            <div className="max-w-4xl">
              {/* Info Banner */}
              <Alert className="mb-6">
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Configure your own AI model to power all ChandraHoro AI features including 
                  daily readings, chat assistance, and compatibility analysis. Your API key 
                  is encrypted and never shared.
                </AlertDescription>
              </Alert>

              <MyLlmSettingsCard
                adminEnforced={defaults?.enforced}
                allowedProviders={defaults?.allowedProviders}
              />
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="mt-6">
              <div className="max-w-6xl">
                {/* Admin Info Banner */}
                <Alert className="mb-6">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    As an administrator, you can configure global defaults, manage user access 
                    to BYOK features, set usage quotas, and monitor all LLM-related activities 
                    through the audit log.
                  </AlertDescription>
                </Alert>

                <AdminControls />
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            AI features are powered by leading language models. 
            <br />
            All interactions are subject to our{' '}
            <a href="/privacy" className="text-saffron-600 hover:underline">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" className="text-saffron-600 hover:underline">
              Terms of Service
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
