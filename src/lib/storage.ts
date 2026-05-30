import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('storm-chaser.db');

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

function executeSql<T = any>(sql: string, params: (string | number | null)[] = []): Promise<SQLite.SQLResultSet> {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                sql,
                params,
                (_, result) => resolve(result),
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
}

async function initDb() {
    await executeSql(
        `CREATE TABLE IF NOT EXISTS storm_reports (
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
    );`
    );

    await executeSql(
        `CREATE TABLE IF NOT EXISTS weather_cache (
      id INTEGER PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );`
    );
}

export async function saveCachedWeather(payload: string) {
    await initDb();
    await executeSql(
        `DELETE FROM weather_cache;`
    );
    await executeSql(
        `INSERT INTO weather_cache (payload, updatedAt) VALUES (?, ?);`,
        [payload, new Date().toISOString()]
    );
}

export async function getCachedWeather(): Promise<string | null> {
    await initDb();
    const result = await executeSql(`SELECT payload FROM weather_cache ORDER BY updatedAt DESC LIMIT 1;`);
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows.item(0).payload as string;
}

export async function saveStormReport(report: StormReport) {
    await initDb();

    const result = await executeSql(
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

    return result.insertId;
}

export async function getStormReports(): Promise<StormReport[]> {
    await initDb();
    const result = await executeSql(
        `SELECT * FROM storm_reports ORDER BY createdAt DESC;`
    );

    const reports: StormReport[] = [];
    for (let i = 0; i < result.rows.length; i += 1) {
        reports.push(result.rows.item(i));
    }

    return reports;
}

export async function getStormReportById(id: number): Promise<StormReport | null> {
    await initDb();
    const result = await executeSql(`SELECT * FROM storm_reports WHERE id = ?;`, [id]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows.item(0);
}
