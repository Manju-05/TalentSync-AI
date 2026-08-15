import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChevronRight, LayoutDashboard, Briefcase, ClipboardList, MessageSquare, ShieldCheck, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Job Matches", icon: Briefcase },
  { to: "/applications", label: "My Applications", icon: ClipboardList },
  { to: "/guidance", label: "Career Coach", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
];

export function Layout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const currentItem = navItems.find((item) => item.to === pathname) ?? navItems[0];
  const CurrentIcon = currentItem.icon;

  return (
    <div className="min-h-screen bg-background md:flex md:items-stretch">
      <aside className="z-40 border-b border-border/60 bg-card/90 backdrop-blur md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-4">
          <Link
            to="/"
            className="group flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground"
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-elegant transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              <Briefcase className="h-4 w-4" />
            </span>
            <span className="gradient-text">TalentSync</span>
          </Link>
          <div className="ml-auto md:hidden">
            <ThemeToggle />
          </div>
        </div>
        <div className="hidden px-5 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:block">
          Workspace
        </div>
        <nav aria-label="Primary navigation" className="stagger-children flex snap-x gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] md:flex-col md:overflow-visible md:pb-0">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="group relative inline-flex shrink-0 snap-start items-center gap-2 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:translate-x-0.5 hover:bg-accent hover:text-primary data-[status=active]:bg-primary/10 data-[status=active]:text-primary data-[status=active]:shadow-sm md:w-full"
            >
              <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-border/60 px-5 py-4 md:block">
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 animate-fade-up px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
          <nav aria-label="Breadcrumb" className="mb-5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:mb-6">
            <Link to="/" className="shrink-0 transition-colors hover:text-primary">Workspace</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate font-medium text-foreground">
              <CurrentIcon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate">{currentItem.label}</span>
            </span>
          </nav>
          {children}
        </main>
        <footer className="border-t border-border/60 bg-card/40">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:grid-cols-2 sm:px-6 sm:py-10 md:px-8 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 font-display text-base font-bold text-foreground">
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                >
                  <Briefcase className="h-4 w-4" />
                </span>
                TalentSync
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                Smarter career decisions, powered by personalized job intelligence.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground">Platform</h2>
              <nav className="mt-3 flex flex-col items-start gap-2 text-sm text-muted-foreground">
                <Link to="/jobs" className="transition-colors hover:text-primary">Job Matches</Link>
                <Link to="/applications" className="transition-colors hover:text-primary">Application Tracker</Link>
                <Link to="/guidance" className="transition-colors hover:text-primary">Career Guidance</Link>
              </nav>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground">Your Account</h2>
              <nav className="mt-3 flex flex-col items-start gap-2 text-sm text-muted-foreground">
                <Link to="/profile" className="transition-colors hover:text-primary">Profile Settings</Link>
                <Link to="/register" className="transition-colors hover:text-primary">Create Profile</Link>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure by design</span>
              </nav>
            </div>
          </div>
          <div className="border-t border-border/60">
            <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
              <p>© 2026 TalentSync. All rights reserved.</p>
              <p>Career intelligence for professionals.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
