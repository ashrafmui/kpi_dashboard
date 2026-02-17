import { getTankData } from "@/lib/GetTankData";
import { TankCard } from "@/components/TankCard";

export default async function DashboardPage() {
  const data = await getTankData();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tank Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((record) => (
          <TankCard key={record.id} record={record} />
        ))}
      </div>
    </main>
  );
}