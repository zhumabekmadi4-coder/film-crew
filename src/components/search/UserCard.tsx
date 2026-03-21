import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { MapPin, Clock } from "lucide-react";

const availabilityLabels: Record<string, string> = {
  "full-time": "Полный день",
  "part-time": "Частичная занятость",
  "project-based": "Под проект",
};

interface Props {
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    city?: string | null;
    availability: string;
    experienceYears?: number | null;
    bio?: string | null;
    professions?: Array<{ isPrimary: boolean; profession: { name: string } | null }>;
  };
  actions?: React.ReactNode;
}

export function UserCard({ user, actions }: Props) {
  const primaryProfessions = user.professions?.filter((p) => p.isPrimary) ?? [];

  return (
    <Card className="active:scale-[0.98] transition-transform">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <Link href={`/profile/${user.id}`}>
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${user.id}`}>
              <p className="font-semibold text-sm truncate">{user.name}</p>
            </Link>
            {primaryProfessions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {primaryProfessions.slice(0, 2).map((p) => (
                  <Badge key={p.profession?.name} variant="secondary" className="text-xs py-0">
                    {p.profession?.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
              {user.city && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {user.city}
                </span>
              )}
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {availabilityLabels[user.availability] ?? user.availability}
              </span>
              {user.experienceYears && <span>{user.experienceYears} лет опыта</span>}
            </div>
          </div>
          {actions && <div className="flex items-center">{actions}</div>}
        </div>
        {user.bio && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{user.bio}</p>
        )}
      </CardContent>
    </Card>
  );
}
