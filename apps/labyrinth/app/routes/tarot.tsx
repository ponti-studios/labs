import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
} from "@pontistudios/ui";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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

export default function TarotRoute() {
  const [dateKey, setDateKey] = useState(() => getLocalDateKey());
  const [result, setResult] = useState<DailyTarotResult | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncDateKey = () => {
      const nextDateKey = getLocalDateKey();
      setDateKey((current) => (current === nextDateKey ? current : nextDateKey));
    };

    syncDateKey();
    const intervalId = window.setInterval(syncDateKey, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setResult(readDailyTarotResult(dateKey));
    setError(null);
    setIsHydrated(true);
  }, [dateKey]);

  const handleDrawCard = async () => {
    setIsDrawing(true);
    setError(null);

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
      setResult(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to draw your card");
    } finally {
      setIsDrawing(false);
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
            <div className="ui-eyebrow">Today</div>
            <div className="mt-1 text-lg font-medium text-foreground">{formatDate(dateKey)}</div>
          </div>
        </motion.div>

        {!isHydrated ? (
          <Card className="border border-border bg-background p-8 shadow-sm">
            <div className="py-16 text-center text-muted-foreground">
              Preparing today&apos;s ritual...
            </div>
          </Card>
        ) : result ? (
          <DailyTarotReadingView result={result} />
        ) : (
          <div className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
            <div className="mx-auto flex h-72 w-52 items-center justify-center border border-border bg-muted">
              <div className="text-center">
                <div className="text-4xl text-muted-foreground">✦</div>
                <div className="ui-eyebrow mt-3">Daily draw</div>
                <h3 className="mt-2">Today&apos;s card</h3>
              </div>
            </div>

            <div>
              <p className="ui-eyebrow">Daily practice</p>
              <h2 className="mt-3">Pull one card and let the day orbit around it.</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                You&apos;ll get one card for your local day, a concise reading, and a reflection
                prompt. Once drawn, it stays with you until tomorrow.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={handleDrawCard}
                  disabled={isDrawing}
                  size="lg"
                  className="min-w-48"
                >
                  {isDrawing ? "Drawing..." : "Draw today’s card"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  No redraws today. Come back tomorrow for a new card.
                </p>
              </div>

              {error && (
                <div className="mt-4 border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
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
            className="h-auto w-full border border-border"
          />
        </div>

        <div className="text-center">
          <p className="ui-eyebrow">{card.arcana}</p>
          <h2 className="mt-2">{card.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
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

        <div className="border-t border-border pt-4 text-sm text-muted-foreground">
          <div className="ui-eyebrow">Reading source</div>
          <div className="mt-2">
            {source === "ai"
              ? "AI-generated reading grounded in the curated card data."
              : "Curated fallback reading assembled from the card’s source meanings."}
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        <section className="space-y-4 border-b border-border pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="ui-eyebrow">Today’s reading</p>
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

        <section className="space-y-4 border-b border-border pb-6">
          <p className="ui-eyebrow">Questions to sit with</p>
          <div className="grid gap-2.5">
            {card.reflectionQuestions.slice(0, 3).map((question) => (
              <div key={question} className="border-l-2 border-border pl-4 text-foreground">
                {question}
              </div>
            ))}
          </div>
        </section>

        <Accordion type="single" collapsible className="border-b border-border">
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
                  <div className="border-t border-border pt-4">
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
    <div className="border-l-2 border-border pl-4">
      <div className="ui-eyebrow">{title}</div>
      <p className="mt-2 text-base leading-7 text-foreground">{body}</p>
    </div>
  );
}

function MeaningList({ title, accent, items }: { title: string; accent: string; items: string[] }) {
  return (
    <div className="border-l-2 border-border pl-4">
      <h5 className={accent}>{title}</h5>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-foreground">
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
      <div className="ui-eyebrow">{label}</div>
      <p className="mt-1.5 text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}
