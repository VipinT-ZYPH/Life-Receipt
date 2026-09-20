'use client';

import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Cpu, Layers } from 'lucide-react';

interface DataIntegrityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataIntegrityModal({ isOpen, onClose }: DataIntegrityModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-[#11141c] border border-[#272e42] rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161a25] border-b border-[#23293b]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wider">
                DATA INTEGRITY & METHODOLOGY STATEMENT
              </h2>
              <p className="text-[11px] text-slate-400">
                Ethical boundary framework for LIFE//RECEIPT
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed">
          
          {/* Core Principle Alert */}
          <div className="p-4 rounded-xl bg-[#161c28] border border-[#2b354c] space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-mono font-bold text-xs uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>THE ZERO-FABRICATION PROTOCOL</span>
            </div>
            <p className="text-slate-300">
              This application strictly adheres to the principle that <strong className="text-white">no single real-world individual identity is assumed across datasets</strong>. There is no guaranteed common user ID connecting the three disparate datasets. Every connection is derived strictly from observable mathematical and contextual proximity.
            </p>
          </div>

          {/* Three Tiers of Knowledge */}
          <div className="space-y-3">
            <h3 className="font-mono font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>THE THREE-TIER EPISTEMIC FRAMEWORK</span>
            </h3>

            <div className="space-y-3 font-mono">
              <div className="p-3.5 rounded-xl bg-[#141722] border border-[#212738]">
                <div className="text-emerald-400 font-bold mb-1 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>TIER 1: OBSERVED DATA (EMPIRICAL)</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  Direct raw attributes provided by the datasets: Timestamps, play duration, track titles, artist names, monetary values, payment modes, and geocoded coordinates.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141722] border border-[#212738]">
                <div className="text-sky-400 font-bold mb-1 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>TIER 2: DERIVED CONNECTIONS (STATISTICAL)</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  Measurable relationships computed algorithmically: Same-date occurrences, rolling time proximity windows (&plusmn;3h), repeated artist affinity, skip-rate disparities in shuffle mode, and diurnal rhythm peaks.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141722] border border-[#212738]">
                <div className="text-purple-400 font-bold mb-1 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span>TIER 3: INTERPRETATION (OBJECTIVE HYPOTHESIS)</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  Contextual framing of behavioral clusters (e.g. &quot;The Night Shift&quot; or &quot;Domestic Ledger Rhythms&quot;) without attributing speculative personal emotions, unrecorded life crises, or private biographies.
                </p>
              </div>
            </div>
          </div>

          {/* Dataset Provenance */}
          <div className="space-y-2 pt-2 border-t border-[#1f2536]">
            <h4 className="font-mono font-bold text-xs text-slate-300 uppercase">
              DATASET SPECS & BOUNDARIES
            </h4>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              <li><strong className="text-slate-200">Spotify Telemetry:</strong> ~150K records span 2013–2024 with audio platforms, tracks, skip flags.</li>
              <li><strong className="text-slate-200">Daily Household:</strong> 2,461 transaction records span 2015–2018 in INR currency.</li>
              <li><strong className="text-slate-200">Augmented India Trans:</strong> 10,267 commerce records span 2022–2024 across 8 urban metros with anomaly monitoring.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#151924] border-t border-[#23293b] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            I Understand & Acknowledge
          </button>
        </div>

      </div>
    </div>
  );
}
