import { Plus, Trash2, MessageSquare, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatSession } from "@/hooks/useChat";

interface Props {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onClose?: () => void;
}

export function ChatSidebar({ sessions, activeSessionId, onSelectSession, onNewSession, onDeleteSession, onClose }: Props) {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Activity className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">MedAssist AI</span>
      </div>

      {/* New chat */}
      <div className="p-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => {
            onNewSession();
            onClose?.();
          }}
        >
          <Plus className="h-4 w-4" />
          New conversation
        </Button>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin">
        {sessions.length === 0 && (
          <p className="px-2 pt-4 text-center text-xs text-muted-foreground">No conversations yet</p>
        )}
        <div className="space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSelectSession(s.id);
                onClose?.();
              }}
              className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                s.id === activeSessionId
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{s.title}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(s.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onDeleteSession(s.id);
                  }
                }}
                className="hidden shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive group-hover:block"
                aria-label="Delete conversation"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
