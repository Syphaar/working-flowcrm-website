import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, ArrowUpDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportCSV, exportPDF, exportXLSX } from "@/lib/exporters";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => unknown;
  sortable?: boolean;
  className?: string;
}

interface Props<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  filters?: React.ReactNode;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  bulkActions?: { label: string; onClick: (ids: string[]) => void; destructive?: boolean }[];
  exportName?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search…",
  searchKeys,
  filters,
  onRowClick,
  pageSize = 10,
  bulkActions,
  exportName,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  toolbar,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      const keys = searchKeys ?? Object.keys(row as Record<string, unknown>);
      return keys.some((key) =>
        String((row as Record<string, unknown>)[key as string] ?? "")
          .toLowerCase()
          .includes(q),
      );
    });
  }, [data, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((col) => col.key === sort.key);
    const accessorFn = column?.accessor ?? ((row: T) => (row as Record<string, unknown>)[sort.key]);
    return [...filtered].sort((itemA, itemB) => {
      const valueA = accessorFn(itemA),
        valueB = accessorFn(itemB);
      if (valueA == null) return 1;
      if (valueB == null) return -1;
      const comparison =
        typeof valueA === "number" && typeof valueB === "number"
          ? valueA - valueB
          : String(valueA).localeCompare(String(valueB));
      return sort.dir === "asc" ? comparison : -comparison;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const currentPageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedIds = Object.keys(selected).filter((key) => selected[key]);
  const allOnPageSelected =
    currentPageRows.length > 0 && currentPageRows.every((row) => selected[row.id]);

  const exportRows = sorted.map((row) => {
    const exportRow: Record<string, string> = {};
    columns.forEach((col) => {
      const accessorFn = col.accessor ?? ((row: T) => (row as Record<string, unknown>)[col.key]);
      exportRow[col.header] = String(accessorFn(row) ?? "");
    });
    return exportRow;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters}
          {toolbar}
          {exportName && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportCSV(exportName, exportRows)}>
                  <FileText className="mr-2 h-4 w-4" /> CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportXLSX(exportName, exportRows)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportPDF(exportName, exportRows, exportName)}>
                  <FileText className="mr-2 h-4 w-4" /> PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {bulkActions && selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          <span>{selectedIds.length} selected</span>
          <div className="flex flex-wrap gap-2">
            {bulkActions.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant={action.destructive ? "destructive" : "secondary"}
                onClick={() => {
                  action.onClick(selectedIds);
                  setSelected({});
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <tr>
                {bulkActions && (
                  <th className="w-10 px-3 py-3">
                    <Checkbox
                      checked={allOnPageSelected}
                      onCheckedChange={(checked) => {
                        const next = { ...selected };
                        currentPageRows.forEach((row) => {
                          next[row.id] = !!checked;
                        });
                        setSelected(next);
                      }}
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th key={col.key} className={cn("px-3 py-3", col.className)}>
                    {col.sortable ? (
                      <button
                        className="inline-flex items-center gap-1 hover:text-foreground"
                        onClick={() =>
                          setSort((prevSort) =>
                            prevSort?.key === col.key
                              ? { key: col.key, dir: prevSort.dir === "asc" ? "desc" : "asc" }
                              : { key: col.key, dir: "asc" },
                          )
                        }
                      >
                        {col.header} <ArrowUpDown className="h-3 w-3" />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentPageRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (bulkActions ? 1 : 0)} className="p-0">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription ?? "Try adjusting your search or filters."}
                    />
                  </td>
                </tr>
              ) : (
                currentPageRows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "group transition-colors",
                      onRowClick && "cursor-pointer hover:bg-muted/40",
                    )}
                    onClick={(event) => {
                      const tag = (event.target as HTMLElement).tagName;
                      if (
                        tag === "INPUT" ||
                        tag === "BUTTON" ||
                        (event.target as HTMLElement).closest("button,a,input,[role=checkbox]")
                      )
                        return;
                      onRowClick?.(row);
                    }}
                  >
                    {bulkActions && (
                      <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={!!selected[row.id]}
                          onCheckedChange={(checked) =>
                            setSelected((prev) => ({ ...prev, [row.id]: !!checked }))
                          }
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-3 py-3 align-middle", col.className)}>
                        {col.render
                          ? col.render(row)
                          : String(
                              col.accessor?.(row) ??
                                (row as Record<string, unknown>)[col.key] ??
                                "",
                            )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pageCount > 1 && (
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setPage((prevPage) => Math.max(1, prevPage - 1));
                  }}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, pageCount) }, (_, index) => {
                const pageNum =
                  Math.min(Math.max(1, currentPage - 2), Math.max(1, pageCount - 4)) + index;
                if (pageNum > pageCount) return null;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      isActive={pageNum === currentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(pageNum);
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setPage((prevPage) => Math.min(pageCount, prevPage + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
