/**
 * Profile Settings Component
 * 
 * Allows users to edit their profile information including
 * name, avatar, and basic details.
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Upload, User } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfileSettingsProps {
  session: any;
  profile: any;
}

export default function ProfileSettings({ session, profile }: ProfileSettingsProps) {
  const { update } = useSession();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || session?.user?.name || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
  });
  
  const [isUploading, setIsUploading] = useState(false);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      update(); // Update NextAuth session
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      // Upload to your storage solution
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { data } = await uploadResponse.json();
      const avatarUrl = data.url;

      // Update profile with new avatar URL
      await updateProfile.mutateAsync({ avatarUrl });
      
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  // Generate user initials
  const initials = (formData.fullName || session?.user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and profile picture
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage 
                src={session?.user?.image || profile?.avatarUrl} 
                alt="Profile picture"
              />
              <AvatarFallback className="text-xl bg-saffron-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {/* Upload overlay */}
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Profile Picture</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click on the avatar to upload a new picture. Max size: 5MB
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Change Avatar'}
            </Button>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={session?.user?.email || ''}
              disabled
              className="bg-gray-50 dark:bg-gray-900"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us a bit about yourself..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
