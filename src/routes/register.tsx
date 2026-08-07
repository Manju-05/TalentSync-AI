import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, CheckCircle2, Copy, CopyCheck } from "lucide-react";
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

const REGISTER_URL = "https://mahakal-ujjain.app.n8n.cloud/webhook/register";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register Your Profile — AI Job Portal" },
      {
        name: "description",
        content: "Create your AI Job Portal profile with your skills, roles and experience level.",
      },
      { property: "og:title", content: "Register Your Profile — AI Job Portal" },
      {
        property: "og:description",
        content: "Create your AI Job Portal profile in under a minute.",
      },
      { property: "og:url", content: "/register" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Register Your Profile — AI Job Portal" },
      { name: "twitter:description", content: "Create your AI Job Portal profile in under a minute." },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),
  component: RegisterPage,
});

const emptyForm = {
  full_name: "",
  email: "",
  skills: "",
  preferred_roles: "",
  experience_level: "",
  location: "",
};

const registerSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(100, "Name must be under 100 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces and . ' -"),
  email: z.string().trim().email("Enter a valid email address").max(255, "Email is too long"),
  skills: z
    .string()
    .trim()
    .min(2, "Add at least one skill")
    .max(300, "Keep skills under 300 characters"),
  preferred_roles: z
    .string()
    .trim()
    .min(2, "Add at least one preferred role")
    .max(200, "Keep roles under 200 characters"),
  experience_level: z.enum(["Fresher", "Junior", "Mid", "Senior"], {
    message: "Select your experience level",
  }),
  location: z
    .string()
    .trim()
    .min(2, "Enter your location")
    .max(120, "Location must be under 120 characters"),
});

type FieldErrors = Partial<Record<keyof typeof emptyForm, string>>;

function RegisterPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const update = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof emptyForm;
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error(`Registration failed (${res.status})`);
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }
      if (Array.isArray(data)) data = data[0] ?? {};
      const id = String(data.user_id ?? data.userId ?? data.id ?? "");
      if (id) {
        localStorage.setItem("user_id", id);
        setUserId(id);
      }
      setForm(emptyForm);
      setFieldErrors({});
      toast.success("Registration successful!", {
        action: id
          ? {
              label: "Copy User ID",
              onClick: () => copyUserId(id),
            }
          : undefined,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function copyUserId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success("User ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy automatically");
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground">Register</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us about yourself so we can match you with the right roles.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" error={fieldErrors.full_name}>
              <Input
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Email" error={fieldErrors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="jane@example.com"
              />
            </Field>
          </div>

          <Field label="Skills (comma separated)" error={fieldErrors.skills}>
            <Input
              value={form.skills}
              onChange={(e) => update("skills", e.target.value)}
              placeholder="React, Node.js, SQL"
            />
          </Field>

          <Field label="Preferred Roles" error={fieldErrors.preferred_roles}>
            <Input
              value={form.preferred_roles}
              onChange={(e) => update("preferred_roles", e.target.value)}
              placeholder="Frontend Developer, Full Stack Engineer"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Experience Level" error={fieldErrors.experience_level}>
              <Select
                value={form.experience_level}
                onValueChange={(v) => update("experience_level", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {["Fresher", "Junior", "Mid", "Senior"].map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Location" error={fieldErrors.location}>
              <Input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Bengaluru, India"
              />
            </Field>
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full rounded-full" size="lg">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        {userId && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">Registration successful</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your User ID: <span className="font-mono text-primary">{userId}</span> — saved for
                job matching and career guidance.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => copyUserId(userId)}
            >
              {copied ? <CopyCheck className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
