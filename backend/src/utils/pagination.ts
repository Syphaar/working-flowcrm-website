export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function paginate<T>(
  items: T[],
  query: PaginationQuery
): PaginatedResult<T> {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const sortBy = query.sortBy;
  const sortOrder = query.sortOrder || "asc";

  let sortedItems = [...items];

  if (sortBy) {
    sortedItems.sort((itemA: any, itemB: any) => {
      const valueA = itemA[sortBy];
      const valueB = itemB[sortBy];

      if (valueA == null) return 1;
      if (valueB == null) return -1;

      if (typeof valueA === "string") {
        const comparison = valueA.localeCompare(valueB);
        return sortOrder === "asc" ? comparison : -comparison;
      }

      return sortOrder === "asc"
        ? valueA - valueB
        : valueB - valueA;
    });
  }

  const totalItems = sortedItems.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = sortedItems.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
