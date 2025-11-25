'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  MessageSquare,
  Clock,
  Star,
  Archive,
} from 'lucide-react';

import type { ConversationListProps, Conversation } from '@/types/chat';

/**
 * Conversation List Component
 * 
 * Displays chat history sidebar with conversation selection and management.
 */
export function ConversationList({
  conversations,
  activeConversationId,
  onConversationSelect,
  onConversationCreate,
  onConversationDelete,
  onConversationRename,
  onConversationArchive,
  isLoading = false,
  className,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.messages.some(message =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Sort conversations by last message date
  const sortedConversations = filteredConversations.sort((a, b) => {
    const dateA = new Date(a.lastMessageAt);
    const dateB = new Date(b.lastMessageAt);
    return dateB.getTime() - dateA.getTime();
  });

  const handleRenameStart = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const handleRenameSubmit = () => {
    if (editingId && editingTitle.trim()) {
      onConversationRename?.(editingId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDeleteConfirm = () => {
    if (deleteDialogId) {
      onConversationDelete?.(deleteDialogId);
      setDeleteDialogId(null);
    }
  };

  const formatLastMessageTime = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const getConversationPreview = (conversation: Conversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (!lastMessage) return 'No messages yet';
    
    const preview = lastMessage.content.replace(/\n/g, ' ').trim();
    return preview.length > 60 ? `${preview.substring(0, 60)}...` : preview;
  };

  const getMessageCount = (conversation: Conversation) => {
    return conversation.messages.length;
  };

  return (
    <div className={cn('flex flex-col h-full bg-background border-r', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button
            size="sm"
            onClick={onConversationCreate}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? (
              <div>
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No conversations found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div>
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new chat to begin</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2">
            {sortedConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  'group relative p-3 rounded-lg cursor-pointer transition-colors',
                  'hover:bg-muted/50',
                  activeConversationId === conversation.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'border border-transparent'
                )}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingId === conversation.id ? (
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit();
                          if (e.key === 'Escape') handleRenameCancel();
                        }}
                        className="h-6 text-sm font-medium"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h3 className="text-sm font-medium truncate mb-1">
                        {conversation.title}
                      </h3>
                    )}

                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {getConversationPreview(conversation)}
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatLastMessageTime(conversation.lastMessageAt)}
                      </div>

                      <Badge variant="secondary" className="text-xs h-4 px-1.5">
                        {getMessageCount(conversation)}
                      </Badge>

                      {conversation.isStarred && (
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      )}

                      {conversation.isArchived && (
                        <Archive className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameStart(conversation);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onConversationArchive?.(conversation.id, !conversation.isArchived);
                        }}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        {conversation.isArchived ? 'Unarchive' : 'Archive'}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialogId(conversation.id);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogId} onOpenChange={() => setDeleteDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
