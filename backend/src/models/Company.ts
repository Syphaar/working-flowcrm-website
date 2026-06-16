export type CompanyStatus = "Active" | "Prospect" | "Inactive";

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  address: string;
  revenue: number;
  employees: number;
  status: CompanyStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
