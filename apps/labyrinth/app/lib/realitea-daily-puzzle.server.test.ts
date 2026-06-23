import { beforeEach, describe, expect, it, vi } from 'vitest';

const { dbMock, safeParseMock, rhobhDailyPuzzlesMock } = vi.hoisted(() => {
  const dbMock = {
    delete: vi.fn(),
    insert: vi.fn(),
    select: vi.fn(),
    transaction: vi.fn(),
    update: vi.fn(),
  };

  const rhobhDailyPuzzlesMock = {
    createdAt: 'createdAt',
    dateUtc: 'dateUtc',
    expireAt: 'expireAt',
    franchise: 'franchise',
    id: 'id',
    normalizedAnswer: 'normalizedAnswer',
    publishAt: 'publishAt',
    scheduledForDateKey: 'scheduledForDateKey',
    status: 'status',
    validationStatus: 'validationStatus',
  };

  const safeParseMock = vi.fn();

  return { dbMock, rhobhDailyPuzzlesMock, safeParseMock };
});

const isValidWordMock = vi.fn();

vi.mock('@pontistudios/db', () => ({
  and: vi.fn(),
  db: dbMock,
  desc: vi.fn(),
  eq: vi.fn(),
  gt: vi.fn(),
  gte: vi.fn(),
  inArray: vi.fn(),
  lte: vi.fn(),
  rhobhDailyPuzzles: rhobhDailyPuzzlesMock,
}));

vi.mock('./server/env', () => ({
  LabyrinthServerEnv: {
    safeParse: safeParseMock,
  },
}));

vi.mock('./word-list.server', () => ({
  isValidWord: isValidWordMock,
}));

function createSelectResponder(queue: unknown[][]) {
  return vi.fn(() => ({
    from: () => ({
      where: () => {
        const result = queue.shift() ?? [];
        return {
          orderBy: () => ({
            limit: async () => result,
          }),
          then: (resolve: (value: unknown[]) => unknown, reject?: (reason: unknown) => unknown) =>
            Promise.resolve(result).then(resolve, reject),
        };
      },
    }),
  }));
}

function createUpdateResponder(queue: unknown[][] = []) {
  return vi.fn(() => ({
    set: () => ({
      where: () => ({
        returning: async () => queue.shift() ?? [],
      }),
    }),
  }));
}

const PUBLISHED_ROW = {
  answer: 'ERIKA',
  answerType: 'person',
  clue: 'The Pretty Mess performer never misses a sharp confessional.',
  createdAt: new Date('2026-05-20T12:00:00.000Z'),
  dateUtc: '2026-05-20',
  detail:
    'Erika Jayne keeps the glam, the one-liners, and the pop-star energy turned all the way up.',
  expireAt: new Date('2026-05-21T07:00:00.000Z'),
  franchise: 'bravo',
  generationBatchId: null,
  generationStatus: 'published',
  id: 1,
  newsMode: 'current',
  normalizedAnswer: 'ERIKA',
  publishAt: new Date('2026-05-20T07:00:00.000Z'),
  role: 'Pop diva energy',
  scheduledForDateKey: '2026-05-20',
  sourceKind: 'current',
  sourcePublishedAt: [],
  sourceSummary: [],
  sourceTitles: [],
  sourceUrls: [],
  status: 'published',
  updatedAt: new Date('2026-05-20T12:00:00.000Z'),
  validationStatus: 'approved',
};

describe('realitea daily puzzle server helpers', () => {
  beforeEach(() => {
    safeParseMock.mockReset();
    safeParseMock.mockReturnValue({ success: false });
    dbMock.delete.mockReset();
    dbMock.insert.mockReset();
    dbMock.select.mockReset();
    dbMock.transaction.mockReset();
    dbMock.update.mockReset();
    vi.unstubAllGlobals();
  });

  it('loads the active published puzzle when one exists', async () => {
    dbMock.select.mockImplementation(createSelectResponder([[PUBLISHED_ROW]]));
    dbMock.update.mockImplementation(createUpdateResponder());

    const { loadActivePuzzle } = await import('./realitea-daily-puzzle.server');
    const envelope = await loadActivePuzzle(new Date('2026-05-20T12:00:00.000Z'));

    expect(envelope?.puzzle.answer).toBe('ERIKA');
    expect(envelope?.puzzle.dateKey).toBe('2026-05-20');
  });

  it('promotes the scheduled puzzle when no published puzzle exists', async () => {
    dbMock.select.mockImplementation(createSelectResponder([[]]));
    dbMock.update.mockImplementation(createUpdateResponder());

    const scheduledRow = {
      answer: 'DRAMA',
      answerType: 'moment',
      clue: 'A clash that keeps the whole cast spinning.',
      createdAt: new Date('2026-05-20T12:00:00.000Z'),
      dateUtc: '2026-05-20',
      detail: 'A single conflict can dominate the full episode and aftermath.',
      expireAt: new Date('2026-05-21T07:00:00.000Z'),
      franchise: 'bravo',
      generationBatchId: null,
      generationStatus: 'published',
      id: 7,
      newsMode: 'current',
      normalizedAnswer: 'DRAMA',
      publishAt: new Date('2026-05-20T07:00:00.000Z'),
      role: 'Escalating conflict',
      scheduledForDateKey: '2026-05-20',
      sourceKind: 'current',
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
      status: 'scheduled',
      updatedAt: new Date('2026-05-20T12:00:00.000Z'),
      validationStatus: 'approved',
    };

    const txSelect = createSelectResponder([[], [scheduledRow]]);
    const txUpdate = createUpdateResponder([[{ ...scheduledRow, status: 'published' }]]);

    dbMock.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({ select: txSelect, update: txUpdate }),
    );

    const { loadActivePuzzle } = await import('./realitea-daily-puzzle.server');
    const envelope = await loadActivePuzzle(new Date('2026-05-20T12:00:00.000Z'));

    expect(envelope?.puzzle.answer).toBe('DRAMA');
    expect(envelope?.puzzle.dateKey).toBe('2026-05-20');
  });

  it('returns null when no published or scheduled puzzle exists', async () => {
    dbMock.select.mockImplementation(createSelectResponder([[]]));
    dbMock.update.mockImplementation(createUpdateResponder());

    dbMock.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        select: createSelectResponder([[], []]),
        update: createUpdateResponder(),
      }),
    );

    const { loadActivePuzzle } = await import('./realitea-daily-puzzle.server');
    const envelope = await loadActivePuzzle(new Date('2026-05-20T12:00:00.000Z'));

    expect(envelope).toBeNull();
  });
});

describe('evaluateGuessServer', () => {
  beforeEach(() => {
    isValidWordMock.mockReset();
    dbMock.select.mockReset();
  });

  it('rejects a word that is not the answer length', async () => {
    const { evaluateGuessServer } = await import('./realitea-daily-puzzle.server');
    const result = await evaluateGuessServer('2026-05-20', 'ABC', []);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('wrong-length');
    expect(result.word).toBe('ABC');
  });

  it('rejects an already-guessed word before touching the database', async () => {
    isValidWordMock.mockResolvedValue(true);
    dbMock.select.mockImplementation(createSelectResponder([[PUBLISHED_ROW]]));
    const { evaluateGuessServer } = await import('./realitea-daily-puzzle.server');
    const result = await evaluateGuessServer('2026-05-20', 'ERIKA', [{ word: 'ERIKA' }]);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('already-guessed');
    expect(isValidWordMock).not.toHaveBeenCalled();
  });

  it('returns not-in-word-list when the word is missing', async () => {
    isValidWordMock.mockResolvedValue(false);
    dbMock.select.mockImplementation(createSelectResponder([[PUBLISHED_ROW]]));
    const { evaluateGuessServer } = await import('./realitea-daily-puzzle.server');
    const result = await evaluateGuessServer('2026-05-20', 'ZZZZZ', []);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('not-in-word-list');
  });

  it('returns not-in-word-list when no puzzle exists for the date', async () => {
    isValidWordMock.mockResolvedValue(true);
    dbMock.select.mockImplementation(createSelectResponder([[]]));
    const { evaluateGuessServer } = await import('./realitea-daily-puzzle.server');
    const result = await evaluateGuessServer('2026-05-20', 'ERIKA', []);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('not-in-word-list');
    expect(isValidWordMock).not.toHaveBeenCalled();
  });

  it('evaluates a valid guess and returns per-letter states without the answer', async () => {
    isValidWordMock.mockResolvedValue(true);
    dbMock.select.mockImplementation(createSelectResponder([[PUBLISHED_ROW]]));
    const { evaluateGuessServer } = await import('./realitea-daily-puzzle.server');
    const result = await evaluateGuessServer('2026-05-20', 'ERIKA', []);
    expect(result.valid).toBe(true);
    expect(result.word).toBe('ERIKA');
    expect(result.states).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
    expect(result.isSolved).toBe(true);
    expect(result.isGameOver).toBe(true);
    expect(result.status).toBe('solved');
    expect((result as { answer?: string }).answer).toBeUndefined();
  });

  it('marks the game failed on the sixth valid guess that is not the answer', async () => {
    isValidWordMock.mockResolvedValue(true);
    dbMock.select.mockImplementation(createSelectResponder([[PUBLISHED_ROW]]));
    const { evaluateGuessServer } = await import('./realitea-daily-puzzle.server');
    const previous = ['DORIT', 'SUTTON', 'KATHY', 'ERIKA', 'TILLY'].map((word) => ({
      word,
    }));
    const result = await evaluateGuessServer('2026-05-20', 'KYLEE', previous);
    expect(result.valid).toBe(true);
    expect(result.isSolved).toBe(false);
    expect(result.isGameOver).toBe(true);
    expect(result.status).toBe('failed');
  });

  it('keeps the game playing while guesses remain', async () => {
    isValidWordMock.mockResolvedValue(true);
    dbMock.select.mockImplementation(createSelectResponder([[PUBLISHED_ROW]]));
    const { evaluateGuessServer } = await import('./realitea-daily-puzzle.server');
    const result = await evaluateGuessServer('2026-05-20', 'DORIT', []);
    expect(result.valid).toBe(true);
    expect(result.isSolved).toBe(false);
    expect(result.isGameOver).toBe(false);
    expect(result.status).toBe('playing');
  });
});
