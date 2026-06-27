import { AlertCircle, Check, GripVertical, Plus, Settings } from "lucide-react";
import type { DragEvent, ReactNode } from "react";
import { useRef, useState } from "react";

export function meta() {
  return [{ title: "Calendar | Labyrinth" }];
}

type CalendarEvent =
  | {
      id: string;
      type: "past";
      time: string;
      endTime: string;
      title: string;
      location: string;
    }
  | {
      id: string;
      type: "split";
      time: string;
      endTime: string;
      events: Array<{
        title: string;
        participants?: string[];
        icon?: ReactNode;
      }>;
    }
  | {
      id: string;
      type: "standard";
      time: string;
      endTime: string;
      title: string;
      transit?: string;
      transitTime?: string;
    }
  | {
      id: string;
      type: "collision";
      time: string;
      endTime: string;
      title: string;
      isHardConflict: boolean;
    }
  | {
      id: string;
      type: "nested";
      time: string;
      endTime: string;
      title: string;
      subEvent: {
        time: string;
        title: string;
        participants: string[];
        completed: boolean;
      };
    };

const initialEvents: CalendarEvent[] = [
  {
    id: "e1",
    type: "past",
    time: "8:00 AM",
    endTime: "9:00 AM",
    title: "Morning Run",
    location: "River Trail",
  },
  {
    id: "e2",
    type: "split",
    time: "9:30 AM",
    endTime: "10:30 AM",
    events: [
      { title: "Design Sync", participants: ["SJ", "ML"] },
      { title: "Server Maintenance", icon: <Settings size={14} className="text-gray-500" /> },
    ],
  },
  {
    id: "e3",
    type: "standard",
    time: "11:00 AM",
    endTime: "11:30 AM",
    title: "Client Presentation: Apex",
    transit: "15m prep",
    transitTime: "10:45 AM",
  },
  {
    id: "e4",
    type: "collision",
    time: "12:00 PM",
    endTime: "1:00 PM",
    title: "Lunch with David vs. Dentist Appt",
    isHardConflict: true,
  },
  {
    id: "e5",
    type: "nested",
    time: "1:30 PM",
    endTime: "5:00 PM",
    title: "Deep Work: Project Sphinx",
    subEvent: {
      time: "3:00 PM",
      title: "Submit Draft",
      participants: ["JC", "LP", "TB"],
      completed: false,
    },
  },
];

const AvatarGroup = ({ initials }: { initials: string[] }) => (
  <div className="flex -space-x-2">
    {initials.map((initial, idx) => (
      <div
        key={`${initial}-${idx}`}
        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white ${
          idx % 3 === 0 ? "bg-blue-500" : idx % 3 === 1 ? "bg-emerald-500" : "bg-purple-500"
        }`}
      >
        {initial}
      </div>
    ))}
  </div>
);

export default function CalendarExperiment() {
  const [events, setEvents] = useState(initialEvents);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnter = (_e: DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = "1";

    if (dragOverItem.current === null || dragOverItem.current === undefined) return;
    if (dragItem.current === null || dragItem.current === undefined) return;

    const copyListItems = [...events];
    const dragItemContent = copyListItems[dragItem.current];

    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);

    dragItem.current = null;
    dragOverItem.current = null;
    setEvents(copyListItems);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const renderEventContent = (event: CalendarEvent) => {
    switch (event.type) {
      case "past":
        return (
          <div className="rounded-xl border border-gray-200 bg-gray-100 p-3 text-gray-400">
            <div className="mb-1 text-xs font-medium">
              {event.time} - {event.endTime}
            </div>
            <div className="text-sm">{event.title}</div>
          </div>
        );
      case "split":
        return (
          <div className="relative flex gap-2">
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-full w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-400/30 blur-xl" />

            <div className="relative z-10 flex-1 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="mb-1 text-xs font-medium text-gray-500">
                {event.time} - {event.endTime}
              </div>
              <div className="mb-2 text-sm font-medium text-gray-800">{event.events[0].title}</div>
              {event.events[0].participants && (
                <AvatarGroup initials={event.events[0].participants} />
              )}
            </div>

            <div className="relative z-10 flex-1 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="mb-1 text-xs font-medium text-gray-500">{event.time}</div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                {event.events[1].title}
                {event.events[1].icon}
              </div>
            </div>
          </div>
        );
      case "collision":
        return (
          <div className="flex items-start justify-between rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm">
            <div>
              <div className="mb-1 text-xs font-medium text-red-600">
                {event.time} - {event.endTime}
              </div>
              <div className="text-sm font-bold text-red-900">{event.title}</div>
            </div>
            <AlertCircle className="mt-1 h-5 w-5 text-red-500" />
          </div>
        );
      case "nested":
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <div className="p-3">
              <div className="mb-1 text-xs font-medium text-gray-500">
                {event.time} - {event.endTime}
              </div>
              <div className="text-sm font-medium text-gray-800">{event.title}</div>
            </div>

            <div className="mx-2 mb-2 flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <button className="flex h-5 w-5 items-center justify-center rounded border border-gray-300 transition-colors hover:bg-gray-100">
                  {event.subEvent.completed && <Check size={14} />}
                </button>
                <div>
                  <div className="text-[10px] font-medium text-gray-500">{event.subEvent.time}</div>
                  <div className="text-sm font-medium text-gray-700">{event.subEvent.title}</div>
                </div>
              </div>
              <AvatarGroup initials={event.subEvent.participants} />
            </div>
          </div>
        );
      case "standard":
      default:
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs text-gray-500">
              {event.time} - {event.endTime}
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-gray-800">
              <span>{event.title}</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                A
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[calc(100dvh-6rem)] w-full bg-gray-50 pb-24 font-sans text-gray-900">
      <div className="relative mx-auto min-h-[calc(100dvh-6rem)] max-w-md overflow-hidden bg-white shadow-2xl">
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 p-4 backdrop-blur-md">
          <h1 className="text-xl font-bold tracking-tight">Today</h1>
          <p className="text-sm text-gray-500">Thursday, April 9</p>
        </header>

        <div className="relative pt-4">
          <div className="pointer-events-none absolute top-[108px] left-0 z-40 flex w-full items-center">
            <div className="w-16 pr-2 text-right">
              <span className="bg-white px-1 text-[10px] font-bold text-teal-600">10:15 AM</span>
            </div>
            <div className="relative h-[2px] flex-1 bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]">
              <div className="absolute top-1/2 left-0 h-2 w-2 -translate-y-1/2 rounded-full bg-teal-500" />
            </div>
          </div>

          {events.map((event, index) => (
            <div
              key={event.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              className={`group relative grid cursor-grab grid-cols-[64px_1fr] gap-3 border-b border-gray-50 px-4 py-3 transition-colors hover:bg-gray-50 active:cursor-grabbing ${
                event.type === "past" ? "opacity-60 grayscale-[0.5]" : ""
              }`}
            >
              <div className="absolute top-1/2 left-0 -translate-y-1/2 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical size={16} />
              </div>

              <div className="relative flex flex-col items-end border-r border-gray-100 pt-3 pr-2">
                <span className="text-right text-[10px] font-medium text-gray-400">
                  {event.time}
                </span>
                {"transit" in event && event.transit && (
                  <>
                    <div className="absolute top-[-20px] right-[-1px] h-6 w-[2px] rounded-full bg-gray-300" />
                    <span className="absolute top-[-15px] right-2 text-[8px] tracking-widest whitespace-nowrap text-gray-400 uppercase">
                      {event.transitTime} Transit
                    </span>
                  </>
                )}
                {"location" in event && (
                  <span className="mt-1 text-right text-[10px] text-gray-300">
                    {event.location}
                  </span>
                )}
              </div>

              <div className="relative w-full">{renderEventContent(event)}</div>
            </div>
          ))}
        </div>

        <button className="absolute right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-xl transition-all hover:scale-105 active:scale-95">
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}
