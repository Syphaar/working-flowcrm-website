import type { LeadStage } from "./Lead.js";

export type DealStatus = "Open" | "Won" | "Lost";

export interface Deal {
  id: string;
  name: string;
  customerId?: string;
  customerName: string;
  value: number;
  stage: LeadStage;
  status: DealStatus;
  probability: number;
  ownerId: string;
  closeDate: string;
  createdAt: string;
  updatedAt: string;
}
