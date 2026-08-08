import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, ExternalLink, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { RequireUser } from "@/components/RequireUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { api, type Application } from "@/lib/api";

const STATUSES = ["saved", "applied", "interviewing", "offer", "rejected"];

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "My Applications — SkillMatch" },
      {
        name: "description",
        content: "Track saved and applied jobs, update their status and set follow-up reminders.",
      },
      { property: "og:title", content: "My Applications — SkillMatch" },
      {
        property: "og:description",
        content: "Track saved and applied jobs and set follow-up reminders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "My Applications — SkillMatch" },
      { name: "twitter:description", content: "Track your job applications in one place." },
    ],
    links: [{ rel: "canonical", href: "/applications" }],
  }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything you&apos;ve saved or applied to, grouped by stage.
        </p>
        <RequireUser>{(userId) => <ApplicationBoard userId={userId} />}</RequireUser>
      </div>
    </Layout>
  );
}

function ApplicationBoard({ userId }: { userId: string }) {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listApplications(userId);
      setApps(data.applications ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load applications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading)
    return (
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    );
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!apps || apps.length === 0)
    return (
      <div className="mt-8">
        <EmptyState
          title="Nothing tracked yet"
          description="Save or mark jobs as applied from Job Matches and they'll show up here."
        />
      </div>
    );

  const known = STATUSES.filter((s) => apps.some((a) => (a.status ?? "saved") === s));
  const extra = [...new Set(apps.map((a) => a.status ?? "saved"))].filter(
    (s) => !STATUSES.includes(s),
  );

  return (
    <div className="mt-8 space-y-8">
      {[...known, ...extra].map((status) => (
        <section key={status}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {status} ({apps.filter((a) => (a.status ?? "saved") === status).length})
          </h2>
          <div className="mt-3 grid gap-3">
            {apps
              .filter((a) => (a.status ?? "saved") === status)
              .map((app) => (
                <AppRow
                  key={app.app_id ?? app.job_hash}
                  app={app}
                  userId={userId}
                  onChanged={() => void load()}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function AppRow({
  app,
  userId,
  onChanged,
}: {
  app: Application;
  userId: string;
  onChanged: () => void;
}) {
  const [notes, setNotes] = useState(app.notes ?? "");
  const [reminder, setReminder] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    } finally {
      setBusy(false);
    }
  }

  const id = app.app_id ?? app.job_hash ?? "app";

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold text-foreground">{app.job_title ?? "Untitled role"}</p>
          <p className="text-sm text-muted-foreground">{app.company}</p>
          {app.applied_at && (
            <p className="mt-1 text-xs text-muted-foreground">Added {app.applied_at}</p>
          )}
          {app.reminder_at && (
            <p className="mt-1 flex items-center gap-1 text-xs text-primary">
              <Bell className="h-3 w-3" /> Reminder {new Date(app.reminder_at).toLocaleString()}
            </p>
          )}
        </div>
        {app.url && (
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <a href={app.url} target="_blank" rel="noreferrer">
              Open <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select
            value={app.status ?? "saved"}
            onValueChange={(v) =>
              void run(() => api.updateStatus(userId, app, v, notes), "Status updated")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`notes-${id}`} className="text-xs">
            Notes
          </Label>
          <div className="flex gap-2">
            <Input
              id={`notes-${id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              className="rounded-full"
              onClick={() =>
                void run(
                  () => api.updateStatus(userId, app, app.status ?? "saved", notes),
                  "Notes saved",
                )
              }
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`reminder-${id}`} className="text-xs">
            Reminder
          </Label>
          <div className="flex gap-2">
            <Input
              id={`reminder-${id}`}
              type="datetime-local"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={busy || !reminder}
              className="rounded-full"
              onClick={() =>
                void run(
                  () => api.setReminder(userId, app, new Date(reminder).toISOString()),
                  "Reminder set",
                )
              }
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
