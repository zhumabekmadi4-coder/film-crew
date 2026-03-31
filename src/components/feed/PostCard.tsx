"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Trash2, UserPlus } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PostUser {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  professions?: string[];
}

interface PostCardProps {
  id: string;
  content: string;
  isWelcomePost: boolean;
  createdAt: string;
  user: PostUser;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  currentUserId: string;
  onLike: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onCommentClick: (postId: string) => void;
}

export function PostCard({
  id,
  content,
  isWelcomePost,
  createdAt,
  user,
  likesCount,
  commentsCount,
  isLiked,
  currentUserId,
  onLike,
  onDelete,
  onCommentClick,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likesCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    onLike(id);
  };

  const isOwn = user.id === currentUserId;

  return (
    <div className="p-4 border-b hover:bg-muted/30 transition-colors">
      <div className="flex gap-3">
        <Link href={`/profile/${user.id}`}>
          <UserAvatar name={user.name || ""} avatarUrl={user.avatarUrl} size="sm" />
        </Link>
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/profile/${user.id}`}
              className="font-medium text-sm hover:underline truncate"
            >
              {user.name}
            </Link>
            {user.professions?.map((p) => (
              <Badge key={p} variant="secondary" className="text-[10px] py-0">
                {p}
              </Badge>
            ))}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), {
                addSuffix: true,
                locale: ru,
              })}
            </span>
          </div>

          {/* Content */}
          {isWelcomePost ? (
            <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
              <UserPlus className="w-4 h-4 text-primary" />
              <span>{content}</span>
            </div>
          ) : (
            <p className="mt-1.5 text-sm whitespace-pre-wrap break-words">
              {content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-colors",
                  liked && "fill-red-500 text-red-500"
                )}
              />
              {likes > 0 && <span>{likes}</span>}
            </button>
            <button
              onClick={() => onCommentClick(id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {commentsCount > 0 && <span>{commentsCount}</span>}
            </button>
            {isOwn && onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
