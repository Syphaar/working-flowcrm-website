import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { FileText } from "lucide-react";
import { fmtDateTime, initials } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Activity } from "@/lib/types";

export default function AuditPage() {
  const { activities, bulkRemove } = useData();
  const { can, isAdmin, isHydrated } = useAuth();
  useEffect(() => {
    document.title = "Audit Log — FlowCRM";
  }, []);
  if (!isHydrated)
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  if (!can("view_audit"))
    return (
      <div className="p-8 text-center">
        <p>Access denied.</p>
        <Link to="/dashboard" className="text-primary">
          Back
        </Link>
      </div>
    );
  const cols: Column<Activity>[] = [
    {
      key: "createdAt",
      header: "Timestamp",
      sortable: true,
      render: (activity) => fmtDateTime(activity.createdAt),
      accessor: (activity) => activity.createdAt,
    },
    {
      key: "userName",
      header: "User",
      render: (activity) => (
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
            {initials(activity.userName)}
          </div>
          <span className="text-sm">{activity.userName}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (activity) => (
        <span className="capitalize text-muted-foreground">{activity.role.replace("_", " ")}</span>
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
    { key: "entity", header: "Entity" },
    { key: "description", header: "Description" },
  ];
  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="A tamper-evident record of every action across the workspace."
        icon={FileText}
      />
      <DataTable
        data={activities}
        columns={cols}
        searchPlaceholder="Search audit log…"
        searchKeys={["userName", "description", "kind", "entity", "role"]}
        exportName="audit-log"
        pageSize={20}
        bulkActions={
          isAdmin
            ? [
                {
                  label: "Delete",
                  destructive: true,
                  onClick: (ids) => {
                    bulkRemove("activities", ids);
                    toast.success(`${ids.length} audit entries deleted`);
                  },
                },
              ]
            : undefined
        }
      />
    </div>
  );
}
