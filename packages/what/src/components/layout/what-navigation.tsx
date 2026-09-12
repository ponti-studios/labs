import { Navigation } from "@ponti-studios/ui/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@ponti-studios/ui/overlays";
import { Button } from "@ponti-studios/ui/primitives";
import { LucideChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";

import { BRAND_NAME } from "~/config/brand";

export interface NavigationGame {
  slug: string;
  name: string;
}

export interface WhatNavigationProps {
  games: NavigationGame[];
  signedIn: boolean;
  canAccessAdmin: boolean;
  loginUrl: string;
}

export function getCurrentGame(pathname: string, games: readonly NavigationGame[]) {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return games.find((game) => game.slug === firstSegment) ?? null;
}

export function WhatNavigation({ games, signedIn, canAccessAdmin, loginUrl }: WhatNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentGame = getCurrentGame(location.pathname, games);
  const isHistory = location.pathname === "/history";
  const isAdmin = location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  const hasSelectedGame = currentGame !== null;

  return (
    <Navigation ariaLabel={`${BRAND_NAME} navigation`} className="what-navigation">
      <Navigation.Brand>
        <Link to="/" aria-label={`${BRAND_NAME} home`}>
          <img className="h-8 w-auto" src="/logo.png" alt="" />
        </Link>
      </Navigation.Brand>

      {games.length === 1 ? (
        <Navigation.List>
          <Navigation.Item asChild active={currentGame?.slug === games[0].slug}>
            <Link to={`/${games[0].slug}`}>Play</Link>
          </Navigation.Item>
        </Navigation.List>
      ) : games.length > 1 ? (
        <Popover>
          <PopoverTrigger
            className="what-navigation__game-trigger"
            aria-label={hasSelectedGame ? `Current game: ${currentGame?.name}` : "Choose a game"}
          >
            <span>{currentGame?.name ?? "Games"}</span>
            <span aria-hidden="true">
              <LucideChevronDown className="size-4" />
            </span>
          </PopoverTrigger>
          <PopoverContent align="start" className="what-navigation__game-popover" sideOffset={20}>
            <p className="what-navigation__game-label">Games</p>
            <div className="what-navigation__game-options">
              {games.map((game) => (
                <button
                  key={game.slug}
                  type="button"
                  aria-current={currentGame?.slug === game.slug ? "page" : undefined}
                  onClick={() => void navigate(`/${game.slug}`)}
                >
                  <span>{game.name}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : null}

      <Navigation.List>
        <Navigation.Item asChild active={isHistory}>
          <Link to="/history">History</Link>
        </Navigation.Item>
        {canAccessAdmin && (
          <Navigation.Item asChild active={isAdmin}>
            <Link to="/admin">Admin</Link>
          </Navigation.Item>
        )}
      </Navigation.List>

      {!signedIn && (
        <Navigation.Action className="what-navigation__auth">
          <Button asChild size="sm">
            <a href={loginUrl}>Sign in</a>
          </Button>
        </Navigation.Action>
      )}
    </Navigation>
  );
}
