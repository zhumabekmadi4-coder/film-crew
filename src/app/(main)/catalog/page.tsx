"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpecialistCard } from "@/components/catalog/SpecialistCard";
import { CompanyCard } from "@/components/catalog/CompanyCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search, Loader2 } from "lucide-react";
import type { Profession } from "@/types";

type CatalogTab = "specialists" | "companies";

export default function CatalogPage() {
  const [tab, setTab] = useState<CatalogTab>("specialists");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [professionId, setProfessionId] = useState("");
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/professions")
      .then((r) => r.json())
      .then(setProfessions);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);

    if (tab === "specialists") {
      if (professionId) params.set("professionId", professionId);
      fetch(`/api/users?${params}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
        });
    } else {
      fetch(`/api/companies?${params}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
        });
    }
  }, [tab, query, city, professionId]);

  return (
    <div>
      {/* Tabs */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b">
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as CatalogTab);
            setResults([]);
          }}
          className="px-4"
        >
          <TabsList className="w-full h-10 bg-transparent p-0 justify-start gap-0">
            <TabsTrigger
              value="specialists"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Специалисты
            </TabsTrigger>
            <TabsTrigger
              value="companies"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Компании
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-2 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={
              tab === "specialists"
                ? "Поиск по имени..."
                : "Поиск компании..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Город"
            className="flex-1"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          {tab === "specialists" && (
            <Select
              value={professionId || "all"}
              onValueChange={(v) => setProfessionId(v === "all" ? "" : v)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Профессия" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все профессии</SelectItem>
                {professions.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          message={
            tab === "specialists"
              ? "Специалисты не найдены"
              : "Компании не найдены"
          }
        />
      ) : (
        <div className="divide-y">
          {tab === "specialists"
            ? results.map((u: any) => (
                <SpecialistCard
                  key={u.id}
                  id={u.id}
                  name={u.name}
                  avatarUrl={u.avatarUrl}
                  city={u.city}
                  availability={u.availability}
                  experienceYears={u.experienceYears}
                  bio={u.bio}
                  isActor={u.isActor}
                />
              ))
            : results.map((c: any) => (
                <CompanyCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  description={c.description}
                  city={c.city}
                  logoUrl={c.logoUrl}
                />
              ))}
        </div>
      )}
    </div>
  );
}
