import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Settings, Shield, AlertCircle, Loader2, Search, RefreshCw, FileText } from 'lucide-react';
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { PromptModuleCard } from '@/components/ai-prompts/PromptModuleCard';
import { PromptEditorDialog } from '@/components/ai-prompts/PromptEditorDialog';
import {
  getAvailableModules,
  initializeDefaults,
  createPrompt,
  updatePrompt,
  resetToDefault,
  AiModuleInfo,
  AiPromptConfig
} from '@/lib/api/ai-prompts';
import { toast } from 'sonner';

export default function AiPromptConfigPage() {
  const { user, loading: authLoading } = useAuth();
  const [modules, setModules] = useState<AiModuleInfo[]>([]);
  const [filteredModules, setFilteredModules] = useState<AiModuleInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<AiModuleInfo | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  // Load modules on mount
  useEffect(() => {
    if (user) {
      loadModules();
    }
  }, [user]);

  // Filter modules based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredModules(modules);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = modules.filter(
        (module) =>
          module.display_name.toLowerCase().includes(query) ||
          module.description.toLowerCase().includes(query) ||
          module.module_type.toLowerCase().includes(query)
      );
      setFilteredModules(filtered);
    }
  }, [searchQuery, modules]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const response = await getAvailableModules();
      setModules(response.modules);
      setFilteredModules(response.modules);
    } catch (error) {
      console.error('Failed to load modules:', error);
      toast.error('Failed to load AI modules');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      setInitializing(true);
      const result = await initializeDefaults();
      toast.success(result.message);
      await loadModules();
    } catch (error: any) {
      console.error('Failed to initialize defaults:', error);
      toast.error(error.message || 'Failed to initialize defaults');
    } finally {
      setInitializing(false);
    }
  };

  const handleModuleSelect = (module: AiModuleInfo) => {
    setSelectedModule(module);
    setEditorOpen(true);
  };

  const handleReset = async (module: AiModuleInfo) => {
    if (!module.custom_prompt_id) {
      toast.info('This module is already using the system default');
      return;
    }

    if (!confirm(`Reset "${module.display_name}" to system default?`)) {
      return;
    }

    try {
      await resetToDefault(module.custom_prompt_id);
      toast.success('Reset to system default');
      await loadModules();
      // If this was the selected module, close the editor
      if (selectedModule?.module_type === module.module_type) {
        setEditorOpen(false);
        setSelectedModule(null);
      }
    } catch (error: any) {
      console.error('Failed to reset prompt:', error);
      toast.error(error.message || 'Failed to reset prompt');
    }
  };

  const handleEditorSave = async () => {
    // Reload modules after save
    await loadModules();
  };

  const handleEditorClose = () => {
    setEditorOpen(false);
    setSelectedModule(null);
  };

  // Calculate statistics
  const totalCount = modules.length;
  const customCount = modules.filter((m) => m.has_custom_prompt).length;
  const defaultCount = totalCount - customCount;

  if (authLoading) {
    return (
      <>
        <Head>
          <title>AI Prompt Configuration - ChandraHoro</title>
          <meta name="description" content="Configure AI prompts for ChandraHoro insights" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-50">
          <MainNav />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-saffron-500" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Head>
          <title>AI Prompt Configuration - ChandraHoro</title>
          <meta name="description" content="Configure AI prompts for ChandraHoro insights" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-50">
          <MainNav />
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
                <p className="text-muted-foreground">
                  Please sign in to access AI Prompt Configuration.
                </p>
              </CardContent>
            </Card>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>AI Prompt Configuration - ChandraHoro</title>
        <meta name="description" content="Configure AI prompts for ChandraHoro insights" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-50">
        <MainNav />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-saffron-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-saffron-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Prompt Configuration</h1>
                <p className="text-muted-foreground">
                  Customize AI prompts for each insight module to personalize your experience
                </p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white">
                <FileText className="h-3 w-3 mr-1" />
                {totalCount} Total Modules
              </Badge>
              <Badge variant="outline" className="bg-white">
                <Sparkles className="h-3 w-3 mr-1" />
                {customCount} Custom Prompts
              </Badge>
              <Badge variant="outline" className="bg-white">
                <Settings className="h-3 w-3 mr-1" />
                {defaultCount} Using Defaults
              </Badge>
              {isAdmin && (
                <Badge variant="outline" className="bg-white">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin Access
                </Badge>
              )}
            </div>
          </div>

          {/* Info Banner */}
          <Alert className="mb-6">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              Customize the AI prompts used for each insight module. You can use template variables
              like {'{chart_data}'}, {'{planets}'}, {'{houses}'} to personalize the prompts.
              Test your prompts before saving to ensure they work correctly.
            </AlertDescription>
          </Alert>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-saffron-600" />
                        Admin Controls
                      </CardTitle>
                      <CardDescription>
                        Initialize system default prompts for all modules
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleInitializeDefaults}
                      disabled={initializing}
                      variant="outline"
                    >
                      {initializing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          Initialize Defaults
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Search and Refresh */}
          <div className="mb-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search modules by name, description, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={loadModules} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Modules Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-saffron-500" />
                <p className="text-muted-foreground">Loading modules...</p>
              </div>
            </div>
          ) : filteredModules.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No modules found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'No AI modules available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((module) => (
                <PromptModuleCard
                  key={module.module_type}
                  module={module}
                  isSelected={selectedModule?.module_type === module.module_type && editorOpen}
                  onSelect={handleModuleSelect}
                  onReset={handleReset}
                />
              ))}
            </div>
          )}

          {/* Editor Dialog */}
          {selectedModule && (
            <PromptEditorDialog
              open={editorOpen}
              onClose={handleEditorClose}
              module={selectedModule}
              onSave={handleEditorSave}
            />
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>
              AI prompts are used to generate personalized insights and predictions.
              <br />
              All configurations are subject to our{' '}
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

        <Footer />
      </div>
    </>
  );
}


