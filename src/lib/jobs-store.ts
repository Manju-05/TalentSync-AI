const SAVED_JOBS_KEY = "saved_jobs";
const RECENT_SEARCHES_KEY = "recent_userid_searches";

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

export type SavedJob = {
  id: string;
  title: string;
  company?: string | undefined;
  location?: string | undefined;
  url?: string | undefined;
  skills: string[];
  savedAt: number;
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

export function toSavedJob(job: Job, index: number): SavedJob {
  return {
    id: makeJobId(job, index),
    title: job.job_title ?? job.title ?? "Untitled role",
    company: job.company,
    location: job.location,
    url: job.url ?? job.job_url ?? job.apply_url,
    skills: normalizeSkills(job),
    savedAt: Date.now(),
  };
}

export function getSavedJobs(): SavedJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveJob(job: SavedJob) {
  const saved = getSavedJobs();
  const exists = saved.find((j) => j.id === job.id);
  if (exists) return;
  const updated = [job, ...saved];
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated));
}

export function removeSavedJob(id: string) {
  const saved = getSavedJobs().filter((j) => j.id !== id);
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(saved));
}

export function isJobSaved(id: string): boolean {
  return getSavedJobs().some((j) => j.id === id);
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(userId: string) {
  if (!userId.trim()) return;
  const recent = getRecentSearches().filter((id) => id !== userId);
  const updated = [userId, ...recent].slice(0, 5);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}
