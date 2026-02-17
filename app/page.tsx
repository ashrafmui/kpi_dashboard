import { getTankData } from "@/lib/GetTankData";
import { aggregateKPIs } from "@/lib/AggregateTanks";
import { KPICard } from "@/components/KPICard";
import { TankCard } from "@/components/TankCard";

export default async function DashboardPage() {
  const data = await getTankData();
  const kpis = aggregateKPIs(data);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tank Dashboard</h1>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Time Saved"
          value={`${(kpis.totalTimeSaved / 60).toFixed(1)} min`}
          subtitle={`Across ${kpis.totalRecords} cycles`}
        />
        <KPICard
          title="Total Energy Saved"
          value={`${kpis.totalEnergySaved} kWh`}
          subtitle={`Across ${kpis.totalRecords} cycles`}
        />
        <KPICard
          title="Total Water Saved"
          value={`${kpis.totalWaterSaved} gal`}
          subtitle={`From ${kpis.waterRecordCount} of ${kpis.totalRecords} cycles`}
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

      {/* Individual Tank Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((record) => (
          <TankCard key={record.id} record={record} />
        ))}
      </div>
    </main>
  );
}