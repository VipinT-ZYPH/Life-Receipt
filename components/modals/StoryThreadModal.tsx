'use client';

import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Compass, 
  Clock, 
  Calendar, 
  Music, 
  ShoppingBag, 
  CreditCard,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { AnyReceipt } from '@/lib/types';
import { buildStoryThread } from '@/lib/data/data-analyzer';

interface StoryThreadModalProps {
  receipt: AnyReceipt | null;
  allReceipts: AnyReceipt[];
  onClose: () => void;
  onSelectReceipt: (receipt: AnyReceipt) => void;
}

export function StoryThreadModal({
  receipt,
  allReceipts,
  onClose,
  onSelectReceipt
}: StoryThreadModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!receipt) return null;

  const thread = buildStoryThread(receipt, allReceipts);
  const sequence = thread.chronologicalSequence;
  const currentItem = sequence[currentStep] || sequence[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-[#10131b] border border-[#262c3e] rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151924] border-b border-[#222839]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wider">
                NARRATIVE STORY THREAD // {sequence.length} CONNECTED MOMENTS
              </h2>
              <p className="text-[11px] text-slate-400">
                Reconstructing temporal sequence anchored around {receipt.primaryTitle}
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

        {/* Stepper progress bar */}
        <div className="px-6 py-3 bg-[#0d0f17] border-b border-[#1f2434] flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {sequence.map((step, idx) => {
              const isCurrent = idx === currentStep;
              const isAnchor = step.receipt.id === receipt.id;
              return (
                <button
                  key={step.receipt.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    isCurrent
                      ? 'w-8 bg-sky-400'
                      : isAnchor
                      ? 'w-3 bg-amber-400'
                      : 'w-3 bg-[#242b3d] hover:bg-[#343e58]'
                  }`}
                  title={`Step ${idx + 1}: ${step.receipt.primaryTitle}`}
                />
              );
            })}
          </div>
          <span className="font-mono text-xs text-slate-400">
            MOMENT {currentStep + 1} OF {sequence.length}
          </span>
        </div>

        {/* Narrative Card Presentation */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Connection Context Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#171c2a] to-[#121622] border border-[#272f44] flex items-start space-x-3.5">
            <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/50 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wide">
                  {currentItem.connectionType}
                </span>
                <span className="text-[11px] font-mono text-slate-400 px-2 py-0.2 rounded bg-[#1e2436]">
                  {currentItem.timeDeltaFormatted}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentItem.connectionReason}
              </p>
            </div>
          </div>

          {/* Active Moment Thermal Slip */}
          <div className="receipt-paper p-6 rounded-xl border border-[#2b334a] font-mono text-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-dashed border-[#343d56]">
              <div className="flex items-center space-x-2">
                {currentItem.receipt.source === 'spotify' ? (
                  <Music className="w-4 h-4 text-sky-400" />
                ) : currentItem.receipt.source === 'household' ? (
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                ) : (
                  <CreditCard className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {currentItem.receipt.source.toUpperCase()} RECEIPT #{currentItem.receipt.id.slice(0, 8)}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {currentItem.receipt.dateStr} • {currentItem.receipt.timeStr}
              </span>
            </div>

            <div className="py-4 space-y-2 border-b border-dashed border-[#343d56]">
              <div className="text-[11px] text-slate-400 uppercase">SUBJECT:</div>
              <div className="text-base font-bold text-white bg-[#0e1017] p-3 rounded border border-[#22283a]">
                {currentItem.receipt.primaryTitle}
              </div>
              <div className="text-xs text-slate-300">
                {currentItem.receipt.secondaryTitle}
              </div>
            </div>

            <div className="py-3 text-xs grid grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-500">Category: </span>
                <span className="text-slate-200">{currentItem.receipt.category}</span>
              </div>
              <div className="text-right">
                {currentItem.receipt.amountFormatted ? (
                  <span className="font-bold text-amber-400">{currentItem.receipt.amountFormatted}</span>
                ) : (
                  <span className="text-slate-300">{(currentItem.receipt as any).durationFormatted || 'Standard Play'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Defensible Inference Note */}
          <div className="p-3.5 rounded-lg bg-[#131620] border border-[#222838] flex items-center space-x-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>
              This thread was constructed via empirical timestamp proximity (&plusmn;3 days) and category co-occurrence. No speculative life identity is asserted.
            </span>
          </div>

        </div>

        {/* Stepper Footer Controls */}
        <div className="p-4 bg-[#141824] border-t border-[#222839] flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl bg-[#1e2333] hover:bg-[#282f44] disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Moment</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectReceipt(currentItem.receipt);
            }}
            className="px-4 py-2 rounded-xl bg-[#181e2d] hover:bg-[#222a3e] text-sky-400 text-xs font-mono font-medium border border-sky-800/30"
          >
            Inspect Full Slip
          </button>

          <button
            onClick={() => setCurrentStep(Math.min(sequence.length - 1, currentStep + 1))}
            disabled={currentStep === sequence.length - 1}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <span>Next Moment</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
