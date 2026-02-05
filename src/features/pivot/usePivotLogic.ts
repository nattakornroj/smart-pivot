import { useState, useMemo } from 'react';
import type { PivotConfig, DataRow } from '../../utils/types';
import { performPivot, getColumns } from '../../utils/pivotEngine';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export const usePivotLogic = (data: DataRow[]) => {
    // 1. Config State
    const [config, setConfig] = useState<PivotConfig>({
        rows: [],
        columns: [],
        values: []
    });

    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<any>(null);

    // 2. Computed Data
    const columns = useMemo(() => getColumns(data), [data]);
    const pivotResult = useMemo(() => performPivot(data, config), [data, config]);

    // 3. Actions
    const toggleRow = (field: string) => {
        setConfig(prev => ({
            ...prev,
            rows: prev.rows.includes(field) ? prev.rows.filter(f => f !== field) : [...prev.rows, field]
        }));
    };

    const toggleColumn = (field: string) => {
        setConfig(prev => ({
            ...prev,
            columns: prev.columns.includes(field) ? prev.columns.filter(f => f !== field) : [...prev.columns, field]
        }));
    };

    const addValue = (field: string) => {
        setConfig(prev => ({
            ...prev,
            values: [...prev.values, { field, aggregator: 'count' }]
        }));
    };

    const removeValue = (index: number) => {
        setConfig(prev => ({
            ...prev,
            values: prev.values.filter((_, i) => i !== index)
        }));
    };

    const updateAggregator = (index: number, agg: any) => {
        setConfig(prev => {
            const newValues = [...prev.values];
            newValues[index] = { ...newValues[index], aggregator: agg };
            return { ...prev, values: newValues };
        });
    };

    // 4. DnD Logic
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        setActiveItem(event.active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);

        if (!over) return;

        const activeType = active.data.current?.type;
        const overId = over.id as string;

        if (activeType === 'source') {
            const field = active.data.current?.field;
            if (overId === 'rows-container' || overId.startsWith('row-')) {
                if (!config.rows.includes(field) && !config.columns.includes(field)) {
                    setConfig(prev => ({ ...prev, rows: [...prev.rows, field] }));
                }
            } else if (overId === 'cols-container' || overId.startsWith('col-')) {
                if (!config.columns.includes(field) && !config.rows.includes(field)) {
                    setConfig(prev => ({ ...prev, columns: [...prev.columns, field] }));
                }
            } else if (overId === 'values-container' || overId.startsWith('value-')) {
                addValue(field);
            }
        }

        if (activeType === 'row' && overId.startsWith('row-')) {
            const oldIndex = config.rows.findIndex(r => `row-${r}` === active.id);
            const newIndex = config.rows.findIndex(r => `row-${r}` === overId);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                setConfig(prev => ({ ...prev, rows: arrayMove(prev.rows, oldIndex, newIndex) }));
            }
        }

        if (activeType === 'col' && overId.startsWith('col-')) {
            const oldIndex = config.columns.findIndex(r => `col-${r}` === active.id);
            const newIndex = config.columns.findIndex(r => `col-${r}` === overId);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                setConfig(prev => ({ ...prev, columns: arrayMove(prev.columns, oldIndex, newIndex) }));
            }
        }

        if (activeType === 'value' && overId.startsWith('value-')) {
            const oldIndex = parseInt((active.id as string).split('::')[1]);
            const newIndex = parseInt(overId.split('::')[1]);
            if (!isNaN(oldIndex) && !isNaN(newIndex) && oldIndex !== newIndex) {
                setConfig(prev => ({ ...prev, values: arrayMove(prev.values, oldIndex, newIndex) }));
            }
        }
    };

    return {
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
    };
};
