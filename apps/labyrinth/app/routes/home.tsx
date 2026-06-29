import { ParticleBackground } from "@pontistudios/ui";

type NavEntry = {
  path: string;
  label: string;
  source?: string;
};

type Category = {
  name: string;
  entries: NavEntry[];
};

const categories: Category[] = [
  {
    name: "Games",
    entries: [
      { path: "/games/realitea", label: "RealiTea" },
      { path: "/games/cards", label: "Cards" },
      { path: "/games/tetris", label: "Tetris" },
    ],
  },
  {
    name: "Experiments",
    entries: [
      { path: "/experiments/career-resume-animated", label: "Career Resume Animated" },
      { path: "/experiments/calendar", label: "Calendar" },
      { path: "/experiments/pixel-descent.html", label: "Pixel Descent" },
      { path: "/experiments/theatre-management", label: "Theatre Management" },
      { path: "/experiments/llm-interface", label: "LLM Interface" },
      { path: "/experiments/glass", label: "Glass" },
      { path: "/experiments/threegl-web-request", label: "ThreeGL Web Request" },
      { path: "/experiments/threegl-image-gallery", label: "ThreeGL Image Gallery" },
      { path: "/experiments/infinite-scroll", label: "Infinite Scroll" },
    ],
  },
  {
    name: "Tools",
    entries: [
      { path: "/gen/image", label: "Image Generation" },
      { path: "/tarot", label: "Tarot" },
      { path: "/covid", label: "COVID Analytics" },
    ],
  },
  {
    name: "Challenges",
    entries: [
      { path: "/challenges/anagrams", label: "Group Anagrams", source: "ChartHop" },
      {
        path: "/challenges/click-therapeutics",
        label: "Election Vote Counter",
        source: "Click Therapeutics",
      },
      {
        path: "/challenges/cloudmargin",
        label: "Financial Accruals Manager",
        source: "CloudMargin",
      },
      { path: "/challenges/cloud-pricing", label: "Cloud Cost Calculator" },
      { path: "/challenges/fee-or-upfront", label: "Payment Fee Calculator" },
      {
        path: "/challenges/search-studio",
        label: "Search Studio",
        source: "Vendigo + Kensho",
      },
      {
        path: "/challenges/peterson-academy",
        label: "Infinite Image Carousel",
        source: "Peterson Academy",
      },
      { path: "/challenges/prime-countdown", label: "Prime Number Countdown" },
      { path: "/challenges/qubit", label: "CSS Selector Engine", source: "Qubit" },
      { path: "/challenges/red-badger", label: "Mars Robot Navigator", source: "Red Badger" },
    ],
  },
];

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: "Labyrinth" },
    { name: "description", content: "A portfolio of experiments, games, tools, and challenges." },
  ];
}

export default function Home() {
  return (
    <section className="relative mx-auto w-full">
      <ParticleBackground />
      <div className="bg-background w-full">
        <div className="grid gap-8 sm:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-4">
              <h2 className="ui-eyebrow">{cat.name}</h2>
              <ul className="flex flex-col gap-2">
                {cat.entries.map((entry) => (
                  <li key={entry.path}>
                    <a
                      href={entry.path}
                      title={entry.source ? `Source: ${entry.source}` : undefined}
                      className="hover:bg-muted hover:text-foreground focus-visible:text-foreground focus-visible:outline-ring rounded-md  transition-colors duration-100 focus-visible:outline-1 focus-visible:outline-offset-4"
                    >
                      {entry.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
