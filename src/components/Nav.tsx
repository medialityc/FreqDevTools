import Link from "next/link";
import { Terminal } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";

const publicLinks = [
  { href: "/tools/guid", label: "GUID" },
  { href: "/tools/api-keys", label: "API Keys" },
  { href: "/tools/csharp-serializer", label: "C# → JSON" },
  { href: "/tools/datetime", label: "DateTime" },
  { href: "/tools/appsettings", label: "appsettings.json" },
  { href: "/tools/password", label: "Contraseñas" },
  { href: "/skills", label: "Skills" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <MobileMenu links={publicLinks} />
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Terminal className="h-5 w-5 text-primary" />
          <span>FreqDevTools</span>
        </Link>

        <div className="hidden flex-1 items-center gap-1 md:flex">
          {publicLinks.map((l) => (
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
        </div>
      </nav>
    </header>
  );
}
