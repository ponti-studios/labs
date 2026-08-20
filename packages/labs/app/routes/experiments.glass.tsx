import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ponti-studios/ui/data-display";
import { Button, Label } from "@ponti-studios/ui/primitives";
import { cn } from "@ponti-studios/ui/utilities";
import { Input, Slider } from "@ponti-studios/ui/forms";
import { useState } from "react";
import { computeDisplacements, LiquidGlass } from "~/components/LiquidGlass";

const HOW_IT_WORKS_URL =
  "https://github.com/ponti-studios/labs/blob/main/docs/experiments/glass-refraction.md";

export function meta() {
  return [{ title: "Glassmorphism | Experiments" }];
}

function HowItWorksLink({ className }: { className?: string }) {
  return (
    <a
      href={HOW_IT_WORKS_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-slate-700",
        className,
      )}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s4.332.477 5.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      How it works
    </a>
  );
}

export default function ExperimentsGlass() {
  const [displacements, setDisplacements] = useState(() => computeDisplacements(20, 2));
  const [backgroundImage, setBackgroundImage] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg",
  );
  const [controlsOpen, setControlsOpen] = useState(false);

  return (
    <div className="w-full bg-slate-950 text-white">
      {/* Interactive Glass Section */}
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Controls panel — Mobile: bottom sheet, Desktop: sidebar */}
        <div
          className={cn(
            "bg-card z-50 rounded-lg transition-all duration-300",
            // Mobile: bottom sheet
            "fixed right-0 bottom-0 left-0 md:absolute md:top-4 md:right-4 md:bottom-auto",
            "w-full md:w-auto md:max-w-72",
            "max-h-[60vh] overflow-y-auto md:max-h-none md:overflow-visible",
            "rounded-t-lg rounded-b-none md:rounded-lg md:rounded-b-lg",
            "p-4 md:p-3",
            "border-t border-slate-700 md:border-t-0",
            // Show/hide logic
            controlsOpen ? "translate-y-0" : "translate-y-full md:translate-y-0",
          )}
        >
          {/* Mobile close button */}
          <button
            onClick={() => setControlsOpen(false)}
            className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-200 md:hidden"
            aria-label="Close controls"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs font-medium">Glass Effect</p>
            <a
              href={HOW_IT_WORKS_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden text-xs text-cyan-400 hover:text-cyan-300 md:inline"
            >
              How it works ↗
            </a>
          </div>
          <p className="mb-3 text-sm">
            Drag the glass overlay to view chromatic aberration using SVG displacement maps.
          </p>

          <div className="space-y-2 py-2">
            <label htmlFor="background-url" className="text-muted-foreground text-xs">
              Background
            </label>
            <div className="flex gap-2">
              <Input
                id="background-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={backgroundImage}
                onChange={(e) => setBackgroundImage(e.target.value)}
                onDrop={(e) => {
                  e.preventDefault();
                  const url = e.dataTransfer.getData("text/plain");
                  if (url.startsWith("http")) setBackgroundImage(url);
                }}
                onDragOver={(e) => e.preventDefault()}
              />
              <Button onClick={() => setBackgroundImage("")}>Clear</Button>
            </div>
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="displacement">
              <AccordionTrigger>Displacement</AccordionTrigger>
              <AccordionContent className="space-y-4">
                {(
                  [
                    { channel: "red", color: "bg-red-500", label: "Red" },
                    { channel: "green", color: "bg-green-500", label: "Green" },
                    { channel: "blue", color: "bg-blue-500", label: "Blue" },
                  ] as const
                ).map(({ channel, color, label }) => (
                  <div key={channel} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={channel}
                        className="text-muted-foreground flex items-center gap-2"
                      >
                        <span className={cn("inline-block size-2 rounded-full", color)} />
                        {label}
                      </Label>
                      <span className="text-muted-foreground text-sm tabular-nums">
                        {displacements[channel]}
                      </span>
                    </div>
                    <Slider
                      id={channel}
                      min={-300}
                      max={300}
                      value={[displacements[channel]]}
                      onValueChange={([val]) =>
                        setDisplacements((prev) => ({ ...prev, [channel]: val }))
                      }
                    />
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDisplacements(computeDisplacements(20, 2))}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDisplacements({ red: 0, green: 0, blue: 0 })}
                  >
                    No Effect
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div
          data-testid="background-image"
          className="absolute inset-0 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Mobile: Controls toggle + How it works */}
        <div
          className={cn(
            "fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2 transition-all md:hidden",
            controlsOpen ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <button
            onClick={() => setControlsOpen(!controlsOpen)}
            className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-slate-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </button>
          <HowItWorksLink />
        </div>

        {/* Draggable Glass — Responsive sizing */}
        <LiquidGlass
          data-testid="glass-svg"
          displacements={displacements}
          initialPosition={{ x: 50, y: 50 }}
        />
      </div>
    </div>
  );
}

