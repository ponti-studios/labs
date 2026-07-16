import { Calendar, type CalendarEvent } from "../components/calendar/Calendar";

export function meta() {
  return [{ title: "Calendar | Labyrinth" }];
}

function clampMinute(value: number) {
  return Math.min(24 * 60 - 1, Math.max(0, value));
}

export function createShowcaseEvents(nowMinute: number): CalendarEvent[] {
  const currentStart = clampMinute(nowMinute - 45);
  const currentEnd = clampMinute(nowMinute + 45);
  const tennisStart = clampMinute(nowMinute + 300);

  return [
    {
      id: "yesterday-run",
      dayOffset: -1,
      startMinute: 7 * 60 + 30,
      endMinute: 8 * 60 + 20,
      title: "Morning run",
      detail: "A quiet start before the day gathers speed.",
      location: "River trail",
      kind: "foreground",
      contexts: [
        {
          id: "yesterday-run-podcast",
          label: "Podcast",
          detail: "The Daily Practice",
          icon: "radio",
        },
      ],
    },
    {
      id: "yesterday-sync",
      dayOffset: -1,
      startMinute: 9 * 60,
      endMinute: 10 * 60,
      title: "Design sync",
      detail: "Three people, one shared direction.",
      location: "Studio",
      kind: "foreground",
      contexts: [
        {
          id: "yesterday-sync-transit",
          label: "Transit",
          detail: "15 minutes from the river trail",
          icon: "clock",
        },
      ],
    },
    {
      id: "yesterday-lunch",
      dayOffset: -1,
      startMinute: 12 * 60,
      endMinute: 13 * 60,
      title: "Lunch with David",
      detail: "A commitment that shared the same hour as something else.",
      location: "East Village",
      lane: "primary",
      kind: "foreground",
    },
    {
      id: "yesterday-dentist",
      dayOffset: -1,
      startMinute: 12 * 60 + 15,
      endMinute: 13 * 60 + 15,
      title: "Dentist appointment",
      detail: "A collision is part of the day, not an error outside it.",
      location: "West 14th",
      lane: "parallel",
      kind: "foreground",
    },
    {
      id: "yesterday-deep-work",
      dayOffset: -1,
      startMinute: 13 * 60 + 30,
      endMinute: 17 * 60,
      title: "Deep work: Project Sphinx",
      detail: "A long field of attention with a smaller obligation inside it.",
      location: "Studio",
      kind: "foreground",
      contexts: [
        {
          id: "yesterday-draft",
          label: "A deadline inside it",
          detail: "Project Sphinx draft · 3:00 PM",
          icon: "sparkles",
        },
      ],
    },
    {
      id: "today-focus",
      dayOffset: 0,
      startMinute: currentStart,
      endMinute: currentEnd,
      title: "Talking with someone",
      detail: "The foreground activity of this moment.",
      lane: "primary",
      kind: "foreground",
      contexts: [
        {
          id: "today-stream",
          label: "Twitch livestream",
          detail: "A second window open in the same hour",
          icon: "radio",
        },
        {
          id: "today-generators",
          label: "Image generators",
          detail: "Three images finishing in the background",
          icon: "sparkles",
        },
      ],
    },
    {
      id: "today-reset",
      dayOffset: 0,
      startMinute: clampMinute(nowMinute + 60),
      endMinute: clampMinute(nowMinute + 120),
      title: "Open time",
      detail: "Unstructured time is still part of a life.",
      kind: "transition",
    },
    {
      id: "today-tennis",
      dayOffset: 0,
      startMinute: tennisStart,
      endMinute: clampMinute(tennisStart + 90),
      title: "Tennis",
      detail: "A future commitment already shaping the present.",
      location: "North courts",
      kind: "foreground",
    },
    {
      id: "tomorrow-presentation",
      dayOffset: 1,
      startMinute: 10 * 60,
      endMinute: 11 * 60,
      title: "Client presentation",
      detail: "The next day's shape is already beginning to form.",
      location: "Apex HQ",
      kind: "foreground",
      contexts: [
        {
          id: "tomorrow-prep",
          label: "Preparation",
          detail: "15 minutes before the meeting",
          icon: "clock",
        },
      ],
    },
    {
      id: "tomorrow-walk",
      dayOffset: 1,
      startMinute: 18 * 60,
      endMinute: 19 * 60,
      title: "Walk home",
      detail: "A transition that deserves to remain visible.",
      kind: "transition",
    },
  ];
}

export default function CalendarExperiment() {
  return (
    <main className="bg-background text-foreground min-h-screen px-4 pt-4 pb-24 md:px-6 md:pt-6">
      <div className="mx-auto max-w-3xl">
        <header className="border-subtle mb-4 flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <p className="ui-data-label mb-1">Time, as it is lived</p>
            <h1 className="heading-2">Your day in one stream.</h1>
          </div>
          <p className="body-4 text-muted-foreground hidden pt-1 text-right sm:block">
            Calendar experiment
          </p>
        </header>

        <Calendar getEvents={createShowcaseEvents} />
      </div>
    </main>
  );
}
