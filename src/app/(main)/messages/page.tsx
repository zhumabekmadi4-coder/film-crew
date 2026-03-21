"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => { setConversations(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  return (
    <div className="p-4 space-y-4">
      {loading ? (
        [1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)
      ) : conversations.length === 0 ? (
        <EmptyState icon="💬" title="Нет сообщений" description="Найди специалиста в разделе «Люди» и напиши ему" />
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => {
            const other = conv.participants?.find((p: any) => p.id !== session?.user?.id);
            const displayName = conv.type === "project" ? conv.title : other?.name;
            const displayAvatar = conv.type === "project" ? null : other?.avatarUrl;
            const displayInitials = displayName || "?";

            return (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors active:scale-[0.98]">
                  <UserAvatar name={displayInitials} avatarUrl={displayAvatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{displayName}</p>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage.content}</p>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false, locale: ru })}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
