export const LAYOUT_IDS = ["vertical", "horizontal"] as const;
export type LayoutId = (typeof LAYOUT_IDS)[number];

export function isLayoutId(value: string | undefined): value is LayoutId {
  return value === "vertical" || value === "horizontal";
}

export type MovieTile = {
  id: string;
  name: string;
  category: string;
  logo: string;
};

export const MOVIE_TILES: MovieTile[] = [
  {
    id: "spider-man-brand-new-day",
    name: "Spider-Man: Brand New Day",
    category: "Sony · 2026",
    logo: "/toys/streaming/posters/spider-man-brand-new-day.jpg",
  },
  {
    id: "the-odyssey",
    name: "The Odyssey",
    category: "Universal · 2026",
    logo: "/toys/streaming/posters/the-odyssey.jpg",
  },
  {
    id: "toy-story-5",
    name: "Toy Story 5",
    category: "Pixar · 2026",
    logo: "/toys/streaming/posters/toy-story-5.jpg",
  },
  {
    id: "michael",
    name: "Michael",
    category: "Lionsgate · 2026",
    logo: "/toys/streaming/posters/michael.png",
  },
  {
    id: "super-mario-galaxy",
    name: "The Super Mario Galaxy Movie",
    category: "Universal · 2026",
    logo: "/toys/streaming/posters/super-mario-galaxy.jpeg",
  },
  {
    id: "minions-and-monsters",
    name: "Minions & Monsters",
    category: "Universal · 2026",
    logo: "/toys/streaming/posters/minions-and-monsters.jpg",
  },
  {
    id: "moana",
    name: "Moana",
    category: "Disney · 2026",
    logo: "/toys/streaming/posters/moana.jpg",
  },
  {
    id: "avengers-doomsday",
    name: "Avengers: Doomsday",
    category: "Marvel Studios · 2026",
    logo: "/toys/streaming/posters/avengers-doomsday.jpg",
  },
  {
    id: "dune-part-three",
    name: "Dune: Part Three",
    category: "Warner Bros. · 2026",
    logo: "/toys/streaming/posters/dune-part-three.jpg",
  },
  {
    id: "masters-of-the-universe",
    name: "Masters of the Universe",
    category: "Amazon MGM · 2026",
    logo: "/toys/streaming/posters/masters-of-the-universe.jpeg",
  },
  {
    id: "supergirl",
    name: "Supergirl",
    category: "DC Studios · 2026",
    logo: "/toys/streaming/posters/supergirl.jpg",
  },
  {
    id: "hunger-games-sunrise",
    name: "The Hunger Games: Sunrise on the Reaping",
    category: "Lionsgate · 2026",
    logo: "/toys/streaming/posters/hunger-games-sunrise.jpg",
  },
  {
    id: "the-mandalorian-and-grogu",
    name: "The Mandalorian and Grogu",
    category: "Lucasfilm · 2026",
    logo: "/toys/streaming/posters/the-mandalorian-and-grogu.jpg",
  },
  {
    id: "street-fighter",
    name: "Street Fighter",
    category: "Sony · 2026",
    logo: "/toys/streaming/posters/street-fighter.jpeg",
  },
  {
    id: "project-hail-mary",
    name: "Project Hail Mary",
    category: "Amazon MGM · 2026",
    logo: "/toys/streaming/posters/project-hail-mary.jpg",
  },
  {
    id: "clayface",
    name: "Clayface",
    category: "DC Studios · 2026",
    logo: "/toys/streaming/posters/clayface.jpg",
  },
  {
    id: "werwulf",
    name: "Werwulf",
    category: "Focus Features · 2026",
    logo: "/toys/streaming/posters/werwulf.jpg",
  },
  {
    id: "violent-night-2",
    name: "Violent Night 2",
    category: "Universal · 2026",
    logo: "/toys/streaming/posters/violent-night-2.jpeg",
  },
  {
    id: "scary-movie",
    name: "Scary Movie",
    category: "Paramount · 2026",
    logo: "/toys/streaming/posters/scary-movie.jpg",
  },
  {
    id: "hoppers",
    name: "Hoppers",
    category: "Pixar · 2026",
    logo: "/toys/streaming/posters/hoppers.jpg",
  },
];

export type LayoutMeta = {
  id: LayoutId;
  label: string;
  title: string;
  lede: string;
  whenToUse: string;
  metaTitle: string;
  metaDescription: string;
};

export const LAYOUTS: Record<LayoutId, LayoutMeta> = {
  vertical: {
    id: "vertical",
    label: "Vertical",
    title: "Vertical marquee",
    lede: "An ambient, endlessly scrolling slate. 2026's biggest films drift past on their own — no clicks, no drags, no interruption.",
    whenToUse:
      "Streaming homepages, hero backdrops, login screens — anywhere the service should feel alive without asking for attention.",
    metaTitle: "Vertical Marquee | Toys",
    metaDescription:
      "A seamless, ambient vertical marquee of 2026's biggest films for streaming heroes and full-bleed backdrops.",
  },
  horizontal: {
    id: "horizontal",
    label: "Horizontal",
    title: "Horizontal carousel",
    lede: "A keyboard-ready rail that loops forever. Arrow through it, or let it autoplay through the slate.",
    whenToUse:
      "Streaming rows, browse rails, continue-watching strips — anywhere the viewer is shopping and should stay in control.",
    metaTitle: "Horizontal Carousel | Toys",
    metaDescription:
      "A seamless infinite horizontal carousel of 2026's biggest films with keyboard and autoplay support.",
  },
};