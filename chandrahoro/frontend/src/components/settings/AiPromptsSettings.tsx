/**
 * AI Prompts Settings Component
 * 
 * Main component for managing AI prompt configurations.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  Settings, 
  AlertCircle, 
  Loader2, 
  Search,
  RefreshCw,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { AiModuleInfo } from '@/types/ai-prompts';
import { getAvailableModules, resetToDefault, initializeDefaults } from '@/lib/api/ai-prompts';
import { PromptModuleCard } from '@/components/ai-prompts/PromptModuleCard';
import { PromptEditorDialog } from '@/components/ai-prompts/PromptEditorDialog';

interface AiPromptsSettingsProps {
  session: any;
  profile: any;
}

export default function AiPromptsSettings({ session, profile }: AiPromptsSettingsProps) {
  const [modules, setModules] = useState<AiModuleInfo[]>([]);
  const [filteredModules, setFilteredModules] = useState<AiModuleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<AiModuleInfo | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'owner';

  // Load modules
  const loadModules = async () => {
    setLoading(true);
    try {
      const response = await getAvailableModules();
      setModules(response.modules);
      setFilteredModules(response.modules);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load AI modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

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

  const handleConfigure = (module: AiModuleInfo) => {
    setSelectedModule(module);
    setEditorOpen(true);
  };

  const handleReset = async (module: AiModuleInfo) => {
    if (!confirm(`Are you sure you want to reset "${module.display_name}" to the system default?`)) {
      return;
    }

    try {
      await resetToDefault({ module_type: module.module_type });
      toast.success('Prompt reset to default successfully');
      loadModules();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset prompt');
    }
  };

  const handleInitializeDefaults = async () => {
    if (!confirm('This will initialize system default prompts for all modules. Continue?')) {
      return;
    }

    setInitializing(true);
    try {
      const result = await initializeDefaults();
      toast.success(result.message);
      loadModules();
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize defaults');
    } finally {
      setInitializing(false);
    }
  };

  const handleEditorClose = () => {
    setEditorOpen(false);
    setSelectedModule(null);
  };

  const handleEditorSave = () => {
    loadModules();
  };

  const customCount = modules.filter((m) => m.has_custom_prompt).length;
  const totalCount = modules.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-saffron-100 dark:bg-saffron-900/30 rounded-lg">
                <Sparkles className="h-6 w-6 text-saffron-600 dark:text-saffron-400" />
              </div>
              <div>
                <CardTitle>AI Prompt Configuration</CardTitle>
                <CardDescription>
                  Customize AI prompts for each insight module
                </CardDescription>
              </div>
            </div>
            
            {isAdmin && (
              <Button
                variant="outline"
                onClick={handleInitializeDefaults}
                disabled={initializing}
              >
                {initializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Initialize Defaults
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Info Banner */}
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          Customize AI prompts for each module to match your preferred style and tone.
          Your custom prompts will be used for all AI-generated insights in that module.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-saffron-600">{totalCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Modules</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{customCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Custom Prompts</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600">{totalCount - customCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Using Defaults</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={loadModules}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Modules Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-saffron-500" />
            <p className="text-gray-600 dark:text-gray-400">Loading AI modules...</p>
          </div>
        </div>
      ) : filteredModules.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'No modules found matching your search' : 'No AI modules available'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((module) => (
            <PromptModuleCard
              key={module.module_type}
              module={module}
              onConfigure={handleConfigure}
              onReset={handleReset}
            />
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <PromptEditorDialog
        open={editorOpen}
        onClose={handleEditorClose}
        module={selectedModule}
        onSave={handleEditorSave}
      />
    </div>
  );
}

