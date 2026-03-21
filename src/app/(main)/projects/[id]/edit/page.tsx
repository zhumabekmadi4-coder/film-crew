"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FILM_GENRES, PROJECT_STATUSES } from "@/lib/constants";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", genre: "", city: "", status: "recruiting" });

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((p) => setForm({ title: p.title || "", description: p.description || "", genre: p.genre || "", city: p.city || "", status: p.status || "recruiting" }));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push(`/projects/${id}`);
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Редактировать проект</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Название</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Описание</Label>
          <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <Label>Жанр</Label>
            <Select value={form.genre || "none"} onValueChange={(v) => setForm({ ...form, genre: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Жанр" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без жанра</SelectItem>
                {FILM_GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5">
            <Label>Статус</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Город</Label>
          <Input placeholder="Алматы" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Сохраняем..." : "Сохранить"}</Button>
      </form>
    </div>
  );
}
