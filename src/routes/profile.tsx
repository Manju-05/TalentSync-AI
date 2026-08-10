import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { FileUp, LogOut, ExternalLink } from "lucide-react";
import { Layout } from "@/components/Layout";
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
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your session and resume settings.
        </p>

        <RequireUser>
          {(userId) => (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="mt-1 break-all font-mono text-sm font-semibold text-foreground">
                  {userId}
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

              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <FileUp className="h-4 w-4 text-primary" />
                  <p className="font-semibold">Upload your resume</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload a PDF resume and our AI extracts your skills into your profile. After
                  uploading, your job matches get noticeably sharper.
                </p>
                <Button asChild className="mt-4 rounded-full">
                  <a href={RESUME_UPLOAD_URL} target="_blank" rel="noreferrer">
                    Open resume upload <ExternalLink className="ml-1.5 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </RequireUser>
      </div>
    </Layout>
  );
}
