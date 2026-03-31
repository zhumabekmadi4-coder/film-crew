"use client";
import Link from "next/link";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase } from "lucide-react";

interface SpecialistCardProps {
  id: string;
  name: string;
  avatarUrl: string | null;
  city: string | null;
  availability: string;
  experienceYears: number | null;
  bio: string | null;
  isActor?: boolean;
}

const availabilityLabels: Record<string, string> = {
  "full-time": "Полный день",
  "part-time": "Частичная",
  "project-based": "Под проект",
};

export function SpecialistCard({
  id,
  name,
  avatarUrl,
  city,
  availability,
  experienceYears,
  bio,
  isActor,
}: SpecialistCardProps) {
  return (
    <Link
      href={`/profile/${id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <UserAvatar name={name} avatarUrl={avatarUrl} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{name}</span>
          {isActor && (
            <Badge variant="secondary" className="text-[10px] py-0">
              Актёр
            </Badge>
          )}
        </div>
        {city && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3" />
            <span>{city}</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {availabilityLabels[availability] || availability}
          </span>
          {experienceYears && (
            <span className="text-xs text-muted-foreground">
              · {experienceYears} лет опыта
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
