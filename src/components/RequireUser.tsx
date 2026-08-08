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
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">You&apos;re not signed in</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Register your profile — or enter an existing User ID — to see your matches, applications
          and personalised coaching.
        </p>
        <Button asChild className="mt-5 rounded-full">
          <Link to="/register">Get started</Link>
        </Button>
      </div>
    );
  }

  return <>{children(userId)}</>;
}
