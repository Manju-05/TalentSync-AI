import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { FileUp, LogOut, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { RequireUser } from "@/components/RequireUser";
import { Button } from "@/components/ui/button";
import { RESUME_UPLOAD_URL } from "@/lib/api";
import { clearUserId } from "@/lib/user";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — TalentSync" },
      {
        name: "description",
        content: "Manage your TalentSync session and upload a resume to sharpen your job matches.",
      },
      { property: "og:title", content: "Profile — TalentSync" },
      {
        property: "og:description",
        content: "Manage your session and upload a resume to improve your matches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Profile — TalentSync" },
      { name: "twitter:description", content: "Manage your session and resume." },
    ],
    links: [{ rel: "canonical", href: "/profile" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="mx-auto max-w-3xl pb-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="animate-fade-up font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">Profile</h1>
            <p className="mt-3 animate-fade-up text-base text-muted-foreground sm:text-lg">
              Your session and resume settings.
            </p>
          </div>
        </div>

        <RequireUser>
          {(userId) => (
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 shadow-elegant transition-shadow hover:shadow-lg sm:p-8">
                <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                <div className="relative">
                <div className="flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <p className="font-semibold">Your workspace</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Active profile ID</p>
                <p className="mt-1 break-all font-mono text-sm font-semibold text-foreground">
                  {userId}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Keep this ID private. It connects your saved roles, applications and career guidance.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-full"
                  onClick={() => {
                    clearUserId();
                    toast.success("Logged out");
                    void navigate({ to: "/register" });
                  }}
                >
                  <LogOut className="mr-1.5 h-4 w-4" />
                  Log out
                </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-2 text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="font-semibold">Improve your recommendations</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload a PDF resume and TalentSync can use your skills and experience to make job recommendations more relevant.
                </p>
                <Button asChild className="mt-4 rounded-full">
                  <a href={`${RESUME_UPLOAD_URL}?user_id=${userId}`} target="_blank" rel="noreferrer">
                    <FileUp className="mr-1.5 h-4 w-4" /> Upload resume <ExternalLink className="ml-1.5 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </RequireUser>
      </div>
    </>
  );
}
