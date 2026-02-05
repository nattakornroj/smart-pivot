
export interface DataRow {
    [key: string]: string | number | boolean | null;
}

export interface SheetInfo {
    name: string;
    rowCount: number;
    preview: DataRow[]; // First few rows for preview
}

export interface WorkbookData {
    fileName: string;
    sheets: SheetInfo[];
    // We might load full data on demand or all at once. For simplicity, let's load all for now if files aren't huge.
    // Or keep raw data in memory mapped by sheet name.
    rawSheets: Record<string, DataRow[]>;
}

export type PivotField = string;

export interface PivotConfig {
    rows: PivotField[];
    columns: PivotField[];
    values: {
        field: PivotField;
        aggregator: 'sum' | 'count' | 'average' | 'min' | 'max' | 'percentage';
    }[];
}

export interface PivotResult {
    headers: string[];
    data: any[][];
}

export interface PivotViewProps {
    data: WorkbookData;
    selectedSheets: string[];
    onBack: () => void;
}
