import LeadsTable from "@/components/leads-table";

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bullseye Revenue</h1>
          <p className="text-muted-foreground">GTM Intelligence Dashboard</p>
        </div>
        <LeadsTable />
      </div>
    </div>
  );
}
