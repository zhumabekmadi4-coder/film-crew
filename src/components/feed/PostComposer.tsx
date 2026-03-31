"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Send } from "lucide-react";

interface PostComposerProps {
  onPostCreated: () => void;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  if (!session?.user) return null;

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        onPostCreated();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b">
      <div className="flex gap-3">
        <UserAvatar name={session.user.name} size="sm" />
        <div className="flex-1">
          <Textarea
            placeholder="Что нового?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[60px] resize-none border-0 p-0 focus-visible:ring-0 text-sm"
            maxLength={1000}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {content.length}/1000
            </span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
            >
              <Send className="w-4 h-4 mr-1" />
              {loading ? "..." : "Опубликовать"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
