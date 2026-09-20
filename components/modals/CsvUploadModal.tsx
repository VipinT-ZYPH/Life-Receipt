'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Layers,
  Music,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { parseCsvFile } from '@/lib/data/dataset-loader';
import { AnyReceipt } from '@/lib/types';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptsImported: (newReceipts: AnyReceipt[], format: string) => void;
}

export function CsvUploadModal({
  isOpen,
  onClose,
  onReceiptsImported
}: CsvUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ count: number; format: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please provide a valid CSV file (.csv format).');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const result = await parseCsvFile(file);
      setSuccessInfo({ count: result.totalParsed, format: result.format });
      setTimeout(() => {
        onReceiptsImported(result.receipts, result.format);
        setLoading(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to parse CSV file.');
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-[#11141c] border border-[#272e42] rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161a25] border-b border-[#23293b]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wider">
                IMPORT CSV LIFE RECEIPTS
              </h2>
              <p className="text-[11px] text-slate-400">
                Auto-detects Spotify, Household, or India Commerce schemas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1e2333] hover:bg-rose-950 hover:text-rose-300 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5">
          
          {/* Supported Format Pills */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
            <div className="p-2.5 rounded-xl bg-[#141722] border border-[#222838] flex flex-col items-center">
              <Music className="w-4 h-4 text-sky-400 mb-1" />
              <span className="text-slate-200 font-semibold">Spotify</span>
              <span className="text-slate-400 text-[10px]">spotify_history.csv</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141722] border border-[#222838] flex flex-col items-center">
              <ShoppingBag className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-slate-200 font-semibold">Household</span>
              <span className="text-slate-400 text-[10px]">Daily Household.csv</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141722] border border-[#222838] flex flex-col items-center">
              <CreditCard className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-slate-200 font-semibold">Multi-Facet</span>
              <span className="text-slate-400 text-[10px]">Augmented_India.csv</span>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-sky-400 bg-sky-950/20 scale-[1.01]'
                : 'border-[#2d364c] hover:border-sky-500/50 bg-[#131622] hover:bg-[#161a28]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {loading ? (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                <p className="text-xs font-mono text-slate-300">
                  Parsing and indexing stream records in memory...
                </p>
              </div>
            ) : successInfo ? (
              <div className="flex flex-col items-center space-y-2 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
                <p className="text-xs font-mono font-bold">
                  Successfully indexed {successInfo.count.toLocaleString()} receipts ({successInfo.format.toUpperCase()})!
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2.5">
                <div className="p-3 rounded-full bg-[#1b2130] text-sky-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-medium text-slate-200">
                  <span className="text-sky-400 font-bold">Click to browse</span> or drag and drop your CSV dataset here
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Runs client-side in browser memory with instant re-indexing of Discoveries and Constellations.
                </p>
              </div>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-900 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#151924] border-t border-[#23293b] flex items-center justify-between text-xs text-slate-400">
          <span>Client-only processing (No backend required)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1e2333] hover:bg-[#282f45] text-slate-200"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
