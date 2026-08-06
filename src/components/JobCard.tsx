import { useState } from "react";
import { Heart, MapPin, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Job, type SavedJob, toSavedJob, saveJob, removeSavedJob, normalizeSkills } from "@/lib/jobs-store";

export function JobCard({
  job,
  index,
  saved,
  onToggleSave,
}: {
  job: Job;
  index: number;
  saved: boolean;
  onToggleSave?: () => void;
}) {
  const [isSaved, setIsSaved] = useState(saved);

  const title = job.job_title ?? job.title ?? "Untitled role";
  const skills = normalizeSkills(job);
  const url = job.url ?? job.job_url ?? job.apply_url;

  function toggle() {
    const savedJob = toSavedJob(job, index);
    if (isSaved) {
      removeSavedJob(savedJob.id);
    } else {
      saveJob(savedJob);
    }
    setIsSaved(!isSaved);
    onToggleSave?.();
  }

  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <button
        onClick={toggle}
        className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
        aria-label={isSaved ? "Remove saved job" : "Save job"}
      >
        <Heart
          className={`h-5 w-5 transition-all ${isSaved ? "fill-primary text-primary" : ""}`}
        />
      </button>

      <h2 className="pr-10 text-lg font-semibold text-foreground">{title}</h2>
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
}
