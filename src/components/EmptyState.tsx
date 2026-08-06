import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border/60 bg-card/50 p-10 text-center">
      <SearchX className="h-10 w-10 text-muted-foreground" />
      <p className="mt-3 font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
