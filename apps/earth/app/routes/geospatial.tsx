import { activeTab } from "../lib/signals/earth";

export default function Geospatial() {
  activeTab.value = "geospatial";

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Geospatial Search</h2>
      <p className="text-text-secondary text-sm">Search and explore geographic data.</p>
    </div>
  );
}
