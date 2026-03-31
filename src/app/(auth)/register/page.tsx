"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, Camera, Upload } from "lucide-react";
import { AVAILABILITY_OPTIONS } from "@/lib/constants";
import { signIn } from "next-auth/react";

interface Profession {
  id: number;
  name: string;
}

const STEPS = ["Аккаунт", "Профессии", "О себе", "Фото", "Подтверждение"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 0: Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Step 1: Professions
  const [allProfessions, setAllProfessions] = useState<Profession[]>([]);
  const [primaryIds, setPrimaryIds] = useState<number[]>([]);
  const [secondaryIds, setSecondaryIds] = useState<number[]>([]);

  // Step 2: About
  const [city, setCity] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("project-based");

  // Step 3: Photo
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  // Step 4: Confirmation
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    fetch("/api/professions")
      .then((r) => r.json())
      .then(setAllProfessions);
  }, []);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || null,
          phone: phone || null,
          password,
          name,
          city,
          experienceYears: experienceYears ? Number(experienceYears) : null,
          bio,
          availability,
          avatarUrl: avatarUrl || null,
          selfieUrl: selfieUrl || null,
          ageConfirmed,
          termsAccepted,
          primaryProfessions: primaryIds,
          secondaryProfessions: secondaryIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка регистрации");
        setLoading(false);
        return;
      }

      // Sign in with email or phone
      const login = email || phone;
      await signIn("credentials", { login, password, redirect: false });
      router.push("/feed");
    } catch {
      setError("Что-то пошло не так");
      setLoading(false);
    }
  }

  const canProceed = () => {
    switch (step) {
      case 0:
        return name && (email || phone) && password.length >= 6;
      case 1:
        return primaryIds.length >= 1;
      case 2:
        return true;
      case 3:
        return true; // avatar optional at this stage
      case 4:
        return ageConfirmed && termsAccepted;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-8 bg-gradient-to-b from-primary/5 to-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold mt-1">Film Crew</h1>
          <p className="text-sm text-muted-foreground">Регистрация</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  i <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px flex-1 ${
                    i < step ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-4">
            {/* Step 0: Account */}
            {step === 0 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Ф.И. *</Label>
                  <Input
                    placeholder="Иван Петров"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Телефон</Label>
                  <Input
                    type="tel"
                    placeholder="+7 777 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Укажите телефон или email (или оба)
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Пароль *</Label>
                  <Input
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 1: Professions */}
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Выберите основные профессии (1–3). Нажмите ещё раз для
                  дополнительной.
                </p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="default">Основная</Badge>
                  <Badge variant="outline">Дополнительная</Badge>
                </div>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto py-1">
                  {allProfessions.map((p) => {
                    const isPrimary = primaryIds.includes(p.id);
                    const isSecondary = secondaryIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (!isPrimary && !isSecondary) {
                            if (primaryIds.length < 3) {
                              setPrimaryIds((prev) => [...prev, p.id]);
                            }
                          } else if (isPrimary) {
                            setPrimaryIds((prev) =>
                              prev.filter((x) => x !== p.id)
                            );
                            setSecondaryIds((prev) => [...prev, p.id]);
                          } else {
                            setSecondaryIds((prev) =>
                              prev.filter((x) => x !== p.id)
                            );
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${
                          isPrimary
                            ? "bg-primary text-primary-foreground border-primary"
                            : isSecondary
                            ? "bg-primary/10 text-primary border-primary/50"
                            : "bg-background border-input"
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
                {primaryIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Основные: {primaryIds.length}/3 · Дополнительные:{" "}
                    {secondaryIds.length}
                  </p>
                )}
              </div>
            )}

            {/* Step 2: About */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Город</Label>
                  <Input
                    placeholder="Алматы"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Лет опыта</Label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Доступность</Label>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABILITY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>О себе</Label>
                  <Textarea
                    placeholder="Коротко расскажите о себе..."
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Avatar + Selfie */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Аватарка</Label>
                  <div className="flex items-center gap-4">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Camera className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => avatarRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Загрузить
                    </Button>
                    <input
                      ref={avatarRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setAvatarUrl)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Селфи для идентификации</Label>
                  <p className="text-xs text-muted-foreground">
                    Сделайте фото лица. Используется для верификации аккаунта.
                  </p>
                  <div className="flex items-center gap-4">
                    {selfieUrl ? (
                      <img
                        src={selfieUrl}
                        alt="Selfie"
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                        <Camera className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selfieRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-1" />
                      Сделать фото
                    </Button>
                    <input
                      ref={selfieRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setSelfieUrl)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="age"
                    checked={ageConfirmed}
                    onCheckedChange={(c) => setAgeConfirmed(!!c)}
                  />
                  <label htmlFor="age" className="text-sm leading-tight">
                    Подтверждаю, что мне исполнилось 18 лет *
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(c) => setTermsAccepted(!!c)}
                  />
                  <label htmlFor="terms" className="text-sm leading-tight">
                    Принимаю условия{" "}
                    <span className="text-primary underline">
                      оферты
                    </span>{" "}
                    и{" "}
                    <span className="text-primary underline">
                      политики конфиденциальности
                    </span>{" "}
                    *
                  </label>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive mt-3">{error}</p>
            )}

            <div className="flex gap-2 mt-4">
              {step > 0 && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep(step - 1);
                    setError("");
                  }}
                >
                  Назад
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button
                  className="flex-1"
                  onClick={() => {
                    setStep(step + 1);
                    setError("");
                  }}
                  disabled={!canProceed()}
                >
                  Далее
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={loading || !canProceed()}
                >
                  {loading ? "Регистрируем..." : "Создать аккаунт"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Есть аккаунт?{" "}
          <Link href="/login" className="text-primary font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
