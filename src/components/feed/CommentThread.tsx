"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Send, CornerDownRight, X } from "lucide-react";

interface Comment {
  id: number;
  postId: string;
  userId: string;
  parentCommentId: number | null;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; avatarUrl: string | null };
}

interface CommentThreadProps {
  postId: string;
  onClose: () => void;
  onCommentAdded: () => void;
}

export function CommentThread({ postId, onClose, onCommentAdded }: CommentThreadProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const res = await fetch(`/api/posts/${postId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text.trim(),
          parentCommentId: replyTo?.id || null,
        }),
      });
      if (res.ok) {
        setText("");
        setReplyTo(null);
        fetchComments();
        onCommentAdded();
      }
    } finally {
      setSending(false);
    }
  };

  // Build tree
  const rootComments = comments.filter((c) => !c.parentCommentId);
  const replies = (parentId: number) =>
    comments.filter((c) => c.parentCommentId === parentId);

  return (
    <div className="border-t bg-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-sm font-medium">
          Комментарии ({comments.length})
        </span>
        <button onClick={onClose} className="p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Comments list */}
      <div className="max-h-[300px] overflow-y-auto px-4 py-2 space-y-3">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Загрузка...
          </p>
        ) : rootComments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Пока нет комментариев
          </p>
        ) : (
          rootComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                onReply={(id, name) => setReplyTo({ id, name })}
              />
              {replies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-8 mt-2">
                  <CommentItem
                    comment={reply}
                    onReply={(id, name) => setReplyTo({ id, name })}
                  />
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-2 border-t">
        {replyTo && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <CornerDownRight className="w-3 h-3" />
            <span>Ответ для {replyTo.name}</span>
            <button onClick={() => setReplyTo(null)} className="ml-1">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Написать комментарий..."
            className="text-sm h-9"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button size="sm" onClick={handleSend} disabled={!text.trim() || sending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  onReply,
}: {
  comment: Comment;
  onReply: (id: number, name: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <UserAvatar
        name={comment.user.name || ""}
        avatarUrl={comment.user.avatarUrl}
        size="xs"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{comment.user.name}</span>
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: ru,
            })}
          </span>
        </div>
        <p className="text-xs mt-0.5 break-words">{comment.content}</p>
        <button
          onClick={() => onReply(comment.id, comment.user.name || "")}
          className="text-[10px] text-muted-foreground hover:text-primary mt-0.5"
        >
          Ответить
        </button>
      </div>
    </div>
  );
}
