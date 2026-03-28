"use client";
import { useState, useEffect, useRef } from "react";
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
import { Plus, Trash2, LogOut, Save, Camera, X, ImagePlus } from "lucide-react";

interface Profession { id: number; name: string; }

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [allProfessions, setAllProfessions] = useState<Profession[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "", bio: "", city: "", experienceYears: "", availability: "project-based",
    showreel: "", website: "", telegram: "", instagram: "", portfolio: "",
  });
  const [primaryIds, setPrimaryIds] = useState<number[]>([]);
  const [secondaryIds, setSecondaryIds] = useState<number[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [newEquip, setNewEquip] = useState({ category: "camera", name: "", description: "" });
  const [addingEquip, setAddingEquip] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
        portfolio: data.portfolio || "",
      });
      setPrimaryIds(data.professions?.filter((p: any) => p.isPrimary).map((p: any) => p.professionId) || []);
      setSecondaryIds(data.professions?.filter((p: any) => !p.isPrimary).map((p: any) => p.professionId) || []);
      setEquipment(data.equipment || []);
      setPhotos(data.photos || []);
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

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await fetch("/api/profile/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      if (res.ok) {
        const photo = await res.json();
        setPhotos([...photos, photo]);
      }
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  async function deletePhoto(id: number) {
    await fetch("/api/profile/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPhotos(photos.filter((p) => p.id !== id));
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: dataUrl }),
      });
      setProfile({ ...profile, avatarUrl: dataUrl });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  if (!profile) return <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <UserAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="lg" />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center"
              disabled={uploadingAvatar}
            >
              <Camera className="w-3 h-3" />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
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
          <TabsTrigger value="photos" className="flex-1">Фото</TabsTrigger>
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

          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Ссылки</p>
            <div className="space-y-2">
              <div className="space-y-1.5"><Label>Showreel</Label><Input placeholder="https://vimeo.com/..." value={form.showreel} onChange={(e) => setForm({ ...form, showreel: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Портфолио</Label><Input placeholder="https://behance.net/..." value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Сайт</Label><Input placeholder="https://mysite.com" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1.5"><Label>Telegram</Label><Input placeholder="@username" value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} /></div>
                <div className="flex-1 space-y-1.5"><Label>Instagram</Label><Input placeholder="@username" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></div>
              </div>
            </div>
          </div>

          <Button className="w-full" onClick={saveProfile} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saved ? "Сохранено!" : saving ? "Сохраняем..." : "Сохранить"}
          </Button>
        </TabsContent>

        <TabsContent value="photos" className="space-y-3 mt-3">
          <p className="text-sm text-muted-foreground">Загрузи до 3 фотографий работ или портфолио</p>

          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {photos.length < 3 && (
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {uploadingPhoto ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs">Добавить</span>
                  </>
                )}
              </button>
            )}
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
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
                  className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${
                    isPrimary ? "bg-primary text-primary-foreground border-primary" :
                    isSecondary ? "bg-primary/10 text-primary border-primary/50" :
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
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary/20 border border-primary/50 inline-block" /> Дополнительная</span>
          </div>
          <Button className="w-full" onClick={saveProfile} disabled={saving}>
            {saved ? "Сохранено!" : "Сохранить профессии"}
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
