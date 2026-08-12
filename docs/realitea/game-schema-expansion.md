# RealiTea game schema expansion

The current schema has the right first-level entities—`games`, `feeds`, `feed_games`, `articles`, and `daily_puzzles`—but two assumptions will become incorrect when RealiTea swaps editorial genres and source bundles.

## Problems to resolve before production expansion

1. `articles.status` is global. When one article is used by a celebrity game, it becomes unavailable to every other game. Rejection and expiry are also global even though eligibility is game-specific.
2. `games` currently mixes the stable game identity with editorial generation configuration. That makes source/genre experiments look like separate games and makes it harder to reproduce which configuration generated a puzzle.

## Recommended additive model

- Keep RealiTea's five-letter rule as a product invariant. Do not make answer length configurable, and keep the five-letter database check.
- Keep `games` as the stable game identity and player-progress boundary.
- Add an editorial profile/config entity, such as `game_profiles`, containing `game_id`, `slug`, `label`, `genre`, `prompt_key`/`prompt_version`, and active/default state. A profile represents “celebrity gossip,” “tech news,” or another source/genre bundle—not a different word game.
- Link profiles to feeds with `profile_feeds` (or extend `feed_games` only if profiles will never exist). Store priority/role there if a profile combines Page Six and TMZ.
- Record `profile_id` on each puzzle row. This makes historical clues explainable after the active source/genre changes.
- Keep `articles` as immutable, globally deduplicated source provenance.
- Add a per-game article inventory link, such as `game_articles`, containing `game_id`, `article_id`, lifecycle status, rejection count/reason, and timestamps. Move pending/used/rejected/expired selection to this table.
- Ingest can create or refresh `game_articles` links for each active profile. Article lifecycle is then isolated per game/profile while the source article remains globally deduplicated.
- Keep the accepted word list and five-letter validation global to RealiTea. A future word-list experiment should be a deliberate product change, not a genre setting.
- Keep prompt experiments in files/fixtures until a version wins evaluation; do not turn every experiment into a database game.

The likely migration is: add profiles and profile-feed links, backfill the current RHOBH configuration as the default profile, add profile provenance to puzzles, then move article lifecycle state from global articles to per-profile inventory. This should use Drizzle's expand → backfill → switch sequence. No migration is included in this prompt-evaluation change because the per-profile inventory transition affects repository queries and article lifecycle semantics together.
