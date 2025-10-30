import type { PaginationMeta } from "@/types";

interface PaginationOptions {
  totalItems: number;
  page: number;
  limit: number;
  maxLimit?: number;
}

interface NormalizedPagination {
  page: number;
  limit: number;
}

export function buildPaginationMeta(options: PaginationOptions): PaginationMeta {
  const { totalItems } = options;
  const { page, limit } = normalizePagination(options.page, options.limit, options.maxLimit);
  const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;

  return {
    current_page: page,
    total_pages: totalPages,
    total_items: totalItems,
    items_per_page: limit,
    has_next: page < totalPages,
    has_previous: page > 1,
  };
}

export function getPaginationOffset(page: number, limit: number, maxLimit?: number): number {
  const normalized = normalizePagination(page, limit, maxLimit);
  return (normalized.page - 1) * normalized.limit;
}

function normalizePagination(page: number, limit: number, maxLimit?: number): NormalizedPagination {
  const safeLimit = Math.max(1, Math.floor(limit));
  const normalizedLimit =
    typeof maxLimit === "number" ? Math.min(safeLimit, Math.max(1, Math.floor(maxLimit))) : safeLimit;
  const normalizedPage = Math.max(1, Math.floor(page));

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
}
