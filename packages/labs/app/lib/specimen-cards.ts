import type { SpecimenProject } from "~/components/projects/specimen-card";
import type { Project } from "~/data/projects";
import { t } from "~/translations";

/** The specimen-tag representation of a catalog project, for the /projects grid. */
export function toSpecimenCard(project: Project): SpecimenProject {
  return {
    id: project.slug,
    href: `/projects/${project.slug}`,
    logo: project.logo,
    logoAlt: `${project.name} logo`,
    title: project.name,
    category: project.category,
    status: t.projects.statusLabels[project.status],
    tech: project.tech,
  };
}
