import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { EmptyState } from "./EmptyState";
import { Paperclip, Upload, Trash2, FileText } from "lucide-react";

export function AttachmentsPanel({ entity, entityId }: { entity: string; entityId: string }) {
  const { attachments, upsert, remove, log } = useData();
  const { user } = useAuth();
  const ref = useRef<HTMLInputElement>(null);
  const list = attachments.filter(
    (attachment) => attachment.entity === entity && attachment.entityId === entityId,
  );

  const onPick = (files: FileList | null) => {
    if (!files || !user) return;
    Array.from(files).forEach((file) => {
      const id = `at_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      upsert("attachments", {
        id,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        entity,
        entityId,
        uploaderId: user.id,
        createdAt: new Date().toISOString(),
      });
      log({
        userId: user.id,
        userName: user.name,
        role: user.role,
        kind: "create",
        entity: "Attachment",
        entityId: id,
        description: `Uploaded ${file.name}`,
      });
    });
    toast.success(`Uploaded ${files.length} file(s)`);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <input
          ref={ref}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => onPick(event.target.files)}
        />
        <Button size="sm" variant="outline" onClick={() => ref.current?.click()}>
          <Upload className="mr-2 h-4 w-4" /> Upload
        </Button>
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon={Paperclip}
          title="No attachments"
          description="Drop contracts, proposals, or anything else relevant."
        />
      ) : (
        <ul className="space-y-2">
          {list.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{attachment.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(attachment.size / 1024).toFixed(1)} KB · {fmtDate(attachment.createdAt)}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  toast.success("Downloading " + attachment.name);
                }}
              >
                <Upload className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  remove("attachments", attachment.id);
                  toast.success("Deleted");
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
