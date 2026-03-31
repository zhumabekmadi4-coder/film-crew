"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/feed": "Лента",
  "/catalog": "Каталог",
  "/projects": "Проекты",
  "/projects/new": "Новый проект",
  "/profile": "Профиль",
  "/messages": "Чаты",
  "/invitations": "Приглашения",
  "/company": "Компания",
  "/settings": "Настройки",
  "/support": "Поддержка",
  "/faq": "F.A.Q.",
  "/casting": "Кастинги",
  "/admin": "Администрирование",
  "/my-projects": "Мои проекты",
};

export function TopBar() {
  const pathname = usePathname();

  const title =
    Object.entries(titles).find(
      ([key]) => pathname === key || pathname.startsWith(key + "/")
    )?.[1] ?? "Film Crew";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm pt-safe">
      <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
        <Link
          href="/feed"
          className="font-bold text-lg text-primary tracking-tight"
        >
          Film Crew
        </Link>
        <h1 className="text-base font-semibold absolute left-1/2 -translate-x-1/2">
          {title}
        </h1>
        <div className="w-10" /> {/* spacer for symmetry */}
      </div>
    </header>
  );
}
