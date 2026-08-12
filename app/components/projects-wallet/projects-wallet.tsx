import { ProjectCard, type FeaturedProject } from "./project-card";

type ProjectsWalletProps = {
  projects: FeaturedProject[];
  ariaLabel?: string;
};

/** Horizontally scrollable row of credit-card-styled featured projects. */
export function ProjectsWallet({ projects, ariaLabel = "Featured projects" }: ProjectsWalletProps) {
  return (
    <ul
      aria-label={ariaLabel}
      className="flex snap-x snap-mandatory scrollbar-thin gap-6 overflow-x-auto pb-2"
    >
      {projects.map((project) => (
        <li key={project.id} className="shrink-0">
          <ProjectCard {...project} data-testid={`featured-project-${project.id}`} />
        </li>
      ))}
    </ul>
  );
}
