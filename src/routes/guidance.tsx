import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Placeholder webhook — replace with the real career guidance endpoint.
const GUIDANCE_URL = "https://mahakal-ujjain.app.n8n.cloud/webhook/career-guidance";

export const Route = createFileRoute("/guidance")({
  head: () => ({
    meta: [
      { title: "AI Career Guidance — AI Job Portal" },
      {
        name: "description",
        content: "Ask the AI career coach about skills, roles, and your next career move.",
      },
      { property: "og:title", content: "AI Career Guidance — AI Job Portal" },
      {
        property: "og:description",
        content: "Ask the AI career coach about skills, roles, and your next move.",
      },
    ],
  }),
  component: GuidancePage,
});

function GuidancePage() {
  const [userId, setUserId] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user_id");
    if (saved) setUserId(saved);
  }, []);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch(GUIDANCE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, question }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const text = await res.text();
      let data: any = text;
      try {
        data = text ? JSON.parse(text) : "";
      } catch {
        /* keep raw text */
      }
      if (Array.isArray(data)) data = data[0] ?? {};
      const reply =
        typeof data === "string" ? data : (data.response ?? data.answer ?? data.output ?? "");
      setAnswer(reply || "No response received.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get a response");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground">AI Career Guidance</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask anything about your skills, roles or next career step.
        </p>

        <form
          onSubmit={ask}
          className="mt-8 space-y-5 rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
        >
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Your user ID"
            />
          </div>
          <div className="space-y-2">
            <Label>Your Question</Label>
            <Textarea
              required
              rows={5}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Which skills should I learn to become a senior frontend developer?"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full" size="lg">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Ask AI
          </Button>
        </form>

        {error && (
          <p className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {answer && (
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> AI Response
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {answer}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
