/**
 * ChandraHoro V2.1 - Chat Page
 * 
 * Main chat interface page with responsive sidebar and chat area.
 * Provides AI-powered astrological guidance through conversational interface.
 * 
 * Features:
 * - Responsive layout (sidebar + chat area)
 * - Mobile drawer for sidebar
 * - Conversation management
 * - Real-time streaming chat
 * - Auto-save conversations
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, MessageSquare } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Fetch conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('/api/conversations');
      if (!res.ok) {
        throw new Error('Failed to fetch conversations');
      }
      return res.json();
    },
  });
  
  const handleNewConversation = () => {
    setConversationId(undefined);
    if (isMobile) setSidebarOpen(false);
  };
  
  const handleSelectConversation = (id: string) => {
    setConversationId(id);
    if (isMobile) setSidebarOpen(false);
  };
  
  const conversationList = conversations?.data || [];
  
  // Desktop layout: sidebar always visible
  if (!isMobile) {
    return (
      <div className="flex h-[calc(100vh-64px)]">
        <ConversationSidebar
          conversations={conversationList}
          activeId={conversationId}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
        />
        <ChatArea conversationId={conversationId} />
      </div>
    );
  }
  
  // Mobile layout: sidebar in drawer
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Mobile Header */}
      <div className="border-b p-4 flex items-center justify-between bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <ConversationSidebar
                conversations={conversationList}
                activeId={conversationId}
                onSelect={handleSelectConversation}
                onNew={handleNewConversation}
              />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              Chat with Claude
            </h1>
          </div>
        </div>
        
        {/* New conversation button for mobile */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNewConversation}
          className="text-xs"
        >
          New
        </Button>
      </div>
      
      {/* Chat Area */}
      <ChatArea conversationId={conversationId} />
    </div>
  );
}
