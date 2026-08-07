import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search, X, RefreshCw } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { extractApiError } from "@/lib/api-error";
import { JobCard } from "@/components/JobCard";
import { JobSkeletonList } from "@/components/JobSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import {
  type Job,
  isJobSaved,
  normalizeSkills,
  makeJobId,
} from "@/lib/jobs-store";

const JOB_MATCH_URL = "https://mahakal-ujjain.app.n8n.cloud/webhook/job-updates";

type SortOption = "relevance" | "company" | "title";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Find Matching Jobs — AI Job Portal" },
      {
        name: "description",
        content: "Enter your user ID to see jobs matched to your skills and preferred roles.",
      },
      { property: "og:title", content: "Find Matching Jobs — AI Job Portal" },
      {
        property: "og:description",
        content: "See jobs matched to your skills and preferred roles.",
      },
      { property: "og:url", content: "/jobs" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Find Matching Jobs — AI Job Portal" },
      { name: "twitter:description", content: "See jobs matched to your skills and preferred roles." },
    ],
    links: [{ rel: "canonical", href: "/jobs" }],
  }),
  component: JobsPage,
});

function JobsPage() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [keyword, setKeyword] = useState("");
  const [minSkills, setMinSkills] = useState(0);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [savedVersion, setSavedVersion] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const userIdRef = useRef("");
  userIdRef.current = userId;

  const fetchJobs = useCallback(async (silent = false) => {
    const id = userIdRef.current.trim();
    if (!id) return;
    if (silent) setRefreshing(true);
    else {
      setLoading(true);
      setJobs(null);
    }
    setError(null);
    try {
      const res = await fetch(JOB_MATCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(extractApiError(res.status, text));
      const data = text ? JSON.parse(text) : [];
      const list: Job[] = Array.isArray(data) ? data : data.jobs ?? [];
      setJobs(list);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  function findJobs(e?: React.FormEvent) {
    e?.preventDefault();
    void fetchJobs(false);
  }

  useEffect(() => {
    if (!autoRefresh || !jobs || !userId.trim()) return;
    const timer = setInterval(() => void fetchJobs(true), 60000);
    return () => clearInterval(timer);
  }, [autoRefresh, jobs, userId, fetchJobs]);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    let list = [...jobs];

    const k = keyword.trim().toLowerCase();
    if (k) {
      list = list.filter((job) => {
        const haystack = [
          job.job_title ?? job.title ?? "",
          job.company ?? "",
          job.location ?? "",
          normalizeSkills(job).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(k);
      });
    }

    if (minSkills > 0) {
      list = list.filter((job) => normalizeSkills(job).length >= minSkills);
    }

    switch (sort) {
      case "company":
        list.sort((a, b) => (a.company ?? "").localeCompare(b.company ?? ""));
        break;
      case "title":
        list.sort((a, b) =>
          (a.job_title ?? a.title ?? "").localeCompare(b.job_title ?? b.title ?? ""),
        );
        break;
      default:
        break;
    }

    return list;
  }, [jobs, keyword, minSkills, sort]);

  const maxSkills = useMemo(() => {
    if (!jobs) return 0;
    return Math.max(1, ...jobs.map((job) => normalizeSkills(job).length));
  }, [jobs]);

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground">Find Jobs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your User ID to see roles matched to your profile.
        </p>

        <form
          onSubmit={findJobs}
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-2">
            <Label>User ID</Label>
            <Input
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. user_123"
            />
          </div>
          <Button type="submit" disabled={loading} className="rounded-full" size="lg">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Find Matching Jobs
          </Button>
        </form>

        {error && <ErrorState message={error} onRetry={() => findJobs()} />}

        {loading && <JobSkeletonList count={3} />}

        {jobs && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5" />
                  Filter by keyword
                </Label>
                <div className="relative">
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Title, company, location, skill..."
                    className="pr-8"
                  />
                  {keyword && (
                    <button
                      onClick={() => setKeyword("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Clear keyword"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="min-w-[180px] space-y-2">
                <Label>Sort by</Label>
                <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[180px] space-y-2">
                <Label>Min skills: {minSkills}</Label>
                <Slider
                  value={[minSkills]}
                  onValueChange={(v) => setMinSkills(v[0] ?? 0)}
                  max={maxSkills || 10}
                  step={1}
                  min={0}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Showing {filteredJobs.length} of {jobs.length} match{jobs.length === 1 ? "" : "es"}
              </p>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <div className="ml-auto flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                  <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                  Auto-refresh
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={refreshing || loading}
                  onClick={() => void fetchJobs(true)}
                >
                  <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <EmptyState
                title="No matching jobs"
                description="Try adjusting your filters or enter a different User ID."
              />
            ) : (
              <div className="grid gap-4">
                {filteredJobs.map((job, i) => {
                  const id = makeJobId(job, i);
                  return (
                    <JobCard
                      key={`${id}-${savedVersion}`}
                      job={job}
                      index={i}
                      saved={isJobSaved(id)}
                      onToggleSave={() => setSavedVersion((v) => v + 1)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
