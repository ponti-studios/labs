import { __awaiter } from "tslib";
import { Kysely, MysqlDialect } from 'kysely';
// Database URL should be set via DATABASE_URL environment variable
// Format: mysql://user:password@host:port/database
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !databaseUrl.startsWith('mysql://')) {
    throw new Error('DATABASE_URL must be set and point to a MySQL database (mysql://user:password@host:port/database)');
}
let mysqlPool = null;
function createClient() {
    return __awaiter(this, void 0, void 0, function* () {
        const mysql = yield import('mysql2/promise');
        mysqlPool = mysql.createPool(databaseUrl);
        return new Kysely({
            dialect: new MysqlDialect({
                pool: mysqlPool,
            }),
        });
    });
}
// Initialize on first import
const db = await createClient();
export { db };
export function closeDb() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.destroy();
        if (mysqlPool && typeof mysqlPool.end === 'function') {
            yield mysqlPool.end();
        }
    });
}
//# sourceMappingURL=client.js.map