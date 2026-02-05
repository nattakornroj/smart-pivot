import { useState } from 'react';
import './index.css';
import { UploadZone } from './features/upload/UploadZone';
import { SheetSelector } from './features/sheet/SheetSelector';
import { PivotView } from './features/pivot/PivotView';
import type { WorkbookData } from './utils/types';

function App() {
  const [step, setStep] = useState<'upload' | 'select' | 'pivot'>('upload');
  const [data, setData] = useState<WorkbookData | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);

  const handleDataLoaded = (wbData: WorkbookData) => {
    setData(wbData);
    setStep('select');
  };

  const handleSheetConfirm = (sheets: string[]) => {
    setSelectedSheets(sheets);
    setStep('pivot');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      <header className="animate-fade-in" style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{
          margin: 0,
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '3.5rem',
          fontWeight: 800,
          letterSpacing: '-2px',
          filter: 'drop-shadow(0 0 20px var(--accent-glow))'
        }}>
          Smart Pivot
        </h1>
      </header>

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: step === 'pivot' ? 'stretch' : 'center' }}>
        {step === 'upload' && (
          <UploadZone onDataLoaded={handleDataLoaded} />
        )}

        {step === 'select' && data && (
          <SheetSelector
            sheets={data.sheets}
            onConfirm={handleSheetConfirm}
            onBack={() => { setData(null); setStep('upload'); }}
          />
        )}

        {step === 'pivot' && data && (
          <PivotView
            data={data}
            selectedSheets={selectedSheets}
            onBack={() => setStep('select')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
