import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, X, Clock } from "lucide-react";
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
import { JobCard } from "@/components/JobCard";
import { JobSkeletonList } from "@/components/JobSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import {
  type Job,
  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
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
  const [recent, setRecent] = useState<string[]>([]);
  const [savedVersion, setSavedVersion] = useState(0);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  async function findJobs(e?: React.FormEvent) {
    e?.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    setJobs(null);
    try {
      const res = await fetch(JOB_MATCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      const list: Job[] = Array.isArray(data) ? data : data.jobs ?? [];
      setJobs(list);
      addRecentSearch(userId);
      setRecent(getRecentSearches());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch jobs");
    } finally {
      setLoading(false);
    }
  }

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

  function useRecent(id: string) {
    setUserId(id);
    setTimeout(() => findJobs(), 0);
  }

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

        {recent.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Recent searches
              <button
                onClick={() => {
                  clearRecentSearches();
                  setRecent([]);
                }}
                className="ml-auto text-xs underline-offset-2 hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((id) => (
                <button
                  key={id}
                  onClick={() => useRecent(id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        )}

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

            <p className="text-sm text-muted-foreground">
              Showing {filteredJobs.length} of {jobs.length} match{jobs.length === 1 ? "" : "es"}
            </p>

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
