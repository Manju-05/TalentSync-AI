import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, Send, Bot, User, Trash2, Paperclip, FileText, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api-error";

const MAX_RESUME_BYTES = 100 * 1024;

type Attachment = { name: string; size: number; dataUrl: string };

const GUIDANCE_URL = "https://mahakal-ujjain.app.n8n.cloud/webhook/career-guidance";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachmentName?: string;
};

export const Route = createFileRoute("/guidance")({
  head: () => ({
    meta: [
      { title: "AI Career Guidance — AI Job Portal" },
      {
        name: "description",
        content: "Chat with the AI career coach about skills, roles, and your next career move.",
      },
      { property: "og:title", content: "AI Career Guidance — AI Job Portal" },
      {
        property: "og:description",
        content: "Chat with the AI career coach about skills, roles, and your next move.",
      },
      { property: "og:url", content: "/guidance" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "AI Career Guidance — AI Job Portal" },
      {
        name: "twitter:description",
        content: "Chat with the AI career coach about skills, roles, and your next move.",
      },
    ],
    links: [{ rel: "canonical", href: "/guidance" }],
  }),
  component: GuidancePage,
});

const SUGGESTIONS = [
  "What skills should I learn next?",
  "Are there openings matching my skills?",
  "How do I improve my resume?",
];

function GuidancePage() {
  const [userId, setUserId] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [resume, setResume] = useState<Attachment | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Only PDF resumes are supported");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      toast.error(`Resume must be under 100 KB (this file is ${Math.round(file.size / 1024)} KB)`);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast.error("Could not read that file");
    reader.onload = () => {
      setResume({ name: file.name, size: file.size, dataUrl: String(reader.result) });
      toast.success("Resume attached");
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    return () => {
      if (streamTimer.current) clearInterval(streamTimer.current);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const isStreaming = streamingId !== null;

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if ((!trimmed && !resume) || !userId.trim() || loading || streamTimer.current) return;

    setError(null);
    setQuestion("");
    const attached = resume;
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
        ...(attached ? { attachmentName: attached.name } : {}),
      },
    ]);
    setResume(null);
    setLoading(true);

    try {
      const res = await fetch(GUIDANCE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          question: trimmed,
          ...(attached
            ? {
                resume: {
                  filename: attached.name,
                  mime_type: "application/pdf",
                  size: attached.size,
                  file_data: attached.dataUrl,
                },
              }
            : {}),
        }),
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(extractApiError(res.status, raw));
      let data: any = raw;
      try {
        data = raw ? JSON.parse(raw) : "";
      } catch {
        /* keep raw text */
      }
      if (Array.isArray(data)) data = data[0] ?? {};
      const reply =
        typeof data === "string" ? data : (data.response ?? data.answer ?? data.output ?? "");
      streamReply(reply || "No response received.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get a response");
    } finally {
      setLoading(false);
    }
  }

  function streamReply(full: string) {
    const id = `a-${Date.now()}`;
    setMessages((prev) => [...prev, { id, role: "assistant", content: "" }]);
    setStreamingId(id);
    let i = 0;
    if (streamTimer.current) clearInterval(streamTimer.current);
    streamTimer.current = setInterval(() => {
      i = Math.min(full.length, i + Math.max(2, Math.round(full.length / 240)));
      const chunk = full.slice(0, i);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: chunk } : m)));
      if (i >= full.length) {
        if (streamTimer.current) clearInterval(streamTimer.current);
        streamTimer.current = null;
        setStreamingId(null);
      }
    }, 16);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(question);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(question);
    }
  }

  return (
    <Layout>
      <div className="mx-auto flex h-[calc(100vh-11rem)] max-w-3xl flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Career Guidance</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Chat with your AI career coach — the whole conversation stays on screen.
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setMessages([])}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="mt-5 space-y-2">
          <Label>User ID</Label>
          <Input
            required
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. user_123"
          />
        </div>

        <div className="mt-5 flex-1 overflow-y-auto rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm sm:p-6">
          {messages.length === 0 && !loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Ask your first question to start the conversation.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setQuestion(s);
                      inputRef.current?.focus();
                    }}
                    className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end gap-3">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                      {m.attachmentName && (
                        <span className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-primary-foreground/15 px-2 py-1 text-xs">
                          <FileText className="h-3.5 w-3.5" />
                          {m.attachmentName}
                        </span>
                      )}
                      {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                    </div>
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="prose prose-sm max-w-none flex-1 text-sm leading-relaxed text-foreground dark:prose-invert prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                      {streamingId === m.id && (
                        <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-primary align-middle" />
                      )}
                    </div>
                  </div>
                ),
              )}

              {loading && (
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <p className="animate-pulse text-sm text-muted-foreground">Thinking...</p>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        <form
          onSubmit={onSubmit}
          className="mt-4 rounded-2xl border border-border/60 bg-card p-2 shadow-sm"
        >
          {resume && (
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs text-secondary-foreground">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{resume.name}</span>
              <span className="text-muted-foreground">{Math.round(resume.size / 1024)} KB</span>
              <button
                type="button"
                onClick={() => setResume(null)}
                className="ml-auto rounded-full p-0.5 hover:bg-background"
                aria-label="Remove resume"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={onPickFile}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-10 w-10 shrink-0 rounded-full"
            onClick={() => fileRef.current?.click()}
            disabled={loading || isStreaming}
            title="Attach resume (PDF, under 100 KB)"
            aria-label="Attach resume"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            ref={inputRef}
            rows={1}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              userId.trim() ? "Ask a follow-up question..." : "Enter your User ID first..."
            }
            className="min-h-[44px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full"
            disabled={
              loading || isStreaming || (!question.trim() && !resume) || !userId.trim()
            }
            aria-label="Send message"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
          </div>
          <p className="px-2 pb-1 pt-1.5 text-[11px] text-muted-foreground">
            Attach your resume as a PDF under 100 KB to get it evaluated.
          </p>
        </form>
      </div>
    </Layout>
  );
}
