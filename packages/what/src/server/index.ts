import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sql from "./db";
import { getWhatUser, loginUrl } from "./auth";
import { addDaysToDateKey, getDateKey, isDateKey } from "../lib/player-what/date";
import { evaluateGuess, hasGuessedWord, normalizeGuess, MAX_GUESSES, WHAT_ANSWER_LENGTH } from "../lib/player-what/rules";
import { isValidWord } from "../lib/what/server/word-list.server";
import type { GameStatus, WhatGuess } from "../lib/player-what/types";

const root = resolve(fileURLToPath(new URL("../../dist", import.meta.url)));
const port = Number(process.env.PORT ?? 3000);
const gameSlug = process.env.WHAT_DEFAULT_GAME_SLUG ?? "rhobh";
const rateLimitWindowMs = 60_000;
const rateLimitMaxGuesses = 10;
type Puzzle = {
  id: number;
  gameId: number;
  dateKey: string;
  answer: string;
  answerType: "moment" | "object" | "phrase" | "place" | "storyline";
  clue: string;
  detail: string;
  articleUrl: string;
  articleTitle: string;
  publishedAt: string;
};

type Attempt = { id: number; dateKey: string; guesses: WhatGuess[]; status: GameStatus };

function json(res: ServerResponse, value: unknown, status = 200) {
  const body = JSON.stringify(value);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(body);
}

function requestFromNode(req: IncomingMessage): Request {
  const protocol = req.headers["x-forwarded-proto"]?.toString() ?? "http";
  const host = req.headers.host ?? "localhost";
  return new Request(`${protocol}://${host}${req.url ?? "/"}`, { headers: { cookie: req.headers.cookie ?? "" } });
}

function timeZone(url: URL): string {
  const value = url.searchParams.get("tz") ?? "UTC";
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return value;
  } catch {
    return "UTC";
  }
}

async function getGame() {
  const rows = await sql<{ id: number; slug: string; name: string }[]>`
    select id, slug, name from labs.games_topics where slug = ${gameSlug} and active = true limit 1
  `;
  return rows[0] ?? null;
}

async function puzzleForDate(gameId: number, dateKey: string): Promise<Puzzle | null> {
  const rows = await sql<Puzzle[]>`
    select p.id, p.games_topic_id as "gameId", p.date_utc as "dateKey", p.answer,
      p.answer_type as "answerType", p.clue, p.detail, a.url as "articleUrl",
      a.title as "articleTitle", coalesce(a.published_at::text, '') as "publishedAt"
    from labs.games_puzzles p join labs.articles a on a.id = p.article_id
    where p.games_topic_id = ${gameId} and p.date_utc = ${dateKey}
    order by p.created_at desc limit 1
  `;
  return rows[0] ?? null;
}

async function activePuzzle(gameId: number, dateKey: string): Promise<{ puzzle: Puzzle; fallback: boolean } | null> {
  const exact = await puzzleForDate(gameId, dateKey);
  if (exact) return { puzzle: exact, fallback: false };
  const rows = await sql<Puzzle[]>`
    select p.id, p.games_topic_id as "gameId", p.date_utc as "dateKey", p.answer,
      p.answer_type as "answerType", p.clue, p.detail, a.url as "articleUrl",
      a.title as "articleTitle", coalesce(a.published_at::text, '') as "publishedAt"
    from labs.games_puzzles p join labs.articles a on a.id = p.article_id
    where p.games_topic_id = ${gameId} and p.date_utc <= ${dateKey}
    order by p.created_at desc limit 1
  `;
  return rows[0] ? { puzzle: rows[0], fallback: true } : null;
}

function publicPuzzle(puzzle: Puzzle, fallback: boolean) {
  return {
    answerType: puzzle.answerType, clue: puzzle.clue, dateKey: puzzle.dateKey,
    detail: puzzle.detail, isFallback: fallback,
    sources: [{ url: puzzle.articleUrl, title: puzzle.articleTitle, publishedAt: puzzle.publishedAt }],
  };
}

async function attemptFor(userId: string, gameId: number, dateKey: string): Promise<Attempt | null> {
  const rows = await sql<Attempt[]>`
    select id, date_utc as "dateKey", guesses, status
    from labs.games_attempts
    where hominem_user_id = ${userId} and games_topic_id = ${gameId} and date_utc = ${dateKey}
    limit 1
  `;
  return rows[0] ?? null;
}

async function recentGuessCount(userId: string): Promise<number> {
  const cutoff = new Date(Date.now() - rateLimitWindowMs).toISOString();
  const rows = await sql<{ guessedAt: string[] }[]>`
    select guessed_at as "guessedAt" from labs.games_attempts
    where hominem_user_id = ${userId} and updated_at >= ${cutoff}
  `;
  return rows.reduce((total, row) => total + row.guessedAt.filter((value) => value >= cutoff).length, 0);
}

async function submitGuess(request: Request, body: { dateKey: string; word: string; previousGuesses?: WhatGuess[] }) {
  const user = await getWhatUser(request);
  const game = await getGame();
  if (!game) return { status: 404, value: { valid: false, reason: "game-over" } };
  const word = normalizeGuess(body.word);
  if (word.length !== WHAT_ANSWER_LENGTH) return { status: 200, value: { valid: false, word, reason: "wrong-length" } };
  const requested = isDateKey(body.dateKey) ? body.dateKey : getDateKey(new Date(), "UTC");
  let resolved = await puzzleForDate(game.id, requested);
  if (!resolved) {
    const previous = addDaysToDateKey(requested, -1);
    resolved = previous ? await puzzleForDate(game.id, previous) : null;
  }
  if (!resolved) return { status: 200, value: { valid: false, word, reason: "not-in-word-list" } };
  if (!(await isValidWord(word, game.id))) {
    return { status: 200, value: { valid: false, word, reason: "not-in-word-list" } };
  }

  let attempt = user ? await attemptFor(user.id, game.id, resolved.dateKey) : null;
  const prior = attempt?.guesses ?? body.previousGuesses ?? [];
  if (!user && prior.length >= 1) return { status: 200, value: { valid: false, word, reason: "auth-required", authRequired: true } };
  if (attempt?.status !== undefined && attempt.status !== "playing") return { status: 200, value: { valid: false, word, reason: "game-over", status: attempt.status, isGameOver: true } };
  if (hasGuessedWord(prior, word)) return { status: 200, value: { valid: false, word, reason: "already-guessed" } };
  if (user && (await recentGuessCount(user.id)) >= rateLimitMaxGuesses) return { status: 200, value: { valid: false, word, reason: "rate-limited" } };

  const states = evaluateGuess(resolved.answer, word);
  const solved = states.every((state) => state === "correct");
  if (!user) return { status: 200, value: { valid: true, word, states, isSolved: solved, isGameOver: true, status: solved ? "solved" : "playing", authRequired: !solved } };

  if (!attempt) {
    const rows = await sql<Attempt[]>`
      insert into labs.games_attempts (hominem_user_id, games_topic_id, date_utc)
      values (${user.id}, ${game.id}, ${resolved.dateKey})
      on conflict (hominem_user_id, games_topic_id, date_utc) do nothing
      returning id, date_utc as "dateKey", guesses, status
    `;
    attempt = rows[0] ?? await attemptFor(user.id, game.id, resolved.dateKey);
  }
  if (!attempt) throw new Error("Unable to create attempt");
  const nextGuesses = [...attempt.guesses, { word, states }];
  const status: GameStatus = solved ? "solved" : nextGuesses.length >= MAX_GUESSES ? "failed" : "playing";
  await sql`
    update labs.games_attempts set guesses = ${JSON.stringify(nextGuesses)}::jsonb,
      guessed_at = guessed_at || ${JSON.stringify([new Date().toISOString()])}::jsonb,
      status = ${status}, updated_at = now() where id = ${attempt.id}
  `;
  return { status: 200, value: { valid: true, word, states, isSolved: solved, isGameOver: status !== "playing", status, remainingGuesses: Math.max(0, MAX_GUESSES - nextGuesses.length) } };
}

async function handleApi(req: IncomingMessage, res: ServerResponse, url: URL) {
  const request = requestFromNode(req);
  if (req.method === "OPTIONS") { res.writeHead(204, { "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type" }); return res.end(); }
  const game = await getGame();
  if (!game) return json(res, { error: "No active WH?T game" }, 503);
  const user = await getWhatUser(request);
  const login = loginUrl(request, url.searchParams.get("returnTo") ?? undefined);

  if (url.pathname === "/api/games/what/puzzle" && req.method === "GET") {
    const resolved = await activePuzzle(game.id, getDateKey(new Date(), timeZone(url)));
    if (!resolved) return json(res, { code: "WHAT_PUZZLE_NOT_FOUND", error: "No puzzle found" }, 404);
    const attempt = user ? await attemptFor(user.id, game.id, resolved.puzzle.dateKey) : null;
    return json(res, { puzzle: publicPuzzle(resolved.puzzle, resolved.fallback), attempt: attempt ? { guesses: attempt.guesses, status: attempt.status } : null, games: [{ slug: game.slug, name: game.name }], loginUrl: login, gameSlug: game.slug });
  }
  const dateMatch = url.pathname.match(/^\/api\/games\/what\/puzzle\/(\d{4}-\d{2}-\d{2})$/);
  if (dateMatch && req.method === "GET") {
    const puzzle = await puzzleForDate(game.id, dateMatch[1]);
    if (!puzzle) return json(res, { code: "WHAT_PUZZLE_NOT_FOUND", error: "No puzzle found" }, 404);
    const attempt = user ? await attemptFor(user.id, game.id, puzzle.dateKey) : null;
    return json(res, { puzzle: publicPuzzle(puzzle, false), attempt: attempt ? { guesses: attempt.guesses, status: attempt.status } : null, signedIn: Boolean(user), loginUrl: login, gameSlug: game.slug });
  }
  if (url.pathname === "/api/games/what/guess" && req.method === "POST") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    let body: unknown;
    try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return json(res, { valid: false, reason: "invalid-request" }, 400); }
    if (!body || typeof body !== "object") return json(res, { valid: false, reason: "invalid-request" }, 400);
    return json(res, (await submitGuess(request, body as { dateKey: string; word: string; previousGuesses?: WhatGuess[] })).value);
  }
  if (url.pathname === "/api/games/what/history" && req.method === "GET") {
    if (!user) return json(res, { signedIn: false, loginUrl: login });
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
    const end = addDaysToDateKey(getDateKey(new Date(), "UTC"), -(page - 1) * 7) ?? getDateKey(new Date(), "UTC");
    const start = addDaysToDateKey(end, -6) ?? end;
    const rows = await sql<{ dateKey: string; status: GameStatus; guesses: WhatGuess[]; answerType: string; clue: string; detail: string }[]>`
      select a.date_utc as "dateKey", a.status, a.guesses, p.answer_type as "answerType", p.clue,
        case when a.status = 'playing' then null else p.detail end as detail
      from labs.games_attempts a join labs.games_puzzles p on p.games_topic_id = a.games_topic_id and p.date_utc = a.date_utc
      where a.hominem_user_id = ${user.id} and a.games_topic_id = ${game.id} and a.date_utc between ${start} and ${end}
      order by a.date_utc desc
    `;
    const all = await sql<{ dateKey: string; status: GameStatus; guesses: WhatGuess[] }[]>`
      select date_utc as "dateKey", status, guesses from labs.games_attempts where hominem_user_id = ${user.id} and games_topic_id = ${game.id} order by date_utc desc
    `;
    const solved = all.filter((row) => row.status === "solved").length;
    return json(res, { signedIn: true, loginUrl: login, gameSlug: game.slug, history: { rows, page, totalPages: Math.max(1, page), hasNext: rows.length > 0, hasPrev: page > 1, weekStartKey: start, weekEndKey: end, stats: { gamesPlayed: all.length, gamesSolved: solved, winRate: all.length ? solved / all.length : 0, currentStreak: 0, maxStreak: 0, guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } }, playableUnplayedDateKeys: [] } });
  }
  return json(res, { error: "Not found" }, 404);
}

function contentType(path: string) {
  return ({ ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon" } as Record<string, string>)[extname(path)] ?? "application/octet-stream";
}

async function serve(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (url.pathname.startsWith("/api/")) {
    try { return await handleApi(req, res, url); } catch (error) { console.error(error); return json(res, { error: "Internal server error" }, 500); }
  }
  const requested = normalize(join(root, url.pathname === "/" ? "index.html" : url.pathname));
  const safe = requested.startsWith(root) ? requested : join(root, "index.html");
  try { if ((await stat(safe)).isFile()) { res.writeHead(200, { "content-type": contentType(safe) }); return createReadStream(safe).pipe(res); } } catch { /* SPA fallback */ }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  createReadStream(join(root, "index.html")).pipe(res);
}

createServer((req, res) => void serve(req, res)).listen(port, () => console.log(`WH?T listening on ${port}`));
