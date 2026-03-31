"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeOff, Ban, Loader2 } from "lucide-react";

type ModTab = "posts" | "users";

export default function ModerationPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<ModTab>("posts");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === "posts") {
      setLoading(true);
      fetch("/api/posts?tab=all&limit=50")
        .then((r) => r.json())
        .then((data) => {
          setPosts(data);
          setLoading(false);
        });
    }
  }, [tab]);

  const hidePost = async (postId: string) => {
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setPosts(posts.filter((p) => p.id !== postId));
  };

  const shadowBan = async (userId: string) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "shadowBan", userId }),
    });
  };

  const role = session?.user?.role;
  if (role !== "content-manager" && role !== "admin" && role !== "superadmin") {
    return <EmptyState title="Нет доступа" />;
  }

  return (
    <div>
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as ModTab)}
          className="px-4"
        >
          <TabsList className="w-full h-10 bg-transparent p-0 justify-start gap-0">
            <TabsTrigger
              value="posts"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Посты
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Пользователи
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : tab === "posts" ? (
          posts.length === 0 ? (
            <EmptyState message="Нет постов" />
          ) : (
            <div className="space-y-2">
              {posts.map((post: any) => (
                <Card key={post.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        name={post.user?.name || ""}
                        avatarUrl={post.user?.avatarUrl}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">
                          {post.user?.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {post.content}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Скрыть пост"
                          onClick={() => hidePost(post.id)}
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Тихий бан автора"
                          onClick={() => shadowBan(post.userId)}
                        >
                          <Ban className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <EmptyState message="Поиск пользователей для модерации" />
        )}
      </div>
    </div>
  );
}
