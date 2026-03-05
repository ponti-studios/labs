import { getDb, closeDb } from '@pontistudios/earth-db'

async function main() {
  const db = await getDb()
  console.log('inserting test row...');
  await db.insertInto('disaster_events').values({
    id: 'test-' + Date.now(),
    title: 'Test Event',
    category_id: 'test',
    category_title: 'Test',
    occurred_at: new Date().toISOString(),
    geometry_type: 'Point',
    latitude: 0,
    longitude: 0,
  }).execute();

  const [{ count }] = await db.selectFrom('disaster_events').select(db.fn.count('*').as('count')).execute();
  console.log('row count:', count);
  await closeDb();
}

main()
  .then(() => {
    console.log('test-db finished, exiting now');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
