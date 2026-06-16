import { useEffect, useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
} from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/types";

export default function CalendarPage() {
  const { events, upsert, remove, log } = useData();
  const { user } = useAuth();
  const [cursor, setCursor] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:00",
    duration: 60,
    recurrence: "none",
  });

  useEffect(() => {
    document.title = "Calendar — FlowCRM";
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const eventsOnDay = (day: Date) =>
    events.filter((event) => isSameDay(new Date(event.startsAt), day));

  const openNew = (d?: Date) => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      date: format(d ?? new Date(), "yyyy-MM-dd"),
      time: "10:00",
      duration: 60,
      recurrence: "none",
    });
    setOpen(true);
  };
  const openEdit = (event: CalendarEvent) => {
    setEditing(event);
    const startDate = new Date(event.startsAt);
    setForm({
      title: event.title,
      description: event.description,
      date: format(startDate, "yyyy-MM-dd"),
      time: format(startDate, "HH:mm"),
      duration: Math.max(15, (new Date(event.endsAt).getTime() - startDate.getTime()) / 60000),
      recurrence: event.recurrence || "none",
    });
    setOpen(true);
  };
  const save = () => {
    const id = editing?.id ?? `ev_${Date.now()}`;
    const starts = new Date(`${form.date}T${form.time}`);
    const ends = new Date(starts.getTime() + Number(form.duration) * 60000);
    const ev: CalendarEvent = {
      id,
      title: form.title,
      description: form.description,
      startsAt: starts.toISOString(),
      endsAt: ends.toISOString(),
      attendees: editing?.attendees ?? [user!.id],
      recurrence: form.recurrence,
      status: "Scheduled",
      createdAt: editing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsert("events", ev);
    log({
      userId: user!.id,
      userName: user!.name,
      role: user!.role,
      kind: editing ? "update" : "create",
      entity: "Event",
      entityId: id,
      description: `${editing ? "Updated" : "Created"} event "${form.title}".`,
    });
    toast.success(editing ? "Event updated" : "Event created");
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Meetings, demos, and scheduled work."
        icon={CalIcon}
        actions={
          <>
            <Button variant="outline" size="icon" onClick={() => setCursor(addMonths(cursor, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-semibold min-w-[120px] text-center">
              {format(cursor, "MMMM yyyy")}
            </div>
            <Button variant="outline" size="icon" onClick={() => setCursor(addMonths(cursor, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm" className="gradient-primary text-white" onClick={() => openNew()}>
              <Plus className="mr-2 h-4 w-4" /> Event
            </Button>
          </>
        }
      />
      <Card className="shadow-card overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b text-xs font-semibold text-muted-foreground bg-muted/40">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
              <div key={dayName} className="p-2 text-center">
                {dayName}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const evs = eventsOnDay(day);
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[90px] border-b border-r p-1.5 cursor-pointer hover:bg-muted/30",
                    !isSameMonth(day, cursor) && "bg-muted/20 text-muted-foreground",
                    isSameDay(day, new Date()) && "bg-primary/5",
                  )}
                  onClick={() => openNew(day)}
                >
                  <div className="text-xs font-medium">{format(day, "d")}</div>
                  <div className="mt-1 space-y-0.5">
                    {evs.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openEdit(event);
                        }}
                        className="truncate rounded bg-primary/15 text-primary px-1.5 py-0.5 text-[10px] font-medium hover:bg-primary/25"
                      >
                        {format(new Date(event.startsAt), "HH:mm")} {event.title}
                      </div>
                    ))}
                    {evs.length > 3 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{evs.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(event) => setForm({ ...form, time: event.target.value })}
                />
              </div>
              <div>
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  value={form.duration}
                  onChange={(event) => setForm({ ...form, duration: event.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Recurrence</Label>
              <Select
                value={form.recurrence}
                onValueChange={(value) => setForm({ ...form, recurrence: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["none", "daily", "weekly", "monthly"].map((recurrence) => (
                    <SelectItem key={recurrence} value={recurrence} className="capitalize">
                      {recurrence}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            {editing && (
              <Button
                variant="destructive"
                onClick={() => {
                  remove("events", editing.id);
                  toast.success("Deleted");
                  setOpen(false);
                }}
              >
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} className="gradient-primary text-white">
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
