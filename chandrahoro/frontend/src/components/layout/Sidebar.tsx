'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Target,
  FileText,
  BarChart3,
  Settings,
  Database,
  Shield,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  CreditCard,
  Mail,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
    badge: '1.2k',
  },
  {
    label: 'Entitlements',
    href: '/admin/entitlements',
    icon: Target,
  },
  {
    label: 'Audit Logs',
    href: '/admin/audit',
    icon: FileText,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    children: [
      {
        label: 'Usage Stats',
        href: '/admin/analytics/usage',
        icon: Activity,
      },
      {
        label: 'Revenue',
        href: '/admin/analytics/revenue',
        icon: CreditCard,
      },
    ],
  },
  {
    label: 'System',
    href: '/admin/system',
    icon: Database,
    children: [
      {
        label: 'Health',
        href: '/admin/system/health',
        icon: Activity,
      },
      {
        label: 'Security',
        href: '/admin/system/security',
        icon: Shield,
      },
      {
        label: 'Notifications',
        href: '/admin/system/notifications',
        icon: Bell,
      },
    ],
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    label: 'Support',
    href: '/admin/support',
    icon: HelpCircle,
    badge: '3',
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isExpanded = (href: string) => expandedItems.includes(href);

  const SidebarItemComponent = ({ item, level = 0 }: { item: SidebarItem; level?: number }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const expanded = isExpanded(item.href);

    return (
      <div key={item.href}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                {hasChildren ? (
                  <Button
                    variant="ghost"
                    onClick={() => toggleExpanded(item.href)}
                    className={cn(
                      'w-full justify-start gap-3 h-11 px-3 transition-all duration-200',
                      level > 0 && 'ml-6 w-[calc(100%-1.5rem)]',
                      active && 'bg-saffron-100 dark:bg-saffron-900/30 text-saffron-700 dark:text-saffron-300',
                      !active && 'hover:bg-saffron-50 dark:hover:bg-saffron-900/20',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon className={cn(
                      'h-5 w-5 transition-transform duration-200',
                      active && 'text-saffron-600'
                    )} />
                    
                    {!isCollapsed && (
                      <>
                        <span className="font-medium truncate">{item.label}</span>
                        <div className="flex items-center gap-2 ml-auto">
                          {item.badge && (
                            <span className="bg-saffron-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            expanded && 'rotate-90'
                          )} />
                        </div>
                      </>
                    )}
                  </Button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 w-full h-11 px-3 rounded-lg transition-all duration-200',
                      level > 0 && 'ml-6 w-[calc(100%-1.5rem)]',
                      active && 'bg-saffron-100 dark:bg-saffron-900/30 text-saffron-700 dark:text-saffron-300',
                      !active && 'hover:bg-saffron-50 dark:hover:bg-saffron-900/20 text-muted-foreground hover:text-foreground',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon className={cn(
                      'h-5 w-5 transition-transform duration-200',
                      active && 'text-saffron-600'
                    )} />
                    
                    {!isCollapsed && (
                      <>
                        <span className="font-medium truncate">{item.label}</span>
                        {item.badge && (
                          <span className="bg-saffron-500 text-white text-xs px-2 py-0.5 rounded-full ml-auto">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )}

                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-saffron-500 rounded-r-full" />
                )}
              </div>
            </TooltipTrigger>
            
            {isCollapsed && (
              <TooltipContent side="right" className="ml-2">
                <p>{item.label}</p>
                {item.badge && (
                  <span className="ml-2 bg-saffron-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Children */}
        {hasChildren && expanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => (
              <SidebarItemComponent key={child.href} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-30 h-screen bg-white dark:bg-slate-900 border-r border-border transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={cn(
          'flex items-center gap-3 p-4 border-b border-border',
          isCollapsed && 'justify-center px-2'
        )}>
          <BrandMark size="sm" />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-saffron-600 to-gold-600 bg-clip-text text-transparent">
                ChandraHoro
              </span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map(item => (
            <SidebarItemComponent key={item.href} item={item} />
          ))}
        </nav>

        {/* Footer with Collapse Toggle */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'w-full justify-start gap-3 h-11',
              isCollapsed && 'justify-center px-2'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="font-medium">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
