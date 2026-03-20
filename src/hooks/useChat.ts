import { useState, useCallback, useRef, useEffect } from "react";

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

const STORAGE_KEY = "medchat_sessions";

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw, (key, value) => {
      if (key === "timestamp" || key === "createdAt") return new Date(value);
      return value;
    });
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Simulated API call — replace with real endpoint
async function sendMessageAPI(message: string, _history: ChatMessage[]): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

  const responses = [
    "Based on the symptoms you've described, there are several possible explanations. However, I want to emphasize that this information is for educational purposes only. **Please consult a healthcare professional** for an accurate diagnosis and personalized treatment plan.",
    "That's a great question. According to current medical literature, the condition you're asking about typically presents with varying symptoms. I'd recommend scheduling an appointment with your primary care physician for a thorough evaluation.",
    "I understand your concern. While I can provide general health information, it's important to note that individual cases can vary significantly. A qualified healthcare provider can offer the most relevant guidance for your specific situation.",
    "The symptoms you're describing could be associated with several conditions. For accurate diagnosis, clinical examination and possibly lab tests would be needed. I'd strongly suggest consulting with a medical professional.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const s = loadSessions();
    return s.length > 0 ? s[0].id : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const createSession = useCallback(() => {
    const session: ChatSession = {
      id: generateId(),
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
    };
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    return session.id;
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
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
        sessionId = createSession();
      }

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
        const response = await sendMessageAPI(content, history);

        const botMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };

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
