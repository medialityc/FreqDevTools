import Link from "next/link";
import { Terminal } from "lucide-react";
import { auth } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";
import { Button } from "@/components/ui/Button";

const publicLinks = [
  { href: "/tools/guid", label: "GUID" },
  { href: "/tools/api-keys", label: "API Keys" },
  { href: "/tools/csharp-serializer", label: "C# → JSON" },
  { href: "/tools/datetime", label: "DateTime" },
  { href: "/skills", label: "Skills" },
];

const privateLinks = [
  { href: "/credentials", label: "Credenciales" },
  { href: "/env", label: "Env" },
  { href: "/workflows", label: "Workflows" },
];

export async function Nav() {
  const session = await auth();
  const user = session?.user;
  const links = user ? [...publicLinks, ...privateLinks] : publicLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <MobileMenu links={links} />
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Terminal className="h-5 w-5 text-primary" />
          <span>FreqDevTools</span>
        </Link>

        <div className="hidden flex-1 items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit">
                  Salir
                </Button>
              </form>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Iniciar sesión</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
