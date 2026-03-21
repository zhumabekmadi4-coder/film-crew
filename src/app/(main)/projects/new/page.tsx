"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConditionsForm } from "@/components/projects/ConditionsForm";
import { RoleCard } from "@/components/projects/RoleCard";
import { FILM_GENRES } from "@/lib/constants";
import { Plus, Trash2 } from "lucide-react";
import { Button as Btn } from "@/components/ui/button";

interface Profession { id: number; name: string; }
interface RoleData {
  professionId?: number;
  customTitle?: string;
  conditionsType: "discuss" | "specified";
  payment?: string;
  schedule?: string;
  timeCommitment?: string;
  otherConditions?: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [city, setCity] = useState("");

  const [roles, setRoles] = useState<RoleData[]>([]);
  const [addingRole, setAddingRole] = useState(false);
  const [newRole, setNewRole] = useState<RoleData>({ conditionsType: "discuss" });

  useEffect(() => {
    fetch("/api/professions").then((r) => r.json()).then(setProfessions);
  }, []);

  function addRole() {
    if (!newRole.professionId && !newRole.customTitle) return;
    setRoles([...roles, newRole]);
    setNewRole({ conditionsType: "discuss" });
    setAddingRole(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) { setError("Укажи название проекта"); return; }
    setLoading(true);
    setError("");

    // Create project
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, genre, city, status: "recruiting" }),
    });
    const project = await res.json();

    // Create roles
    for (const role of roles) {
      await fetch(`/api/projects/${project.id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(role),
      });
    }

    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Новый проект</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Основное</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Название *</Label>
              <Input placeholder="Название проекта" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Textarea placeholder="О чём проект, идея, концепция..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label>Жанр</Label>
                <Select value={genre || "none"} onValueChange={(v) => setGenre(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Выбрать" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без жанра</SelectItem>
                    {FILM_GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1.5">
                <Label>Город</Label>
                <Input placeholder="Алматы" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Нужны в команду</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={() => setAddingRole(true)}>
                <Plus className="w-4 h-4 mr-1" /> Добавить
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {roles.length === 0 && !addingRole && (
              <p className="text-sm text-muted-foreground text-center py-4">Добавь нужных специалистов</p>
            )}
            {roles.map((role, i) => (
              <RoleCard
                key={i}
                role={{
                  id: i,
                  professionName: professions.find((p) => p.id === role.professionId)?.name,
                  customTitle: role.customTitle,
                  conditionsType: role.conditionsType,
                  payment: role.payment,
                  schedule: role.schedule,
                  timeCommitment: role.timeCommitment,
                  otherConditions: role.otherConditions,
                  isFilled: false,
                }}
                actions={
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setRoles(roles.filter((_, j) => j !== i))}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                }
              />
            ))}

            {addingRole && (
              <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                <Select
                  value={newRole.professionId ? String(newRole.professionId) : "custom"}
                  onValueChange={(v) => setNewRole({ ...newRole, professionId: v !== "custom" ? Number(v) : undefined })}
                >
                  <SelectTrigger><SelectValue placeholder="Выбери профессию" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Другая роль...</SelectItem>
                    {professions.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                {!newRole.professionId && (
                  <Input
                    placeholder="Название роли"
                    value={newRole.customTitle || ""}
                    onChange={(e) => setNewRole({ ...newRole, customTitle: e.target.value })}
                  />
                )}

                <ConditionsForm value={newRole} onChange={(v) => setNewRole(v)} />

                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={addRole}>Добавить</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setAddingRole(false)}>Отмена</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Создаём..." : "Создать проект"}
        </Button>
      </form>
    </div>
  );
}
