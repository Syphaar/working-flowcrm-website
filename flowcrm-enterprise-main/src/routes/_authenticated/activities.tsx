import { useEffect } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Activity as ActivityIcon } from "lucide-react";
import { fmtDateTime, initials } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Activity } from "@/lib/types";

export default function ActivitiesPage() {
  const { activities, bulkRemove } = useData();
  const { isAdmin } = useAuth();
  useEffect(() => {
    document.title = "Activities — FlowCRM";
  }, []);
  const cols: Column<Activity>[] = [
    {
      key: "userName",
      header: "User",
      sortable: true,
      render: (activity) => (
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">
            {initials(activity.userName)}
          </div>
          <div>
            <div className="text-sm font-medium">{activity.userName}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {activity.role.replace("_", " ")}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "kind",
      header: "Action",
      render: (activity) => (
        <Badge variant="secondary" className="capitalize">
          {activity.kind.replace("_", " ")}
        </Badge>
      ),
    },
    { key: "description", header: "Description" },
    {
      key: "createdAt",
      header: "Timestamp",
      sortable: true,
      render: (activity) => fmtDateTime(activity.createdAt),
      accessor: (activity) => activity.createdAt,
    },
  ];
  return (
    <div>
      <PageHeader
        title="Activities"
        description="Every action across your CRM, in one stream."
        icon={ActivityIcon}
      />
      <DataTable
        data={activities}
        columns={cols}
        searchPlaceholder="Search users, actions…"
        searchKeys={["userName", "description", "kind", "entity"]}
        exportName="activities"
        pageSize={15}
        bulkActions={
          isAdmin
            ? [
                {
                  label: "Delete",
                  destructive: true,
                  onClick: (ids) => {
                    bulkRemove("activities", ids);
                    toast.success(`${ids.length} activities deleted`);
                  },
                },
              ]
            : undefined
        }
      />
    </div>
  );
}
