import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Settings, Trash2, RotateCcw, TestTube, Sparkles, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useLlmConfig } from '@/hooks/useLlmConfig';
import { LlmConfigInput, LlmProvider, PROVIDER_LABELS, PROVIDERS_REQUIRING_BASE_URL, AZURE_ONLY_PROVIDERS, DEFAULT_MODELS, ResponseFormat } from '@/types/llm';
import { ProviderSelect } from './ProviderSelect';
import { ExtraHeadersEditor } from './ExtraHeadersEditor';
import { TestConnectionBadge, TestConnectionDetails } from './TestConnectionBadge';
import { ConfirmDialog } from './ConfirmDialog';
import { toast } from 'sonner';

interface MyLlmSettingsCardProps {
  adminEnforced?: boolean;
  allowedProviders?: LlmProvider[];
}

export function MyLlmSettingsCard({ adminEnforced = false, allowedProviders }: MyLlmSettingsCardProps) {
  const {
    config,
    loading,
    error,
    testResult,
    testing,
    saving,
    rotating,
    deleting,
    loadConfig,
    testConnection,
    saveConfig,
    rotateKey,
    deleteConfig,
    clearError,
    clearTestResult
  } = useLlmConfig();

  const [formData, setFormData] = useState<LlmConfigInput>({
    provider: 'openai',
    model: '',
    apiKey: '',
    baseUrl: '',
    extraHeaders: {},
    region: '',
    deployment: '',
    responseFormat: 'auto',
    dailyLimit: undefined
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRotateDialog, setShowRotateDialog] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleProviderChange = (provider: LlmProvider) => {
    setFormData(prev => ({
      ...prev,
      provider,
      model: DEFAULT_MODELS[provider] || '',
      baseUrl: PROVIDERS_REQUIRING_BASE_URL.includes(provider) ? prev.baseUrl : '',
      region: AZURE_ONLY_PROVIDERS.includes(provider) ? prev.region : '',
      deployment: AZURE_ONLY_PROVIDERS.includes(provider) ? prev.deployment : ''
    }));
    clearTestResult();
  };

  const handleInputChange = (field: keyof LlmConfigInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearTestResult();
  };

  const handleTest = async () => {
    if (!formData.apiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your API key before testing',
        variant: 'destructive'
      });
      return;
    }

    const result = await testConnection(formData);
    if (result.ok) {
      toast({
        title: 'Connection Successful',
        description: `Connected to ${PROVIDER_LABELS[formData.provider]} successfully`,
      });
    } else {
      toast({
        title: 'Connection Failed',
        description: result.error || 'Failed to connect to provider',
        variant: 'destructive'
      });
    }
  };

  const handleSave = async () => {
    if (!testResult?.ok) {
      toast({
        title: 'Test Required',
        description: 'Please test the connection before saving',
        variant: 'destructive'
      });
      return;
    }

    const success = await saveConfig(formData);
    if (success) {
      toast({
        title: 'Configuration Saved',
        description: 'Your LLM configuration has been saved successfully',
      });
    }
  };

  const handleRotate = async () => {
    const success = await rotateKey();
    if (success) {
      toast({
        title: 'Key Rotated',
        description: 'Your API key has been rotated. Please enter your new key.',
      });
      setFormData(prev => ({ ...prev, apiKey: '' }));
      clearTestResult();
    }
    setShowRotateDialog(false);
  };

  const handleDelete = async () => {
    const success = await deleteConfig();
    if (success) {
      toast({
        title: 'Configuration Deleted',
        description: 'Your LLM configuration has been deleted',
      });
      setFormData({
        provider: 'openai',
        model: DEFAULT_MODELS.openai,
        apiKey: '',
        baseUrl: '',
        extraHeaders: {},
        region: '',
        deployment: '',
        responseFormat: 'auto',
        dailyLimit: undefined
      });
      clearTestResult();
    }
    setShowDeleteDialog(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (adminEnforced) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            My LLM Settings
          </CardTitle>
          <CardDescription>
            Your AI model configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              BYOK (Bring Your Own Key) has been disabled by your administrator. 
              All AI features will use the organization's default model configuration.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show setup form if no config exists
  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Configure LLM
          </CardTitle>
          <CardDescription>
            Set up your own AI model to power all ChandraHoro AI features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Essential Fields - Always Visible */}
            <div>
              <Label htmlFor="provider">Provider *</Label>
              <ProviderSelect
                value={formData.provider}
                onValueChange={handleProviderChange}
                allowedProviders={allowedProviders}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="e.g., gpt-4, claude-3-5-sonnet-20241022"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="apiKey">API Key *</Label>
              <div className="relative mt-1">
                <Input
                  id="apiKey"
                  name="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder="Enter your API key"
                  className="pr-10"
                  autoComplete="new-password"
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Auto-show Base URL for providers that require it */}
            {PROVIDERS_REQUIRING_BASE_URL.includes(formData.provider) && (
              <div>
                <Label htmlFor="baseUrl">Base URL *</Label>
                <Input
                  id="baseUrl"
                  value={formData.baseUrl}
                  onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                  placeholder="https://api.example.com/v1"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for {PROVIDER_LABELS[formData.provider]}
                </p>
              </div>
            )}

            {/* Auto-show Azure fields when Azure is selected */}
            {AZURE_ONLY_PROVIDERS.includes(formData.provider) && (
              <>
                <div>
                  <Label htmlFor="region">Azure Region *</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    placeholder="e.g., eastus"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deployment">Deployment Name *</Label>
                  <Input
                    id="deployment"
                    value={formData.deployment}
                    onChange={(e) => handleInputChange('deployment', e.target.value)}
                    placeholder="Your deployment name"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {/* Advanced Options Toggle */}
            <div className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full justify-between p-3 h-auto border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-700">
                  {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                </span>
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>

            {/* Advanced Fields - Conditionally Visible */}
            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-600 mb-3">
                  Advanced Configuration
                </div>

                <ExtraHeadersEditor
                  headers={formData.extraHeaders || {}}
                  onChange={(headers) => handleInputChange('extraHeaders', headers)}
                />

                <div>
                  <Label htmlFor="responseFormat">Response Format</Label>
                  <Select
                    value={formData.responseFormat}
                    onValueChange={(value: ResponseFormat) => handleInputChange('responseFormat', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    How the AI should format its responses
                  </p>
                </div>

                <div>
                  <Label htmlFor="dailyLimit">Daily Usage Hint</Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    value={formData.dailyLimit || ''}
                    onChange={(e) => handleInputChange('dailyLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 100"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Personal reminder for your daily usage limit
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <TestConnectionDetails result={testResult} testing={testing} />
            
            <div className="flex gap-2">
              <Button
                onClick={handleTest}
                disabled={testing || !formData.apiKey.trim()}
                variant="outline"
                className="flex-1"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={saving || !testResult?.ok}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show ready state if config exists
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          LLM Configuration Ready
        </CardTitle>
        <CardDescription>
          AI features across ChandraHoro will use this model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Essential Info - Always Visible */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm text-muted-foreground">Provider & Model</Label>
              <p className="font-medium text-lg">
                {PROVIDER_LABELS[config.provider]} • {config.model}
              </p>
            </div>
            <div className="text-right">
              <Label className="text-sm text-muted-foreground">Usage Today</Label>
              <div className="flex items-center gap-2 justify-end">
                <span className="font-medium text-lg">{config.usageToday}</span>
                {config.dailyLimit && (
                  <Badge variant="outline" className="text-xs">
                    / {config.dailyLimit}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">API Key:</span>
              <span className="font-mono">****{config.keyLastFour}</span>
            </div>
            <div className="text-muted-foreground">
              Last validated: {new Date(config.lastValidatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Details Toggle */}
        <div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full justify-between p-3 h-auto border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">
              {showDetails ? 'Hide Details' : 'View Details'}
            </span>
            {showDetails ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>

        {/* Detailed Info - Conditionally Visible */}
        {showDetails && (
          <div className="space-y-4 pt-2 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {config.baseUrl && (
                <div>
                  <Label className="text-xs text-muted-foreground">Base URL</Label>
                  <p className="font-mono text-xs break-all">{config.baseUrl}</p>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Last Validated</Label>
                <p className="text-xs">{new Date(config.lastValidatedAt).toLocaleString()}</p>
              </div>
              {config.dailyLimit && (
                <div>
                  <Label className="text-xs text-muted-foreground">Daily Limit</Label>
                  <p className="text-xs">{config.dailyLimit} requests</p>
                </div>
              )}
            </div>
          </div>
        )}

        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            All AI features (daily readings, chat, compatibility analysis) will use your configured model.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowRotateDialog(true)}
            disabled={rotating}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Rotate Key
          </Button>
          
          <Button
            onClick={handleTest}
            disabled={testing}
            variant="outline"
            size="sm"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Re-Test
          </Button>
          
          <Button
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Configuration
          </Button>
        </div>

        <ConfirmDialog
          open={showRotateDialog}
          onOpenChange={setShowRotateDialog}
          title="Rotate API Key"
          description="This will invalidate your current API key. You'll need to enter a new one after rotation."
          confirmText="Rotate Key"
          onConfirm={handleRotate}
          loading={rotating}
        />

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Configuration"
          description="This will permanently delete your LLM configuration. AI features will fall back to the default model."
          confirmText="Delete"
          onConfirm={handleDelete}
          loading={deleting}
          variant="destructive"
        />
      </CardContent>
    </Card>
  );
}
