import { ArrowDown, Clock3, MapPin, Radio, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DAY_OFFSETS = [-1, 0, 1] as const;

export type DayOffset = (typeof DAY_OFFSETS)[number];

export type CalendarEventContext = {
  id: string;
  label: string;
  detail: string;
  icon: "radio" | "sparkles" | "clock";
};

export type CalendarEvent = {
  id: string;
  dayOffset: DayOffset;
  startMinute: number;
  endMinute: number;
  title: string;
  detail: string;
  location?: string;
  lane?: "primary" | "parallel";
  kind: "foreground" | "transition" | "milestone";
  contexts?: CalendarEventContext[];
};

export type CalendarProps = {
  getEvents: (nowMinute: number) => CalendarEvent[];
};

const iconForContext = {
  radio: Radio,
  sparkles: Sparkles,
  clock: Clock3,
} as const;

type TemporalCondition = "past" | "present" | "future";

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
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

function formatDuration(startMinute: number, endMinute: number) {
  const duration = Math.max(0, endMinute - startMinute);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}m`;
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

function getCondition(event: CalendarEvent, nowMinute: number): TemporalCondition {
  if (event.dayOffset < 0 || (event.dayOffset === 0 && event.endMinute < nowMinute)) {
    return "past";
  }

  if (event.dayOffset === 0 && event.startMinute <= nowMinute && event.endMinute >= nowMinute) {
    return "present";
  }

  return "future";
}

function TemporalContext({ context }: { context: CalendarEventContext }) {
  const Icon = iconForContext[context.icon];

  return (
    <div className="border-border min-w-0 border-t pt-2">
      <div className="subtext-lg text-muted-foreground flex items-center gap-1.5 font-semibold tracking-tight uppercase">
        <Icon aria-hidden="true" className="size-3.5 shrink-0" />
        <span>{context.label}</span>
      </div>
      <p className="text-foreground mt-1 text-sm">{context.detail}</p>
    </div>
  );
}

function TemporalMoment({ event, nowMinute }: { event: CalendarEvent; nowMinute: number }) {
  const condition = getCondition(event, nowMinute);
  const isPresent = condition === "present";
  const isPast = condition === "past";
  const Icon = event.kind === "transition" ? Clock3 : isPresent ? Sparkles : null;

  return (
    <article
      className={`relative border-l-2 pr-1 pl-4 transition-colors duration-150 md:pr-0 md:pl-6 ${
        isPresent
          ? "border-accent bg-accent/5 py-6"
          : isPast
            ? "border-border py-3"
            : "border-border border-dashed py-4"
      }`}
      data-event-condition={condition}
      data-event-state={isPresent ? "current" : condition}
      data-event-id={event.id}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums">
            {Icon && <Icon aria-hidden="true" className="text-accent size-4 shrink-0" />}
            <span>{formatTime(event.startMinute)}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDuration(event.startMinute, event.endMinute)}</span>
            {isPresent && <span className="text-accent font-semibold uppercase">Here</span>}
          </div>

          <h3
            className={`${isPresent ? "text-xl font-semibold tracking-tight" : "text-base font-semibold"} mt-2`}
          >
            {event.title}
          </h3>
          <p
            className={`${isPresent ? "text-sm" : "text-sm"} text-muted-foreground mt-1 max-w-2xl`}
          >
            {event.detail}
          </p>

          {event.location && (
            <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              {event.location}
            </p>
          )}
        </div>

        {isPresent && (
          <span className="text-accent hidden shrink-0 pt-1 text-xs uppercase sm:inline">
            Happening now
          </span>
        )}
      </div>

      {event.contexts && event.contexts.length > 0 && (
        <div className={`${isPresent ? "mt-6" : "mt-3"} pl-3`}>
          <p className="ui-data-label text-muted-foreground mb-2">Also here</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {event.contexts.map((context) => (
              <TemporalContext key={context.id} context={context} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function DayLandmark({
  date,
  offset,
  events,
  nowMinute,
}: {
  date: Date;
  offset: DayOffset;
  events: CalendarEvent[];
  nowMinute: number;
}) {
  const dayEvents = events
    .filter((event) => event.dayOffset === offset)
    .sort((a, b) => a.startMinute - b.startMinute);

  return (
    <section data-stream-day={offset}>
      <header className="flex items-center gap-3 py-8">
        <h2 className="ui-data-label text-foreground">{formatDay(date, offset)}</h2>
        <p className="text-muted-foreground text-sm">{formatDate(date)}</p>
        <div className="border-border ml-1 h-px flex-1 border-t" />
      </header>

      <div className="space-y-3">
        {dayEvents.map((event) => (
          <TemporalMoment key={event.id} event={event} nowMinute={nowMinute} />
        ))}
      </div>
    </section>
  );
}

export function Calendar({ getEvents }: CalendarProps) {
  const [now, setNow] = useState<Date | null>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const hasPositionedNow = useRef(false);

  useEffect(() => {
    const updateNow = () => setNow(new Date());
    updateNow();
    const intervalId = window.setInterval(updateNow, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const nowMinute = now ? now.getHours() * 60 + now.getMinutes() : 12 * 60;
  const events = useMemo(() => getEvents(nowMinute), [getEvents, nowMinute]);

  const scrollToNow = useCallback((behavior: ScrollBehavior = "smooth") => {
    const currentEvent = streamRef.current?.querySelector<HTMLElement>(
      '[data-event-state="current"]',
    );

    currentEvent?.scrollIntoView({ behavior, block: "center", inline: "nearest" });
  }, []);

  useEffect(() => {
    if (now && !hasPositionedNow.current) {
      hasPositionedNow.current = true;
      requestAnimationFrame(() => scrollToNow("auto"));
    }
  }, [now, scrollToNow]);

  return (
    <section aria-label="A continuous stream of lived time">
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-xs">A day in motion</p>
        <button
          type="button"
          onClick={() => scrollToNow()}
          aria-label="Return to now"
          className="border-border bg-card text-foreground hover:bg-popover focus-visible:outline-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowDown aria-hidden="true" className="size-4" />
          Now
        </button>
      </div>

      <div ref={streamRef}>
        {now ? (
          DAY_OFFSETS.map((offset) => (
            <DayLandmark
              key={offset}
              date={addDays(now, offset)}
              offset={offset}
              events={events}
              nowMinute={nowMinute}
            />
          ))
        ) : (
          <div className="text-muted-foreground flex min-h-96 items-center justify-center p-6 text-sm">
            Finding your place in time…
          </div>
        )}
      </div>
    </section>
  );
}
