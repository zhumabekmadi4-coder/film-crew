"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Check, X, Loader2, Building2, Clapperboard } from "lucide-react";

interface AccreditationReq {
  id: number;
  type: string;
  status: string;
  message: string | null;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
  company?: { id: string; name: string } | null;
}

export default function AccreditationPage() {
  const [requests, setRequests] = useState<AccreditationReq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin?type=accreditation")
      .then((r) => r.json())
      .then((data) => {
        setRequests(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const handleAction = async (
    id: number,
    action: "approved" | "rejected"
  ) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "accreditation",
        requestId: id,
        status: action,
      }),
    });
    setRequests(
      requests.map((r) =>
        r.id === id ? { ...r, status: action } : r
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-semibold">
        Ожидают рассмотрения ({pending.length})
      </h2>

      {pending.length === 0 ? (
        <EmptyState message="Нет новых запросов" />
      ) : (
        <div className="space-y-2">
          {pending.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={req.user.name}
                    avatarUrl={req.user.avatarUrl}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{req.user.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {req.type === "company" ? (
                        <Building2 className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <Clapperboard className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {req.type === "company"
                          ? `Компания: ${req.company?.name || "—"}`
                          : "Кастинг-агентство"}
                      </span>
                    </div>
                    {req.message && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {req.message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleAction(req.id, "approved")}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => handleAction(req.id, "rejected")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <>
          <h2 className="font-semibold mt-6">История</h2>
          <div className="space-y-2">
            {resolved.map((req) => (
              <Card key={req.id} className="opacity-60">
                <CardContent className="p-3 flex items-center gap-3">
                  <UserAvatar
                    name={req.user.name}
                    avatarUrl={req.user.avatarUrl}
                    size="sm"
                  />
                  <div className="flex-1">
                    <p className="text-sm">{req.user.name}</p>
                  </div>
                  <Badge
                    variant={
                      req.status === "approved" ? "default" : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {req.status === "approved" ? "Одобрено" : "Отклонено"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
