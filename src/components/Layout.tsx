import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChevronRight, LayoutDashboard, Briefcase, ClipboardList, MessageSquare, ShieldCheck, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Job Matches", icon: Briefcase },
  { to: "/applications", label: "My Applications", icon: ClipboardList },
  { to: "/guidance", label: "Career Coach", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
];

export function Layout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const currentItem = navItems.find((item) => item.to === pathname) ?? navItems[0]!;
  const CurrentIcon = currentItem.icon;

  return (
    <div className="min-h-screen bg-background md:flex md:items-stretch">
      <aside className="z-40 border-b border-border/60 bg-card/90 backdrop-blur md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-4">
          <Link
            to="/"
            className="group flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground"
          >
            <img 
              src="/logo.png" 
              alt="TalentSync Logo" 
              className="h-9 w-9 rounded-xl shadow-elegant transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3" 
            />
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
          {navItems.map((item) => {
            const isActive = currentItem.to === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative inline-flex shrink-0 snap-start items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 md:w-full ${isActive ? "text-primary font-semibold" : "text-muted-foreground hover:translate-x-1 hover:bg-accent hover:text-primary"}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-highlight"
                    className="absolute inset-0 rounded-xl bg-primary/10 shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
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
        <footer className="mt-auto border-t border-border/60 bg-card/40">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 md:px-8">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="TalentSync Logo" className="h-6 w-6 rounded-md opacity-80 grayscale transition-all hover:grayscale-0" />
              <p className="text-sm font-medium text-muted-foreground">
                © {new Date().getFullYear()} TalentSync
              </p>
            </div>
            <div className="flex items-center gap-5 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Secure</span>
              <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
              <a href="#" className="transition-colors hover:text-foreground">Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
