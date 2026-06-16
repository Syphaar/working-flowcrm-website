export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyId?: string;
  company: string;
  title: string;
  ownerId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
