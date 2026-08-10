import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, Briefcase, ClipboardList, MessageSquare, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Job Matches", icon: Briefcase },
  { to: "/applications", label: "My Applications", icon: ClipboardList },
  { to: "/guidance", label: "Career Coach", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="sticky top-0 z-40 border-b border-border/60 bg-card/90 backdrop-blur md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-5 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Briefcase className="h-4 w-4" />
            </span>
            TalentSync
          </Link>
          <div className="ml-auto md:hidden">
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex flex-wrap gap-1 px-3 pb-3 md:flex-col md:flex-nowrap md:pb-0">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-5 py-4 md:block">
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 md:py-10">{children}</main>
        <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
          Copyright 2026 Manjunath TalentSync
        </footer>
      </div>
    </div>
  );
}
