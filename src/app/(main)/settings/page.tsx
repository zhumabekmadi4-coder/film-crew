"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Loader2, Shield, Lock, Eye } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [privacy, setPrivacy] = useState({
    privacyShowPhone: false,
    privacyShowTelegram: true,
    privacyShowWhatsapp: true,
    privacyAllowMessages: true,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setPrivacy({
            privacyShowPhone: data.privacyShowPhone ?? false,
            privacyShowTelegram: data.privacyShowTelegram ?? true,
            privacyShowWhatsapp: data.privacyShowWhatsapp ?? true,
            privacyAllowMessages: data.privacyAllowMessages ?? true,
          });
        }
        setLoading(false);
      });
  }, []);

  const savePrivacy = async () => {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(privacy),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const changePassword = async () => {
    setPasswordError("");
    if (passwords.newPassword.length < 6) {
      setPasswordError("Минимум 6 символов");
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordError("Пароли не совпадают");
      return;
    }

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwords.current,
        newPassword: passwords.newPassword,
      }),
    });

    if (res.ok) {
      setPasswordSaved(true);
      setPasswords({ current: "", newPassword: "", confirm: "" });
      setTimeout(() => setPasswordSaved(false), 2000);
    } else {
      const data = await res.json();
      setPasswordError(data.error || "Ошибка");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Privacy settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Приватность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Показывать телефон</p>
              <p className="text-xs text-muted-foreground">
                Другие пользователи увидят ваш номер
              </p>
            </div>
            <Switch
              checked={privacy.privacyShowPhone}
              onCheckedChange={(c) =>
                setPrivacy({ ...privacy, privacyShowPhone: c })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Показывать Telegram</p>
              <p className="text-xs text-muted-foreground">
                Ссылка на Telegram в профиле
              </p>
            </div>
            <Switch
              checked={privacy.privacyShowTelegram}
              onCheckedChange={(c) =>
                setPrivacy({ ...privacy, privacyShowTelegram: c })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Показывать WhatsApp</p>
              <p className="text-xs text-muted-foreground">
                Ссылка на WhatsApp в профиле
              </p>
            </div>
            <Switch
              checked={privacy.privacyShowWhatsapp}
              onCheckedChange={(c) =>
                setPrivacy({ ...privacy, privacyShowWhatsapp: c })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Разрешить сообщения</p>
              <p className="text-xs text-muted-foreground">
                Другие пользователи могут писать вам
              </p>
            </div>
            <Switch
              checked={privacy.privacyAllowMessages}
              onCheckedChange={(c) =>
                setPrivacy({ ...privacy, privacyAllowMessages: c })
              }
            />
          </div>

          <Button onClick={savePrivacy} disabled={saving} className="w-full" size="sm">
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" /> Сохранено
              </>
            ) : (
              "Сохранить"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Смена пароля
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Текущий пароль</Label>
            <Input
              type="password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Новый пароль</Label>
            <Input
              type="password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Подтвердить</Label>
            <Input
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
            />
          </div>
          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}
          <Button
            onClick={changePassword}
            disabled={!passwords.current || !passwords.newPassword}
            className="w-full"
            size="sm"
          >
            {passwordSaved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" /> Пароль изменён
              </>
            ) : (
              "Сменить пароль"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Referral */}
      {session?.user && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Реферальная ссылка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Пригласите коллег по реферальной ссылке
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/register?ref=${session.user.id}`
                );
              }}
            >
              Скопировать ссылку
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
