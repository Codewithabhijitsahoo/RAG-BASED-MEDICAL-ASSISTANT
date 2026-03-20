import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatInput } from "@/components/chat/ChatInput";
import { EmptyChat } from "@/components/chat/EmptyChat";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";

export default function Chat() {
  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    sendMessage,
    isLoading,
    scrollRef,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messages = activeSession?.messages ?? [];

  return (
    <div className="flex h-dvh bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNewSession={createSession}
          onDeleteSession={deleteSession}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 animate-slide-in-left">
            <ChatSidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={setActiveSessionId}
              onNewSession={createSession}
              onDeleteSession={deleteSession}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-4 top-4 z-20 rounded-full bg-card p-2 shadow-md"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
          </div>
          <span className="text-sm font-medium text-foreground">
            {activeSession ? activeSession.title : "MedAssist AI"}
          </span>
          <ThemeToggle />
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-surface-chat scrollbar-thin">
          {messages.length === 0 ? (
            <EmptyChat onSuggestionClick={sendMessage} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
              <MedicalDisclaimer compact />
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
