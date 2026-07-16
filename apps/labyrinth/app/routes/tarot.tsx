import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@pontistudios/ui/data-display";
import { Badge, Button, Card } from "@pontistudios/ui/primitives";
import { motion } from "framer-motion";
import { useEffect, useReducer } from "react";
import { getLocalDateKey, isDailyTarotResult } from "~/lib/tarot-daily";
import { readDailyTarotResult, saveDailyTarotResult } from "~/lib/tarot-state";
import type { DailyTarotResult } from "~/lib/tarot-types";

function formatDate(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

type TarotState = {
  dateKey: string;
  result: DailyTarotResult | null;
  isHydrated: boolean;
  isDrawing: boolean;
  error: string | null;
};

type TarotAction =
  | { type: "date_synced"; dateKey: string }
  | { type: "date_loaded"; result: DailyTarotResult | null }
  | { type: "draw/start" }
  | { type: "draw/success"; result: DailyTarotResult }
  | { type: "draw/error"; message: string };

function tarotReducer(state: TarotState, action: TarotAction): TarotState {
  switch (action.type) {
    case "date_synced":
      return state.dateKey === action.dateKey ? state : { ...state, dateKey: action.dateKey };
    case "date_loaded":
      return { ...state, result: action.result, error: null, isHydrated: true };
    case "draw/start":
      return { ...state, isDrawing: true, error: null };
    case "draw/success":
      return { ...state, isDrawing: false, result: action.result };
    case "draw/error":
      return { ...state, isDrawing: false, error: action.message };
  }
}

export default function TarotRoute() {
  const [{ dateKey, result, isHydrated, isDrawing, error }, dispatch] = useReducer(tarotReducer, {
    dateKey: getLocalDateKey(),
    result: null,
    isHydrated: false,
    isDrawing: false,
    error: null,
  });

  useEffect(() => {
    const syncDateKey = () => dispatch({ type: "date_synced", dateKey: getLocalDateKey() });
    syncDateKey();
    const intervalId = window.setInterval(syncDateKey, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    dispatch({ type: "date_loaded", result: readDailyTarotResult(dateKey) });
  }, [dateKey]);

  const handleDrawCard = async () => {
    dispatch({ type: "draw/start" });

    try {
      const response = await fetch(`/api/tarot?date=${dateKey}`);

      if (!response.ok) {
        throw new Error(`Failed to draw daily tarot card (${response.status})`);
      }

      const payload = (await response.json()) as unknown;

      if (!isDailyTarotResult(payload)) {
        throw new Error("Received an invalid tarot reading");
      }

      saveDailyTarotResult(dateKey, payload);
      dispatch({ type: "draw/success", result: payload });
    } catch (requestError) {
      dispatch({
        type: "draw/error",
        message: requestError instanceof Error ? requestError.message : "Failed to draw your card",
      });
    }
  };

  return (
    <div className="p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 pb-6 md:flex-row md:items-start md:justify-between"
        >
          <div className="max-w-2xl">
            <h1>Daily Tarot</h1>
          </div>

          <div className="pt-1 text-sm md:text-right">
            <div className="text-secondary text-xs font-medium">Today</div>
            <div className="text-primary mt-1 text-lg font-medium">{formatDate(dateKey)}</div>
          </div>
        </motion.div>

        {!isHydrated ? (
          <Card className="border-default bg-canvas border p-8 shadow-sm">
            <div className="text-secondary py-16 text-center">
              Preparing today&apos;s ritual...
            </div>
          </Card>
        ) : result ? (
          <DailyTarotReadingView result={result} />
        ) : (
          <div className="border-default grid gap-6 border-b pb-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
            <div className="border-default bg-inset mx-auto flex h-72 w-52 items-center justify-center border">
              <div className="text-center">
                <div className="text-secondary text-4xl">✦</div>
                <div className="text-secondary mt-3 text-xs font-medium">Daily draw</div>
                <h3 className="mt-2">Today&apos;s card</h3>
              </div>
            </div>

            <div>
              <p className="text-secondary text-xs font-medium">Daily practice</p>
              <h2 className="mt-3">Pull one card and let the day orbit around it.</h2>
              <p className="text-secondary mt-3 max-w-2xl text-base leading-7">
                You&apos;ll get one card for your local day, a concise reading, and a reflection
                prompt. Once drawn, it stays with you until tomorrow.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button onClick={handleDrawCard} disabled={isDrawing} className="min-w-48">
                  {isDrawing ? "Drawing..." : "Draw today’s card"}
                </Button>
                <p className="text-secondary text-sm">
                  No redraws today. Come back tomorrow for a new card.
                </p>
              </div>

              {error && (
                <div className="border-destructive/20 bg-destructive/5 text-destructive mt-4 border px-4 py-3 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DailyTarotReadingView({ result }: { result: DailyTarotResult }) {
  const { card, reading, source } = result;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="mx-auto max-w-68">
          <img
            src={`/tarot-cards/${card.img}`}
            alt={card.name}
            className="border-default h-auto w-full border"
          />
        </div>

        <div className="text-center">
          <p className="text-secondary text-xs font-medium">{card.arcana}</p>
          <h2 className="mt-2">{card.name}</h2>
          <p className="text-secondary mt-2 text-sm">
            {card.rank}
            {card.suit !== "Trump" ? ` of ${card.suit}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {card.keywords.slice(0, 5).map((keyword) => (
            <Badge key={keyword} variant="secondary">
              {keyword}
            </Badge>
          ))}
        </div>

        <div className="border-default text-secondary border-t pt-4 text-sm">
          <div className="text-secondary text-xs font-medium">Reading source</div>
          <div className="mt-2">
            {source === "ai"
              ? "AI-generated reading grounded in the curated card data."
              : "Curated fallback reading assembled from the card’s source meanings."}
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        <section className="border-default space-y-4 border-b pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-secondary text-xs font-medium">Today’s reading</p>
              <h3 className="mt-2">{reading.headline}</h3>
            </div>
            <Badge variant="secondary">{source === "ai" ? "AI reading" : "Curated reading"}</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ReadingPanel title="Today’s message" body={reading.todayMessage} />
            <ReadingPanel title="Where to focus" body={reading.focus} />
            <ReadingPanel title="Reflection prompt" body={reading.reflectionPrompt} />
            <ReadingPanel title="Gentle caution" body={reading.careNote} />
          </div>
        </section>

        <section className="border-default space-y-4 border-b pb-6">
          <p className="text-secondary text-xs font-medium">Questions to sit with</p>
          <div className="grid gap-2.5">
            {card.reflectionQuestions.slice(0, 3).map((question) => (
              <div key={question} className="border-default text-primary border-l-2 pl-4">
                {question}
              </div>
            ))}
          </div>
        </section>

        <Accordion type="single" collapsible className="border-default border-b">
          <AccordionItem value="study" className="border-b-0">
            <AccordionTrigger className="py-0">
              <h4>Curated meanings and deeper notes</h4>
            </AccordionTrigger>

            <AccordionContent className="pb-6 pl-0">
              <div className="grid gap-4 pt-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <MeaningList
                    title="Light meanings"
                    accent="text-emerald-700"
                    items={card.curatedReading.uprightDetails}
                  />
                  <MeaningList
                    title="Shadow meanings"
                    accent="text-rose-700"
                    items={card.curatedReading.shadowDetails}
                  />
                </div>

                <MeaningList
                  title="Fortune telling notes"
                  accent="text-amber-700"
                  items={card.curatedReading.fortuneTelling}
                />

                {card.studyNotes && (
                  <div className="border-default border-t pt-4">
                    <h5>Study notes</h5>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {card.studyNotes.archetype && (
                        <StudyNote label="Archetype" value={card.studyNotes.archetype} />
                      )}
                      {card.studyNotes.numerology && (
                        <StudyNote label="Numerology" value={card.studyNotes.numerology} />
                      )}
                      {card.studyNotes.elemental && (
                        <StudyNote label="Elemental" value={card.studyNotes.elemental} />
                      )}
                      {card.studyNotes.astrology && (
                        <StudyNote label="Astrology" value={card.studyNotes.astrology} />
                      )}
                      {card.studyNotes.hebrewAlphabet && (
                        <StudyNote label="Hebrew alphabet" value={card.studyNotes.hebrewAlphabet} />
                      )}
                      {card.studyNotes.affirmation && (
                        <StudyNote label="Affirmation" value={card.studyNotes.affirmation} />
                      )}
                      {card.studyNotes.mythicalSpiritual && (
                        <div className="md:col-span-2">
                          <StudyNote
                            label="Mythical / spiritual"
                            value={card.studyNotes.mythicalSpiritual}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

function ReadingPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-default border-l-2 pl-4">
      <div className="text-secondary text-xs font-medium">{title}</div>
      <p className="text-primary mt-2 text-base leading-7">{body}</p>
    </div>
  );
}

function MeaningList({ title, accent, items }: { title: string; accent: string; items: string[] }) {
  return (
    <div className="border-default border-l-2 pl-4">
      <h5 className={accent}>{title}</h5>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-primary flex gap-3 text-sm leading-6">
            <span className={`${accent}`}>✦</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StudyNote({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-secondary text-xs font-medium">{label}</div>
      <p className="text-primary mt-1.5 text-sm leading-6">{value}</p>
    </div>
  );
}
