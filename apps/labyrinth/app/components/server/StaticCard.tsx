// Server Component - Static card with data
// This renders on the server and ships zero JavaScript

interface StaticCardProps {
  title: string;
  description: string;
  metadata?: {
    author: string;
    date: string;
  };
}

export function StaticCard({ title, description, metadata }: StaticCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-2">{title}</h3>
      <p className="mb-4 text-gray-600">{description}</p>
      {metadata && (
        <footer className="mt-4 border-t pt-4 text-sm text-gray-500">
          <span>By {metadata.author}</span>
          <span className="mx-2">•</span>
          <time>{metadata.date}</time>
        </footer>
      )}
    </article>
  );
}
