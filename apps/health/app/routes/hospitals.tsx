import { Button } from "@ponti-studios/ui/primitives";
import { Link } from "react-router";
import { HOSPITALS } from "../lib/hospitals";
import type { Hospital } from "../types/hospital";

export default function HospitalsPage() {
  return (
    <div className="container mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
      <Link to="/" className="text-secondary hover:text-primary inline-flex text-sm">
        ← Dashboard
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">Find Immediate Care</h1>

      <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-4 text-sm">
        For life-threatening emergencies, call <strong>911</strong> immediately.
      </div>

      <div className="border-default bg-inset/30 text-secondary rounded-lg border p-4 text-sm">
        If you need urgent in-person care, call ahead or open directions before leaving.
      </div>

      <h2 className="text-lg font-semibold">Nearest Hospitals</h2>

      <div className="flex flex-col gap-4">
        {HOSPITALS.map((hospital) => (
          <HospitalListItem key={hospital.id} hospital={hospital} />
        ))}
      </div>
    </div>
  );
}

function HospitalListItem({ hospital }: { hospital: Hospital }) {
  return (
    <div className="hover:bg-inset/50 rounded-lg border p-4 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{hospital.name}</h3>
        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
          {hospital.distance}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-secondary text-sm">{hospital.address}</p>
        <p className="text-sm font-medium">{hospital.phone}</p>
      </div>
      <div className="flex gap-2 pt-3">
        <Button variant="outline" asChild>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${hospital.name} ${hospital.address}`,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Get Directions
          </a>
        </Button>
        <Button asChild>
          <a href={`tel:${hospital.phone.replace(/[^\d+]/g, "")}`}>Call</a>
        </Button>
      </div>
    </div>
  );
}
