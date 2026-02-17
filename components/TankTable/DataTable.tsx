"use client";

import { useState } from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransformedTankRecord } from "@/lib/TransformTank";
import { aggregateKPIs } from "@/lib/AggregateTanks";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tankNames: string[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tankNames,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    filterFns: {
      dateRange: (row, columnId, filterValue) => {
        const rowDate = (row.original as TransformedTankRecord).date;
        const [from, to] = filterValue as [string, string];
        if (from && rowDate < from) return false;
        if (to && rowDate > to) return false;
        return true;
      },
    },
  });

  function updateDateFilter(from: string, to: string) {
    setDateFrom(from);
    setDateTo(to);
    table.getColumn("date")?.setFilterValue(
      from || to ? [from, to] : undefined
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-end">
        <Select
          onValueChange={(value) =>
            table
              .getColumn("tankName")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by tank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tanks</SelectItem>
            {tankNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => updateDateFilter(e.target.value, dateTo)}
            className="w-[160px]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => updateDateFilter(dateFrom, e.target.value)}
            className="w-[160px]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            {(() => {
              const rows = table.getFilteredRowModel().rows;
              const records = rows.map(
                (r) => r.original as TransformedTankRecord
              );
              const totals = aggregateKPIs(records);

              return (
                <TableRow className="font-semibold">
                  <TableCell>Total ({rows.length})</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    {(totals.totalTimeSaved / 60).toFixed(1)} min
                  </TableCell>
                  <TableCell>{totals.totalEnergySaved} kWh</TableCell>
                  <TableCell>
                    {totals.totalWaterSaved.toLocaleString()} gal
                  </TableCell>
                  <TableCell>
                    {(totals.totalTimeUsed / 60).toFixed(1)} min
                  </TableCell>
                  <TableCell>
                    {totals.totalEnergyUsed.toLocaleString()} kWh
                  </TableCell>
                  <TableCell>
                    {totals.totalWaterUsed.toLocaleString()} gal
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}