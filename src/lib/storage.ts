import { Platform } from 'react-native';
import type { StormReport } from './storage.web';

type StorageExports = {
    saveCachedWeather(payload: string): Promise<void>;
    getCachedWeather(): Promise<string | null>;
    saveStormReport(report: StormReport): Promise<number>;
    getStormReports(): Promise<StormReport[]>;
    getStormReportById(id: number): Promise<StormReport | null>;
    deleteStormReport(id: number): Promise<void>;
};

const storage = (Platform.OS === 'web'
    ? require('./storage.web')
    : require('./storage.native')) as StorageExports;

export type { StormReport };
export const saveCachedWeather = storage.saveCachedWeather;
export const getCachedWeather = storage.getCachedWeather;
export const saveStormReport = storage.saveStormReport;
export const getStormReports = storage.getStormReports;
export const getStormReportById = storage.getStormReportById;
export const deleteStormReport = storage.deleteStormReport;
