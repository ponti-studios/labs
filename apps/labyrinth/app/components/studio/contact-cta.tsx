import { Button } from "@pontistudios/ui";
import { BOOK_CALL_URL, CONTACT_EMAIL } from "~/data/studio";
import { t } from "~/translations";

type ContactCtaProps = {
  title: string;
  description?: string;
  /** When true, adds a bottom border (default). Set false on final page sections. */
  bordered?: boolean;
  className?: string;
};

export function ContactCta({
  title,
  description,
  bordered = true,
  className,
}: ContactCtaProps) {
  return (
    <section
      className={[
        "flex flex-col gap-4 py-16",
        bordered ? "border-border/60 border-b" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-2">
        <h2 className="heading-2 text-foreground">{title}</h2>
        {description ? (
          <p className="body-1 text-muted-foreground max-w-xl">{description}</p>
        ) : null}
      </div>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.common.contactSteps.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-2">
            <span className="ui-eyebrow">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="subheading-3 text-foreground">{step.title}</h3>
            <p className="body-3 text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild size="lg">
          <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
            {t.common.bookCall}
          </a>
        </Button>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="body-2 text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
      <p className="body-4 text-muted-foreground">{t.common.replyWithin}</p>
    </section>
  );
}
