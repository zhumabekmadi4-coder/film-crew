"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search, Ban, Shield, Loader2 } from "lucide-react";
import { USER_ROLES } from "@/lib/constants";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("limit", "50");

    fetch(`/api/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [query]);

  const updateRole = async (userId: string, role: string) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setRole", userId, role }),
    });
    setUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  const toggleBan = async (userId: string, isBanned: boolean) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: isBanned ? "unban" : "ban",
        userId,
      }),
    });
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, isBanned: !isBanned } : u
      )
    );
  };

  const isSuperadmin = session?.user?.role === "superadmin";

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Поиск пользователей..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState message="Пользователи не найдены" />
      ) : (
        <div className="space-y-2">
          {users.map((user: any) => (
            <Card key={user.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={user.name}
                    avatarUrl={user.avatarUrl}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {user.name}
                      </p>
                      {user.isBanned && (
                        <Badge variant="destructive" className="text-[10px]">
                          Заблокирован
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user.city || "Город не указан"}
                    </p>
                  </div>

                  {/* Role selector (superadmin only) */}
                  {isSuperadmin && (
                    <Select
                      value={user.role || "user"}
                      onValueChange={(v) => updateRole(user.id, v)}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((r) => (
                          <SelectItem
                            key={r.value}
                            value={r.value}
                            className="text-xs"
                          >
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Ban button (superadmin only) */}
                  {isSuperadmin && (
                    <Button
                      variant={user.isBanned ? "outline" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleBan(user.id, user.isBanned)}
                      title={
                        user.isBanned ? "Разблокировать" : "Заблокировать"
                      }
                    >
                      <Ban
                        className={`w-4 h-4 ${
                          user.isBanned
                            ? "text-muted-foreground"
                            : "text-destructive"
                        }`}
                      />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
