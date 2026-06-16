import type { Priority } from "./Lead.js";

export type TaskStatus = "Open" | "In Progress" | "Done";

export interface RelatedTo {
  type: string;
  id: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  dueDate: string;
  status: TaskStatus;
  assigneeId: string;
  relatedTo?: RelatedTo;
  createdAt: string;
  updatedAt: string;
}
