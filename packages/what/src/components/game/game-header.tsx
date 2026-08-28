import { BRAND_NAME } from "../../config/brand";
import { Button, Popover, PopoverContent, PopoverTrigger, Select } from "../primitives";
import styles from "./game-header.module.css";

interface GameHeaderProps {
  isFallback: boolean;
  gameSlug: string;
  topics?: { slug: string; name: string }[];
  onTopicChange?: (slug: string) => void;
}

export function GameHeader({ isFallback, gameSlug, topics = [], onTopicChange }: GameHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <img src="/logo.png" alt={BRAND_NAME} className={styles.logo} data-testid="game-logo" />
        {topics.length > 1 && (
          <div className={styles.topicControl} data-testid="game-topic" data-slug={gameSlug}>
            <Select
              aria-label="Topic"
              className={styles.topicSelect}
              data-testid="game-topic-select"
              value={gameSlug}
              onValueChange={(value) => value && onTopicChange?.(value)}
              options={topics.map((topic) => ({ value: topic.slug, label: topic.name }))}
            />
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
                  data-testid="game-fallback-notice"
                >
                  <span aria-hidden="true">!</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className={styles.popover}>
                <p style={{ fontSize: "0.875rem", lineHeight: "1.25rem" }}>
                  Today&apos;s puzzle isn&apos;t ready yet — you&apos;re seeing the most recent
                  puzzle.
                </p>
              </PopoverContent>
            </Popover>
          )}
          <Button asChild aria-label="Your puzzle history" variant="ghost" size="icon">
            <a
              href={`/${encodeURIComponent(gameSlug)}/history`}
              data-testid="game-history-link"
            >
              <span aria-hidden="true">↺</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
