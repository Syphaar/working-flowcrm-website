import { useData } from "@/context/DataContext";
import { relTime } from "@/lib/format";
import { EmptyState } from "./EmptyState";
import { Activity } from "lucide-react";

export function Timeline({ entity, entityId }: { entity: string; entityId: string }) {
  const { activities } = useData();
  const list = activities
    .filter(
      (activity) =>
        activity.entityId === entityId ||
        (activity.entity === entity && activity.description.includes(entityId)),
    )
    .sort((activityA, activityB) => +new Date(activityB.createdAt) - +new Date(activityA.createdAt))
    .slice(0, 30);

  if (list.length === 0)
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Actions on this record will show up here."
      />
    );

  return (
    <ol className="relative space-y-3 border-l pl-5">
      {list.map((activity) => (
        <li key={activity.id} className="relative">
          <span className="absolute -left-6.75 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">
                {activity.userName}{" "}
                <span className="text-muted-foreground font-normal">
                  · {activity.kind.replace("_", " ")}
                </span>
              </span>
              <span className="text-muted-foreground">{relTime(activity.createdAt)}</span>
            </div>
            <div className="mt-1 text-sm">{activity.description}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
