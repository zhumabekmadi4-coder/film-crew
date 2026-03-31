"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Building2,
  Briefcase,
  Settings,
  HelpCircle,
  MessageSquare,
  Clapperboard,
  LogOut,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { data: session } = useSession();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!session?.user) return null;

  const user = session.user;
  const isAdmin = user.role === "admin" || user.role === "superadmin";
  const isContentManager = user.role === "content-manager" || isAdmin;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Side panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[70] w-[300px] max-w-[85vw] bg-background shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-safe border-b">
          <span className="font-semibold text-lg">Меню</span>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <UserAvatar name={user.name} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
              {user.isCastingDirector && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  Кастинг-директор
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2">
          <MenuLink
            href="/profile"
            icon={User}
            label="Профиль"
            onClick={onClose}
          />
          <MenuLink
            href="/company"
            icon={Building2}
            label="Управление компанией"
            onClick={onClose}
          />
          <MenuLink
            href="/my-projects"
            icon={Briefcase}
            label="Управление проектами"
            onClick={onClose}
          />

          {user.isCastingDirector && (
            <>
              <div className="h-px bg-border mx-4 my-2" />
              <MenuLink
                href="/casting"
                icon={Clapperboard}
                label="Управление кастингами"
                onClick={onClose}
              />
            </>
          )}

          {isContentManager && (
            <>
              <div className="h-px bg-border mx-4 my-2" />
              <MenuLink
                href="/admin"
                icon={Shield}
                label="Администрирование"
                onClick={onClose}
              />
            </>
          )}

          <div className="h-px bg-border mx-4 my-2" />

          <MenuLink
            href="/settings"
            icon={Settings}
            label="Настройки"
            onClick={onClose}
          />
          <MenuLink
            href="/support"
            icon={MessageSquare}
            label="Служба поддержки"
            onClick={onClose}
          />
          <MenuLink
            href="/faq"
            icon={HelpCircle}
            label="F.A.Q."
            onClick={onClose}
          />
        </div>

        {/* Logout */}
        <div className="border-t p-4 pb-safe">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Выйти</span>
          </button>
        </div>
      </div>
    </>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      <Icon className="w-5 h-5 text-muted-foreground" />
      <span className="flex-1 font-medium text-sm">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </Link>
  );
}
