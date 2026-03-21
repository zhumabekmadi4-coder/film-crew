import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Film } from "lucide-react";

interface Props {
  project: {
    id: string;
    title: string;
    description: string | null;
    genre: string | null;
    status: string;
    city: string | null;
    membersCount?: number;
    rolesCount?: number;
  };
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "success" }> = {
  drafting: { label: "Черновик", variant: "outline" },
  recruiting: { label: "Набор команды", variant: "default" },
  "in-progress": { label: "В процессе", variant: "secondary" },
  completed: { label: "Завершён", variant: "success" },
};

export function ProjectCard({ project }: Props) {
  const statusInfo = statusLabels[project.status] ?? { label: project.status, variant: "outline" };

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="active:scale-[0.98] transition-transform">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight">{project.title}</CardTitle>
            <Badge variant={statusInfo.variant} className="shrink-0 text-xs">
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {project.genre && (
              <span className="flex items-center gap-1">
                <Film className="w-3 h-3" />
                {project.genre}
              </span>
            )}
            {project.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {project.city}
              </span>
            )}
            {project.membersCount !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {project.membersCount} участников
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
