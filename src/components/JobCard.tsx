import { MapPin, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Job, normalizeSkills } from "@/lib/jobs-store";

export function JobCard({ job }: { job: Job; index?: number }) {
  const title = job.job_title ?? job.title ?? "Untitled role";
  const skills = normalizeSkills(job);
  const url = job.url ?? job.job_url ?? job.apply_url;

  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
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
