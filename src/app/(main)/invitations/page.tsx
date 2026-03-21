"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

const statusLabels: Record<string, { label: string; variant: "default" | "outline" | "success" | "secondary" | "destructive" }> = {
  pending: { label: "Ожидает", variant: "secondary" },
  accepted: { label: "Принято", variant: "success" },
  declined: { label: "Отклонено", variant: "destructive" },
};

export default function InvitationsPage() {
  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/invitations").then((r) => r.json()),
      fetch("/api/applications").then((r) => r.json()),
    ]).then(([invData, appData]) => {
      setReceived(invData.received || []);
      setSent(invData.sent || []);
      setApplications(Array.isArray(appData) ? appData : []);
      setLoading(false);
    });
  }, []);

  async function respond(id: number, status: "accepted" | "declined") {
    await fetch(`/api/invitations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setReceived(received.map((inv) => inv.id === id ? { ...inv, status } : inv));
  }

  return (
    <div className="p-4 space-y-4">
      <Tabs defaultValue="received">
        <TabsList className="w-full">
          <TabsTrigger value="received" className="flex-1">Входящие ({received.filter(i => i.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="applications" className="flex-1">Заявки ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-3 mt-3">
          {loading ? [1,2].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />) :
          received.length === 0 ? (
            <EmptyState icon="📬" title="Нет приглашений" description="Когда тебя пригласят в проект — появится здесь" />
          ) : received.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={inv.fromUserName || "?"} avatarUrl={inv.fromUserAvatar} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{inv.fromUserName}</p>
                      <Link href={`/projects/${inv.projectId}`} className="text-xs text-primary">{inv.projectTitle}</Link>
                    </div>
                  </div>
                  <Badge variant={statusLabels[inv.status]?.variant ?? "outline"} className="text-xs">
                    {statusLabels[inv.status]?.label}
                  </Badge>
                </div>
                {inv.message && <p className="text-sm text-muted-foreground">{inv.message}</p>}
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true, locale: ru })}
                </p>
                {inv.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => respond(inv.id, "accepted")}>
                      <Check className="w-4 h-4 mr-1" /> Принять
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => respond(inv.id, "declined")}>
                      <X className="w-4 h-4 mr-1" /> Отклонить
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="applications" className="space-y-3 mt-3">
          {applications.length === 0 ? (
            <EmptyState icon="📝" title="Нет заявок" description="Откликайся на проекты в ленте" />
          ) : applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Link href={`/projects/${app.projectId}`} className="text-sm font-medium text-primary">{app.projectTitle}</Link>
                  <Badge variant={statusLabels[app.status]?.variant ?? "outline"} className="text-xs">
                    {statusLabels[app.status]?.label}
                  </Badge>
                </div>
                {app.coverMessage && <p className="text-sm text-muted-foreground line-clamp-2">{app.coverMessage}</p>}
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true, locale: ru })}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
