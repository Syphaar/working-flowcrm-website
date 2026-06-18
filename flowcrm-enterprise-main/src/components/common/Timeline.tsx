import { useState } from "react";
import { useData } from "@/context/DataContext";
import { relTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";
import { Activity } from "lucide-react";

const PAGE_SIZE = 10;

export function Timeline({ entity, entityId }: { entity: string; entityId: string }) {
  const { activities } = useData();
  const [page, setPage] = useState(1);

  const all = activities
    .filter(
      (activity) =>
        activity.entityId === entityId ||
        (activity.entity === entity && activity.description.includes(entityId)),
    )
    .sort((activityA, activityB) => +new Date(activityB.createdAt) - +new Date(activityA.createdAt));

  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const list = all.slice(0, page * PAGE_SIZE);

  if (all.length === 0)
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Actions on this record will show up here."
      />
    );

  return (
    <div>
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
      {page < totalPages && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
            Show more ({all.length - list.length} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
