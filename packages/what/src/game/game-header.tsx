import { Button, Popover, PopoverContent, PopoverTrigger, Select } from "../primitives";
import styles from "./game-header.module.css";

interface WhatGameHeaderProps {
  isFallback: boolean;
  gameSlug: string;
  topics?: { slug: string; name: string }[];
  onTopicChange?: (slug: string) => void;
}

export function WhatGameHeader({
  isFallback,
  gameSlug,
  topics = [],
  onTopicChange,
}: WhatGameHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <img
          src="/logo.what.png"
          alt="WH?T"
          className={styles.logo}
          data-testid="what-logo"
        />
        {topics.length > 1 && (
          <div className={styles.topicControl} data-testid="what-topic" data-slug={gameSlug}>
            <Select
              aria-label="Topic"
              className={styles.topicSelect}
              data-testid="what-topic-select"
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
                  data-testid="what-fallback-notice"
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
              href={`/history?game=${encodeURIComponent(gameSlug)}`}
              data-testid="what-history-link"
            >
              <span aria-hidden="true">↺</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
