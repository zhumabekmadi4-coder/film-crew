"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, CheckCircle } from "lucide-react";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);

    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });

    if (res.ok) {
      setSent(true);
      setSubject("");
      setMessage("");
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Служба поддержки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-medium">Обращение отправлено!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Мы ответим вам в ближайшее время
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSent(false)}
              >
                Написать ещё
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Опишите вашу проблему или вопрос, и мы постараемся помочь.
              </p>
              <div className="space-y-1.5">
                <Label>Тема</Label>
                <Input
                  placeholder="О чём ваше обращение?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Сообщение</Label>
                <Textarea
                  placeholder="Подробно опишите проблему..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!subject.trim() || !message.trim() || loading}
                className="w-full"
              >
                {loading ? "Отправляю..." : "Отправить"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
