import { LucideArrowRightCircle } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router";
import { CardCarousel } from "~/components/CardCarousel";
import { ProjectCard } from "~/components/projects/project-card";
import { CLIENT_CARDS } from "~/lib/client-cards";
import { t } from "~/translations";

/** Same credit-card carousel as FeaturedProjects, populated from past client work. */
export const FeaturedClients = memo(function FeaturedClients() {
  return (
    <section className="bg-accent flex flex-col gap-8 rounded-4xl px-6 py-12">
      <div className="flex items-center gap-12">
        <h2 id="clients-title" className="heading-cta text-foreground max-w-3xl">
          {t.home.clients.title}
        </h2>
        <Link to="/work" prefetch="intent">
          <LucideArrowRightCircle size={48} />
        </Link>
      </div>
      <CardCarousel
        ariaLabel={t.home.clients.title}
        items={CLIENT_CARDS}
        getKey={(client) => client.id}
        renderItem={(client) => (
          <ProjectCard {...client} data-testid={`featured-client-${client.id}`} />
        )}
      />
    </section>
  );
});
