import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useUserId } from "@/lib/user";
import { Skeleton } from "@/components/ui/skeleton";

export function RequireUser({ children }: { children: (userId: string) => ReactNode }) {
  const [userId, ready] = useUserId();

  if (!ready) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="rounded-3xl border border-primary/10 bg-card/40 p-10 text-center shadow-elegant backdrop-blur-md animate-fade-up sm:p-14">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-primary/5">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">You&apos;re not signed in</h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          Register your profile — or enter an existing User ID — to see your matches, applications
          and personalised coaching.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-full font-semibold tracking-wide shadow-md transition-all hover:shadow-lg">
          <Link to="/register">Get started now</Link>
        </Button>
      </div>
    );
  }

  return <>{children(userId)}</>;
}
