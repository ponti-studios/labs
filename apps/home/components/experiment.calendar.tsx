import {
  AlertCircle,
  Check,
  GripVertical,
  MapPin,
  MessageSquare,
  Plus,
  Settings,
} from "lucide-react";
import React, { useRef, useState } from "react";

// --- Mock Data ---
const initialEvents = [
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

// --- Avatar Component ---
const AvatarGroup = ({ initials }) => (
  <div className="flex -space-x-2">
    {initials.map((initial, idx) => (
      <div
        key={idx}
        className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white
          ${idx % 3 === 0 ? "bg-blue-500" : idx % 3 === 1 ? "bg-emerald-500" : "bg-purple-500"}`}
      >
        {initial}
      </div>
    ))}
  </div>
);

export default function App() {
  const [events, setEvents] = useState(initialEvents);

  // Drag and Drop Refs
  const dragItem = useRef();
  const dragOverItem = useRef();

  const handleDragStart = (e, position) => {
    dragItem.current = position;
    // Slight visual feedback while dragging
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";

    // If dropped outside a valid target
    if (dragOverItem.current === null || dragOverItem.current === undefined) return;

    const copyListItems = [...events];
    const dragItemContent = copyListItems[dragItem.current];

    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);

    dragItem.current = null;
    dragOverItem.current = null;

    setEvents(copyListItems);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  // --- Render Event Variations ---
  const renderEventContent = (event) => {
    switch (event.type) {
      case "past":
        return (
          <div className="bg-gray-100 rounded-xl p-3 border border-gray-200 text-gray-400">
            <div className="text-xs font-medium mb-1">
              {event.time} - {event.endTime}
            </div>
            <div className="text-sm">{event.title}</div>
          </div>
        );

      case "split":
        return (
          <div className="flex gap-2 relative">
            {/* The subtle red glow for the conflict */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-full bg-red-400/30 blur-xl pointer-events-none rounded-full" />

            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3 shadow-sm z-10 relative">
              <div className="text-xs text-gray-500 font-medium mb-1">
                {event.time} - {event.endTime}
              </div>
              <div className="text-sm font-medium text-gray-800 mb-2">{event.events[0].title}</div>
              {event.events[0].participants && (
                <AvatarGroup initials={event.events[0].participants} />
              )}
            </div>

            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3 shadow-sm z-10 relative">
              <div className="text-xs text-gray-500 font-medium mb-1">{event.time}</div>
              <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                {event.events[1].title}
                {event.events[1].icon}
              </div>
            </div>
          </div>
        );

      case "collision":
        return (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-red-600 mb-1">
                {event.time} - {event.endTime}
              </div>
              <div className="text-sm font-bold text-red-900">{event.title}</div>
            </div>
            <AlertCircle className="text-red-500 w-5 h-5 mt-1" />
          </div>
        );

      case "nested":
        return (
          <div className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <div className="p-3">
              <div className="text-xs text-gray-500 font-medium mb-1">
                {event.time} - {event.endTime}
              </div>
              <div className="text-sm font-medium text-gray-800">{event.title}</div>
            </div>

            {/* Nested Sub-event */}
            <div className="mx-2 mb-2 bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  {event.subEvent.completed && <Check size={14} />}
                </button>
                <div>
                  <div className="text-[10px] text-gray-500 font-medium">{event.subEvent.time}</div>
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
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <div className="text-xs text-gray-500 font-medium mb-1">
              {event.time} - {event.endTime}
            </div>
            <div className="text-sm font-medium text-gray-800 flex items-center justify-between">
              <span>{event.title}</span>
              <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24">
      {/* Mobile-width container to enforce the "Feed" constraint */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden">
        {/* Sticky Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 z-50">
          <h1 className="text-xl font-bold tracking-tight">Today</h1>
          <p className="text-sm text-gray-500">Thursday, April 9</p>
        </header>

        {/* The Feed Stream */}
        <div className="relative pt-4">
          {/* NOW Line Indicator (Statically placed after the first past event for demo purposes) */}
          <div className="absolute top-[108px] left-0 w-full flex items-center z-40 pointer-events-none">
            <div className="w-16 flex justify-end pr-2">
              <span className="text-[10px] font-bold text-teal-600 bg-white px-1">10:15 AM</span>
            </div>
            <div className="flex-1 h-[2px] bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)] relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-teal-500"></div>
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
              className={`
                group relative grid grid-cols-[64px_1fr] gap-3 px-4 py-3 border-b border-gray-50
                cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors
                ${event.type === "past" ? "opacity-60 grayscale-[0.5]" : ""}
              `}
            >
              {/* Drag Handle (Appears on hover) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
                <GripVertical size={16} />
              </div>

              {/* Gutter: Time & Transit Lines */}
              <div className="relative flex flex-col items-end pt-3 pr-2 border-r border-gray-100">
                <span className="text-[10px] font-medium text-gray-400 text-right">
                  {event.time}
                </span>

                {/* Transit / Leading Line visualization */}
                {event.transit && (
                  <>
                    <div className="absolute right-[-1px] top-[-20px] h-6 w-[2px] bg-gray-300 rounded-full" />
                    <span className="absolute top-[-15px] right-2 text-[8px] text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {event.transitTime} Transit
                    </span>
                  </>
                )}
              </div>

              {/* Event Content */}
              <div className="relative w-full">{renderEventContent(event)}</div>
            </div>
          ))}
        </div>

        {/* Floating Action Button (Quick Add) */}
        <button className="absolute bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}
