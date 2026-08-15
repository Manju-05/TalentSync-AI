import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, LogIn } from "lucide-react";
import { TagInput } from "@/components/TagInput";
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
import { api } from "@/lib/api";
import { getUserId, setUserId } from "@/lib/user";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your TalentSync profile" },
      {
        name: "description",
        content:
          "Register with your skills, preferred roles and experience level to get AI-ranked job matches on TalentSync.",
      },
      { property: "og:title", content: "Create your TalentSync profile" },
      {
        property: "og:description",
        content: "Register in under a minute and get AI-ranked job matches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Create your TalentSync profile" },
      { name: "twitter:description", content: "Register and get AI-ranked job matches." },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),
  component: RegisterPage,
});

const emptyForm = {
  full_name: "",
  email: "",
  preferred_roles: "",
  experience_level: "",
  location: "",
};

const schema = z.object({
  full_name: z.string().trim().max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Enter a valid email address").max(255, "Email is too long"),
  skills: z.string().trim().min(2, "Add at least one skill").max(300, "Keep skills under 300 chars"),
  preferred_roles: z.string().trim().max(200, "Keep roles under 200 characters"),
  experience_level: z.string().trim(),
  location: z.string().trim().max(120, "Location must be under 120 characters"),
});

type FieldErrors = Partial<Record<keyof typeof emptyForm | "skills", string | undefined>>;

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [existingId, setExistingId] = useState("");
  const [showExisting, setShowExisting] = useState(false);

  useEffect(() => {
    if (getUserId()) void navigate({ to: "/" });
  }, [navigate]);

  const update = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, skills: skills.join(", ") };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]) as keyof FieldErrors;
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const data = await api.register(parsed.data);
      if (!data.user_id) throw new Error("Registration succeeded but no user ID was returned");
      setUserId(data.user_id);
      setForm(emptyForm);
      setSkills([]);
      toast.success(data.message ?? "Registration successful");
      void navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function signInWithId(e: React.FormEvent) {
    e.preventDefault();
    const id = existingId.trim();
    if (!id) {
      toast.error("Enter your User ID");
      return;
    }
    setUserId(id);
    toast.success("Welcome back");
    void navigate({ to: "/" });
  }

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <h1 className="animate-fade-up text-3xl font-bold tracking-tight text-foreground md:text-4xl">Create your profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us about yourself so TalentSync can rank roles that actually fit you.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-8"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Career profile</p>
              <p className="mt-1 text-xs text-muted-foreground">The essentials for more relevant opportunities.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Step 1 of 1</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" htmlFor="full_name" error={fieldErrors.full_name}>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Email *" htmlFor="email" error={fieldErrors.email}>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="jane@example.com"
              />
            </Field>
          </div>

          <Field label="Skills *" htmlFor="skills" error={fieldErrors.skills}>
            <TagInput
              id="skills"
              value={skills}
              onChange={(t) => {
                setSkills(t);
                setFieldErrors((p) => ({ ...p, skills: undefined }));
              }}
              placeholder="Type a skill and press Enter"
            />
          </Field>

          <Field label="Preferred Roles" htmlFor="preferred_roles" error={fieldErrors.preferred_roles}>
            <Input
              id="preferred_roles"
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
                  {["junior", "mid", "senior"].map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Location" htmlFor="location" error={fieldErrors.location}>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Remote"
              />
            </Field>
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-full" size="lg">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Registering..." : "Register"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">Fields marked * are required.</p>
        </form>

        <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
          {showExisting ? (
            <form onSubmit={signInWithId} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="existing-id">Your User ID</Label>
                <Input
                  id="existing-id"
                  value={existingId}
                  onChange={(e) => setExistingId(e.target.value)}
                  placeholder="usr_xxx"
                />
              </div>
              <Button type="submit" variant="outline" className="rounded-full">
                <LogIn className="mr-1.5 h-4 w-4" />
                Continue
              </Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowExisting(true)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Already registered? Enter your User ID
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Prefer to browse first?{" "}
          <Link to="/guidance" className="text-primary hover:underline">
            Ask the Career Coach
          </Link>
        </p>
      </div>
    </>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
