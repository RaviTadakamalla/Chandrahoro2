'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Menu,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Edit2,
  Archive,
  Star,
  Settings,
  HelpCircle,
  Zap,
  AlertTriangle,
} from 'lucide-react';

import type { ChatHeaderProps } from '@/types/chat';

/**
 * Chat Header Component
 * 
 * Header with conversation title, quota display, and actions.
 */
export function ChatHeader({
  conversation,
  quotaUsed,
  quotaLimit,
  onSidebarToggle,
  onConversationRename,
  onConversationDelete,
  onConversationArchive,
  onConversationExport,
  onConversationShare,
  onClearChat,
  onSettingsOpen,
  className,
}: ChatHeaderProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation?.title || '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);

  const quotaPercentage = quotaLimit ? (quotaUsed / quotaLimit) * 100 : 0;
  const isQuotaLow = quotaPercentage > 80;
  const isQuotaExceeded = quotaPercentage >= 100;

  const handleRenameSubmit = () => {
    if (conversation && newTitle.trim()) {
      onConversationRename?.(conversation.id, newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setNewTitle(conversation?.title || '');
    setIsRenaming(false);
  };

  const handleDeleteConfirm = () => {
    if (conversation) {
      onConversationDelete?.(conversation.id);
    }
    setShowDeleteDialog(false);
  };

  const handleClearConfirm = () => {
    if (conversation) {
      onClearChat?.(conversation.id);
    }
    setShowClearDialog(false);
  };

  const getQuotaColor = () => {
    if (isQuotaExceeded) return 'text-red-500';
    if (isQuotaLow) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getQuotaBadgeVariant = () => {
    if (isQuotaExceeded) return 'destructive';
    if (isQuotaLow) return 'secondary';
    return 'outline';
  };

  return (
    <div className={cn(
      'flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSidebarToggle}
          className="h-8 w-8 p-0 lg:hidden"
        >
          <Menu className="w-4 h-4" />
        </Button>

        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') handleRenameCancel();
              }}
              className="text-lg font-semibold bg-transparent border-none outline-none focus:ring-0 p-0 w-full"
              autoFocus
            />
          ) : (
            <h1 className="text-lg font-semibold truncate">
              {conversation?.title || 'New Conversation'}
            </h1>
          )}
          
          {conversation && (
            <p className="text-sm text-muted-foreground">
              {conversation.messages.length} messages
            </p>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Quota Display */}
        {quotaLimit && (
          <Dialog open={showQuotaDialog} onOpenChange={setShowQuotaDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-8 px-2', getQuotaColor())}
              >
                <Zap className="w-3 h-3 mr-1" />
                <span className="text-xs font-medium">
                  {quotaUsed}/{quotaLimit}
                </span>
                {isQuotaLow && (
                  <AlertTriangle className="w-3 h-3 ml-1" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>API Usage</DialogTitle>
                <DialogDescription>
                  Your current API usage and limits
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used</span>
                    <span className="font-medium">{quotaUsed} requests</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Limit</span>
                    <span className="font-medium">{quotaLimit} requests</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        isQuotaExceeded ? 'bg-red-500' : isQuotaLow ? 'bg-yellow-500' : 'bg-green-500'
                      )}
                      style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {quotaPercentage.toFixed(1)}% used
                  </div>
                </div>

                {isQuotaExceeded && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">Quota Exceeded</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      You've reached your API limit. Please upgrade your plan or wait for the quota to reset.
                    </p>
                  </div>
                )}

                {isQuotaLow && !isQuotaExceeded && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">Quota Running Low</span>
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">
                      You're approaching your API limit. Consider upgrading your plan.
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {conversation && (
              <>
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onConversationArchive?.(conversation.id, !conversation.isArchived)}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {conversation.isArchived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onConversationShare?.(conversation.id)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onConversationExport?.(conversation.id)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setShowClearDialog(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Chat
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>

                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem onClick={onSettingsOpen}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem>
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Conversation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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

      {/* Clear Chat Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all messages in this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
