import * as XLSX from 'xlsx';
import type { DataRow, SheetInfo, WorkbookData } from './types';

export const parseExcelFile = async (file: File): Promise<WorkbookData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    throw new Error('Failed to read file');
                }

                const workbook = XLSX.read(data, { type: 'array' });
                const sheetNames = workbook.SheetNames;
                const rawSheets: Record<string, DataRow[]> = {};
                const sheets: SheetInfo[] = [];

                sheetNames.forEach((name) => {
                    const sheet = workbook.Sheets[name];
                    // Convert sheet to JSON
                    const jsonData = XLSX.utils.sheet_to_json<DataRow>(sheet, { defval: null });

                    if (jsonData.length > 0) {
                        rawSheets[name] = jsonData;
                        sheets.push({
                            name,
                            rowCount: jsonData.length,
                            preview: jsonData.slice(0, 5)
                        });
                    }
                });

                resolve({
                    fileName: file.name,
                    sheets,
                    rawSheets
                });
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};
