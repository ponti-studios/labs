import { useProjects } from "~/lib/projects";

export default function ProjectsRoute() {
  const { data: projects = [] } = useProjects();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Projects</h1>
      <ul className="mt-4 space-y-2">
        {projects.map((project) => (
          <li key={project.id} className="rounded-md border border-white/10 bg-white/5 p-3">
            {project.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
