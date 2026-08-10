import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bookmark, CheckCircle2, ExternalLink, Loader2, RefreshCw, Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { RequireUser } from "@/components/RequireUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobSkeletonList } from "@/components/JobSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { api, jobHash, type Job } from "@/lib/api";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Job Matches — TalentSync" },
      {
        name: "description",
        content: "AI-ranked job matches scored against your skills, roles and location.",
      },
      { property: "og:title", content: "Job Matches — TalentSync" },
      { property: "og:description", content: "AI-ranked job matches scored against your profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Job Matches — TalentSync" },
      { name: "twitter:description", content: "AI-ranked job matches scored against your profile." },
    ],
    links: [{ rel: "canonical", href: "/jobs" }],
  }),
  component: JobsPage,
});

function JobsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <h1 className="animate-fade-up text-3xl font-bold tracking-tight text-foreground md:text-4xl">Job Matches</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Roles ranked by how well they fit your profile.
        </p>
        <RequireUser>{(userId) => <JobList userId={userId} />}</RequireUser>
      </div>
    </Layout>
  );
}

function JobList({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.jobMatches(userId);
      setJobs(data.jobs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load matches");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function track(job: Job, action: "save" | "apply") {
    const key = `${jobHash(job)}-${action}`;
    setBusy(key);
    try {
      if (action === "save") await api.saveJob(userId, job);
      else await api.applyJob(userId, job);
      toast.success(action === "save" ? "Saved to your applications" : "Marked as applied");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    } finally {
      setBusy(null);
    }
  }

  const k = keyword.trim().toLowerCase();
  const filtered = (jobs ?? []).filter((job) =>
    k
      ? [job.title, job.job_title, job.company, job.location, job.source, job.why_fit]
          .join(" ")
          .toLowerCase()
          .includes(k)
      : true,
  );

  if (loading) return <JobSkeletonList count={3} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Label htmlFor="job-filter" className="sr-only">
            Filter matches
          </Label>
          <Input
            id="job-filter"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Filter by title, company, location..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => void load()}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {jobs?.length ?? 0} matches
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching jobs available"
          description="Upload your resume or add more skills to your profile to improve your matches."
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((job) => (
            <MatchCard
              key={jobHash(job)}
              job={job}
              busy={busy}
              onTrack={(action) => void track(job, action)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function scoreClasses(score: number) {
  if (score >= 70) return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  if (score >= 40) return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-muted text-muted-foreground";
}

function MatchCard({
  job,
  busy,
  onTrack,
}: {
  job: Job;
  busy: string | null;
  onTrack: (action: "save" | "apply") => void;
}) {
  const title = job.title ?? job.job_title ?? "Untitled role";
  const hash = jobHash(job);
  const score = typeof job.match_score === "number" ? job.match_score : null;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {[job.company, job.location].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {[job.source, job.posted_at].filter(Boolean).join(" · ")}
          </p>
        </div>
        {score !== null && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${scoreClasses(score)}`}
            aria-label={`Match score ${score}`}
          >
            {score}% match
          </span>
        )}
      </div>

      {job.why_fit && (
        <p className="mt-4 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
          {job.why_fit}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {job.url && (
          <Button asChild className="rounded-full">
            <a href={job.url} target="_blank" rel="noreferrer">
              Apply on site <ExternalLink className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
        )}
        <Button
          variant="outline"
          className="rounded-full"
          disabled={busy === `${hash}-save`}
          onClick={() => onTrack("save")}
        >
          {busy === `${hash}-save` ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Bookmark className="mr-1.5 h-4 w-4" />
          )}
          Save
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          disabled={busy === `${hash}-apply`}
          onClick={() => onTrack("apply")}
        >
          {busy === `${hash}-apply` ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
          )}
          Mark Applied
        </Button>
      </div>
    </div>
  );
}
