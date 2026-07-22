import { motion, useReducedMotion } from "framer-motion";
import { t } from "~/translations";

const copy = t.manifesto;

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: copy.meta.title }, { name: "description", content: copy.meta.description }];
}

function ManifestoHeroHeadline() {
  const reduceMotion = useReducedMotion();
  return (
    <h1 className="display-1 text-foreground flex max-w-4xl flex-wrap items-baseline gap-x-3 gap-y-1">
      <span>{copy.hero.title}</span>
      <motion.span
        className="text-accent"
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.35, ease: "easeOut" }}
      >
        {copy.hero.punch}
      </motion.span>
    </h1>
  );
}

export default function Manifesto() {
  return (
    <div className="page-bleed">
      {/* Hero */}
      <section className="section section-hero">
        <ManifestoHeroHeadline />
        <p className="text-base text-muted-foreground max-w-2xl">{copy.hero.body}</p>
      </section>

      {/* Tenets — single-column editorial list, one idea at a time */}
      <section className="section gap-12">
        <ol className="flex flex-col gap-12">
          {copy.tenets.items.map((tenet, index) => (
            <li
              key={tenet.title}
              className="grid gap-3 sm:grid-cols-[minmax(0,4rem)_1fr] sm:gap-10"
            >
              <span className="text-sm text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex max-w-3xl flex-col gap-3">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">{tenet.title}</h2>
                <p className="text-base text-muted-foreground">{tenet.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing pull-quote */}
      <section className="section section-hero border-b-0">
        <blockquote className="display-2 text-accent max-w-3xl">
          &ldquo;{copy.quote}&rdquo;
        </blockquote>
      </section>
    </div>
  );
}
