"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  Clapperboard,
  Users,
  ChevronRight,
  Download,
  MessageCircle,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface CastingProject {
  id: string;
  title: string;
  city: string | null;
  roles: {
    id: number;
    customTitle: string | null;
    roleType: string | null;
    applicationsCount: number;
    profession?: { name: string };
  }[];
}

interface Applicant {
  id: number;
  userId: string;
  coverMessage: string | null;
  status: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export default function CastingPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<CastingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<{
    projectId: string;
    roleId: number;
    title: string;
  } | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    fetchCastings();
  }, []);

  const fetchCastings = async () => {
    const res = await fetch("/api/projects?type=casting&mine=true");
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
    setLoading(false);
  };

  const loadApplicants = async (projectId: string, roleId: number) => {
    setLoadingApplicants(true);
    const res = await fetch(
      `/api/applications?projectId=${projectId}&roleId=${roleId}`
    );
    if (res.ok) {
      const data = await res.json();
      setApplicants(data);
    }
    setLoadingApplicants(false);
  };

  const handleRoleClick = (
    projectId: string,
    roleId: number,
    title: string
  ) => {
    setSelectedRole({ projectId, roleId, title });
    setSelectedApplicants(new Set());
    loadApplicants(projectId, roleId);
  };

  const handleBulkAction = async (action: "message" | "reject") => {
    if (selectedApplicants.size === 0) return;

    if (action === "reject") {
      for (const appId of selectedApplicants) {
        await fetch(`/api/applications/${appId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "declined" }),
        });
      }
      // Reload
      if (selectedRole) {
        loadApplicants(selectedRole.projectId, selectedRole.roleId);
      }
      setSelectedApplicants(new Set());
    }
    // TODO: bulk message — create group conversation
  };

  const toggleApplicant = (id: number) => {
    const next = new Set(selectedApplicants);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedApplicants(next);
  };

  if (!session?.user.isCastingDirector) {
    return (
      <EmptyState
        title="Режим кастинг-агентства"
        description="Эта функция доступна только для кастинг-директоров. Запросите аккредитацию в настройках профиля."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Role detail view
  if (selectedRole) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{selectedRole.title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRole(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Bulk actions */}
        {selectedApplicants.size > 0 && (
          <div className="flex gap-2 mb-3 p-2 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground flex-1">
              Выбрано: {selectedApplicants.size}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("message")}
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1" />
              Написать
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkAction("reject")}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Отклонить
            </Button>
          </div>
        )}

        {loadingApplicants ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : applicants.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Пока нет откликов
          </p>
        ) : (
          <div className="space-y-2">
            {applicants.map((app) => (
              <Card
                key={app.id}
                className={`cursor-pointer transition-colors ${
                  selectedApplicants.has(app.id) ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => toggleApplicant(app.id)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedApplicants.has(app.id)}
                    onChange={() => toggleApplicant(app.id)}
                    className="shrink-0"
                  />
                  <Link
                    href={`/profile/${app.user.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <UserAvatar
                      name={app.user.name}
                      avatarUrl={app.user.avatarUrl}
                      size="sm"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${app.user.id}`}
                      className="font-medium text-sm hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {app.user.name}
                    </Link>
                    {app.coverMessage && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {app.coverMessage}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      app.status === "accepted"
                        ? "default"
                        : app.status === "declined"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {app.status === "accepted"
                      ? "Принят"
                      : app.status === "declined"
                      ? "Отклонён"
                      : "Ожидает"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Castings list
  return (
    <div className="p-4">
      {projects.length === 0 ? (
        <EmptyState
          title="Нет кастингов"
          description="Создайте проект типа «Кастинг» для управления откликами актёров"
          action={
            <Link href="/projects/new">
              <Button>Создать кастинг</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clapperboard className="w-4 h-4 text-primary" />
                  {project.title}
                  {project.city && (
                    <span className="text-xs text-muted-foreground font-normal">
                      · {project.city}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {project.roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() =>
                      handleRoleClick(
                        project.id,
                        role.id,
                        role.customTitle || role.profession?.name || "Роль"
                      )
                    }
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {role.customTitle || role.profession?.name || "Роль"}
                      </span>
                      {role.roleType && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-[10px]"
                        >
                          {role.roleType === "main"
                            ? "Главная"
                            : role.roleType === "episodic"
                            ? "Эпизод"
                            : "Массовка"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        {role.applicationsCount}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
