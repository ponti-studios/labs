import { ArrowDown, CalendarDays, Clock3, MapPin, Radio, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function meta() {
  return [{ title: "Calendar | Labyrinth" }];
}

const MINUTE_HEIGHT = 2;
const MINUTES_PER_DAY = 24 * 60;
const DAY_OFFSETS = [-1, 0, 1] as const;
type DayOffset = (typeof DAY_OFFSETS)[number];

type TemporalContext = {
  id: string;
  label: string;
  detail: string;
  icon: "radio" | "sparkles" | "clock";
};

type TemporalEvent = {
  id: string;
  dayOffset: DayOffset;
  startMinute: number;
  endMinute: number;
  title: string;
  detail: string;
  location?: string;
  lane?: "primary" | "parallel";
  kind: "foreground" | "transition" | "milestone";
  contexts?: TemporalContext[];
};

const iconForContext = {
  radio: Radio,
  sparkles: Sparkles,
  clock: Clock3,
} as const;

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function clampMinute(value: number) {
  return Math.min(MINUTES_PER_DAY - 1, Math.max(0, value));
}

function formatTime(minute: number) {
  const hours = Math.floor(minute / 60);
  const minutes = minute % 60;
  const date = new Date(2020, 0, 1, hours, minutes);

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDay(date: Date, offset: DayOffset) {
  if (offset === 0) return "Today";
  if (offset === -1) return "Yesterday";
  if (offset === 1) return "Tomorrow";

  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function createEvents(nowMinute: number): TemporalEvent[] {
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
          label: "Contained moment",
          detail: "Submit draft · 3:00 PM",
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
          detail: "A second context sharing the moment",
          icon: "radio",
        },
        {
          id: "today-generators",
          label: "Image generators",
          detail: "Running in the background",
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

function isEventPast(event: TemporalEvent, nowMinute: number) {
  return event.dayOffset < 0 || (event.dayOffset === 0 && event.endMinute < nowMinute);
}

function isEventCurrent(event: TemporalEvent, nowMinute: number) {
  return event.dayOffset === 0 && event.startMinute <= nowMinute && event.endMinute >= nowMinute;
}

function TimelineEvent({ event, nowMinute }: { event: TemporalEvent; nowMinute: number }) {
  const isPast = isEventPast(event, nowMinute);
  const isCurrent = isEventCurrent(event, nowMinute);
  const width = event.lane === "parallel" ? "w-[calc(66%-8px)]" : "w-[calc(100%-16px)]";
  const left = event.lane === "parallel" ? "left-[34%]" : "left-2";
  const Icon = isCurrent ? Sparkles : event.kind === "transition" ? Clock3 : CalendarDays;

  return (
    <article
      className={`absolute z-10 ${left} ${width} overflow-hidden rounded-lg border p-3 transition-colors duration-150 ${
        isCurrent
          ? "border-accent bg-accent/10"
          : event.kind === "transition"
            ? "border-border bg-muted/40 border-dashed"
            : "border-border bg-card"
      } ${isPast ? "text-muted-foreground" : "text-foreground"}`}
      style={{
        top: `${event.startMinute * MINUTE_HEIGHT}px`,
        minHeight: `${Math.max((event.endMinute - event.startMinute) * MINUTE_HEIGHT, 72)}px`,
      }}
      data-event-state={isCurrent ? "current" : isPast ? "past" : "future"}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="body-4 text-muted-foreground flex items-center gap-2 uppercase">
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span>
              {formatTime(event.startMinute)} — {formatTime(event.endMinute)}
            </span>
            {isCurrent && <span className="text-accent">Now</span>}
          </div>
          <h3 className="heading-4 mt-2 truncate">{event.title}</h3>
          <p className="body-3 text-muted-foreground mt-1 max-w-2xl">{event.detail}</p>
          {event.location && (
            <p className="body-4 text-muted-foreground mt-2 flex items-center gap-1.5">
              <MapPin aria-hidden="true" className="size-3.5" />
              {event.location}
            </p>
          )}
        </div>
      </div>

      {event.contexts && event.contexts.length > 0 && (
        <div className="border-border/60 mt-3 grid gap-2 border-t pt-2 sm:grid-cols-2">
          {event.contexts.map((context) => {
            const ContextIcon = iconForContext[context.icon];

            return (
              <div key={context.id} className="bg-muted/60 rounded-md p-2">
                <div className="subheading-3 text-muted-foreground flex items-center gap-1.5 uppercase">
                  <ContextIcon aria-hidden="true" className="size-3.5" />
                  {context.label}
                </div>
                <p className="body-4 text-foreground mt-1">{context.detail}</p>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

function DayStream({
  date,
  offset,
  events,
  nowMinute,
}: {
  date: Date;
  offset: DayOffset;
  events: TemporalEvent[];
  nowMinute: number;
}) {
  const dayEvents = events.filter((event) => event.dayOffset === offset);

  return (
    <section className="border-border/60 relative border-b" data-stream-day={offset}>
      <header className="bg-background border-border/60 sticky top-0 z-10 flex items-baseline gap-3 border-b px-4 py-4 md:px-6">
        <h2 className="heading-2 text-foreground">{formatDay(date, offset)}</h2>
        <p className="body-3 text-muted-foreground">{formatDate(date)}</p>
      </header>

      <div className="relative" style={{ height: `${MINUTES_PER_DAY * MINUTE_HEIGHT}px` }}>
        {Array.from({ length: 24 }, (_, hour) => (
          <div
            key={hour}
            className="border-border/40 pointer-events-none absolute inset-x-0 border-t"
            style={{ top: `${hour * 60 * MINUTE_HEIGHT}px` }}
          >
            <span className="body-4 text-muted-foreground absolute top-2 left-4 w-14 text-right md:left-6">
              {formatTime(hour * 60)}
            </span>
          </div>
        ))}

        <div className="border-border/60 absolute inset-y-0 left-[88px] border-l md:left-[112px]" />

        <div className="absolute inset-y-0 right-4 left-[104px] md:right-6 md:left-[128px]">
          {dayEvents.map((event) => (
            <TimelineEvent key={event.id} event={event} nowMinute={nowMinute} />
          ))}
        </div>

        {offset === 0 && (
          <div
            className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
            data-now-marker="true"
            style={{ top: `${nowMinute * MINUTE_HEIGHT}px` }}
          >
            <span className="body-4 text-accent bg-background ml-4 w-14 pr-2 text-right font-semibold uppercase md:ml-6">
              Now
            </span>
            <div className="bg-accent h-px flex-1" />
            <div className="bg-accent size-2 -translate-x-1 rounded-full" />
          </div>
        )}
      </div>
    </section>
  );
}

export default function CalendarExperiment() {
  const [now, setNow] = useState<Date | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const hasScrolledToNow = useRef(false);

  useEffect(() => {
    const updateNow = () => setNow(new Date());
    updateNow();
    const intervalId = window.setInterval(updateNow, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const nowMinute = now ? now.getHours() * 60 + now.getMinutes() : 12 * 60;
  const events = useMemo(() => createEvents(nowMinute), [nowMinute]);

  const scrollToDay = useCallback((offset: DayOffset) => {
    const container = timelineRef.current;
    const day = container?.querySelector<HTMLElement>(`[data-stream-day="${offset}"]`);

    if (!container || !day) return;

    container.scrollTo({ top: day.offsetTop, behavior: "auto" });
  }, []);

  const scrollToNow = useCallback(() => {
    const container = timelineRef.current;
    const marker = container?.querySelector<HTMLElement>('[data-now-marker="true"]');

    if (!container || !marker) return;

    const markerTop = marker.getBoundingClientRect().top - container.getBoundingClientRect().top;

    container.scrollTo({
      top: Math.max(0, container.scrollTop + markerTop - container.clientHeight / 2),
      behavior: "auto",
    });
  }, []);

  useEffect(() => {
    if (now && !hasScrolledToNow.current) {
      hasScrolledToNow.current = true;
      scrollToNow();
    }
  }, [now, scrollToNow]);

  return (
    <main className="bg-background text-foreground min-h-[calc(100dvh-6rem)] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-border/60 mb-6 flex flex-col gap-5 border-b pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="ui-data-label mb-2">A continuous view of lived time</p>
            <h1 className="display-2">The shape of a day</h1>
            <p className="body-2 text-muted-foreground mt-2 max-w-2xl">
              One foreground moment. The contexts around it. Everything that came before and is
              waiting ahead.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Calendar navigation">
            <button
              type="button"
              onClick={() => scrollToDay(-1)}
              className="border-border bg-surface text-foreground hover:bg-elevated focus-visible:outline-ring inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Past
            </button>
            <button
              type="button"
              onClick={scrollToNow}
              className="border-border bg-surface text-foreground hover:bg-elevated focus-visible:outline-ring inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <ArrowDown aria-hidden="true" className="size-4" />
              Now
            </button>
            <button
              type="button"
              onClick={() => scrollToDay(1)}
              className="border-border bg-surface text-foreground hover:bg-elevated focus-visible:outline-ring inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Future
            </button>
          </div>
        </header>

        <section aria-label="Continuous calendar stream">
          <div
            ref={timelineRef}
            className="border-border bg-surface max-h-[calc(100dvh-15rem)] scrollbar-gutter-stable overflow-y-auto rounded-xl border"
            tabIndex={0}
          >
            {now ? (
              DAY_OFFSETS.map((offset) => (
                <DayStream
                  key={offset}
                  date={addDays(now, offset)}
                  offset={offset}
                  events={events}
                  nowMinute={nowMinute}
                />
              ))
            ) : (
              <div className="body-2 text-muted-foreground flex min-h-96 items-center justify-center p-6">
                Finding your place in time…
              </div>
            )}
          </div>
        </section>

        <p className="body-3 text-muted-foreground mt-4 max-w-2xl">
          Scroll backward to see what time became. Scroll forward to see what is already shaping the
          present.
        </p>
      </div>
    </main>
  );
}
