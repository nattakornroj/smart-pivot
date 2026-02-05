import { forwardRef } from 'react';
import type { PivotResult } from '../../utils/types';

interface PivotTableProps {
    data: PivotResult;
}

export const PivotTable = forwardRef<HTMLDivElement, PivotTableProps>(({ data }, ref) => {
    // If no data, show message
    if (!data.data.length && !data.headers.length) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Drag your data to start analysis
            </div>
        );
    }

    const { headers, data: rows } = data;

    return (
        <div ref={ref} style={{ flex: 1, background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ overflow: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 10 }}>
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} style={{
                                    padding: '1rem 1.5rem',
                                    textAlign: 'left',
                                    borderBottom: '2px solid var(--border-primary)',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    textTransform: 'uppercase',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} style={{
                                borderBottom: '1px solid var(--border-highlight)',
                                background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'
                            }}>
                                {row.map((cell, j) => (
                                    <td key={j} style={{ padding: '0.85rem 1.5rem', color: 'var(--text-primary)' }}>
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

PivotTable.displayName = 'PivotTable';
