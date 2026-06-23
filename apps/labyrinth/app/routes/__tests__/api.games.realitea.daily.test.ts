import type { LoaderFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadActivePublicPuzzle = vi.fn();

vi.mock('../../lib/realitea-daily-puzzle.server', () => ({
  loadActivePublicPuzzle,
}));

describe('RealiTea daily puzzle loader', () => {
  beforeEach(() => {
    loadActivePublicPuzzle.mockReset();
  });

  function createLoaderArgs(url: string): LoaderFunctionArgs {
    const request = new Request(url);

    return {
      context: {},
      params: {},
      pattern: '',
      request,
      url: new URL(request.url),
    } as LoaderFunctionArgs;
  }

  it('returns the public puzzle (no answer) when one is available', async () => {
    loadActivePublicPuzzle.mockResolvedValue({
      puzzle: {
        answerLength: 5,
        answerType: 'moment',
        clue: 'A clash that keeps the whole cast spinning.',
        dateKey: '2026-05-27',
        detail: 'A single RHOBH conflict can dominate the full episode and aftermath.',
        role: 'Escalating conflict',
        sourceUrls: ['https://www.bravotv.com/example'],
      },
    });

    const { loader } = await import('../api.games.realitea.daily');
    const response = await loader(
      createLoaderArgs('http://localhost/api/games/realitea/daily?date=2026-05-27'),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.puzzle.answer).toBeUndefined();
    expect(payload.puzzle.dateKey).toBe('2026-05-27');
    expect(payload.puzzle.answerLength).toBe(5);
  });

  it('returns 404 when no puzzle exists for the requested day', async () => {
    loadActivePublicPuzzle.mockResolvedValue(null);

    const { loader } = await import('../api.games.realitea.daily');
    const response = await loader(
      createLoaderArgs('http://localhost/api/games/realitea/daily?date=2026-05-27'),
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toBe('No RealiTea puzzle found for today');
  });
});
