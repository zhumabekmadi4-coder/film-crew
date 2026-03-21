"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Film, MessageCircle, ExternalLink } from "lucide-react";
import { AVAILABILITY_OPTIONS, EQUIPMENT_CATEGORIES } from "@/lib/constants";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((data) => { setUser(data); setLoading(false); });
  }, [id]);

  async function openChat() {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    const conv = await res.json();
    router.push(`/messages/${conv.id}`);
  }

  if (loading) return <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>;
  if (!user) return <div className="p-4 text-center">Пользователь не найден</div>;

  const primaryProfs = user.professions?.filter((p: any) => p.isPrimary) ?? [];
  const secondaryProfs = user.professions?.filter((p: any) => !p.isPrimary) ?? [];
  const availLabel = AVAILABILITY_OPTIONS.find((o) => o.value === user.availability)?.label;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-4">
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
        <div className="flex-1">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <div className="flex flex-wrap gap-1 mt-1">
            {primaryProfs.map((p: any) => (
              <Badge key={p.professionId} variant="default" className="text-xs">{p.profession?.name}</Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-muted-foreground">
            {user.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.city}</span>}
            {availLabel && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{availLabel}</span>}
            {user.experienceYears && <span>{user.experienceYears} лет опыта</span>}
          </div>
        </div>
      </div>

      {session?.user?.id !== id && (
        <Button className="w-full" onClick={openChat}>
          <MessageCircle className="w-4 h-4 mr-2" /> Написать
        </Button>
      )}

      {user.bio && (
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-sm leading-relaxed">{user.bio}</p>
          </CardContent>
        </Card>
      )}

      {secondaryProfs.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Дополнительно</p>
          <div className="flex flex-wrap gap-1">
            {secondaryProfs.map((p: any) => (
              <Badge key={p.professionId} variant="outline" className="text-xs">{p.profession?.name}</Badge>
            ))}
          </div>
        </div>
      )}

      {user.equipment?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Техника</p>
          <div className="space-y-1.5">
            {user.equipment.map((item: any) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="text-xs shrink-0">
                  {EQUIPMENT_CATEGORIES.find(c => c.value === item.category)?.label}
                </Badge>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {user.showreel && <a href={user.showreel} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><Film className="w-3.5 h-3.5 mr-1.5" />Showreel</Button></a>}
        {user.website && <a href={user.website} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><ExternalLink className="w-3.5 h-3.5 mr-1.5" />Сайт</Button></a>}
        {user.telegram && <a href={`https://t.me/${user.telegram.replace("@","")}`} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline">Telegram</Button></a>}
        {user.instagram && <a href={`https://instagram.com/${user.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline">Instagram</Button></a>}
      </div>
    </div>
  );
}
