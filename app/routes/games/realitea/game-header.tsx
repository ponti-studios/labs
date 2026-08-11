import { Button } from "@ponti-studios/ui/primitives";
import { Popover, PopoverContent, PopoverTrigger } from "@ponti-studios/ui/overlays";
import { LucideCircleAlert, LucideHistory } from "lucide-react";
import { Link } from "react-router";

import styles from "./game-header.module.css";

interface RealiTeaGameHeaderProps {
  isFallback: boolean;
}

export function RealiTeaGameHeader({ isFallback }: RealiTeaGameHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <img src="/experiments/logo.realitea.png" alt="RealiTea" className={styles.logo} />
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
            <Link to="/games/realitea/history">
              <LucideHistory aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
