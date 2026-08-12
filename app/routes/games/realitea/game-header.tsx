import { Button } from "@ponti-studios/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ponti-studios/ui/forms";
import { Popover, PopoverContent, PopoverTrigger } from "@ponti-studios/ui/overlays";
import { LucideCircleAlert, LucideHistory } from "lucide-react";
import { Link } from "react-router";

import styles from "./game-header.module.css";

interface RealiTeaGameHeaderProps {
  isFallback: boolean;
  gameSlug: string;
  topics?: { slug: string; name: string }[];
  onTopicChange?: (slug: string) => void;
}

export function RealiTeaGameHeader({
  isFallback,
  gameSlug,
  topics = [],
  onTopicChange,
}: RealiTeaGameHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <img src="/experiments/logo.realitea.png" alt="RealiTea" className={styles.logo} />
        {topics.length > 1 && (
          <div className={styles.topicControl}>
            <Select value={gameSlug} onValueChange={onTopicChange}>
              <SelectTrigger aria-label="Topic" className={styles.topicSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.slug} value={topic.slug}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className={styles.actions}>
          {isFallback && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  aria-label="Why am I seeing this puzzle?"
                  variant="ghost"
                  size="icon"
                  data-testid="realitea-fallback-notice"
                >
                  <LucideCircleAlert aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className={styles.popover}>
                <p className="text-sm leading-5">
                  Today&apos;s puzzle isn&apos;t ready yet — you&apos;re seeing the most recent
                  puzzle.
                </p>
              </PopoverContent>
            </Popover>
          )}
          <Button asChild aria-label="Your puzzle history" variant="ghost" size="icon">
            <Link to={`/games/realitea/history?game=${encodeURIComponent(gameSlug)}`}>
              <LucideHistory aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
