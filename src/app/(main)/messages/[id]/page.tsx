"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [partner, setPartner] = useState<{ name: string; avatarUrl?: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load conversation info + history
  useEffect(() => {
    fetch(`/api/conversations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.participants) {
          const other = data.participants.find((p: any) => p.id !== session?.user?.id);
          if (other) setPartner(other);
        }
      });
    fetch(`/api/conversations/${id}/messages`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      });
  }, [id, session?.user?.id]);

  // SSE — persistent connection, messages arrive instantly
  useEffect(() => {
    const es = new EventSource(`/api/conversations/${id}/stream`);

    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } catch {}
    };

    return () => es.close();
  }, [id]);

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
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, { ...msg, senderName: session?.user?.name }];
    });
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)]">
      <div className="flex items-center gap-3 px-4 py-2 border-b">
        <button onClick={() => router.push("/messages")} aria-label="Назад к сообщениям">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {partner && (
          <>
            <UserAvatar name={partner.name} avatarUrl={partner.avatarUrl} size="sm" />
            <span className="font-medium text-sm">{partner.name}</span>
          </>
        )}
      </div>
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
        <Button type="submit" size="icon" disabled={!text.trim() || sending} aria-label="Отправить сообщение">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
