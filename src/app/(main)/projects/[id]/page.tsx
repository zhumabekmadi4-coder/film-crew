"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleCard } from "@/components/projects/RoleCard";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Film, Users, Link2, Edit, UserPlus } from "lucide-react";

const statusLabels: Record<string, string> = {
  drafting: "Черновик",
  recruiting: "Набор команды",
  "in-progress": "В процессе",
  completed: "Завершён",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [coverMessage, setCoverMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => { setProject(data); setLoading(false); });
  }, [id]);

  async function handleApply() {
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: id, roleId: selectedRoleId, coverMessage }),
    });
    setApplying(false);
    setCoverMessage("");
    alert("Заявка отправлена!");
  }

  async function generateLink() {
    const res = await fetch(`/api/projects/${id}/invite-link`, { method: "POST" });
    const data = await res.json();
    setInviteLink(data.link);
    navigator.clipboard.writeText(data.link).catch(() => {});
  }

  if (loading) return <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>;
  if (!project) return <div className="p-4 text-center">Проект не найден</div>;

  const isOwner = session?.user?.id === project.ownerId;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold leading-tight">{project.title}</h2>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge>{statusLabels[project.status] ?? project.status}</Badge>
            {project.genre && <Badge variant="outline">{project.genre}</Badge>}
          </div>
        </div>
        {isOwner && (
          <Link href={`/projects/${id}/edit`}>
            <Button size="icon" variant="ghost"><Edit className="w-4 h-4" /></Button>
          </Link>
        )}
      </div>

      {project.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
        {project.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.city}</span>}
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{project.membersCount} участников</span>
      </div>

      {project.owner && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Автор:</span>
          <Link href={`/profile/${project.owner.id}`} className="flex items-center gap-2">
            <UserAvatar name={project.owner.name} avatarUrl={project.owner.avatarUrl} size="sm" />
            <span className="text-sm font-medium">{project.owner.name}</span>
          </Link>
        </div>
      )}

      {project.roles && project.roles.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ищем в команду</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {project.roles.map((role: any) => (
              <RoleCard
                key={role.id}
                role={{ ...role, professionName: role.professionName }}
                actions={
                  !isOwner && !role.isFilled ? (
                    <Dialog open={applying && selectedRoleId === role.id} onOpenChange={(o) => { setApplying(o); if (o) setSelectedRoleId(role.id); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="shrink-0">
                          <UserPlus className="w-3.5 h-3.5 mr-1" /> Откликнуться
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Заявка на роль: {role.professionName || role.customTitle}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label>Сопроводительное сообщение</Label>
                            <Textarea
                              placeholder="Расскажи почему ты подходишь..."
                              rows={4}
                              value={coverMessage}
                              onChange={(e) => setCoverMessage(e.target.value)}
                            />
                          </div>
                          <Button className="w-full" onClick={handleApply}>Отправить заявку</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : null
                }
              />
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {!isOwner && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <UserPlus className="w-4 h-4 mr-2" /> Подать заявку на проект
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Заявка на проект</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Сообщение</Label>
                  <Textarea
                    placeholder="Расскажи о себе..."
                    rows={4}
                    value={coverMessage}
                    onChange={(e) => setCoverMessage(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={() => { setSelectedRoleId(null); handleApply(); }}>
                  Отправить заявку
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {isOwner && (
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={generateLink}>
              <Link2 className="w-4 h-4 mr-2" /> Создать ссылку-приглашение
            </Button>
            {inviteLink && (
              <div className="text-xs bg-muted p-2 rounded break-all">
                Ссылка скопирована: {inviteLink}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
