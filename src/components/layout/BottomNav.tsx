"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/feed", icon: Home, label: "Лента" },
  { href: "/people", icon: Users, label: "Люди" },
  { href: "/projects/new", icon: PlusCircle, label: "Проект", isMain: true },
  { href: "/messages", icon: MessageCircle, label: "Чаты" },
  { href: "/profile", icon: User, label: "Профиль" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ href, icon: Icon, label, isMain }) => {
          const isActive = pathname === href || (href !== "/feed" && pathname.startsWith(href) && !isMain);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-full px-2",
                isMain && "relative"
              )}
            >
              {isMain ? (
                <div className="flex flex-col items-center -mt-6">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
                </div>
              ) : (
                <>
                  <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-[10px]", isActive ? "text-primary font-medium" : "text-muted-foreground")}>
                    {label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
