"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostComposer } from "@/components/feed/PostComposer";
import { PostCard } from "@/components/feed/PostCard";
import { CommentThread } from "@/components/feed/CommentThread";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loader2 } from "lucide-react";

type Tab = "all" | "following" | "my" | "news";

interface PostData {
  id: string;
  userId: string;
  content: string;
  isWelcomePost: boolean;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    professions: string[];
  };
}

export default function FeedPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("all");
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?tab=${tab}&limit=30`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (postId: string) => {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  };

  const handleDelete = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  if (!session) return null;

  return (
    <div>
      {/* Tabs */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as Tab)}
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
              value="following"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Подписки
            </TabsTrigger>
            <TabsTrigger
              value="my"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Моё
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Новости
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Post composer (only on Все and Моё tabs) */}
      {(tab === "all" || tab === "my") && (
        <PostComposer onPostCreated={fetchPosts} />
      )}

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          message={
            tab === "following"
              ? "Подпишитесь на пользователей, чтобы видеть их посты"
              : tab === "my"
              ? "Вы ещё ничего не публиковали"
              : "Пока нет постов"
          }
        />
      ) : (
        <div>
          {posts.map((post) => (
            <div key={post.id}>
              <PostCard
                {...post}
                currentUserId={session.user.id}
                onLike={handleLike}
                onDelete={handleDelete}
                onCommentClick={(id) =>
                  setOpenComments(openComments === id ? null : id)
                }
              />
              {openComments === post.id && (
                <CommentThread
                  postId={post.id}
                  onClose={() => setOpenComments(null)}
                  onCommentAdded={fetchPosts}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
