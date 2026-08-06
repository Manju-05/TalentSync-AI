import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1">
          <p>{message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
