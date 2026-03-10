import { afterEach, describe, expect, it } from 'vitest';

import { createDb, withDb, DbEnv } from '../src';

const fakeUrl = 'mysql://user:pass@localhost:3306/testdb';

describe('db package basics', () => {
  it('parses environment correctly', () => {
    const env = DbEnv.parse({ DATABASE_URL: fakeUrl });
    expect(env.url).toBe(fakeUrl);
    expect(env.connectionLimit).toBeUndefined();
  });

  it('createDb constructs a Kysely instance and can be destroyed', async () => {
    const db = createDb({ databaseUrl: fakeUrl });
    expect(db).toBeDefined();
    // destroy should not throw even if the pool never connected
    await expect(db.destroy()).resolves.not.toThrow();
  });

  it('withDb passes an instance through and cleans up', async () => {
    let seen: boolean | undefined;
    await withDb({ databaseUrl: fakeUrl }, async (db) => {
      expect(db).toBeDefined();
      seen = true;
    });
    expect(seen).toBe(true);
  });

  it('has at least one migration file', () => {
    const fs = require('fs');
    const path = require('path');
    const files = fs.readdirSync(path.join(__dirname, '../migrations'));
    expect(files.length).toBeGreaterThan(0);
  });
});
