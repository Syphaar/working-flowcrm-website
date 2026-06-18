import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KanbanSquare, Pencil, Plus } from "lucide-react";
import { fmtCurrency, fmtDate } from "@/lib/format";
import { toast } from "sonner";
import type { Deal, Pipeline } from "@/lib/types";
import { cn } from "@/lib/utils";

const DEFAULT_STAGES: string[] = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

export default function PipelinePage() {
  const { deals, upsert, log, pipelines } = useData();
  const { user, isAdmin, can, isHydrated } = useAuth();
  const [active, setActive] = useState<Deal | null>(null);
  const [open, setOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [form, setForm] = useState<any>({
    name: "",
    stages: DEFAULT_STAGES.join(", "),
    description: "",
  });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const activePipeline = useMemo(() => {
    if (selectedPipelineId) return pipelines.find((p) => p.id === selectedPipelineId) || null;
    if (pipelines.length > 0) return pipelines[0];
    return null;
  }, [pipelines, selectedPipelineId]);

  useEffect(() => {
    if (!selectedPipelineId && pipelines.length > 0) {
      setSelectedPipelineId(pipelines[0].id);
    }
  }, [pipelines, selectedPipelineId]);

  const stages: string[] = activePipeline?.stages || DEFAULT_STAGES;

  const visible = isAdmin ? deals : deals.filter((deal) => deal.ownerId === user?.id);

  const byStage = useMemo(() => {
    const m: Record<string, Deal[]> = {};
    stages.forEach((stage) => (m[stage] = []));
    visible.forEach((deal) => m[deal.stage]?.push(deal));
    return m;
  }, [visible, stages]);

  useEffect(() => {
    document.title = "Pipeline — FlowCRM";
  }, []);

  const openNewDialog = () => {
    setEditingPipeline(false);
    setForm({ name: "", stages: DEFAULT_STAGES.join(", "), description: "" });
    setOpen(true);
  };

  const openEditDialog = () => {
    if (!activePipeline) return;
    setEditingPipeline(true);
    setForm({
      name: activePipeline.name,
      stages: activePipeline.stages.join(", "),
      description: activePipeline.description || "",
    });
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditingPipeline(false);
    setForm({ name: "", stages: DEFAULT_STAGES.join(", "), description: "" });
  };

  const onStart = (event: DragStartEvent) =>
    setActive(visible.find((deal) => deal.id === event.active.id) ?? null);
  const onEnd = (event: DragEndEvent) => {
    setActive(null);
    const over = event.over?.id as string | undefined;
    const deal = visible.find((item) => item.id === event.active.id);
    if (!deal || !over || deal.stage === over) return;
    const status = over === "Won" ? "Won" : over === "Lost" ? "Lost" : "Open";
    upsert("deals", { ...deal, stage: over, status });
    log({
      userId: user!.id,
      userName: user!.name,
      role: user!.role,
      kind: "stage_change",
      entity: "Deal",
      entityId: deal.id,
      description: `Moved "${deal.name}" to ${over}.`,
    });
    toast.success(`Moved to ${over}`);
  };

  const savePipeline = () => {
    if (!user) return;
    const stagesList = form.stages.split(",").map((s: string) => s.trim()).filter(Boolean);
    if (!form.name || stagesList.length === 0) {
      toast.error("Pipeline name and at least one stage required");
      return;
    }
    if (editingPipeline && activePipeline) {
      upsert("pipelines", {
        ...activePipeline,
        name: form.name,
        stages: stagesList,
        description: form.description,
        updatedAt: new Date().toISOString(),
      });
      log({
        userId: user.id,
        userName: user.name,
        role: user.role,
        kind: "update",
        entity: "Pipeline",
        entityId: activePipeline.id,
        description: `Updated pipeline "${form.name}"`,
      });
      toast.success("Pipeline updated");
    } else {
      const id = `tmp_pl_${Date.now()}`;
      upsert("pipelines", {
        id,
        name: form.name,
        stages: stagesList,
        description: form.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      log({
        userId: user.id,
        userName: user.name,
        role: user.role,
        kind: "create",
        entity: "Pipeline",
        entityId: id,
        description: `Created pipeline "${form.name}"`,
      });
      toast.success("Pipeline created");
    }
    closeDialog();
  };

  if (!isHydrated)
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  if (!can("manage_deals"))
    return (
      <div className="p-8 text-center">
        <p>Access denied.</p>
        <Link to="/dashboard" className="text-primary">Back</Link>
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Sales Pipeline"
        description="Drag deals between stages to update them."
        icon={KanbanSquare}
        actions={
          isAdmin ? (
            <div className="flex gap-2">
              {activePipeline && (
                <Button size="sm" variant="outline" onClick={openEditDialog}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Pipeline
                </Button>
              )}
              <Button size="sm" className="gradient-primary text-white" onClick={openNewDialog}>
                <Plus className="mr-2 h-4 w-4" /> New Pipeline
              </Button>
            </div>
          ) : undefined
        }
      />
      {pipelines.length > 1 && (
        <div className="mb-4 max-w-xs">
          <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
            <SelectTrigger>
              <SelectValue placeholder="Select pipeline" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <DndContext sensors={sensors} onDragStart={onStart} onDragEnd={onEnd}>
        <div className="grid grid-flow-col auto-cols-[280px] gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <Column key={stage} stage={stage} deals={byStage[stage] || []} />
          ))}
        </div>
        <DragOverlay>{active ? <DealCardView deal={active} dragging /> : null}</DragOverlay>
      </DndContext>
      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPipeline ? "Edit Pipeline" : "New Pipeline"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Pipeline name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Sales Pipeline"
              />
            </div>
            <div className="space-y-2">
              <Label>Stages</Label>
              <Input
                value={form.stages}
                onChange={(e) => setForm({ ...form, stages: e.target.value })}
                placeholder="New Lead, Contacted, Qualified, Won, Lost"
              />
              <p className="text-xs text-muted-foreground">Separate each stage with a comma.</p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Main sales pipeline"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={savePipeline} className="gradient-primary text-white">
              {editingPipeline ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Column({ stage, deals }: { stage: string; deals: Deal[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = deals.reduce((sum, deal) => sum + deal.value, 0);
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border bg-card p-3 transition-colors",
        isOver && "ring-2 ring-primary bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold">{stage}</div>
          <div className="text-xs text-muted-foreground">
            {deals.length} · {fmtCurrency(total)}
          </div>
        </div>
      </div>
      <div className="space-y-2 min-h-[100px]">
        {deals.map((deal) => (
          <DraggableCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}

function DraggableCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("touch-none", isDragging && "opacity-30")}
    >
      <DealCardView deal={deal} />
    </div>
  );
}

function DealCardView({ deal, dragging }: { deal: Deal; dragging?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 shadow-soft cursor-grab active:cursor-grabbing",
        dragging && "shadow-elevated rotate-2",
      )}
    >
      <div className="text-sm font-semibold line-clamp-1">{deal.name}</div>
      <div className="text-xs text-muted-foreground line-clamp-1">{deal.customerName}</div>
      <div className="mt-2 flex justify-between text-xs">
        <span className="font-bold text-primary">{fmtCurrency(deal.value)}</span>
        <span className="text-muted-foreground">{deal.probability}%</span>
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">
        Close {fmtDate(deal.closeDate)}
      </div>
    </div>
  );
}
