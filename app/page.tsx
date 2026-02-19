import { getTankData } from "@/lib/GetTankData";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const data = await getTankData();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tank Dashboard</h1>
      <DashboardClient data={data} />
    </main>
  );
}