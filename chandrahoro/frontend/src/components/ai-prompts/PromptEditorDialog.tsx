/**
 * Prompt Editor Dialog Component
 * 
 * Modal dialog for editing AI prompts with preview and test functionality.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Save,
  X,
  TestTube,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
  RotateCcw,
  Settings,
  Upload,
  FileText,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { AiModuleInfo, AiPromptConfigCreate, AiPromptConfigUpdate } from '@/types/ai-prompts';
import { createPrompt, updatePrompt, testPrompt, getPromptById } from '@/lib/api/ai-prompts';
import { API_BASE_URL } from '@/lib/constants';

interface PromptEditorDialogProps {
  open: boolean;
  onClose: () => void;
  module: AiModuleInfo | null;
  onSave: () => void;
}

export function PromptEditorDialog({ open, onClose, module, onSave }: PromptEditorDialogProps) {
  const [useCustom, setUseCustom] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [outputFormat, setOutputFormat] = useState('markdown');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(2000);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('edit');
  const [sampleFormatFile, setSampleFormatFile] = useState<File | null>(null);
  const [currentSampleFormat, setCurrentSampleFormat] = useState<{
    filename: string;
    type: string;
    uploaded_at: string;
  } | null>(null);
  const [isUploadingSample, setIsUploadingSample] = useState(false);

  // Load prompt data when module changes
  useEffect(() => {
    if (module && open) {
      loadPromptData();
    }
  }, [module, open]);

  const loadPromptData = async () => {
    if (!module) return;

    setIsLoading(true);
    setTestResult(null);
    setActiveTab('edit');

    try {
      if (module.has_custom_prompt && module.custom_prompt_id) {
        // Load existing custom prompt
        const promptConfig = await getPromptById(module.custom_prompt_id);
        setUseCustom(true);
        setCustomPrompt(promptConfig.custom_prompt);
        setOutputFormat(promptConfig.output_format || 'markdown');
        setTemperature(promptConfig.temperature || 0.7);
        setMaxTokens(promptConfig.max_tokens || 2000);
        setIsEnabled(promptConfig.is_enabled);

        // Load sample format info if exists
        if (promptConfig.sample_format_filename) {
          setCurrentSampleFormat({
            filename: promptConfig.sample_format_filename,
            type: promptConfig.sample_format_type || 'unknown',
            uploaded_at: promptConfig.sample_format_uploaded_at || ''
          });
        } else {
          setCurrentSampleFormat(null);
        }
      } else {
        // Use system default
        setUseCustom(false);
        setCustomPrompt(module.default_prompt);
        setOutputFormat('markdown');
        setTemperature(0.7);
        setMaxTokens(2000);
        setIsEnabled(true);
      }
    } catch (error: any) {
      console.error('Failed to load prompt data:', error);
      toast.error('Failed to load prompt configuration');
      // Fallback to default
      setUseCustom(false);
      setCustomPrompt(module.default_prompt);
      setOutputFormat('markdown');
      setTemperature(0.7);
      setMaxTokens(2000);
      setIsEnabled(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!module) return;
    
    if (!useCustom) {
      toast.info('Using system default prompt');
      onClose();
      return;
    }

    if (!customPrompt.trim()) {
      toast.error('Please enter a custom prompt');
      return;
    }

    setIsSaving(true);
    
    try {
      if (module.has_custom_prompt && module.custom_prompt_id) {
        // Update existing prompt
        const updateData: AiPromptConfigUpdate = {
          custom_prompt: customPrompt,
          output_format: outputFormat,
          temperature,
          max_tokens: maxTokens,
          is_enabled: isEnabled,
        };
        
        await updatePrompt(module.custom_prompt_id, updateData);
        toast.success('Prompt updated successfully');
      } else {
        // Create new prompt
        const createData: AiPromptConfigCreate = {
          module_type: module.module_type,
          custom_prompt: customPrompt,
          output_format: outputFormat,
          temperature,
          max_tokens: maxTokens,
          is_enabled: isEnabled,
        };
        
        await createPrompt(createData);
        toast.success('Custom prompt created successfully');
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save prompt');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!module) {
      toast.error('No module selected');
      return;
    }

    // Use the current prompt text (custom or default)
    const promptToTest = useCustom ? customPrompt : module.default_prompt;

    if (!promptToTest.trim()) {
      toast.error('Please enter a prompt to test');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testPrompt({
        module_type: module.module_type,
        custom_prompt: promptToTest,
        temperature,
        max_tokens: maxTokens,
      });

      setTestResult(result);
      setActiveTab('preview');

      if (result.warnings.length > 0) {
        toast.warning(`Test completed with ${result.warnings.length} warning(s)`);
      } else {
        toast.success('Prompt tested successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to test prompt');
    } finally {
      setIsTesting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.html', '.pdf', '.htm'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!allowedTypes.includes(fileExt)) {
        toast.error('Invalid file type. Please upload HTML or PDF files only.');
        return;
      }

      setSampleFormatFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const handleUploadSampleFormat = async () => {
    if (!sampleFormatFile || !module?.custom_prompt_id) {
      toast.error('Please select a file and save the prompt first');
      return;
    }

    setIsUploadingSample(true);
    try {
      const formData = new FormData();
      formData.append('file', sampleFormatFile);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE_URL}/api/v1/ai-prompts/${module.custom_prompt_id}/upload-sample-format`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to upload sample format');
      }

      const result = await response.json();
      setCurrentSampleFormat({
        filename: result.sample_format_filename,
        type: result.sample_format_type,
        uploaded_at: result.sample_format_uploaded_at
      });
      setSampleFormatFile(null);
      toast.success('Sample format uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload sample format');
    } finally {
      setIsUploadingSample(false);
    }
  };

  const handleDeleteSampleFormat = async () => {
    if (!module?.custom_prompt_id) return;

    setIsUploadingSample(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE_URL}/api/v1/ai-prompts/${module.custom_prompt_id}/sample-format`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete sample format');
      }

      setCurrentSampleFormat(null);
      setSampleFormatFile(null);
      toast.success('Sample format deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete sample format');
    } finally {
      setIsUploadingSample(false);
    }
  };

  if (!module) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-saffron-600" />
            Configure {module.display_name}
          </DialogTitle>
          <DialogDescription>
            {module.has_custom_prompt
              ? 'Viewing and editing your custom prompt configuration'
              : 'Currently using system default. Toggle below to create a custom prompt.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-saffron-600" />
            <span className="ml-3 text-gray-600">Loading prompt configuration...</span>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
          {/* Prompt Source Selector */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent">
            <div className="flex-1">
              <Label className="text-base font-medium">Prompt Source</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {useCustom ? (
                  <>
                    <span className="font-medium text-saffron-600">Custom Prompt</span> - You can edit and save your own prompt
                  </>
                ) : (
                  <>
                    <span className="font-medium text-gray-700 dark:text-gray-300">System Default</span> - Using the built-in prompt (read-only)
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">System Default</span>
              <Switch
                checked={useCustom}
                onCheckedChange={(checked) => {
                  setUseCustom(checked);
                  if (checked && !module.has_custom_prompt) {
                    // When switching to custom for the first time, copy the default prompt
                    setCustomPrompt(module.default_prompt);
                  }
                }}
              />
              <span className="text-sm text-saffron-600 font-medium">Custom</span>
            </div>
          </div>

          {/* Available Variables */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Available Template Variables</Label>
            <div className="flex flex-wrap gap-2">
              {module.available_variables.map((variable) => (
                <Badge
                  key={variable}
                  variant="outline"
                  className="cursor-pointer hover:bg-saffron-100 dark:hover:bg-saffron-900/30"
                  onClick={() => {
                    setCustomPrompt(prev => prev + `{${variable}}`);
                  }}
                >
                  {`{${variable}}`}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click on a variable to insert it into your prompt
            </p>
          </div>

          {/* Tabs for Edit/Preview */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="edit">
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="default">
                <Eye className="h-4 w-4 mr-2" />
                Default
              </TabsTrigger>
              <TabsTrigger value="preview">
                <TestTube className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* Edit Tab */}
            <TabsContent value="edit" className="space-y-4">
              {!useCustom && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    You are viewing the system default prompt. Toggle "Custom" above to create your own editable version.
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="current-prompt">
                  {useCustom ? 'Custom Prompt' : 'Current Prompt (System Default)'}
                </Label>
                <Textarea
                  id="current-prompt"
                  value={useCustom ? customPrompt : module.default_prompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={!useCustom}
                  placeholder={useCustom ? "Enter your custom prompt here..." : "System default prompt (read-only)"}
                  className={`min-h-[300px] font-mono text-sm mt-2 ${!useCustom ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {(useCustom ? customPrompt : module.default_prompt).length} characters
                  {!useCustom && ' (read-only)'}
                </p>
              </div>

              <Separator />

              {/* Configuration Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="output-format">Output Format</Label>
                  <Select value={outputFormat} onValueChange={setOutputFormat} disabled={!useCustom}>
                    <SelectTrigger id="output-format" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="plain">Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="temperature">Temperature: {temperature}</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    disabled={!useCustom}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    disabled={!useCustom}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-enabled"
                    checked={isEnabled}
                    onCheckedChange={setIsEnabled}
                    disabled={!useCustom}
                  />
                  <Label htmlFor="is-enabled">Enable this prompt</Label>
                </div>
              </div>

              <Separator />

              {/* Sample Format Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Sample Output Format (Optional)</Label>
                <p className="text-xs text-gray-500">
                  Upload an HTML or PDF file showing your desired output format. The AI will use this as a reference when generating responses.
                </p>

                {currentSampleFormat ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          {currentSampleFormat.filename}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {currentSampleFormat.type.toUpperCase()} • Uploaded {new Date(currentSampleFormat.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteSampleFormat}
                      disabled={isUploadingSample || !useCustom}
                      className="text-red-600 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept=".html,.htm,.pdf"
                      onChange={handleFileSelect}
                      disabled={!useCustom || !module.has_custom_prompt}
                      className="cursor-pointer"
                    />
                    {sampleFormatFile && (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleUploadSampleFormat}
                          disabled={isUploadingSample || !module.has_custom_prompt}
                          size="sm"
                          className="bg-saffron-600 hover:bg-saffron-700"
                        >
                          {isUploadingSample ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Sample Format
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSampleFormatFile(null)}
                          disabled={isUploadingSample}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {!module.has_custom_prompt && useCustom && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-xs">
                      Please save your custom prompt first before uploading a sample format.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            {/* Default Tab */}
            <TabsContent value="default" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This is the system default prompt. You can use it as a reference when creating your custom prompt.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {module.default_prompt}
                </pre>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              {testResult ? (
                <>
                  {/* Warnings */}
                  {testResult.warnings.length > 0 && (
                    <Alert variant="warning">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside">
                          {testResult.warnings.map((warning: string, index: number) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Template Variables */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Template Variables Found</Label>
                    <div className="flex flex-wrap gap-2">
                      {testResult.template_variables.map((variable: string) => (
                        <Badge key={variable} variant="outline">
                          {`{${variable}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Filled Prompt */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Preview with Sample Data</Label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-[400px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">
                        {testResult.filled_prompt}
                      </pre>
                    </div>
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Click "Test Prompt" to preview how your prompt will look with sample data.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!useCustom || !customPrompt.trim() || isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Prompt
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

