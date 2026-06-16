export type CustomerStatus = "Active" | "Churned" | "At Risk" | "VIP";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  totalSpend: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
