
import type { DataRow, PivotConfig, PivotResult } from './types';

export const performPivot = (data: DataRow[], config: PivotConfig): PivotResult => {
    if (!data || data.length === 0) return { headers: [], data: [] };

    const { rows, columns, values } = config;

    // A. Collect unique grouping keys (Rows and Columns)
    // Map: RowKey -> ColumnKey -> DataRow[]
    const nodeMap: Record<string, Record<string, DataRow[]>> = {};
    const allColKeys = new Set<string>();

    data.forEach(row => {
        const rowKey = rows.length > 0
            ? rows.map(f => String(row[f] || '(Empty)')).join('::')
            : 'Total';

        const colKey = columns.length > 0
            ? columns.map(f => String(row[f] || '(Empty)')).join('::')
            : 'Total';

        allColKeys.add(colKey);

        if (!nodeMap[rowKey]) nodeMap[rowKey] = {};
        if (!nodeMap[rowKey][colKey]) nodeMap[rowKey][colKey] = [];

        nodeMap[rowKey][colKey].push(row);
    });

    // Sort Column Keys to ensure consistent order
    const sortedColKeys = Array.from(allColKeys).sort();

    // B. Build Headers
    // 1. Static headers for Row Fields
    // 2. Dynamic headers for Column Keys x Values
    const headers = [...rows];

    if (columns.length > 0) {
        // If we have columns, we repeat Value headers for each Column Key
        sortedColKeys.forEach(colKey => {
            values.forEach(v => {
                const label = v.aggregator === 'percentage'
                    ? `% ${v.field} `
                    : `${v.aggregator.toUpperCase()} (${v.field})`;
                headers.push(`${colKey} - ${label} `);
            });
        });
    } else {
        // Simple 1D Pivot (like before)
        values.forEach(v => {
            const label = v.aggregator === 'percentage'
                ? `% of Grand Total(${v.field})`
                : `${v.aggregator.toUpperCase()} (${v.field})`;
            headers.push(label);
        });
    }

    // C. Pre-calculate totals for Percentage aggregation
    // We need Grand Totals per Value Field to calculate % of Grand Total
    const grandTotals: Record<string, number> = {};
    if (values.some(v => v.aggregator === 'percentage')) {
        values.forEach(v => {
            if (v.aggregator === 'percentage') {
                const total = data.reduce((acc, row) => acc + (Number(row[v.field]) || 0), 0);
                grandTotals[v.field] = total || 1;
            }
        });
    }

    // D. Build Data Grid
    const resultData: any[][] = [];

    Object.entries(nodeMap).forEach(([rowKey, colMap]) => {
        const rowResult: any[] = [];

        // 1. Add Row Group Keys
        if (rows.length > 0) {
            rowResult.push(...rowKey.split('::'));
        } else {
            // If no rows config, we might want a label "Grand Total" or empty
            // But usually performPivot returns data rows. 
            // If rows=[] and columns=[], we just have 'Total' key.
            // We don't push keys if no row fields are defined, usually.
            // Let's stick to pushing keys if they exist in valid "Split" logic.
            // If rows is empty, rowKey will be 'Total'. We don't want to push 'Total' as a row key.
        }

        // 2. Add Aggregated Values for each Column Key
        const colKeysToIterate = columns.length > 0 ? sortedColKeys : ['Total'];

        colKeysToIterate.forEach(colKey => {
            const groupRows = colMap[colKey] || []; // Might be empty for this cell

            values.forEach(valConfig => {
                if (groupRows.length === 0) {
                    rowResult.push(0); // Empty cell
                    return;
                }

                const fieldValues = groupRows.map(r => Number(r[valConfig.field]) || 0);
                let calculatedValue = 0;

                switch (valConfig.aggregator) {
                    case 'sum':
                        calculatedValue = fieldValues.reduce((a, b) => a + b, 0);
                        break;
                    case 'count':
                        calculatedValue = groupRows.length;
                        break;
                    case 'average':
                        calculatedValue = fieldValues.reduce((a, b) => a + b, 0) / (fieldValues.length || 1);
                        break;
                    case 'max':
                        calculatedValue = fieldValues.length ? Math.max(...fieldValues) : 0;
                        break;
                    case 'min':
                        calculatedValue = fieldValues.length ? Math.min(...fieldValues) : 0;
                        break;
                    case 'percentage': {
                        const groupSum = fieldValues.reduce((a, b) => a + b, 0);
                        // % of Grand Total (not Row Total, per user's previous implicit request logic)
                        const total = grandTotals[valConfig.field];
                        calculatedValue = (groupSum / total) * 100;
                        break;
                    }
                }

                if (valConfig.aggregator === 'percentage') {
                    rowResult.push(`${calculatedValue.toFixed(2)}% `);
                } else {
                    rowResult.push(Math.round(calculatedValue * 100) / 100);
                }
            });
        });

        resultData.push(rowResult);
    });

    return {
        headers,
        data: resultData
    };
};

// Helper: Get available columns from data
export const getColumns = (data: DataRow[]): string[] => {
    if (!data.length) return [];
    return Object.keys(data[0]);
};
