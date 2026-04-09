import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';

interface DropZoneProps {
  onFile: (file: File) => void;
  error?: string | null;
}

export function DropZone({ onFile, error }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrag(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function processFile(file: File) {
    setLocalError(null);
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setLocalError('Only .xlsx files are supported.');
      return;
    }
    onFile(file);
  }

  const displayError = error ?? localError;

  return (
    <div className="w-full">
      <div
        className={`relative flex flex-col items-center justify-center gap-4 rounded-[12px] border-2 border-dashed py-14 px-8 transition-colors cursor-pointer ${
          dragging
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-secondary bg-card/50'
        }`}
        onDragOver={handleDrag}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleChange}
        />

        {/* Upload icon */}
        <div className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
          dragging ? 'bg-accent/20 text-accent' : 'bg-border text-secondary'
        }`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-primary">
            Drop your portfolio file here
          </p>
          <p className="mt-1 text-xs text-secondary">
            We'll load your holdings and transactions automatically.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-semibold tracking-widest text-secondary">
          <span className="rounded border border-border px-2 py-0.5">XLSX</span>
          <span className="rounded border border-border px-2 py-0.5">UP TO 20MB</span>
        </div>
      </div>

      {displayError && (
        <p className="mt-3 text-center text-sm text-loss">{displayError}</p>
      )}
    </div>
  );
}
