import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import type { SheetInfo } from '../../utils/types';
import { Check, Database } from 'lucide-react';

interface SheetSelectorProps {
    sheets: SheetInfo[];
    onConfirm: (selectedSheets: string[]) => void;
    onBack: () => void;
}

export const SheetSelector: React.FC<SheetSelectorProps> = ({ sheets, onConfirm, onBack }) => {
    const [selected, setSelected] = useState<string[]>(sheets.map(s => s.name));

    const toggleSheet = (name: string) => {
        setSelected(prev =>
            prev.includes(name)
                ? prev.filter(s => s !== name)
                : [...prev, name]
        );
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', width: '100%' }}>
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 700 }}>
                <div style={{ background: 'var(--accent-gradient)', padding: '8px', borderRadius: '8px' }}>
                    <Database size={24} color="white" />
                </div>
                Select Data Sheets
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {sheets.map(sheet => {
                    const isSelected = selected.includes(sheet.name);
                    return (
                        <Card
                            key={sheet.name}
                            hover
                            onClick={() => toggleSheet(sheet.name)}
                            style={{
                                cursor: 'pointer',
                                borderColor: isSelected ? 'var(--accent-primary)' : undefined,
                                background: isSelected ? 'rgba(99, 102, 241, 0.1)' : undefined,
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{sheet.name}</span>
                                <div style={{
                                    width: '24px', height: '24px',
                                    borderRadius: '50%',
                                    background: isSelected ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.2s'
                                }}>
                                    {isSelected && <Check size={14} color="white" />}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {sheet.rowCount.toLocaleString()} rows
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '2px 8px', borderRadius: '10px' }}>
                                    Sheet
                                </span>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-primary)', paddingTop: '2rem' }}>
                <Button variant="ghost" onClick={onBack} size="lg">Back</Button>
                <Button
                    size="lg"
                    disabled={selected.length === 0}
                    onClick={() => onConfirm(selected)}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                >
                    Analyze {selected.length} Sheets
                </Button>
            </div>
        </div>
    );
};
