import { Button } from "@ponti-studios/ui/primitives";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ponti-studios/ui/forms";
import { Popover, PopoverContent, PopoverTrigger } from "@ponti-studios/ui/overlays";
import { LucideCircleAlert, LucideHistory } from "lucide-react";
import { Link } from "react-router";

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
          src="/experiments/logo.what.png"
          alt="WH?T"
          className={styles.logo}
          data-testid="what-logo"
        />
        {topics.length > 1 && (
          <div className={styles.topicControl} data-testid="what-topic" data-slug={gameSlug}>
            <Select value={gameSlug} onValueChange={(value) => value && onTopicChange?.(value)}>
              <SelectTrigger
                aria-label="Topic"
                className={styles.topicSelect}
                data-testid="what-topic-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem
                    key={topic.slug}
                    value={topic.slug}
                    data-testid={`what-topic-option-${topic.slug}`}
                  >
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
                  data-testid="what-fallback-notice"
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
            <Link
              to={`/games/what/history?game=${encodeURIComponent(gameSlug)}`}
              data-testid="what-history-link"
            >
              <LucideHistory aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
