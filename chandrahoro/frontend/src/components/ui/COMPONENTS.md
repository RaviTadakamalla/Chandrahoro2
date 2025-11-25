# ChandraHoro UI Components Documentation

## Overview

All UI components are built with ChandraHoro design system tokens and follow accessibility best practices (WCAG AA). Components support dark mode, responsive design, and TypeScript.

## Button Component

### Variants

- **default**: Saffron gradient background (primary CTA)
- **secondary**: Celestial medium background
- **outline**: Border with hover fill
- **ghost**: Transparent with hover effects
- **danger**: Red for destructive actions
- **link**: Text link style

### Sizes

- **sm**: Small (h-9, text-xs)
- **default**: Default (h-10)
- **md**: Medium (h-11)
- **lg**: Large (h-12, text-base)
- **icon**: Square icon button (h-10 w-10)
- **icon-lg**: Large icon button (h-12 w-12)

### Usage

```tsx
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return (
    <>
      <Button>Default</Button>
      <Button variant="secondary" size="lg">Large Secondary</Button>
      <Button disabled>Disabled</Button>
    </>
  );
}
```

## Card Component

### Variants

- **shadow**: sm, md (default), lg, xl, card
- **hover**: true/false - adds lift and scale effect

### Usage

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MyCard() {
  return (
    <Card shadow="lg" hover>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>Card content goes here</CardContent>
    </Card>
  );
}
```

## Input Component

### States

- **default**: Normal state
- **error**: Error state (red border)
- **success**: Success state (green border)

### Sizes

- **sm**: Small (h-9, text-xs)
- **default**: Default (h-11)
- **lg**: Large (h-12, text-base)

### Usage

```tsx
import { Input } from '@/components/ui/input';

export function MyForm() {
  return (
    <>
      <Input placeholder="Default" />
      <Input error placeholder="Error state" />
      <Input success placeholder="Success state" />
      <Input size="lg" placeholder="Large input" />
    </>
  );
}
```

## Dialog Component

### Features

- Backdrop blur effect
- Smooth animations
- Escape key to close
- Click outside to close
- Focus trap

### Usage

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        Dialog content
      </DialogContent>
    </Dialog>
  );
}
```

## Tabs Component

### Features

- Pill-style design (rounded-full)
- Gradient active state (saffron to gold)
- Smooth animations
- Keyboard navigation

### Usage

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function MyTabs() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
    </Tabs>
  );
}
```

## Toast Component

### Variants

- **default**: Default style
- **success**: Green background
- **error**: Red background
- **warning**: Yellow background
- **info**: Blue background

### Usage

```tsx
import { Toast, ToastTitle, ToastDescription, ToastClose } from '@/components/ui/toast';

export function MyToast() {
  return (
    <Toast variant="success">
      <ToastTitle>Success!</ToastTitle>
      <ToastDescription>Your action was completed.</ToastDescription>
      <ToastClose />
    </Toast>
  );
}
```

## LoadingSpinner Component

### Sizes

- **sm**: Small (h-4 w-4)
- **md**: Medium (h-6 w-6)
- **lg**: Large (h-8 w-8)
- **xl**: Extra large (h-12 w-12)

### Colors

- **primary**: Saffron (default)
- **secondary**: Celestial medium
- **accent**: Gold
- **white**: White
- **muted**: Muted foreground

### Usage

```tsx
import { LoadingSpinner, LoadingSpinnerWithText } from '@/components/ui/loading-spinner';

export function MyLoader() {
  return (
    <>
      <LoadingSpinner size="lg" color="primary" />
      <LoadingSpinnerWithText text="Loading..." size="md" />
    </>
  );
}
```

## EmptyState Component

### Usage

```tsx
import { EmptyState } from '@/components/ui/empty-state';

export function MyEmptyState() {
  return (
    <EmptyState
      title="No items found"
      description="Create your first item to get started"
      action={{
        label: 'Create Item',
        onClick: () => console.log('Create'),
      }}
    />
  );
}
```

## ErrorBoundary Component

### Usage

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

export function MyApp() {
  return (
    <ErrorBoundary onError={(error) => console.error(error)}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Accessibility

All components include:

- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus indicators (ring-2 ring-saffron)
- ✅ Color contrast (WCAG AA)
- ✅ Touch targets ≥ 44px
- ✅ Screen reader support

## Dark Mode

All components automatically adapt to dark mode using CSS variables. No additional configuration needed.

## Customization

Components use Tailwind CSS and can be customized via className prop:

```tsx
<Button className="custom-class">Custom Button</Button>
```

## Component Showcase

Visit `/showcase` to see all components in action with interactive examples.

