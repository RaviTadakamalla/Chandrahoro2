/**
 * Account Settings Component
 * 
 * Manages critical account functions including password changes,
 * data export, and account deletion.
 */

'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Key, Download, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AccountSettingsProps {
  session: any;
  profile: any;
}

export default function AccountSettings({ session, profile }: AccountSettingsProps) {
  const router = useRouter();
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Data export state
  const [isExporting, setIsExporting] = useState(false);
  
  // Account deletion state
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to change password');
      }
      
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle data export
  const handleDataExport = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/user/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `chandrahoro-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      toast.success('Account deleted successfully');
      signOut({ callbackUrl: '/' });
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password for better security
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ 
                  ...prev, 
                  currentPassword: e.target.value 
                }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ 
                  ...prev, 
                  newPassword: e.target.value 
                }))}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ 
                  ...prev, 
                  confirmPassword: e.target.value 
                }))}
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
              className="w-full"
            >
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download a copy of all your ChandraHoro data
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will include your profile information, birth charts, readings, 
            and all other data associated with your account. The data will be 
            provided in JSON format.
          </p>
          
          <Button
            onClick={handleDataExport}
            disabled={isExporting}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export My Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Security
          </CardTitle>
          <CardDescription>
            Security information and settings
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Email Verified:</span>
              <span className="ml-2">
                {session?.user?.emailVerified ? (
                  <span className="text-green-600">✓ Verified</span>
                ) : (
                  <span className="text-orange-600">⚠ Not verified</span>
                )}
              </span>
            </div>
            <div>
              <span className="font-medium">Account Created:</span>
              <span className="ml-2">
                {new Date(session?.user?.createdAt || new Date()).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium">Last Login:</span>
              <span className="ml-2">
                {new Date().toLocaleDateString()} (Today)
              </span>
            </div>
            <div>
              <span className="font-medium">Two-Factor Auth:</span>
              <span className="ml-2 text-orange-600">Not enabled</span>
            </div>
          </div>
          
          {!session?.user?.emailVerified && (
            <Button variant="outline" size="sm">
              Verify Email Address
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. All your data, 
              including birth charts, readings, and profile information will be 
              permanently deleted.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="danger" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      This action cannot be undone. This will permanently delete your 
                      account and remove all your data from our servers.
                    </p>
                    <p>
                      Type <strong>DELETE</strong> below to confirm:
                    </p>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="mt-2"
                    />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={deleteConfirmation !== 'DELETE'}
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
