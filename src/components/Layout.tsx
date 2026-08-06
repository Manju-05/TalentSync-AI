import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Briefcase, Heart } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavItem = {
  to: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/register", label: "Register" },
  { to: "/jobs", label: "Find Jobs" },
  { to: "/guidance", label: "Career Guidance" },
  { to: "/saved-jobs", label: "Saved Jobs", icon: Heart },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <Briefcase className="h-5 w-5" />
            AI Job Portal
          </Link>
          <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">{children}</main>
      <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
        © 2026 AI Job Portal
      </footer>
    </div>
  );
}
