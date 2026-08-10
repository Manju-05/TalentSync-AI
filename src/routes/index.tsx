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
      <p className="mt-2 text-sm text-muted-foreground">
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
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <p className="mt-1 text-lg font-semibold text-foreground">
          Let&apos;s find your next role.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Job matches" value={matches ?? 0} to="/jobs" icon={Briefcase} />
          <StatCard
            label="Applications tracked"
            value={apps?.length ?? 0}
            to="/applications"
            icon={ClipboardList}
          />
        </div>
      )}

      {Object.keys(byStatus).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(byStatus).map(([status, count]) => (
            <span
              key={status}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {status}: {count}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink to="/jobs" label="Browse matches" icon={Briefcase} />
        <QuickLink to="/guidance" label="Ask the coach" icon={MessageSquare} />
        <QuickLink to="/profile" label="Profile & resume" icon={User} />
      </div>
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
      className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
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
      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
