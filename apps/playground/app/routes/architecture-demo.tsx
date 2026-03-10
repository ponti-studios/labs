// Example route showing Islands Architecture
// This demonstrates Server Components vs Islands working together


import { InteractiveCard } from "~/components/islands/InteractiveCard";
import { StaticCard } from "~/components/server/StaticCard";

// Mock data - in real app, this would come from loader
const serverContent = {
  title: "Architecture Overview",
  description:
    "This page demonstrates the Islands Architecture pattern where static content is rendered on the server (zero JavaScript) while interactive components are selectively hydrated on the client.",
  metadata: {
    author: "Labs Team",
    date: "March 2026",
  },
};

const islandContent = {
  title: "Interactive Features",
  description:
    "This card is an Island - it hydrates on the client to provide interactivity. Notice the like button and expand/collapse functionality. The JavaScript for this component is only loaded when needed.",
  initialLikes: 42,
};

export default function ArchitectureDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Islands Architecture Demo</h1>
        <p className="text-gray-600">
          Server Components (zero JS) + Islands (hydrated) working together
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        {/* Server Component - Zero JavaScript */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Server Component (Static)
          </h2>
          <StaticCard
            title={serverContent.title}
            description={serverContent.description}
            metadata={serverContent.metadata}
          />
          <p className="mt-3 text-sm text-gray-500">
            This card renders entirely on the server. No JavaScript is shipped to the client.
          </p>
        </div>

        {/* Island Component - Hydrated */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Island (Interactive)
          </h2>
          <InteractiveCard
            title={islandContent.title}
            description={islandContent.description}
            initialLikes={islandContent.initialLikes}
            onLike={(count) => console.log(`Liked! Total: ${count}`)}
          />
          <p className="mt-3 text-sm text-gray-500">
            This card hydrates on the client. JavaScript is loaded only for this component.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">How It Works</h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>
              <strong>Server Components:</strong> Render on the server, ship zero JS. Perfect for
              static content, SEO, and initial page load.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">✓</span>
            <span>
              <strong>Islands:</strong> Hydrate selectively on the client. Marked with 'use client'.
              Only load JS for interactive parts.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">✓</span>
            <span>
              <strong>Benefits:</strong> Smaller bundles, better performance, progressive
              enhancement.
            </span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Code Example</h2>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <pre>{`// Server Component (components/server/StaticCard.tsx)
// No 'use client' - renders on server, zero JS
export function StaticCard({ title, description }) {
  return (
    <article>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

// Island Component (components/islands/InteractiveCard.tsx)
'use client' // Hydrates on client
export function InteractiveCard({ title, description }) {
  const [likes, setLikes] = useState(0);
  return (
    <article>
      <h3>{title}</h3>
      <p>{description}</p>
      <button onClick={() => setLikes(l => l + 1)}>
        Likes: {likes}
      </button>
    </article>
  );
}`}</pre>
        </div>
      </section>
    </div>
  );
}
