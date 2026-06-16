import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { relTime } from "@/lib/format";
import { toast } from "sonner";
import { EmptyState } from "./EmptyState";
import { StickyNote } from "lucide-react";

export function NotesPanel({ entity, entityId }: { entity: string; entityId: string }) {
  const { notes, upsert, remove, log } = useData();
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const list = notes
    .filter((note) => note.entity === entity && note.entityId === entityId)
    .sort((noteA, noteB) => +new Date(noteB.createdAt) - +new Date(noteA.createdAt));

  const add = () => {
    if (!body.trim() || !user) return;
    const id = `no_${Date.now()}`;
    upsert("notes", {
      id,
      authorId: user.id,
      authorName: user.name,
      body: body.trim(),
      entity,
      entityId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    log({
      userId: user.id,
      userName: user.name,
      role: user.role,
      kind: "create",
      entity: "Note",
      entityId: id,
      description: `${user.name} added a note.`,
    });
    setBody("");
    toast.success("Note added");
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Add a note…"
          rows={3}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={add} disabled={!body.trim()}>
            Add note
          </Button>
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Capture context, next steps, or anything worth remembering."
        />
      ) : (
        <ul className="space-y-2">
          {list.map((note) => (
            <li key={note.id} className="rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{note.authorName}</span>
                <span>{relTime(note.createdAt)}</span>
              </div>
              <div className="mt-1 text-sm whitespace-pre-wrap">{note.body}</div>
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    remove("notes", note.id);
                    toast.success("Note deleted");
                  }}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
