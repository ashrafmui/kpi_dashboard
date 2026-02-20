"use client";

import { useState, useMemo } from "react";
import { TransformedTankRecord } from "@/lib/TransformTank";
import {
  aggregateKPIs,
} from "@/lib/AggregateTanks";
import { KPICard } from "@/components/KPICard";
import { SavingsChart } from "@/components/SavingsChart";
import { DataTable } from "@/components/TankTable/DataTable";
import { columns } from "@/components/TankTable/Columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ComparisonChart } from "@/components/ComparisonChart";

interface DashboardClientProps {
  data: TransformedTankRecord[];
}

export function DashboardClient({ data }: DashboardClientProps) {
  const [selectedTank, setSelectedTank] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const tankNames = useMemo(
    () => [...new Set(data.map((r) => r.tankName))].sort(),
    [data]
  );

  // Single source of filtered data for everything
  const filteredData = useMemo(() => {
    return data.filter((r) => {
      if (selectedTank !== "all" && r.tankName !== selectedTank) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      return true;
    });
  }, [data, selectedTank, dateFrom, dateTo]);

  const kpis = useMemo(() => aggregateKPIs(filteredData), [filteredData]);

  const isFiltered =
    selectedTank !== "all" || dateFrom !== "" || dateTo !== "";

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-end flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Tank</label>
          <Select
            value={selectedTank}
            onValueChange={setSelectedTank}
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
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[160px]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[160px]"
          />
        </div>

        {isFiltered && (
          <button
            onClick={() => {
              setSelectedTank("all");
              setDateFrom("");
              setDateTo("");
            }}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      {isFiltered && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredData.length} of {data.length} cycles
        </p>
      )}

      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Time Saved"
          value={`${(kpis.totalTimeSaved / 60).toFixed(1)} min`}
          subtitle={`out of ${(kpis.totalTimeUsed / 60).toFixed(1)} min total · ~${(kpis.projectedYearlyTimeSaved / 3600).toFixed(0)} hrs/yr projected`}
        />
        <KPICard
          title="Total Energy Saved"
          value={`${kpis.totalEnergySaved} kWh`}
          subtitle={`out of ${kpis.totalEnergyUsed.toLocaleString()} kWh total · ~${kpis.projectedYearlyEnergySaved.toLocaleString()} kWh/yr (~$${kpis.projectedYearlyEnergyCost})`}
        />
        <KPICard
          title="Total Water Saved"
          value={`${kpis.totalWaterSaved.toLocaleString()} gal`}
          subtitle={`out of ${kpis.totalWaterUsed.toLocaleString()} gal total · ~${kpis.projectedYearlyWaterSaved.toLocaleString()} gal/yr (~$${kpis.projectedYearlyWaterCost})`}
        />
      </div>

      {/* Average Savings Per Cycle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Avg Time Saved / Cycle"
          value={`${(kpis.avgTimeSaved / 60).toFixed(1)} min`}
        />
        <KPICard
          title="Avg Energy Saved / Cycle"
          value={`${kpis.avgEnergySaved.toFixed(1)} kWh`}
        />
        <KPICard
          title="Avg Water Saved / Cycle"
          value={`${kpis.avgWaterSaved.toFixed(1)} gal`}
        />
      </div>

    {selectedTank == "all" &&
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard
            title="Top Time Saver"
            value={kpis.topTimeSaver.tank}
            subtitle={`${(kpis.topTimeSaver.value / 60).toFixed(1)} min saved`}
            />
            <KPICard
            title="Top Energy Saver"
            value={kpis.topEnergySaver.tank}
            subtitle={`${kpis.topEnergySaver.value} kWh saved`}
            />
            <KPICard
            title="Top Water Saver"
            value={kpis.topWaterSaver.tank}
            subtitle={`${kpis.topWaterSaver.value.toLocaleString()} gal saved`}
            />
        </div>
    }

      {/* Savings Trend Chart */}
      <SavingsChart data={filteredData} tankNames={tankNames} kpis={kpis} />

      <ComparisonChart data={filteredData} kpis={kpis} />

      {/* Tank Records Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Cycle Records</h2>
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}