import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Briefcase, ClipboardList, MessageSquare, User, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { RequireUser } from "@/components/RequireUser";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Application } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TalentSync — AI job matching dashboard" },
      {
        name: "description",
        content:
          "TalentSync ranks jobs against your skills, tracks your applications and coaches your career with AI.",
      },
      { property: "og:title", content: "TalentSync — AI job matching dashboard" },
      {
        property: "og:description",
        content: "AI-ranked job matches, application tracking and career coaching in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "TalentSync — AI job matching dashboard" },
      { name: "twitter:description", content: "AI-ranked matches, tracking and career coaching." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <Layout>
      <h1 className="animate-fade-up text-3xl font-bold tracking-tight text-foreground md:text-4xl">Dashboard</h1>
      <p className="mt-2 animate-fade-up text-sm text-muted-foreground">
        Your matches, applications and next steps at a glance.
      </p>
      <RequireUser>{(userId) => <Summary userId={userId} />}</RequireUser>
    </Layout>
  );
}

function Summary({ userId }: { userId: string }) {
  const [matches, setMatches] = useState<number | null>(null);
  const [apps, setApps] = useState<Application[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [m, a] = await Promise.allSettled([
        api.jobMatches(userId),
        api.listApplications(userId),
      ]);
      if (cancelled) return;
      if (m.status === "fulfilled") setMatches(m.value.jobs?.length ?? m.value.count ?? 0);
      if (a.status === "fulfilled") setApps(a.value.applications ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const byStatus = (apps ?? []).reduce<Record<string, number>>((acc, a) => {
    const s = a.status ?? "saved";
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mt-8 space-y-8">
      <div className="surface-card animate-fade-up relative overflow-hidden rounded-2xl border border-border/60 p-6">
        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 animate-float-soft rounded-full bg-primary/15 blur-3xl" />
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Welcome back</p>
        <p className="mt-2 font-display text-2xl font-bold tracking-tight">
          Let&apos;s find your <span className="gradient-text">next role.</span>
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : (
        <div className="stagger-children grid gap-4 sm:grid-cols-2">
          <StatCard label="Job matches" value={matches ?? 0} to="/jobs" icon={Briefcase} />
          <StatCard
            label="Applications tracked"
            value={apps?.length ?? 0}
            to="/applications"
            icon={ClipboardList}
          />
        </div>
      )}

      {!loading && <FocusPanel matches={matches ?? 0} applications={apps ?? []} />}

      {Object.keys(byStatus).length > 0 && (
        <div className="stagger-children flex flex-wrap gap-2">
          {Object.entries(byStatus).map(([status, count]) => (
            <span
              key={status}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary transition-colors hover:bg-primary/20"
            >
              {status}: {count}
            </span>
          ))}
        </div>
      )}

      <div className="stagger-children grid gap-4 sm:grid-cols-3">
        <QuickLink to="/jobs" label="Browse matches" icon={Briefcase} />
        <QuickLink to="/guidance" label="Ask the coach" icon={MessageSquare} />
        <QuickLink to="/profile" label="Profile & resume" icon={User} />
      </div>
    </div>
  );
}

function FocusPanel({ matches, applications }: { matches: number; applications: Application[] }) {
  const saved = applications.filter((app) => (app.status ?? "saved") === "saved").length;
  const interviewing = applications.filter((app) => app.status === "interviewing").length;
  const title = interviewing
    ? "Prepare for your upcoming conversations"
    : saved
      ? "Turn saved roles into applications"
      : matches
        ? "Review your latest opportunities"
        : "Complete your profile to unlock better matches";
  const description = interviewing
    ? `${interviewing} application${interviewing === 1 ? " is" : "s are"} in the interview stage.`
    : saved
      ? `${saved} saved role${saved === 1 ? " is" : "s are"} ready for your next step.`
      : matches
        ? `${matches} opportunity${matches === 1 ? " is" : "ies are"} ready to review.`
        : "Add your resume and preferences to make the recommendations more useful.";
  const to = interviewing || saved ? "/applications" : matches ? "/jobs" : "/profile";
  const action = interviewing ? "Open application tracker" : saved ? "Review saved roles" : matches ? "Browse matches" : "Complete profile";

  return (
    <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Your next step</p>
        <h2 className="mt-1 font-display text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Link to={to} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 sm:mt-0 sm:shrink-0">
        {action} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  to,
  icon: Icon,
}: {
  label: string;
  value: number;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      to={to}
      className="surface-card hover-lift group rounded-2xl border border-border/60 p-6"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
        {label}
      </div>
      <p className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">{value}</p>
    </Link>
  );
}

function QuickLink({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      to={to}
      className="surface-card group flex items-center gap-3 rounded-2xl border border-border/60 p-4 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-accent"
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
