/**
 * ChandraHoro V2.1 - Conversation Sidebar Component
 * 
 * Sidebar component for managing chat conversations.
 * Displays conversation list with create, select, and delete functionality.
 * 
 * Features:
 * - New conversation creation
 * - Conversation list with message counts
 * - Delete confirmation dialog
 * - Active conversation highlighting
 * - Responsive design
 */

'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  title: string;
  _count?: {
    messages: number;
  };
  updatedAt?: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
}: ConversationSidebarProps) {
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/conversations/${id}`, { 
        method: 'DELETE' 
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete conversation');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Conversation deleted');
      // If we deleted the active conversation, start a new one
      if (activeId) {
        onNew();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete conversation');
    },
  });
  
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };
  
  return (
    <div className="w-[280px] border-r bg-gray-50 dark:bg-gray-900 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-800">
        <Button onClick={onNew} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>
      </div>
      
      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-xs mt-1">Start chatting to create your first conversation</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'group flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors',
                  activeId === conv.id && 'bg-white dark:bg-gray-800 shadow-sm ring-1 ring-orange-200 dark:ring-orange-800'
                )}
                onClick={() => onSelect(conv.id)}
              >
                <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                    {conv.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{conv._count?.messages || 0} messages</span>
                    {conv.updatedAt && (
                      <>
                        <span>•</span>
                        <span>
                          {new Date(conv.updatedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Delete Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 shrink-0 h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{conv.title}" and all its messages. 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => handleDelete(conv.id, e)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-4 border-t bg-white dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💬 Chat with Claude about your astrological insights
        </p>
      </div>
    </div>
  );
}
