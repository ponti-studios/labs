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
    <article className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {metadata && (
        <footer className="text-sm text-gray-500 border-t pt-4 mt-4">
          <span>By {metadata.author}</span>
          <span className="mx-2">•</span>
          <time>{metadata.date}</time>
        </footer>
      )}
    </article>
  );
}
