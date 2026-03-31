"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Shield,
  Users,
  FileCheck,
  Eye,
  ChevronRight,
  BarChart3,
} from "lucide-react";

export default function AdminPage() {
  const { data: session } = useSession();

  const role = session?.user?.role;
  const isAdmin = role === "admin" || role === "superadmin";
  const isContentManager = role === "content-manager" || isAdmin;

  if (!isContentManager) {
    return (
      <EmptyState
        title="Нет доступа"
        description="Эта страница доступна только для администраторов и контент-менеджеров"
      />
    );
  }

  const sections = [
    {
      href: "/admin/moderation",
      icon: Eye,
      title: "Модерация контента",
      description: "Посты, услуги, тихий бан",
      available: true,
    },
    {
      href: "/admin/accreditation",
      icon: FileCheck,
      title: "Аккредитация",
      description: "Запросы компаний и кастинг-агентств",
      available: isAdmin,
    },
    {
      href: "/admin/users",
      icon: Users,
      title: "Пользователи",
      description: "Управление ролями, блокировка",
      available: isAdmin,
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-bold">Администрирование</h1>
      </div>

      {sections
        .filter((s) => s.available)
        .map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{section.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
    </div>
  );
}
