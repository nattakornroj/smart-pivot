import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { parseExcelFile } from '../../utils/excelParser';
import type { WorkbookData } from '../../utils/types';

interface UploadZoneProps {
    onDataLoaded: (data: WorkbookData) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onDataLoaded }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setLoading(true);
        try {
            const data = await parseExcelFile(file);
            onDataLoaded(data);
        } catch (err) {
            console.error(err);
            alert('Error parsing file');
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <Card
            className="animate-scale-in"
            style={{
                width: '100%',
                maxWidth: '600px',
                textAlign: 'center',
                padding: '3rem',
                borderStyle: 'dashed',
                borderWidth: '2px',
                borderColor: isDragOver ? 'var(--accent-primary)' : 'var(--border-highlight)',
                background: isDragOver ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                transform: isDragOver ? 'scale(1.02)' : 'scale(1)'
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2rem',
                position: 'relative'
            }}>
                {loading ? (
                    <div className="animate-spin" style={{
                        animation: 'spin 1.5s linear infinite',
                        filter: 'drop-shadow(0 0 10px var(--accent-primary))'
                    }}>
                        <FileSpreadsheet size={80} color="var(--accent-primary)" />
                    </div>
                ) : (
                    <div style={{
                        position: 'relative',
                        filter: isDragOver ? 'drop-shadow(0 0 20px var(--accent-glow))' : 'none',
                        transition: 'filter 0.3s ease'
                    }}>
                        <UploadCloud size={80} color={isDragOver ? "var(--accent-primary)" : "var(--text-secondary)"} />
                    </div>
                )}
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {loading ? 'Processing Data...' : 'Upload Excel File'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                Drag and drop your spreadsheet here to unlock insights.
            </p>

            <Button
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
            >
                Select File
            </Button>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </Card>
    );
};
