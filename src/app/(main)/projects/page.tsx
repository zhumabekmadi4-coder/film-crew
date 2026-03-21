"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Plus } from "lucide-react";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [owned, setOwned] = useState<any[]>([]);
  const [memberOf, setMemberOf] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    // Get all projects and filter by owner
    Promise.all([
      fetch("/api/projects?limit=50").then((r) => r.json()),
    ]).then(([all]) => {
      setOwned((all as any[]).filter((p: any) => p.ownerId === session.user.id));
      setLoading(false);
    });
  }, [session]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Проекты</h2>
        <Link href="/projects/new">
          <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Новый</Button>
        </Link>
      </div>

      <Tabs defaultValue="owned">
        <TabsList className="w-full">
          <TabsTrigger value="owned" className="flex-1">Мои ({owned.length})</TabsTrigger>
          <TabsTrigger value="member" className="flex-1">Участвую ({memberOf.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="owned" className="space-y-3 mt-3">
          {loading ? (
            [1,2].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)
          ) : owned.length === 0 ? (
            <EmptyState title="Нет проектов" description="Создай свой первый проект" action={<Link href="/projects/new"><Button>Создать проект</Button></Link>} />
          ) : (
            owned.map((p) => <ProjectCard key={p.id} project={p} />)
          )}
        </TabsContent>
        <TabsContent value="member" className="space-y-3 mt-3">
          {memberOf.length === 0 ? (
            <EmptyState title="Ты ни в каком проекте" description="Откликайся на проекты в ленте" />
          ) : (
            memberOf.map((p) => <ProjectCard key={p.id} project={p} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
