import { Avatar, AvatarFallback } from "@pontistudios/ui";
import { t } from "~/translations";

export function Founder() {
  const founder = t.home.founder;

  return (
    <section className="border-border/60 flex flex-col gap-6 border-b py-16">
      <span className="ui-eyebrow">{founder.eyebrow}</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar size="lg">
          <AvatarFallback className="text-sm font-medium">{founder.initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <h2 className="heading-3 text-foreground">{founder.name}</h2>
          <p className="body-2 text-muted-foreground max-w-2xl">{founder.bio}</p>
        </div>
      </div>
    </section>
  );
}
