/**
 * Settings Page Client Component
 * 
 * Main settings interface with tabbed navigation for different
 * settings categories.
 */

'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from './ProfileSettings';
import LanguageSettings from './LanguageSettings';
import AppearanceSettings from './AppearanceSettings';
import ReadingToneSettings from './ReadingToneSettings';
import NotificationSettings from './NotificationSettings';
import AccountSettings from './AccountSettings';

interface SettingsPageClientProps {
  session: Session;
  profile: any;
}

export default function SettingsPageClient({
  session,
  profile,
}: SettingsPageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-charcoal dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and application preferences
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          <TabsTrigger value="profile" className="text-xs lg:text-sm">
            Profile
          </TabsTrigger>
          <TabsTrigger value="language" className="text-xs lg:text-sm">
            Language
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs lg:text-sm">
            Appearance
          </TabsTrigger>
          <TabsTrigger value="tone" className="text-xs lg:text-sm">
            Reading Tone
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs lg:text-sm">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="account" className="text-xs lg:text-sm">
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings session={session} profile={profile} />
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
          <LanguageSettings session={session} profile={profile} />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <AppearanceSettings session={session} profile={profile} />
        </TabsContent>

        <TabsContent value="tone" className="space-y-6">
          <ReadingToneSettings session={session} profile={profile} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings session={session} profile={profile} />
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <AccountSettings session={session} profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
