import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookmarkX, Heart, ExternalLink } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { type SavedJob, getSavedJobs, removeSavedJob } from "@/lib/jobs-store";

export const Route = createFileRoute("/saved-jobs")({
  head: () => ({
    meta: [
      { title: "Saved Jobs — AI Job Portal" },
      {
        name: "description",
        content: "View and manage your saved job matches from AI Job Portal.",
      },
      { property: "og:title", content: "Saved Jobs — AI Job Portal" },
      {
        property: "og:description",
        content: "View and manage your saved job matches from AI Job Portal.",
      },
      { property: "og:url", content: "/saved-jobs" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Saved Jobs — AI Job Portal" },
      { name: "twitter:description", content: "View and manage your saved job matches." },
    ],
    links: [{ rel: "canonical", href: "/saved-jobs" }],
  }),
  component: SavedJobsPage,
});

function SavedJobsPage() {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setJobs(getSavedJobs());
  }, []);

  function remove(id: string) {
    removeSavedJob(id);
    setJobs(getSavedJobs());
  }

  if (!mounted) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-foreground">Saved Jobs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Roles you've bookmarked across your searches.
          </p>
          <div className="mt-8 grid gap-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-border/60 bg-muted"
              />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground">Saved Jobs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Roles you've bookmarked across your searches.
        </p>

        {jobs.length === 0 && (
          <EmptyState
            title="No saved jobs yet"
            description="Find jobs and click the heart icon to save roles here."
          />
        )}

        {jobs.length > 0 && (
          <div className="mt-8 grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">{job.title}</h2>
                    <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                      {job.company && <span>{job.company}</span>}
                      {job.location && <span>{job.location}</span>}
                    </div>
                    {job.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.skills.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => remove(job.id)}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove saved job"
                  >
                    <BookmarkX className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {job.url && (
                    <Button asChild variant="outline" className="rounded-full">
                      <a href={job.url} target="_blank" rel="noreferrer">
                        Apply <ExternalLink className="ml-1.5 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button asChild variant="secondary" className="rounded-full">
                    <Link to="/jobs">Find more</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
