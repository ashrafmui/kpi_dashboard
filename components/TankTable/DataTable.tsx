"use client";

import { useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
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
            const records = data as unknown as TransformedTankRecord[];
            const totals = aggregateKPIs(records);

            return (
              <TableRow className="font-semibold">
                <TableCell>Total ({records.length})</TableCell>
                <TableCell />
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
  );
}