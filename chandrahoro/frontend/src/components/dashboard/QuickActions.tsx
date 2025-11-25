/**
 * ChandraHoro V2.1 - Quick Actions Component
 * 
 * Grid of quick action cards for common dashboard actions.
 * Provides easy navigation to key features with visual icons
 * and descriptions.
 * 
 * Features:
 * - Responsive grid layout
 * - Hover effects and animations
 * - Color-coded action cards
 * - Navigation integration
 * - Accessibility support
 */

'use client';

import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { MessageSquare, PieChart, Heart, TrendingUp, Calendar, Settings } from 'lucide-react';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  href: string;
  color: string;
  textColor?: string;
}

const ACTIONS: QuickAction[] = [
  {
    icon: MessageSquare,
    label: 'AI Chat',
    description: 'Ask about your chart',
    href: '/chat',
    color: 'bg-blue-500',
    textColor: 'text-white',
  },
  {
    icon: PieChart,
    label: 'View Chart',
    description: 'See planetary positions',
    href: '/charts',
    color: 'bg-purple-500',
    textColor: 'text-white',
  },
  {
    icon: Heart,
    label: 'Compatibility',
    description: 'Analyze relationships',
    href: '/compatibility',
    color: 'bg-pink-500',
    textColor: 'text-white',
  },
  {
    icon: TrendingUp,
    label: 'Transits',
    description: 'Current planetary trends',
    href: '/transits',
    color: 'bg-green-500',
    textColor: 'text-white',
  },
];

export function QuickActions() {
  const router = useRouter();
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ACTIONS.map((action) => (
          <Card
            key={action.href}
            className="p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
            onClick={() => router.push(action.href)}
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 shadow-sm`}>
              <action.icon className={`w-6 h-6 ${action.textColor || 'text-white'}`} />
            </div>
            
            {/* Content */}
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {action.label}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {action.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Additional Actions Row */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Card
          className="p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
          onClick={() => router.push('/readings/daily')}
        >
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-3 shadow-sm">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Daily Readings
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              View all daily guidance
            </p>
          </div>
        </Card>
        
        <Card
          className="p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
          onClick={() => router.push('/profile')}
        >
          <div className="w-12 h-12 rounded-xl bg-gray-500 flex items-center justify-center mb-3 shadow-sm">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Settings
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Manage your profile
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
