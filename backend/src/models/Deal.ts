import type { LeadStage, Priority } from "./Lead.js";

export type DealStatus = "Open" | "Won" | "Lost";

export interface Deal {
  id: string;
  name: string;
  customerId?: string;
  customerName: string;
  value: number;
  stage: LeadStage;
  status: DealStatus;
  priority: Priority;
  probability: number;
  ownerId: string;
  closeDate: string;
  createdAt: string;
  updatedAt: string;
}
