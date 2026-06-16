import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusPill } from "@/components/common/StatusPill";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ListChecks, Plus, Check, RotateCcw } from "lucide-react";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";
import type { Task, Priority } from "@/lib/types";

export default function TasksPage() {
  const { tasks, upsert, bulkRemove, log } = useData();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    document.title = "Tasks — FlowCRM";
  }, []);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    description: "",
    priority: "Medium",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  });
  const data = isAdmin ? tasks : tasks.filter((task) => task.assigneeId === user?.id);

  const toggleStatus = (task: Task, status: Task["status"]) => {
    upsert("tasks", { ...task, status });
    log({
      userId: user!.id,
      userName: user!.name,
      role: user!.role,
      kind: status === "Done" ? "complete" : "status_change",
      entity: "Task",
      entityId: task.id,
      description: `Marked task "${task.name}" as ${status}.`,
    });
    toast.success(`Task ${status}`);
  };

  const cols: Column<Task>[] = [
    {
      key: "name",
      header: "Task",
      sortable: true,
      render: (task) => (
        <div>
          <div className="font-medium">{task.name}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{task.description}</div>
        </div>
      ),
    },
    { key: "priority", header: "Priority", render: (task) => <StatusPill value={task.priority} /> },
    { key: "status", header: "Status", render: (task) => <StatusPill value={task.status} /> },
    {
      key: "dueDate",
      header: "Due",
      sortable: true,
      render: (task) => fmtDate(task.dueDate),
      accessor: (task) => task.dueDate,
    },
    {
      key: "actions",
      header: "",
      render: (task) => (
        <div className="flex justify-end gap-1">
          {task.status !== "Done" ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                toggleStatus(task, "Done");
              }}
            >
              <Check className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                toggleStatus(task, "Open");
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];

  const save = () => {
    if (!user) return;
    const id = `tk_${Date.now()}`;
    upsert("tasks", {
      ...form,
      id,
      status: "Open",
      assigneeId: user.id,
      dueDate: new Date(form.dueDate).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Task);
    log({
      userId: user.id,
      userName: user.name,
      role: user.role,
      kind: "create",
      entity: "Task",
      entityId: id,
      description: `Created task "${form.name}".`,
    });
    setForm({
      name: "",
      description: "",
      priority: "Medium",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    });
    toast.success("Task created");
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Stay on top of follow-ups and to-dos."
        icon={ListChecks}
        actions={
          <Button size="sm" className="gradient-primary text-white" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        }
      />
      <DataTable
        data={data}
        columns={cols}
        searchPlaceholder="Search tasks…"
        searchKeys={["name", "description", "priority", "status"]}
        exportName="tasks"
        bulkActions={[
          {
            label: "Delete",
            destructive: true,
            onClick: (ids) => {
              bulkRemove("tasks", ids);
              toast.success("Deleted");
            },
          },
        ]}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) => setForm({ ...form, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Low", "Medium", "High", "Urgent"] as Priority[]).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} className="gradient-primary text-white">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
