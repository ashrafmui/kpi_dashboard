import { getTankData } from "@/lib/GetTankData";
import { aggregateKPIs } from "@/lib/AggregateTanks";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/TankTable/DataTable";
import { columns } from "@/components/TankTable/Columns";
import { SavingsChart } from "@/components/SavingsChart";


export default async function DashboardPage() {
  const data = await getTankData();
  const kpis = aggregateKPIs(data);

  const tankNames = [...new Set(data.map((r) => r.tankName))].sort();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tank Dashboard</h1>

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

      {/* Savings Trend Chart */}
      <SavingsChart data={data} tankNames={tankNames} kpis={kpis} />

      {/* Tank Records Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Cycle Records</h2>
        <DataTable columns={columns} data={data} tankNames={tankNames} />
      </div>
    </main>
  );
}