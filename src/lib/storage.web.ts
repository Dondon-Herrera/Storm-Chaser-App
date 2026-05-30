const STORAGE_REPORTS_KEY = 'storm-chaser-reports';
const STORAGE_WEATHER_KEY = 'storm-chaser-weather-cache';

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

function getStoredReports(): StormReport[] {
    try {
        const raw = window.localStorage.getItem(STORAGE_REPORTS_KEY);
        if (!raw) {
            return [];
        }

        return JSON.parse(raw) as StormReport[];
    } catch {
        return [];
    }
}

function saveStoredReports(reports: StormReport[]) {
    window.localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));
}

export async function saveCachedWeather(payload: string) {
    window.localStorage.setItem(
        STORAGE_WEATHER_KEY,
        JSON.stringify({ payload, updatedAt: new Date().toISOString() })
    );
}

export async function getCachedWeather(): Promise<string | null> {
    try {
        const raw = window.localStorage.getItem(STORAGE_WEATHER_KEY);
        if (!raw) {
            return null;
        }

        const cache = JSON.parse(raw) as { payload: string; updatedAt: string };
        return cache.payload ?? null;
    } catch {
        return null;
    }
}

export async function saveStormReport(report: StormReport) {
    const reports = getStoredReports();
    const nextId = reports.length ? Math.max(...reports.map((item) => item.id ?? 0)) + 1 : 1;
    const storedReport = { ...report, id: nextId };

    reports.unshift(storedReport);
    saveStoredReports(reports);

    return nextId;
}

export async function getStormReports(): Promise<StormReport[]> {
    return getStoredReports().sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function getStormReportById(id: number): Promise<StormReport | null> {
    const reports = getStoredReports();
    return reports.find((report) => report.id === id) ?? null;
}

export async function deleteStormReport(id: number) {
    const reports = getStoredReports().filter((report) => report.id !== id);
    saveStoredReports(reports);
}
