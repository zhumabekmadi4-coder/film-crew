"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AVAILABILITY_OPTIONS, EQUIPMENT_CATEGORIES } from "@/lib/constants";
import { Plus, Trash2, LogOut, Save } from "lucide-react";

interface Profession { id: number; name: string; }

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [allProfessions, setAllProfessions] = useState<Profession[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({ name: "", bio: "", city: "", experienceYears: "", availability: "project-based", showreel: "", website: "", telegram: "", instagram: "" });
  const [primaryIds, setPrimaryIds] = useState<number[]>([]);
  const [secondaryIds, setSecondaryIds] = useState<number[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [newEquip, setNewEquip] = useState({ category: "camera", name: "", description: "" });
  const [addingEquip, setAddingEquip] = useState(false);

  useEffect(() => {
    fetch("/api/professions").then((r) => r.json()).then(setAllProfessions);
    fetch("/api/profile").then((r) => r.json()).then((data) => {
      setProfile(data);
      setForm({
        name: data.name || "",
        bio: data.bio || "",
        city: data.city || "",
        experienceYears: data.experienceYears ? String(data.experienceYears) : "",
        availability: data.availability || "project-based",
        showreel: data.showreel || "",
        website: data.website || "",
        telegram: data.telegram || "",
        instagram: data.instagram || "",
      });
      setPrimaryIds(data.professions?.filter((p: any) => p.isPrimary).map((p: any) => p.professionId) || []);
      setSecondaryIds(data.professions?.filter((p: any) => !p.isPrimary).map((p: any) => p.professionId) || []);
      setEquipment(data.equipment || []);
    });
  }, []);

  async function saveProfile() {
    setSaving(true);
    await Promise.all([
      fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, experienceYears: form.experienceYears ? Number(form.experienceYears) : null }),
      }),
      fetch("/api/profile/professions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary: primaryIds, secondary: secondaryIds }),
      }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addEquipment() {
    if (!newEquip.name) return;
    const res = await fetch("/api/profile/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEquip),
    });
    const item = await res.json();
    setEquipment([...equipment, item]);
    setNewEquip({ category: "camera", name: "", description: "" });
    setAddingEquip(false);
  }

  async function deleteEquipment(id: number) {
    await fetch("/api/profile/equipment", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setEquipment(equipment.filter((e) => e.id !== id));
  }

  if (!profile) return <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="lg" />
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="w-full">
          <TabsTrigger value="info" className="flex-1">Инфо</TabsTrigger>
          <TabsTrigger value="professions" className="flex-1">Профессии</TabsTrigger>
          <TabsTrigger value="equipment" className="flex-1">Техника</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-3 mt-3">
          <div className="space-y-1.5"><Label>Имя</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>О себе</Label><Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Коротко о себе..." /></div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5"><Label>Город</Label><Input placeholder="Алматы" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div className="flex-1 space-y-1.5"><Label>Лет опыта</Label><Input type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Доступность</Label>
            <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{AVAILABILITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Showreel (ссылка)</Label><Input placeholder="https://vimeo.com/..." value={form.showreel} onChange={(e) => setForm({ ...form, showreel: e.target.value })} /></div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5"><Label>Telegram</Label><Input placeholder="@username" value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} /></div>
            <div className="flex-1 space-y-1.5"><Label>Instagram</Label><Input placeholder="@username" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></div>
          </div>

          <Button className="w-full" onClick={saveProfile} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saved ? "✅ Сохранено!" : saving ? "Сохраняем..." : "Сохранить"}
          </Button>
        </TabsContent>

        <TabsContent value="professions" className="space-y-3 mt-3">
          <p className="text-sm text-muted-foreground">1 нажатие — основная профессия, 2 нажатия — дополнительная, 3 — убрать</p>
          <div className="flex flex-wrap gap-2">
            {allProfessions.map((p) => {
              const isPrimary = primaryIds.includes(p.id);
              const isSecondary = secondaryIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (!isPrimary && !isSecondary) { setPrimaryIds([...primaryIds, p.id]); }
                    else if (isPrimary) { setPrimaryIds(primaryIds.filter(x => x !== p.id)); setSecondaryIds([...secondaryIds, p.id]); }
                    else { setSecondaryIds(secondaryIds.filter(x => x !== p.id)); }
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isPrimary ? "bg-primary text-primary-foreground border-primary" :
                    isSecondary ? "bg-secondary text-secondary-foreground border-secondary" :
                    "bg-background border-input"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary inline-block" /> Основная</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-secondary border inline-block" /> Дополнительная</span>
          </div>
          <Button className="w-full" onClick={saveProfile} disabled={saving}>
            {saved ? "✅ Сохранено!" : "Сохранить профессии"}
          </Button>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-3 mt-3">
          {equipment.map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-2 border rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{EQUIPMENT_CATEGORIES.find(c => c.value === item.category)?.label} {item.description && `· ${item.description}`}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0" onClick={() => deleteEquipment(item.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}

          {addingEquip ? (
            <div className="border rounded-lg p-3 space-y-2">
              <Select value={newEquip.category} onValueChange={(v) => setNewEquip({ ...newEquip, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EQUIPMENT_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Название (напр: Canon EOS R5)" value={newEquip.name} onChange={(e) => setNewEquip({ ...newEquip, name: e.target.value })} />
              <Input placeholder="Описание (необязательно)" value={newEquip.description} onChange={(e) => setNewEquip({ ...newEquip, description: e.target.value })} />
              <div className="flex gap-2">
                <Button size="sm" onClick={addEquipment}>Добавить</Button>
                <Button size="sm" variant="outline" onClick={() => setAddingEquip(false)}>Отмена</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setAddingEquip(true)}>
              <Plus className="w-4 h-4 mr-2" /> Добавить технику
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
