"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { AVAILABILITY_OPTIONS } from "@/lib/constants";
import { signIn } from "next-auth/react";

interface Profession { id: number; name: string; }

const STEPS = ["Аккаунт", "Профессии", "О себе"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [allProfessions, setAllProfessions] = useState<Profession[]>([]);
  const [primaryIds, setPrimaryIds] = useState<number[]>([]);
  const [secondaryIds, setSecondaryIds] = useState<number[]>([]);

  const [city, setCity] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("project-based");

  useEffect(() => {
    fetch("/api/professions").then((r) => r.json()).then(setAllProfessions);
  }, []);

  function togglePrimary(id: number) {
    setPrimaryIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    setSecondaryIds((prev) => prev.filter((x) => x !== id));
  }

  function toggleSecondary(id: number) {
    setSecondaryIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    setPrimaryIds((prev) => prev.filter((x) => x !== id));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      // 1. Register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, password, name, city,
          experienceYears: experienceYears ? Number(experienceYears) : null,
          bio, availability,
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

      // 2. Sign in
      await signIn("credentials", { email, password, redirect: false });
      router.push("/feed");
    } catch {
      setError("Что-то пошло не так");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-8 bg-gradient-to-b from-primary/5 to-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-4xl">🎬</span>
          <h1 className="text-xl font-bold mt-1">Film Crew</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i < step ? "bg-primary text-white" : i === step ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-xs ${i === step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-4">
            {/* Step 0: Account */}
            {step === 0 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Имя</Label>
                  <Input placeholder="Иван Петров" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Пароль</Label>
                  <Input type="password" placeholder="Минимум 6 символов" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
            )}

            {/* Step 1: Professions */}
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Выбери основные профессии (нажми один раз) и дополнительные (нажми ещё раз)</p>

                <div className="space-y-2">
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
                            if (!isPrimary && !isSecondary) togglePrimary(p.id);
                            else if (isPrimary) { setPrimaryIds(prev => prev.filter(x => x !== p.id)); setSecondaryIds(prev => [...prev, p.id]); }
                            else { setSecondaryIds(prev => prev.filter(x => x !== p.id)); }
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
                </div>

                {primaryIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Основные: {primaryIds.length} · Дополнительные: {secondaryIds.length}
                  </p>
                )}
              </div>
            )}

            {/* Step 2: About */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Город</Label>
                  <Input placeholder="Алматы" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Лет опыта</Label>
                  <Input type="number" placeholder="3" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Доступность</Label>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AVAILABILITY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>О себе</Label>
                  <Textarea placeholder="Коротко расскажи о себе..." rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive mt-3">{error}</p>}

            <div className="flex gap-2 mt-4">
              {step > 0 && (
                <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                  Назад
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button
                  className="flex-1"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 0 && (!name || !email || !password)}
                >
                  Далее
                </Button>
              ) : (
                <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Регистрируем..." : "Создать аккаунт"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Есть аккаунт?{" "}
          <Link href="/login" className="text-primary font-medium">Войти</Link>
        </p>
      </div>
    </div>
  );
}
