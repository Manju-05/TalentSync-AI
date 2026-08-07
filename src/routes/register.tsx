import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
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

function RegisterPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const update = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
            <Field label="Full Name">
              <Input
                required
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Email">
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="jane@example.com"
              />
            </Field>
          </div>

          <Field label="Skills (comma separated)">
            <Input
              required
              value={form.skills}
              onChange={(e) => update("skills", e.target.value)}
              placeholder="React, Node.js, SQL"
            />
          </Field>

          <Field label="Preferred Roles">
            <Input
              required
              value={form.preferred_roles}
              onChange={(e) => update("preferred_roles", e.target.value)}
              placeholder="Frontend Developer, Full Stack Engineer"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Experience Level">
              <Select
                required
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
            <Field label="Location">
              <Input
                required
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
