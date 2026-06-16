export type LeadStage =
  | "New Lead"
  | "Contacted"
  | "Qualified"
  | "Proposal Sent"
  | "Negotiation"
  | "Won"
  | "Lost";

export type LeadStatus = "Active" | "Inactive" | "Converted" | "Lost";
export type Priority = "Low" | "Medium" | "High" | "Urgent";

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  stage: LeadStage;
  status: LeadStatus;
  ownerId: string;
  value: number;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
