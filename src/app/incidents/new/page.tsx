import React from "react";
import Link from "next/link";
import IncidentForm from "@/components/IncidentForm";

export default function NewIncidentPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-md">
      <div>
        <p className="text-sm text-muted mb-xs">
          <Link href="/incidents" className="hover:text-primary transition-colors">
            &larr; My incidents
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-ink">Log an incident</h1>
        <p className="text-sm text-muted mt-xs">
          Document what happened, attach photos, and log when and how you reported it to your landlord.
        </p>
      </div>

      <IncidentForm />
    </div>
  );
}

