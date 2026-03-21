"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const titles: Record<string, string> = {
  "/feed": "Лента",
  "/people": "Специалисты",
  "/projects": "Проекты",
  "/projects/new": "Новый проект",
  "/profile": "Профиль",
  "/messages": "Сообщения",
  "/invitations": "Приглашения",
};

export function TopBar() {
  const pathname = usePathname();

  const title =
    Object.entries(titles).find(([key]) => pathname === key || pathname.startsWith(key + "/"))?.[1] ??
    "Film Crew";

  return (
    <header className="sticky top-0 z-40 border-b bg-background pt-safe">
      <div className="flex items-center justify-between h-14 px-4">
        <Link href="/feed" className="font-bold text-lg text-primary tracking-tight">
          🎬 Film Crew
        </Link>
        <h1 className="text-base font-semibold absolute left-1/2 -translate-x-1/2">{title}</h1>
        <Link href="/invitations">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
