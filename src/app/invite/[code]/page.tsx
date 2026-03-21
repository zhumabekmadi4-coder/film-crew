import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { projects, projectMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=/invite/${code}`);
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.inviteCode, code),
  });

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader><CardTitle>Ссылка недействительна</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Эта ссылка-приглашение не найдена или устарела.</p>
            <Link href="/feed"><Button className="w-full">На главную</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add member
  await db
    .insert(projectMembers)
    .values({ projectId: project.id, userId: session.user.id })
    .onConflictDoNothing();

  redirect(`/projects/${project.id}`);
}
