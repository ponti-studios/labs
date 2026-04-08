import MarkdownUpload from '../components/MarkdownUpload';
import VectorSearch from '../components/VectorSearch';

export default function VectorSearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-center text-xl font-medium text-gray-900">Search</h1>

        <div className="space-y-8">
          <MarkdownUpload />
          <VectorSearch />
        </div>
      </div>
    </div>
  );
}
