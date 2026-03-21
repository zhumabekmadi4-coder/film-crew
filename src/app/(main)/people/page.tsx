"use client";
import { useState, useEffect } from "react";
import { UserCard } from "@/components/search/UserCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { AVAILABILITY_OPTIONS } from "@/lib/constants";
import { Search } from "lucide-react";

interface Profession { id: number; name: string; }

export default function PeoplePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [professionId, setProfessionId] = useState("");
  const [city, setCity] = useState("");
  const [availability, setAvailability] = useState("");

  useEffect(() => {
    fetch("/api/professions").then((r) => r.json()).then(setProfessions);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (professionId) params.set("professionId", professionId);
    if (city) params.set("city", city);
    if (availability) params.set("availability", availability);

    setLoading(true);
    fetch(`/api/users?${params}`)
      .then((r) => r.json())
      .then((data) => { setUsers(Array.isArray(data) ? data : []); setLoading(false); });
  }, [query, professionId, city, availability]);

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Поиск людей..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={professionId || "all"} onValueChange={(v) => setProfessionId(v === "all" ? "" : v)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Профессия" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все профессии</SelectItem>
              {professions.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={availability || "all"} onValueChange={(v) => setAvailability(v === "all" ? "" : v)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Доступность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любая</SelectItem>
              {AVAILABILITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Город"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="Никого не найдено" description="Попробуй изменить фильтры" icon="🔍" />
      ) : (
        <div className="space-y-3">
          {users.map((u) => <UserCard key={u.id} user={u} />)}
        </div>
      )}
    </div>
  );
}
