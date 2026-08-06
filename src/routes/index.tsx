import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, UserPlus } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Job Portal — Get Matched With Jobs" },
      {
        name: "description",
        content:
          "Register your profile, get matched with jobs, and receive AI career guidance on AI Job Portal.",
      },
      { property: "og:title", content: "AI Job Portal — Get Matched With Jobs" },
      {
        property: "og:description",
        content: "Register your profile, get matched with jobs, and receive AI career guidance.",
      },
    ],
  }),
  component: Index,
});

const features = [
  { icon: UserPlus, title: "Register", text: "Share your skills, roles and experience once." },
  { icon: Search, title: "Find Jobs", text: "Get roles matched to your profile instantly." },
  { icon: Sparkles, title: "Career Guidance", text: "Ask AI anything about your next step." },
];

function Index() {
  return (
    <Layout>
      <section className="rounded-3xl bg-gradient-to-b from-primary/10 to-transparent px-6 py-16 text-center sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          AI Job Portal
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Register your profile, get matched with jobs, and receive AI career guidance.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full">
            <Link to="/register">Register</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="rounded-full">
            <Link to="/jobs">Find Jobs</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link to="/guidance">Career Guidance</Link>
          </Button>
        </div>
      </section>

      <section className="mt-12 grid gap-5 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <f.icon className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
    </Layout>
  );
}
