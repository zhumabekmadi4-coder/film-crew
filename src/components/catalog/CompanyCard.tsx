"use client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Building2 } from "lucide-react";

interface CompanyCardProps {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  logoUrl: string | null;
}

export function CompanyCard({ id, name, description, city, logoUrl }: CompanyCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      href={`/catalog/company/${id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <Avatar className="h-10 w-10">
        {logoUrl && <AvatarImage src={logoUrl} alt={name} />}
        <AvatarFallback>
          <Building2 className="w-5 h-5 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm truncate block">{name}</span>
        {city && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3" />
            <span>{city}</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
