"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TransformedTankRecord } from "@/lib/TransformTank";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper to make a sortable header
function sortableHeader(label: string) {
  return ({ column }: { column: any }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export const columns: ColumnDef<TransformedTankRecord>[] = [
  {
    accessorKey: "tankName",
    header: sortableHeader("Tank"),
  },
  {
    accessorKey: "date",
    header: sortableHeader("Date"),
    filterFn: "dateRange" as any,
    cell: ({ row }) => {
      const d = row.original.startTime;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "durationMinutes",
    header: sortableHeader("Duration"),
    cell: ({ row }) => `${row.original.durationMinutes} min`,
  },
  {
    id: "savingsTime",
    accessorFn: (row) => row.savings.time,
    header: sortableHeader("Time Saved"),
    cell: ({ row }) => `${(row.original.savings.time / 60).toFixed(1)} min`,
  },
  {
    id: "savingsEnergy",
    accessorFn: (row) => row.savings.energy,
    header: sortableHeader("Energy Saved"),
    cell: ({ row }) => `${row.original.savings.energy} kWh`,
  },
  {
    id: "savingsWater",
    accessorFn: (row) => row.savings.water ?? -1,
    header: sortableHeader("Water Saved"),
    cell: ({ row }) => {
      const w = row.original.savings.water;
      return w !== null ? `${w} gal` : "N/A";
    },
  },
  {
    id: "metricsTime",
    accessorFn: (row) => row.metrics.time,
    header: sortableHeader("Time Used"),
    cell: ({ row }) => `${(row.original.metrics.time / 60).toFixed(1)} min`,
  },
  {
    id: "metricsEnergy",
    accessorFn: (row) => row.metrics.energy,
    header: sortableHeader("Energy Used"),
    cell: ({ row }) => `${row.original.metrics.energy} kWh`,
  },
  {
    id: "metricsWater",
    accessorFn: (row) => row.metrics.water ?? -1,
    header: sortableHeader("Water Used"),
    cell: ({ row }) => {
      const w = row.original.metrics.water;
      return w !== null ? `${w} gal` : "N/A";
    },
  },
];