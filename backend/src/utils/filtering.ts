export interface FilterQuery {
  search?: string;
  status?: string;
  stage?: string;
  priority?: string;
  source?: string;
  industry?: string;
  ownerId?: string;
  assigneeId?: string;
  entity?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export function applyFilters<T extends Record<string, any>>(
  items: T[],
  filters: FilterQuery
): T[] {
  let filtered = [...items];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((item) => {
      return Object.values(item).some((value) => {
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }

  if (filters.status) {
    filtered = filtered.filter(
      (item) =>
        item.status?.toLowerCase() === filters.status?.toLowerCase()
    );
  }

  if (filters.stage) {
    filtered = filtered.filter(
      (item) =>
        item.stage?.toLowerCase() === filters.stage?.toLowerCase()
    );
  }

  if (filters.priority) {
    filtered = filtered.filter(
      (item) =>
        item.priority?.toLowerCase() === filters.priority?.toLowerCase()
    );
  }

  if (filters.source) {
    filtered = filtered.filter(
      (item) =>
        item.source?.toLowerCase() === filters.source?.toLowerCase()
    );
  }

  if (filters.industry) {
    filtered = filtered.filter(
      (item) =>
        item.industry?.toLowerCase() ===
        filters.industry?.toLowerCase()
    );
  }

  if (filters.ownerId) {
    filtered = filtered.filter(
      (item) => item.ownerId === filters.ownerId
    );
  }

  if (filters.assigneeId) {
    filtered = filtered.filter(
      (item) => item.assigneeId === filters.assigneeId
    );
  }

  if (filters.entity && filters.entityId) {
    filtered = filtered.filter(
      (item) =>
        item.entity === filters.entity &&
        item.entityId === filters.entityId
    );
  }

  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    filtered = filtered.filter(
      (item) => item.createdAt && new Date(item.createdAt) >= startDate
    );
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    filtered = filtered.filter(
      (item) => item.createdAt && new Date(item.createdAt) <= endDate
    );
  }

  return filtered;
}

export function filterByOwner<T extends { ownerId: string }>(
  items: T[],
  userId: string,
  isAdmin: boolean
): T[] {
  if (isAdmin) return items;
  return items.filter((item) => item.ownerId === userId);
}

export function filterByAssignee<T extends { assigneeId: string }>(
  items: T[],
  userId: string,
  isAdmin: boolean
): T[] {
  if (isAdmin) return items;
  return items.filter((item) => item.assigneeId === userId);
}

export function filterByRecipient<T extends { recipientId: string }>(
  items: T[],
  userId: string,
  isAdmin: boolean
): T[] {
  if (isAdmin) return items;
  return items.filter((item) => item.recipientId === userId);
}
