import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, MapPin, Building2, ExternalLink } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Placeholder webhook — replace with the real job matching endpoint.
const JOB_MATCH_URL = "https://mahakal-ujjain.app.n8n.cloud/webhook/match-jobs";

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
    ],
  }),
  component: JobsPage,
});

type Job = {
  job_title?: string;
  title?: string;
  company?: string;
  location?: string;
  matching_skills?: string[] | string;
  skills?: string[] | string;
  url?: string;
  job_url?: string;
  apply_url?: string;
};

function JobsPage() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);


  async function findJobs(e: React.FormEvent) {
    e.preventDefault();
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
      const list: Job[] = Array.isArray(data) ? data : (data.jobs ?? []);
      setJobs(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch jobs");
    } finally {
      setLoading(false);
    }
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
              placeholder="Your user ID"
            />
          </div>
          <Button type="submit" disabled={loading} className="rounded-full" size="lg">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Find Matching Jobs
          </Button>
        </form>

        {error && (
          <p className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading && (
          <div className="mt-10 flex justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        )}

        {jobs && jobs.length === 0 && !loading && (
          <p className="mt-10 text-center text-muted-foreground">No matching jobs available.</p>
        )}

        {jobs && jobs.length > 0 && (
          <div className="mt-8 grid gap-4">
            {jobs.map((job, i) => {
              const skills = Array.isArray(job.matching_skills)
                ? job.matching_skills
                : String(job.matching_skills ?? job.skills ?? "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
              const url = job.url ?? job.job_url ?? job.apply_url;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <h2 className="text-lg font-semibold text-foreground">
                    {job.job_title ?? job.title ?? "Untitled role"}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    {job.company && (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                    )}
                  </div>
                  {skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {url && (
                    <Button asChild variant="outline" className="mt-5 rounded-full">
                      <a href={url} target="_blank" rel="noreferrer">
                        Apply <ExternalLink className="ml-1.5 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
