import { Link } from "react-router";

const experiments = [
  {
    name: "threegl-web-request",
    path: "/experiments/threegl-web-request",
    description:
      "Three.js visualization of web request flow across load balancer, cache, and database",
  },
  {
    name: "threegl-image-gallery",
    path: "/experiments/threegl-image-gallery",
    description: "Three.js based 3D image gallery experiment",
  },
];

export default function Experiments() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6">Experiments</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Interactive experiments migrated from the legacy experiments-data and experiments-web apps.
      </p>
      <div className="grid gap-4">
        {experiments.map((experiment) => (
          <Link
            key={experiment.name}
            to={experiment.path}
            className="block p-6 border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
          >
            <h2 className="mb-2">{experiment.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{experiment.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
