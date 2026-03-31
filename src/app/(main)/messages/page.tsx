"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Building2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

type ChatTab = "all" | "unread" | "projects" | "companies";

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ChatTab>("all");

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        setConversations(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const filtered = conversations.filter((conv) => {
    if (tab === "all") return true;
    if (tab === "unread") return (conv.unreadCount || 0) > 0;
    if (tab === "projects") return conv.type === "project";
    if (tab === "companies") return conv.type === "company";
    return true;
  });

  return (
    <div>
      {/* Tabs */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as ChatTab)}
          className="px-4"
        >
          <TabsList className="w-full h-10 bg-transparent p-0 justify-start gap-0">
            <TabsTrigger
              value="all"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Все
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Непрочитанное
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Проекты
            </TabsTrigger>
            <TabsTrigger
              value="companies"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Заказы
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message={
              tab === "all"
                ? "Нет сообщений"
                : tab === "unread"
                ? "Нет непрочитанных"
                : tab === "projects"
                ? "Нет чатов по проектам"
                : "Нет заказов"
            }
          />
        ) : (
          <div className="space-y-1">
            {filtered.map((conv) => {
              const other = conv.participants?.find(
                (p: any) => p.id !== session?.user?.id
              );
              const isCompanyChat = conv.type === "company";
              const displayName =
                conv.type === "project"
                  ? conv.title
                  : isCompanyChat
                  ? conv.title || other?.name
                  : other?.name;
              const displayAvatar =
                conv.type === "project" || isCompanyChat
                  ? null
                  : other?.avatarUrl;
              const displayInitials = displayName || "?";

              return (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors active:scale-[0.98] ${
                      isCompanyChat ? "border-l-2 border-primary" : ""
                    }`}
                  >
                    {isCompanyChat ? (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                    ) : (
                      <UserAvatar
                        name={displayInitials}
                        avatarUrl={displayAvatar}
                        size="md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {displayName}
                        </p>
                        {isCompanyChat && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0"
                          >
                            Компания
                          </Badge>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {conv.lastMessage && (
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(conv.lastMessage.createdAt),
                            { addSuffix: false, locale: ru }
                          )}
                        </p>
                      )}
                      {(conv.unreadCount || 0) > 0 && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[10px] text-primary-foreground font-medium">
                            {conv.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
