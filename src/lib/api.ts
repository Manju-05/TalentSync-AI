export const API_BASE = "https://jaishreemahakal.app.n8n.cloud/webhook";
export const RESUME_UPLOAD_URL = "https://jaishreemahakal.app.n8n.cloud/form/resume-upload";

import { extractApiError } from "./api-error";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (Array.isArray(data)) data = data[0] ?? null;
  if (!res.ok) throw new Error(data?.error ?? extractApiError(res.status, text));
  if (data && data.success === false) throw new Error(data.error ?? "Request failed");
  return (data ?? {}) as T;
}

export type RegisterInput = {
  full_name: string;
  email: string;
  skills: string;
  preferred_roles: string;
  experience_level: string;
  location: string;
};

export type RegisterResponse = {
  success?: boolean;
  user_id?: string;
  email?: string;
  message?: string;
};

export type Job = {
  title?: string;
  job_title?: string;
  company?: string;
  location?: string;
  url?: string;
  source?: string;
  posted_at?: string;
  match_score?: number;
  why_fit?: string;
  job_hash?: string;
};

export type Application = {
  app_id?: string;
  job_hash?: string;
  job_title?: string;
  company?: string;
  url?: string;
  status?: string;
  notes?: string;
  applied_at?: string;
  updated_at?: string;
  reminder_at?: string;
};

export const api = {
  register: (input: RegisterInput) => post<RegisterResponse>("/register", input),

  jobMatches: (user_id: string) =>
    post<{ success?: boolean; count?: number; jobs?: Job[] }>("/job-updates", { user_id }),

  careerGuidance: (user_id: string, question: string) =>
    post<{ success?: boolean; answer?: string }>("/career-guidance", { user_id, question }),

  listApplications: (user_id: string) =>
    post<{ count?: number; applications?: Application[] }>("/applications", {
      action: "list",
      user_id,
    }),

  saveJob: (user_id: string, job: Job) =>
    post<{ success?: boolean }>("/applications", {
      action: "save",
      user_id,
      job_hash: jobHash(job),
      job_title: job.title ?? job.job_title,
      company: job.company,
      url: job.url,
    }),

  applyJob: (user_id: string, job: Job) =>
    post<{ success?: boolean }>("/applications", {
      action: "apply",
      user_id,
      job_hash: jobHash(job),
      job_title: job.title ?? job.job_title,
      company: job.company,
      url: job.url,
    }),

  updateStatus: (user_id: string, app: Application, status: string, notes?: string) =>
    post<{ success?: boolean }>("/applications", {
      action: "update_status",
      user_id,
      ...(app.app_id ? { app_id: app.app_id } : { job_hash: app.job_hash }),
      status,
      ...(notes !== undefined ? { notes } : {}),
    }),

  setReminder: (user_id: string, app: Application, reminderAt: string) =>
    post<{ success?: boolean }>("/applications", {
      action: "set_reminder",
      user_id,
      ...(app.app_id ? { app_id: app.app_id } : { job_hash: app.job_hash }),
      reminder_at: reminderAt,
    }),
};

/** Stable fallback identifier when the matches endpoint omits job_hash. */
export function jobHash(job: Job): string {
  if (job.job_hash) return job.job_hash;
  const seed = `${job.title ?? job.job_title ?? ""}|${job.company ?? ""}|${job.url ?? ""}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return `jh_${Math.abs(h).toString(36)}`;
}
