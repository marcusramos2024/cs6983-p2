import Link from "next/link";

export default function IncidentsPage() {
  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">My incidents</h1>
        <Link
          href="/incidents/new"
          className="px-4 py-2 bg-primary text-card hover:bg-primary/90 font-medium rounded-md text-sm transition-colors"
        >
          Log an incident
        </Link>
      </div>

      <div className="bg-card border border-line rounded-md p-xl text-center">
        <p className="text-muted text-sm mb-md">
          No incidents logged yet. Start a record if you have a maintenance issue.
        </p>
        <Link
          href="/incidents/new"
          className="inline-flex px-4 py-2 bg-primary text-card hover:bg-primary/90 font-medium rounded-md text-sm transition-colors"
        >
          Log an incident
        </Link>
      </div>
    </div>
  );
}

