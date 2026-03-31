"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, Search, Briefcase, MessageCircle, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onMenuClick: () => void;
}

const tabs = [
  { href: "/feed", icon: Newspaper, label: "Лента" },
  { href: "/catalog", icon: Search, label: "Каталог" },
  { href: "/projects", icon: Briefcase, label: "Проекты" },
  { href: "/messages", icon: MessageCircle, label: "Чаты" },
];

export function BottomNav({ onMenuClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm pb-safe">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-full px-2"
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[10px] transition-colors",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-full px-2"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Меню</span>
        </button>
      </div>
    </nav>
  );
}
