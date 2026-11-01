import Link from "next/link";
import { IncidentForm } from "@/components/incidents/IncidentForm";

export default function NewIncidentPage() {
  return (
    <div className="space-y-md">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/incidents" className="hover:underline text-ink">
          My incidents
        </Link>{" "}
        / <span className="text-muted">Log an incident</span>
      </nav>

      <IncidentForm />
    </div>
  );
}

