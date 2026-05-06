import { Link } from "react-router";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Tempo</h1>
      <p className="text-gray-600 mb-8">Project and task management with AI assistance</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/projects"
          className="p-6 border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Projects</h2>
          <p className="text-gray-600">Manage your projects</p>
        </Link>

        <Link
          to="/tasks"
          className="p-6 border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Tasks</h2>
          <p className="text-gray-600">View and manage all your tasks</p>
        </Link>
      </div>
    </div>
  );
}
