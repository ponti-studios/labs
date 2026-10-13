import { caseLogos, caseSnapshots } from "~/data/studio";

// Recognizable names first; the strip is proof at a glance, not a full client list.
const LOGO_SLUGS = ["streamyard", "thomson-reuters", "kensho", "humana", "mimecast", "lumina"];

const logos = LOGO_SLUGS.flatMap((slug) => {
  const snapshot = caseSnapshots.find((s) => s.slug === slug);
  const src = caseLogos[slug];
  return snapshot && src ? [{ slug, client: snapshot.client, src }] : [];
});

/** Grayscale client strip that sits directly under the hero. */
export function ClientLogos() {
  return (
    <ul className="border-border grid grid-cols-3 border-t border-l lg:grid-cols-6">
      {logos.map((logo) => (
        <li
          key={logo.slug}
          className="border-border flex h-24 items-center justify-center border-r border-b"
        >
          <img
            src={logo.src}
            alt={logo.client}
            loading="lazy"
            className="h-10 w-24 object-contain opacity-70 grayscale"
          />
        </li>
      ))}
    </ul>
  );
}
