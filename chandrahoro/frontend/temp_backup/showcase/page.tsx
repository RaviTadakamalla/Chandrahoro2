'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner, LoadingSpinnerWithText } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { AlertCircle } from 'lucide-react';

export default function ShowcasePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">ChandraHoro UI Components</h1>
          <p className="text-lg text-muted-foreground">
            A comprehensive showcase of all customized UI components with ChandraHoro design system
          </p>
        </div>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>All button variants and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default (Saffron)</Button>
                <Button variant="secondary">Secondary (Celestial)</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Sizes</h4>
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">States</h4>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button>Enabled</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Cards</CardTitle>
            <CardDescription>Card component with shadow variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card shadow="sm">
                <CardHeader>
                  <CardTitle className="text-base">Small Shadow</CardTitle>
                </CardHeader>
                <CardContent>Subtle shadow effect</CardContent>
              </Card>

              <Card shadow="md" hover>
                <CardHeader>
                  <CardTitle className="text-base">Medium Shadow (Hover)</CardTitle>
                </CardHeader>
                <CardContent>Hover to see lift effect</CardContent>
              </Card>

              <Card shadow="lg">
                <CardHeader>
                  <CardTitle className="text-base">Large Shadow</CardTitle>
                </CardHeader>
                <CardContent>Prominent shadow</CardContent>
              </Card>

              <Card shadow="xl">
                <CardHeader>
                  <CardTitle className="text-base">Extra Large Shadow</CardTitle>
                </CardHeader>
                <CardContent>Maximum shadow depth</CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>Input component with validation states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Input</Label>
              <Input placeholder="Enter text..." />
            </div>

            <div className="space-y-2">
              <Label>Success State</Label>
              <Input success placeholder="Success input" />
            </div>

            <div className="space-y-2">
              <Label>Error State</Label>
              <Input error placeholder="Error input" />
            </div>

            <div className="space-y-2">
              <Label>Disabled State</Label>
              <Input disabled placeholder="Disabled input" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>Pill-style tabs with gradient active state</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Tab One</TabsTrigger>
                <TabsTrigger value="tab2">Tab Two</TabsTrigger>
                <TabsTrigger value="tab3">Tab Three</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="mt-4">
                <p>Content for tab one</p>
              </TabsContent>
              <TabsContent value="tab2" className="mt-4">
                <p>Content for tab two</p>
              </TabsContent>
              <TabsContent value="tab3" className="mt-4">
                <p>Content for tab three</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dialog */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog</CardTitle>
            <CardDescription>Modal dialog with backdrop blur and animations</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog Title</DialogTitle>
                  <DialogDescription>
                    This is a dialog with smooth animations and backdrop blur effect.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Enter something..." />
                  <div className="flex gap-2">
                    <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Loading Spinner */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Spinner</CardTitle>
            <CardDescription>Animated loading indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-8">
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-xs text-muted-foreground">Small</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner size="md" />
                <span className="text-xs text-muted-foreground">Medium</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner size="lg" />
                <span className="text-xs text-muted-foreground">Large</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner size="xl" />
                <span className="text-xs text-muted-foreground">Extra Large</span>
              </div>
            </div>

            <div>
              <LoadingSpinnerWithText text="Loading..." size="md" />
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <Card>
          <CardHeader>
            <CardTitle>Empty State</CardTitle>
            <CardDescription>Empty state component with actions</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<AlertCircle className="h-6 w-6 text-muted-foreground" />}
              title="No data available"
              description="There are no items to display. Create one to get started."
              action={{
                label: 'Create Item',
                onClick: () => alert('Create action clicked'),
              }}
              secondaryAction={{
                label: 'Learn more',
                onClick: () => alert('Learn more clicked'),
              }}
            />
          </CardContent>
        </Card>

        {/* Dark Mode Info */}
        <Card>
          <CardHeader>
            <CardTitle>Dark Mode Support</CardTitle>
            <CardDescription>All components support dark mode</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Toggle dark mode in your system settings to see all components adapt automatically.
              The design system uses CSS variables for seamless theme switching.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

