import { Region } from './types';

export const formatCurrency = (value: number | null): string => {
  if (value === null || typeof value === 'undefined') return 'N/A';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number | null): string => {
  if (value === null || typeof value === 'undefined') return 'N/A';
  return new Intl.NumberFormat('en-CA').format(value);
};

export const formatPercentage = (value: number | null): string => {
  if (value === null || typeof value === 'undefined') return 'N/A';
  return `${value}%`;
};

export const getTrendColor = (current: number | null, previous: number | null): string => {
  if (current === null || previous === null) return 'text-gray-500';
  if (current > previous) return 'text-green-600';
  if (current < previous) return 'text-red-600';
  return 'text-gray-500';
};

export const calculateChange = (current: number | null, previous: number | null): number => {
  if (current === null || previous === null || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Cleans and parses a string into a float. Returns null if the value is empty, not a number, or zero.
 */
export const cleanAndParseFloat = (value: string | undefined): number | null => {
    if (typeof value !== 'string' || value.trim() === '') return null;
    const cleaned = value.replace(/[^0-9.-]+/g, '');
    if (cleaned === '') return null;
    const number = parseFloat(cleaned);
    if (isNaN(number) || number === 0) return null;
    return number;
};

/**
 * Cleans and parses a string into an integer. Returns null if the value is empty, not a number, or zero.
 */
export const cleanAndParseInt = (value: string | undefined): number | null => {
    if (typeof value !== 'string' || value.trim() === '') return null;
    const cleaned = value.replace(/[^0-9.-]+/g, '');
    if (cleaned === '') return null;
    const number = parseInt(cleaned, 10);
    if (isNaN(number) || number === 0) return null;
    return number;
};

/**
 * Parses a CSV string into an array of objects, handling quoted fields.
 * @param csvText The raw CSV string.
 * @returns An array of objects, where each object represents a row.
 */
export const parseCSV = <T extends Record<string, any>>(csvText: string): T[] => {
    const lines = csvText.trim().split(/\r\n|\n/);
    if (lines.length < 2) return [];

    const header = lines[0].split(',').map(h => h.trim());
    const result: T[] = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // This regex handles quoted strings, allowing commas inside them.
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

        if (values.length >= header.length) {
            const obj = header.reduce((acc, key, index) => {
                let value = (values[index] || '').trim();
                // Remove quotes from start and end if they exist
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                // Handle double quotes inside a quoted string "" -> "
                (acc as any)[key] = value.replace(/""/g, '"');
                return acc;
            }, {} as T);
            result.push(obj);
        }
    }
    return result;
};


/**
 * Retrieves a value from a data row by checking a list of possible keys.
 * @param row The object representing a row of data.
 * @param keys An array of possible keys to check for.
 * @returns The value of the first matching key, or undefined if no key is found.
 */
export const getDataFromRow = (row: Record<string, any>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = row[key];
    // IMPORTANT: Return undefined for null, undefined, or empty/whitespace strings
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return undefined;
};