"use client";
import { useState, useEffect } from "react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { FILM_GENRES } from "@/lib/constants";
import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeedPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ status: "recruiting" });
    if (query) params.set("q", query);
    if (genre) params.set("genre", genre);
    if (city) params.set("city", city);

    setLoading(true);
    fetch(`/api/projects?${params}`)
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); });
  }, [query, genre, city]);

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Поиск проектов..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={genre || "all"} onValueChange={(v) => setGenre(v === "all" ? "" : v)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Жанр" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все жанры</SelectItem>
              {FILM_GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            placeholder="Город"
            className="flex-1"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="Проектов пока нет"
          description="Создай первый проект и начни набирать команду"
          action={
            <Link href="/projects/new">
              <Button>Создать проект</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
