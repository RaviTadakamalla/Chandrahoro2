import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Users, FileText, Download, Search, RotateCcw, Trash2, Shield, AlertCircle } from 'lucide-react';
import { useAdminLlm } from '@/hooks/useAdminLlm';
import { AdminDefaults, LlmProvider, PROVIDER_LABELS, ResponseFormat } from '@/types/llm';
import { ProviderSelect } from './ProviderSelect';
import { ExtraHeadersEditor } from './ExtraHeadersEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { toast } from 'sonner';

export function AdminControls() {
  const {
    defaults,
    users,
    audit,
    loading,
    saving,
    error,
    pagination,
    loadDefaults,
    saveDefaults,
    loadUsers,
    toggleUserByok,
    setUserCap,
    loadAudit,
    exportUsersCSV,
    clearError
  } = useAdminLlm();

  const [defaultsForm, setDefaultsForm] = useState<AdminDefaults>({
    enforced: false,
    allowedProviders: [],
    defaultProvider: 'openai',
    defaultModel: 'gpt-4',
    baseUrl: '',
    extraHeaders: {},
    maxOutputTokens: 4000,
    responseFormats: ['auto', 'text', 'json'],
    perUserDailyCap: 100,
    globalDailyCap: 10000
  });

  const [userSearch, setUserSearch] = useState('');
  const [auditFilters, setAuditFilters] = useState({
    query: '',
    from: '',
    to: ''
  });

  const [showCapDialog, setShowCapDialog] = useState<{ userId: string; currentCap: number } | null>(null);
  const [newCap, setNewCap] = useState<number>(0);

  useEffect(() => {
    loadDefaults();
    loadUsers();
    loadAudit();
  }, [loadDefaults, loadUsers, loadAudit]);

  useEffect(() => {
    if (defaults) {
      setDefaultsForm(defaults);
    }
  }, [defaults]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDefaultsChange = (field: keyof AdminDefaults, value: any) => {
    setDefaultsForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDefaults = async () => {
    const success = await saveDefaults(defaultsForm);
    if (success) {
      toast.success('Admin defaults saved successfully');
    }
  };

  const handleProviderToggle = (provider: LlmProvider, checked: boolean) => {
    const current = defaultsForm.allowedProviders || [];
    const updated = checked 
      ? [...current, provider]
      : current.filter(p => p !== provider);
    handleDefaultsChange('allowedProviders', updated);
  };

  const handleResponseFormatToggle = (format: ResponseFormat, checked: boolean) => {
    const current = defaultsForm.responseFormats || [];
    const updated = checked 
      ? [...current, format]
      : current.filter(f => f !== format);
    handleDefaultsChange('responseFormats', updated);
  };

  const handleUserSearch = () => {
    loadUsers(userSearch, 1);
  };

  const handleAuditSearch = () => {
    loadAudit(auditFilters.query, auditFilters.from, auditFilters.to, 1);
  };

  const handleSetUserCap = async () => {
    if (!showCapDialog) return;
    
    const success = await setUserCap(showCapDialog.userId, newCap);
    if (success) {
      toast.success('User cap updated successfully');
      setShowCapDialog(null);
    }
  };

  const handleExportCSV = async () => {
    const csvData = await exportUsersCSV();
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `llm-users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('User data exported successfully');
    }
  };

  if (loading && !defaults) {
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="defaults" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="defaults" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Global Defaults
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Access & Quotas
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="defaults" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Global Defaults
              </CardTitle>
              <CardDescription>
                Configure default settings and restrictions for all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enforced"
                  checked={defaultsForm.enforced || false}
                  onCheckedChange={(checked) => handleDefaultsChange('enforced', checked)}
                />
                <Label htmlFor="enforced" className="font-medium">
                  Enforce single model (disable BYOK)
                </Label>
              </div>

              {defaultsForm.enforced && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      When enabled, users cannot configure their own models
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Default Provider</Label>
                  <ProviderSelect
                    value={defaultsForm.defaultProvider || 'openai'}
                    onValueChange={(value) => handleDefaultsChange('defaultProvider', value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Default Model</Label>
                  <Input
                    value={defaultsForm.defaultModel || ''}
                    onChange={(e) => handleDefaultsChange('defaultModel', e.target.value)}
                    placeholder="e.g., gpt-4"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Base URL (Optional)</Label>
                <Input
                  value={defaultsForm.baseUrl || ''}
                  onChange={(e) => handleDefaultsChange('baseUrl', e.target.value)}
                  placeholder="https://api.example.com/v1"
                  className="mt-1"
                />
              </div>

              <ExtraHeadersEditor
                headers={defaultsForm.extraHeaders || {}}
                onChange={(headers) => handleDefaultsChange('extraHeaders', headers)}
              />

              <div>
                <Label className="text-sm font-medium mb-3 block">Allowed Providers</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PROVIDER_LABELS) as LlmProvider[]).map((provider) => (
                    <div key={provider} className="flex items-center space-x-2">
                      <Checkbox
                        id={`provider-${provider}`}
                        checked={(defaultsForm.allowedProviders || []).includes(provider)}
                        onCheckedChange={(checked) => handleProviderToggle(provider, checked as boolean)}
                      />
                      <Label htmlFor={`provider-${provider}`} className="text-sm">
                        {PROVIDER_LABELS[provider]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Allowed Response Formats</Label>
                <div className="flex gap-4">
                  {(['auto', 'text', 'json'] as ResponseFormat[]).map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox
                        id={`format-${format}`}
                        checked={(defaultsForm.responseFormats || []).includes(format)}
                        onCheckedChange={(checked) => handleResponseFormatToggle(format, checked as boolean)}
                      />
                      <Label htmlFor={`format-${format}`} className="text-sm capitalize">
                        {format}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Max Output Tokens</Label>
                  <Input
                    type="number"
                    value={defaultsForm.maxOutputTokens || ''}
                    onChange={(e) => handleDefaultsChange('maxOutputTokens', parseInt(e.target.value) || undefined)}
                    placeholder="4000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Per-User Daily Cap</Label>
                  <Input
                    type="number"
                    value={defaultsForm.perUserDailyCap || ''}
                    onChange={(e) => handleDefaultsChange('perUserDailyCap', parseInt(e.target.value) || undefined)}
                    placeholder="100"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Global Daily Cap</Label>
                  <Input
                    type="number"
                    value={defaultsForm.globalDailyCap || ''}
                    onChange={(e) => handleDefaultsChange('globalDailyCap', parseInt(e.target.value) || undefined)}
                    placeholder="10000"
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              <Button
                onClick={handleSaveDefaults}
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Saving...' : 'Save Defaults'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Access & Quotas
              </CardTitle>
              <CardDescription>
                Manage user LLM configurations and usage limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
                  />
                </div>
                <Button onClick={handleUserSearch} variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
                <Button onClick={handleExportCSV} variant="outline">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Provider/Model</TableHead>
                      <TableHead>Usage Today</TableHead>
                      <TableHead>Quota</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.user}>
                        <TableCell className="font-medium">{user.user}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'enabled' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.provider && user.model ? (
                            <div className="text-sm">
                              <div className="font-medium">{PROVIDER_LABELS[user.provider as LlmProvider]}</div>
                              <div className="text-muted-foreground">{user.model}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Default</span>
                          )}
                        </TableCell>
                        <TableCell>{user.usageToday}</TableCell>
                        <TableCell>
                          {user.quota ? (
                            <Badge variant="outline">{user.quota}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Unlimited</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleUserByok(user.user)}
                            >
                              {user.status === 'enabled' ? 'Disable' : 'Enable'} BYOK
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowCapDialog({ userId: user.user, currentCap: user.quota || 0 });
                                setNewCap(user.quota || 0);
                              }}
                            >
                              Set Cap
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Log
              </CardTitle>
              <CardDescription>
                View all LLM configuration changes and actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <Input
                  placeholder="Search..."
                  value={auditFilters.query}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, query: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="From date"
                  value={auditFilters.from}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, from: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="To date"
                  value={auditFilters.to}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, to: e.target.value }))}
                />
                <Button onClick={handleAuditSearch} variant="outline">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm">
                          {new Date(row.at).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{row.user}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {row.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {row.provider ? PROVIDER_LABELS[row.provider as LlmProvider] : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.result === 'success' ? 'default' : 'destructive'}>
                            {row.result}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {row.ipMasked || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.note || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showCapDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Set User Cap</CardTitle>
              <CardDescription>
                Set daily usage cap for {showCapDialog.userId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newCap">Daily Usage Cap</Label>
                <Input
                  id="newCap"
                  type="number"
                  value={newCap}
                  onChange={(e) => setNewCap(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCapDialog(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSetUserCap}>
                  Set Cap
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
