"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<string>("");

  // Initial load
  useEffect(() => {
    fetch(`/api/conversations/${id}/messages`)
      .then((r) => r.json())
      .then((data) => {
        const msgs = Array.isArray(data) ? data : [];
        setMessages(msgs);
        if (msgs.length > 0) lastTimestampRef.current = msgs[msgs.length - 1].createdAt;
      });
  }, [id]);

  // Polling
  useEffect(() => {
    const interval = setInterval(() => {
      const after = lastTimestampRef.current;
      fetch(`/api/conversations/${id}/messages${after ? `?after=${encodeURIComponent(after)}` : ""}`)
        .then((r) => r.json())
        .then((newMsgs) => {
          if (Array.isArray(newMsgs) && newMsgs.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const unique = newMsgs.filter((m) => !existingIds.has(m.id));
              return unique.length > 0 ? [...prev, ...unique] : prev;
            });
            lastTimestampRef.current = newMsgs[newMsgs.length - 1].createdAt;
          }
        });
    }, 4000);
    return () => clearInterval(interval);
  }, [id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const content = text.trim();
    setText("");

    const res = await fetch(`/api/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const msg = await res.json();
    setMessages((prev) => [...prev, { ...msg, senderName: session?.user?.name }]);
    lastTimestampRef.current = msg.createdAt;
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isMe = msg.senderId === session?.user?.id;
            return (
              <div key={msg.id} className={cn("flex gap-2", isMe && "flex-row-reverse")}>
                {!isMe && (
                  <UserAvatar name={msg.senderName || "?"} avatarUrl={msg.senderAvatar} size="sm" className="shrink-0 mt-1" />
                )}
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                  isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t bg-background">
        <Input
          placeholder="Сообщение..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!text.trim() || sending}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
