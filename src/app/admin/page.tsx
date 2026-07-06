import { Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { UserRow, type AdminUser } from "./UserRow";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  const currentId = session?.user?.id;

  const [users, count] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.count(),
  ]);

  const rows: AdminUser[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Administración
      </h1>

      <Card className="mb-8 max-w-xs">
        <CardContent className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/15 p-3">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-bold">{count}</div>
            <div className="text-sm text-muted-foreground">
              usuarios registrados
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="px-3 py-2 font-medium">Usuario</th>
                <th className="px-3 py-2 font-medium">Rol</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium">Alta</th>
                <th className="px-3 py-2 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <UserRow key={u.id} user={u} isSelf={u.id === currentId} />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
