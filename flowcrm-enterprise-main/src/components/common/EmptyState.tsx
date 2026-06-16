import { Inbox } from "lucide-react";
import type { ElementType, ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ElementType;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-linear-to-br from-primary/10 to-accent/10 text-primary">
        <Icon className="h-8 w-8" />
      </div>
      <div className="mt-4 text-base font-semibold">{title}</div>
      {description && (
        <div className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
