export type Job = {
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

export function makeJobId(job: Job, index: number): string {
  const title = job.job_title ?? job.title ?? "";
  const company = job.company ?? "";
  return `${index}-${title}-${company}`.replace(/\s+/g, "-").toLowerCase();
}

export function normalizeSkills(job: Job): string[] {
  const raw = job.matching_skills ?? job.skills ?? "";
  if (Array.isArray(raw)) return raw.map((s) => s.trim()).filter(Boolean);
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

