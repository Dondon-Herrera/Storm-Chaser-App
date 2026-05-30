import * as SQLite from 'expo-sqlite';

const dbPromise = SQLite.openDatabaseAsync('storm-chaser.db');

export type StormReport = {
    id?: number;
    photoUri: string;
    stormType: string;
    weatherCondition: string;
    notes: string;
    latitude: number;
    longitude: number;
    dateTime: string;
    createdAt: string;
    temperature: number;
    windSpeed: number;
    precipitationProbability: number | null;
};

async function getDb() {
    return await dbPromise;
}

async function initDb() {
    const db = await getDb();
    await db.execAsync(`CREATE TABLE IF NOT EXISTS storm_reports (
      id INTEGER PRIMARY KEY NOT NULL,
      photoUri TEXT NOT NULL,
      stormType TEXT NOT NULL,
      weatherCondition TEXT NOT NULL,
      notes TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      dateTime TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      temperature REAL NOT NULL,
      windSpeed REAL NOT NULL,
      precipitationProbability REAL
    );`);

    await db.execAsync(`CREATE TABLE IF NOT EXISTS weather_cache (
      id INTEGER PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );`);

    await migrateStormReportsTable(db);
}

async function migrateStormReportsTable(db: SQLite.SQLiteDatabase) {
    const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(storm_reports);`);
    const names = new Set(columns.map((column) => column.name));
    if (!names.has('precipitationProbability')) {
        await db.execAsync(`ALTER TABLE storm_reports ADD COLUMN precipitationProbability REAL;`);
    }
}

export async function saveCachedWeather(payload: string) {
    const db = await getDb();
    await initDb();
    await db.execAsync(`DELETE FROM weather_cache;`);
    await db.runAsync(
        `INSERT INTO weather_cache (payload, updatedAt) VALUES (?, ?);`,
        [payload, new Date().toISOString()]
    );
}

export async function getCachedWeather(): Promise<string | null> {
    await initDb();
    const db = await getDb();
    const rows = await db.getAllAsync<{ payload: string }>(
        `SELECT payload FROM weather_cache ORDER BY updatedAt DESC LIMIT 1;`
    );

    return rows[0]?.payload ?? null;
}

export async function saveStormReport(report: StormReport) {
    await initDb();
    const db = await getDb();

    const result = await db.runAsync(
        `INSERT INTO storm_reports (
      photoUri,
      stormType,
      weatherCondition,
      notes,
      latitude,
      longitude,
      dateTime,
      createdAt,
      temperature,
      windSpeed,
      precipitationProbability
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
            report.photoUri,
            report.stormType,
            report.weatherCondition,
            report.notes,
            report.latitude,
            report.longitude,
            report.dateTime,
            report.createdAt,
            report.temperature,
            report.windSpeed,
            report.precipitationProbability,
        ]
    );

    return result.lastInsertRowId;
}

export async function getStormReports(): Promise<StormReport[]> {
    await initDb();
    const db = await getDb();
    const rows = await db.getAllAsync<StormReport>(
        `SELECT * FROM storm_reports ORDER BY createdAt DESC;`
    );
    return rows;
}

export async function getStormReportById(id: number): Promise<StormReport | null> {
    await initDb();
    const db = await getDb();
    const rows = await db.getAllAsync<StormReport>(
        `SELECT * FROM storm_reports WHERE id = ?;`,
        [id]
    );
    return rows[0] ?? null;
}

export async function deleteStormReport(id: number) {
    await initDb();
    const db = await getDb();
    await db.runAsync(`DELETE FROM storm_reports WHERE id = ?;`, [id]);
}
