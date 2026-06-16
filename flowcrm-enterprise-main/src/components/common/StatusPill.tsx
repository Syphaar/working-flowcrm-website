import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Won: "bg-success/15 text-success border-success/30",
  Done: "bg-success/15 text-success border-success/30",
  Online: "bg-success/15 text-success border-success/30",
  online: "bg-success/15 text-success border-success/30",
  Completed: "bg-success/15 text-success border-success/30",
  VIP: "bg-accent/15 text-accent border-accent/30",
  Qualified: "bg-info/15 text-info border-info/30",
  Contacted: "bg-info/15 text-info border-info/30",
  "Proposal Sent": "bg-accent/15 text-accent border-accent/30",
  Negotiation: "bg-warning/15 text-warning border-warning/30",
  Open: "bg-info/15 text-info border-info/30",
  "In Progress": "bg-info/15 text-info border-info/30",
  Scheduled: "bg-info/15 text-info border-info/30",
  Prospect: "bg-info/15 text-info border-info/30",
  Converted: "bg-success/15 text-success border-success/30",
  "At Risk": "bg-warning/15 text-warning border-warning/30",
  away: "bg-warning/15 text-warning border-warning/30",
  Away: "bg-warning/15 text-warning border-warning/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  Churned: "bg-destructive/15 text-destructive border-destructive/30",
  Lost: "bg-destructive/15 text-destructive border-destructive/30",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  offline: "bg-muted text-muted-foreground border-border",
  Offline: "bg-muted text-muted-foreground border-border",
  "New Lead": "bg-primary/15 text-primary border-primary/30",
  Urgent: "bg-destructive/15 text-destructive border-destructive/30",
  High: "bg-warning/15 text-warning border-warning/30",
  Medium: "bg-info/15 text-info border-info/30",
  Low: "bg-muted text-muted-foreground border-border",
};

export function StatusPill({ value, className }: { value: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        tone[value] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {value}
    </Badge>
  );
}
