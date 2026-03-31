"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Upload, CheckCircle, Loader2 } from "lucide-react";
import { GENDER_OPTIONS, HAIR_COLORS, EYE_COLORS } from "@/lib/constants";

export default function ActorProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    gender: "",
    birthYear: "",
    height: "",
    weight: "",
    hairColor: "",
    eyeColor: "",
    ethnicity: "",
    languages: "",
    bodyType: "",
    specialSkills: "",
    photoFront: "",
    photoProfile: "",
    photo34: "",
    photoFull: "",
    voiceDemo: "",
    actingShowreel: "",
  });

  const photoRefs = {
    photoFront: useRef<HTMLInputElement>(null),
    photoProfile: useRef<HTMLInputElement>(null),
    photo34: useRef<HTMLInputElement>(null),
    photoFull: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    fetch("/api/actor-profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            gender: data.gender || "",
            birthYear: data.birthYear?.toString() || "",
            height: data.height?.toString() || "",
            weight: data.weight?.toString() || "",
            hairColor: data.hairColor || "",
            eyeColor: data.eyeColor || "",
            ethnicity: data.ethnicity || "",
            languages: data.languages || "",
            bodyType: data.bodyType || "",
            specialSkills: data.specialSkills || "",
            photoFront: data.photoFront || "",
            photoProfile: data.photoProfile || "",
            photo34: data.photo34 || "",
            photoFull: data.photoFull || "",
            voiceDemo: data.voiceDemo || "",
            actingShowreel: data.actingShowreel || "",
          });
        }
        setLoading(false);
      });
  }, []);

  const handlePhoto = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, [field]: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/actor-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        birthYear: form.birthYear ? parseInt(form.birthYear) : null,
        height: form.height ? parseInt(form.height) : null,
        weight: form.weight ? parseInt(form.weight) : null,
      }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const photoFields = [
    { key: "photoFront", label: "Анфас" },
    { key: "photoProfile", label: "Профиль" },
    { key: "photo34", label: "3/4" },
    { key: "photoFull", label: "Полный рост" },
  ] as const;

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Анкета актёра</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Photos — required 4 */}
          <div>
            <Label className="mb-2 block">Фотографии (минимум 4)</Label>
            <div className="grid grid-cols-2 gap-2">
              {photoFields.map(({ key, label }) => (
                <div key={key}>
                  <button
                    className="w-full aspect-[3/4] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 hover:bg-muted/50 transition-colors overflow-hidden"
                    onClick={() =>
                      photoRefs[key as keyof typeof photoRefs].current?.click()
                    }
                  >
                    {form[key] ? (
                      <img
                        src={form[key]}
                        alt={label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {label}
                        </span>
                      </>
                    )}
                  </button>
                  <input
                    ref={photoRefs[key as keyof typeof photoRefs]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhoto(e, key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Пол</Label>
              <Select
                value={form.gender || "none"}
                onValueChange={(v) =>
                  setForm({ ...form, gender: v === "none" ? "" : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Пол" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не указан</SelectItem>
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Год рождения</Label>
              <Input
                type="number"
                placeholder="1995"
                value={form.birthYear}
                onChange={(e) =>
                  setForm({ ...form, birthYear: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Рост (см)</Label>
              <Input
                type="number"
                placeholder="175"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Вес (кг)</Label>
              <Input
                type="number"
                placeholder="70"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Цвет волос</Label>
              <Select
                value={form.hairColor || "none"}
                onValueChange={(v) =>
                  setForm({ ...form, hairColor: v === "none" ? "" : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выбрать" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не указан</SelectItem>
                  {HAIR_COLORS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Цвет глаз</Label>
              <Select
                value={form.eyeColor || "none"}
                onValueChange={(v) =>
                  setForm({ ...form, eyeColor: v === "none" ? "" : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выбрать" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не указан</SelectItem>
                  {EYE_COLORS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Языки</Label>
            <Input
              placeholder="Казахский, Русский, Английский"
              value={form.languages}
              onChange={(e) => setForm({ ...form, languages: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Особые навыки</Label>
            <Textarea
              placeholder="Фехтование, верховая езда, танцы..."
              value={form.specialSkills}
              onChange={(e) =>
                setForm({ ...form, specialSkills: e.target.value })
              }
              className="min-h-[60px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Шоурил (ссылка)</Label>
            <Input
              placeholder="https://..."
              value={form.actingShowreel}
              onChange={(e) =>
                setForm({ ...form, actingShowreel: e.target.value })
              }
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Сохранено!
              </>
            ) : saving ? (
              "Сохраняю..."
            ) : (
              "Сохранить анкету"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
