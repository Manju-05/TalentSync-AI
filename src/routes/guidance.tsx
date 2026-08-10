import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, Send, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { RequireUser } from "@/components/RequireUser";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

export const Route = createFileRoute("/guidance")({
  head: () => ({
    meta: [
      { title: "Career Coach — TalentSync" },
      {
        name: "description",
        content:
          "Chat with the TalentSync AI career coach for personalised advice on skills, roles and interviews.",
      },
      { property: "og:title", content: "Career Coach — TalentSync" },
      {
        property: "og:description",
        content: "Personalised AI advice on skills, roles and interviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Career Coach — TalentSync" },
      { name: "twitter:description", content: "Personalised AI career advice." },
    ],
    links: [{ rel: "canonical", href: "/guidance" }],
  }),
  component: GuidancePage,
});

const SUGGESTIONS = [
  "What should I learn next?",
  "How do I improve my resume?",
  "Which roles fit my skills?",
  "How do I prepare for interviews?",
];

type ChatMessage = { role: "user" | "assistant"; content: string };

function GuidancePage() {
  return (
    <Layout>
      <div className="mx-auto flex max-w-3xl flex-col">
        <h1 className="animate-fade-up text-3xl font-bold tracking-tight text-foreground md:text-4xl">Career Coach</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask anything about your career — advice is personalised from your profile.
        </p>
        <RequireUser>{(userId) => <Chat userId={userId} />}</RequireUser>
      </div>
    </Layout>
  );
}

function Chat({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming, loading]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function streamIn(answer: string) {
    return new Promise<void>((resolve) => {
      let i = 0;
      const step = Math.max(2, Math.round(answer.length / 120));
      const timer = setInterval(() => {
        i += step;
        setStreaming(answer.slice(0, i));
        if (i >= answer.length) {
          clearInterval(timer);
          setStreaming("");
          setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
          resolve();
        }
      }, 20);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading || streaming) return;
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setLoading(true);
    try {
      const data = await api.careerGuidance(userId, q);
      const answer = data.answer?.trim() || "Sorry, I could not generate advice right now.";
      setLoading(false);
      await streamIn(answer);
    } catch (err) {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? `⚠️ ${err.message}`
              : "⚠️ Something went wrong. Please try again.",
        },
      ]);
    } finally {
      textareaRef.current?.focus();
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="min-h-[320px] rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        {messages.length === 0 && !loading && !streaming ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Start with a question, or pick a suggestion below.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuestion(s);
                    textareaRef.current?.focus();
                  }}
                  className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {streaming && <Bubble role="assistant" content={streaming} cursor />}
            {loading && (
              <p className="animate-pulse text-sm text-muted-foreground">Coach is thinking…</p>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void onSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Ask your career question…"
          rows={2}
          className="flex-1 resize-none rounded-xl"
        />
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 rounded-full"
          disabled={loading || !!streaming || !question.trim()}
          aria-label="Send question"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            aria-label="Clear conversation"
            onClick={() => setMessages([])}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}

function Bubble({
  role,
  content,
  cursor,
}: {
  role: "user" | "assistant";
  content: string;
  cursor?: boolean;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
      <ReactMarkdown>{content}</ReactMarkdown>
      {cursor && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />}
    </div>
  );
}
