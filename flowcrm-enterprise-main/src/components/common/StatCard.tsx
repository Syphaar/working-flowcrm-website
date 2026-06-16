import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  delta?: { value: number; positive?: boolean };
  icon?: LucideIcon;
  accent?: "primary" | "secondary" | "accent" | "success" | "warning" | "danger";
}

const accentMap: Record<NonNullable<Props["accent"]>, string> = {
  primary: "from-primary/15 to-primary/5 text-primary",
  secondary: "from-secondary/15 to-secondary/5 text-secondary",
  accent: "from-accent/15 to-accent/5 text-accent",
  success: "from-success/15 to-success/5 text-success",
  warning: "from-warning/15 to-warning/5 text-warning",
  danger: "from-destructive/15 to-destructive/5 text-destructive",
};

export function StatCard({ label, value, hint, delta, icon: Icon, accent = "primary" }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition hover:shadow-elevated">
      <div
        className={cn(
          "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br opacity-60 blur-2xl",
          accentMap[accent],
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight md:text-3xl"> {value} </div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
          {/* {hint && (<div className="mt-1 text-xs text-muted-foreground"> {hint} </div> )} */}

          {delta && (
            <div
              className={cn(
                "mt-2 inline-flex items-center text-xs font-semibold",
                delta.positive === false ? "text-destructive" : "text-success",
              )}
            >
              {delta.positive === false ? "▼" : "▲"} {" ."}
              {Math.abs(delta.value)}%
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-linear-to-br",
              accentMap[accent],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
