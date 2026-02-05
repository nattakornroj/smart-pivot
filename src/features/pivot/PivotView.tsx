import React, { useRef, useMemo } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PivotTable } from './PivotTable';
import { usePivotLogic } from './usePivotLogic';
import type { PivotViewProps, DataRow } from '../../utils/types';
import { X, ArrowLeft, Download, Image as ImageIcon, Save, Upload } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import html2canvas from 'html2canvas';
import {
    DndContext,
    DragOverlay,
    useDroppable,
    closestCenter
} from '@dnd-kit/core';
// Unused types removed
import {
    SortableContext,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { DraggableTag } from '../../components/DraggableTag';
import { SortableTag } from '../../components/SortableTag';

// Local PivotViewProps removed to use imported one from types.ts

// Droppable Container Component
const DroppableArea = ({ id, children, style }: { id: string; children: React.ReactNode; style?: React.CSSProperties }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div ref={setNodeRef} style={{
            ...style,
            borderColor: isOver ? 'var(--accent-primary)' : 'var(--border-primary)',
            background: isOver ? 'rgba(99, 102, 241, 0.05)' : undefined
        }}>
            {children}
        </div>
    );
};

export const PivotView: React.FC<PivotViewProps> = ({ data, selectedSheets, onBack }) => {
    const tableRef = useRef<HTMLDivElement>(null);

    // Merge Data needed for hook
    const mergedData = useMemo(() => {
        let allRows: DataRow[] = [];
        // If no specific sheets selected (shouldn't happen in current flow but safe to handle), use all
        const sheetsToUse = selectedSheets.length > 0 ? selectedSheets : Object.keys(data.rawSheets);

        sheetsToUse.forEach(sheetName => {
            // Handle case where selectedSheets might be IDs or Names. 
            // Based on previous code: selectedSheets.forEach(name => ... data.rawSheets[name])
            // Let's assume selectedSheets contains keys for rawSheets.
            if (data.rawSheets[sheetName]) {
                allRows = [...allRows, ...data.rawSheets[sheetName]];
            }
        });
        return allRows;
    }, [data, selectedSheets]);

    // Use Custom Hook
    const {
        config,
        setConfig,
        columns,
        pivotResult,
        activeId,
        activeItem,
        handleDragStart,
        handleDragEnd,
        toggleRow,
        toggleColumn,
        removeValue,
        updateAggregator
    } = usePivotLogic(mergedData);

    // Export Logic
    const handleExportExcel = () => {
        const ws = utils.aoa_to_sheet([pivotResult.headers, ...pivotResult.data]);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Pivot Analysis");
        writeFile(wb, "pivot_analysis.xlsx");
    };

    const handleSaveConfig = () => {
        const jsonString = JSON.stringify(config, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = href;
        link.download = "smart_pivot_config.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLoadConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (Array.isArray(json.rows) && Array.isArray(json.values)) {
                    setConfig(json);
                } else {
                    alert('Invalid configuration file.');
                }
            } catch (error) {
                console.error('Error parsing config:', error);
                alert('Error loading configuration.');
            }
        };
        reader.readAsText(file);
    };

    const handleExportPng = async () => {
        if (tableRef.current) {
            // html2canvas needs the element to be visible and fully rendered.
            // With virtualized table, only visible rows are rendered.
            // We might need a workaround for full PNG export of virtualized table 
            // OR alert user about limitation (snapshot of view).
            // For now, let's capture what is in the container.
            const canvas = await html2canvas(tableRef.current);
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = "pivot_analysis.png";
            link.click();
        }
    };

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="animate-fade-in" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft size={20} /> Back</Button>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Analysis Dashboard</h2>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                analyze_data.xlsx • {mergedData.length.toLocaleString()} rows • {selectedSheets.length} sheets
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ borderRight: '1px solid var(--border-primary)', paddingRight: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                            <Button variant="secondary" size="sm" onClick={handleSaveConfig} title="Save Config to PC">
                                <Save size={18} style={{ marginRight: '8px' }} /> Save Config
                            </Button>
                            <label style={{ cursor: 'pointer' }}>
                                <input type="file" accept=".json" onChange={handleLoadConfig} style={{ display: 'none' }} />
                                <div style={{
                                    padding: '8px 16px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-primary)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s',
                                    height: '36px'
                                }}>
                                    <Upload size={18} style={{ marginRight: '8px' }} /> Load Config
                                </div>
                            </label>
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleExportPng}>
                            <ImageIcon size={18} style={{ marginRight: '8px' }} /> Export Image
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleExportExcel}>
                            <Download size={18} style={{ marginRight: '8px' }} /> Export Excel
                        </Button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                    {/* Sidebar Controls */}
                    <Card style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-surface)' }}>
                        {/* Source Fields */}
                        <div>
                            <h3 style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '1rem' }}>
                                Source Fields (Drag Me)
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {columns.map(col => (
                                    <DraggableTag key={col} id={`source-${col}`} data={{ type: 'source', field: col }}>
                                        <div style={{
                                            padding: '6px 10px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border-primary)',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            cursor: 'grab'
                                        }}>
                                            <span>{col}</span>
                                        </div>
                                    </DraggableTag>
                                ))}
                            </div>
                        </div>

                        {/* Rows Area */}
                        <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '1rem' }}>
                            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Rows (Group By)</h3>
                            <DroppableArea id="rows-container" style={{ minHeight: '60px', borderRadius: '6px', border: '1px dashed var(--border-primary)', padding: '0.5rem' }}>
                                <SortableContext items={config.rows.map(r => `row-${r}`)} strategy={verticalListSortingStrategy}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {config.rows.map(r => (
                                            <SortableTag key={r} id={`row-${r}`} data={{ type: 'row', field: r }}>
                                                <div style={{
                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                                    padding: '0.75rem',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    fontSize: '0.9rem',
                                                    cursor: 'grab'
                                                }}>
                                                    <span>{r}</span>
                                                    <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onPointerDown={(e) => { e.stopPropagation(); toggleRow(r); }} />
                                                </div>
                                            </SortableTag>
                                        ))}
                                        {config.rows.length === 0 && <span style={{ padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', display: 'block' }}>Drag fields here</span>}
                                    </div>
                                </SortableContext>
                            </DroppableArea>
                        </div>

                        {/* Columns Area */}
                        <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '1rem' }}>
                            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Columns (Split By)</h3>
                            <DroppableArea id="cols-container" style={{ minHeight: '60px', borderRadius: '6px', border: '1px dashed var(--border-primary)', padding: '0.5rem' }}>
                                <SortableContext items={config.columns.map(r => `col-${r}`)} strategy={verticalListSortingStrategy}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {config.columns.map(c => (
                                            <SortableTag key={c} id={`col-${c}`} data={{ type: 'col', field: c }}>
                                                <div style={{
                                                    background: 'rgba(236, 72, 153, 0.1)',
                                                    border: '1px solid rgba(236, 72, 153, 0.3)',
                                                    padding: '0.75rem',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    fontSize: '0.9rem',
                                                    cursor: 'grab'
                                                }}>
                                                    <span>{c}</span>
                                                    <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onPointerDown={(e) => { e.stopPropagation(); toggleColumn(c); }} />
                                                </div>
                                            </SortableTag>
                                        ))}
                                        {config.columns.length === 0 && <span style={{ padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', display: 'block' }}>Drag fields here</span>}
                                    </div>
                                </SortableContext>
                            </DroppableArea>
                        </div>

                        {/* Values Area */}
                        <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Values (Metrics)</h3>
                            <DroppableArea id="values-container" style={{ minHeight: '60px', borderRadius: '6px', border: '1px dashed var(--border-primary)', padding: '0.5rem' }}>
                                <SortableContext items={config.values.map((v, i) => `value-${v.field}::${i}`)} strategy={verticalListSortingStrategy}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {config.values.map((v, idx) => {
                                            const id = `value-${v.field}::${idx}`;
                                            return (
                                                <SortableTag key={id} id={id} data={{ type: 'value', index: idx }}>
                                                    <div style={{
                                                        background: 'rgba(139, 92, 246, 0.1)',
                                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                                        padding: '0.75rem',
                                                        borderRadius: '6px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px',
                                                        cursor: 'grab'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 500 }}>
                                                            <span>{v.field}</span>
                                                            <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onPointerDown={(e) => { e.stopPropagation(); removeValue(idx); }} />
                                                        </div>
                                                        <select
                                                            value={v.aggregator}
                                                            onChange={(e) => updateAggregator(idx, e.target.value)}
                                                            onPointerDown={(e) => e.stopPropagation()} /* Prevent interaction from triggering drag */
                                                            style={{
                                                                background: 'rgba(0,0,0,0.2)',
                                                                color: 'var(--text-secondary)',
                                                                border: '1px solid var(--border-primary)',
                                                                fontSize: '0.8rem',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                width: '100%',
                                                                outline: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <option value="sum">Sum</option>
                                                            <option value="count">Count</option>
                                                            <option value="average">Average</option>
                                                            <option value="min">Minimum</option>
                                                            <option value="max">Maximum</option>
                                                            <option value="percentage">% of Grand Total</option>
                                                        </select>
                                                    </div>
                                                </SortableTag>
                                            );
                                        })}
                                        {config.values.length === 0 && <span style={{ padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', display: 'block' }}>Drag fields here</span>}
                                    </div>
                                </SortableContext>
                            </DroppableArea>
                        </div>
                    </Card>

                    {/* Main Table Container */}
                    <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
                        <div ref={tableRef} style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
                            <PivotTable data={pivotResult} />
                        </div>
                    </Card>
                </div>

                {/* Drag Overlay for smooth visual feedback */}
                <DragOverlay dropAnimation={null}>
                    {activeId ? (
                        activeItem?.type === 'source' ? (
                            <div style={{
                                padding: '6px 10px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--accent-primary)',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                cursor: 'grabbing',
                                width: 'max-content'
                            }}>
                                <span>{activeItem?.field || 'Item'}</span>
                            </div>
                        ) : (
                            <div style={{
                                padding: '0.75rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--accent-primary)',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '0.9rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                cursor: 'grabbing',
                                width: '280px' // Match approx width of sidebar items
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                    <span>{activeItem?.field || activeId.replace(/^(row|col|value)-/, '')}</span>
                                    {activeItem?.type === 'value' && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                                            {config.values[activeItem.index]?.aggregator}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};
