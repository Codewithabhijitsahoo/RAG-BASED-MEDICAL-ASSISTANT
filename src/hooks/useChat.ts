import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useAuth } from "./useAuth";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:4000";

async function fetchSessions(userEmail: string): Promise<ChatSession[]> {
  const res = await fetch(`${API_BASE}/api/chat/sessions?email=${userEmail}`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  const { sessions } = await res.json();
  
  // Load messages for the first session or all? 
  // Let's load messages on demand or for all if simple
  const sessionsWithMessages = await Promise.all(sessions.map(async (s: any) => {
    const mRes = await fetch(`${API_BASE}/api/chat/sessions/${s.id}/messages`);
    const { messages } = await mRes.json();
    return {
      ...s,
      createdAt: new Date(s.createdAt),
      messages: messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
    };
  }));
  return sessionsWithMessages;
}

async function saveSessionAPI(id: string, userEmail: string, title: string) {
  await fetch(`${API_BASE}/api/chat/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, userEmail, title })
  });
}

async function saveMessageAPI(id: string, sessionId: string, role: string, content: string, timestamp: Date) {
  await fetch(`${API_BASE}/api/chat/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, sessionId, role, content, timestamp: timestamp.toISOString() })
  });
}

async function deleteSessionAPI(id: string) {
  await fetch(`${API_BASE}/api/chat/sessions/${id}`, { method: "DELETE" });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// API call to the Python Flask backend (server_py/app.py)
const CHAT_API_BASE = (import.meta.env.VITE_CHAT_API_BASE as string) || "http://localhost:8080";

async function sendMessageAPI(message: string, _history: ChatMessage[]): Promise<string> {
  const form = new URLSearchParams();
  form.append("msg", message);

  const res = await fetch(`${CHAT_API_BASE}/get`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Chat backend error");
  }

  const text = await res.text();
  return text;
}

export function useChat() {
  const { user } = useAuth();
  const userEmail = user?.email;

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reload sessions when user changes (from DATABASE)
  useEffect(() => {
    if (!userEmail) {
      setSessions([]);
      setActiveSessionId(null);
      return;
    }

    fetchSessions(userEmail).then(loaded => {
      setSessions(loaded);
      setActiveSessionId(loaded.length > 0 ? loaded[0].id : null);
    }).catch(console.error);
  }, [userEmail]);

  const activeSession = useMemo(() => 
    sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const createSession = useCallback(async () => {
    if (!userEmail) return null;
    const session: ChatSession = {
      id: generateId(),
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
    };
    await saveSessionAPI(session.id, userEmail, session.title);
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    return session.id;
  }, [userEmail]);

  const deleteSession = useCallback(
    async (id: string) => {
      await deleteSessionAPI(id);
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (activeSessionId === id) {
          setActiveSessionId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
    },
    [activeSessionId],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      let sessionId = activeSessionId;
      if (!sessionId) {
        sessionId = await createSession();
      }

      if (!sessionId) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const isFirst = s.messages.length === 0;
          return {
            ...s,
            title: isFirst ? content.trim().slice(0, 40) : s.title,
            messages: [...s.messages, userMsg],
          };
        }),
      );
      scrollToBottom();
      setIsLoading(true);

      try {
        const currentSession = sessions.find((s) => s.id === sessionId);
        const history = currentSession ? [...currentSession.messages, userMsg] : [userMsg];
        
        // Save user message to DB
        await saveMessageAPI(userMsg.id, sessionId, userMsg.role, userMsg.content, userMsg.timestamp);

        const response = await sendMessageAPI(content, history);

        const botMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };

        // Save bot message to DB
        await saveMessageAPI(botMsg.id, sessionId, botMsg.role, botMsg.content, botMsg.timestamp);

        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, botMsg] } : s)),
        );
        scrollToBottom();
      } catch {
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: "I'm sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        };
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, errorMsg] } : s)),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeSessionId, isLoading, createSession, scrollToBottom, sessions],
  );

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    sendMessage,
    isLoading,
    scrollRef,
  };
}
