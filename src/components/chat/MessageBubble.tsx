import { Copy, Check, User, Activity } from "lucide-react";
import { useState } from "react";
import type { ChatMessage } from "@/hooks/useChat";

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex gap-3 animate-fade-up ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div className={`group relative max-w-[75%] md:max-w-[65%]`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-user-bubble text-user-bubble-text rounded-tr-md"
              : "bg-bot-bubble text-bot-bubble-text border border-border/60 rounded-tl-md"
          }`}
          style={{ overflowWrap: "break-word" }}
        >
          {message.content.split("**").map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
          )}
        </div>
        <div className={`mt-1 flex items-center gap-2 ${isUser ? "justify-end" : ""}`}>
          <span className="text-[11px] text-muted-foreground">{formatTime(message.timestamp)}</span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="hidden rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground group-hover:block"
              aria-label="Copy message"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
