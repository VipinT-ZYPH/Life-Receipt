'use client';

import React from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  ShieldAlert, 
  Compass, 
  Music, 
  ShoppingBag, 
  CreditCard 
} from 'lucide-react';
import { AnyReceipt, SpotifyReceipt, HouseholdReceipt, IndiaTransReceipt } from '@/lib/types';

interface ThermalReceiptModalProps {
  receipt: AnyReceipt | null;
  onClose: () => void;
  onExploreThread: (receipt: AnyReceipt) => void;
  onSelectRelated?: (receipt: AnyReceipt) => void;
  relatedReceipts?: AnyReceipt[];
}

export function ThermalReceiptModal({
  receipt,
  onClose,
  onExploreThread,
  onSelectRelated,
  relatedReceipts = []
}: ThermalReceiptModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!receipt) return null;

  const isSpotify = receipt.source === 'spotify';
  const isHousehold = receipt.source === 'household';
  const isIndia = receipt.source === 'india_trans';

  const spotify = isSpotify ? (receipt as SpotifyReceipt) : null;
  const household = isHousehold ? (receipt as HouseholdReceipt) : null;
  const india = isIndia ? (receipt as IndiaTransReceipt) : null;

  const handleCopyId = () => {
    navigator.clipboard?.writeText(JSON.stringify(receipt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-receipt-title"
    >
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg my-8 bg-[#11141c] border border-[#262c3e] rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#161a25] border-b border-[#23293b]">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider">
              RECEIPT ARCHIVE // RECORD #{receipt.id.slice(0, 8)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyId}
              className="p-1.5 rounded-lg bg-[#1e2333] hover:bg-[#282f45] text-slate-300 text-xs flex items-center space-x-1 transition-colors"
              title="Copy JSON record"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              id="close-receipt-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1e2333] hover:bg-rose-950 hover:text-rose-300 text-slate-300 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Slip Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Authentic Thermal Paper Box */}
          <div className="receipt-paper p-6 rounded-xl border border-[#2b334a] font-mono text-slate-200">
            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-dashed border-[#343d56]">
              <div className="text-base font-bold tracking-widest text-slate-100">
                LIFE//RECEIPT
              </div>
              <div className="text-[10px] text-slate-400 tracking-wider mt-0.5 uppercase">
                DIGITAL FRAGMENT PROVENANCE LOG
              </div>
              <div className="text-[11px] text-sky-400 font-semibold mt-1">
                {receipt.source === 'spotify' && 'AUDIO STREAMING TELEMETRY'}
                {receipt.source === 'household' && 'DAILY HOUSEHOLD FISCAL RECORD'}
                {receipt.source === 'india_trans' && 'MULTI-FACET COMMERCE RECEIPT'}
              </div>
            </div>

            {/* Date & Time Grid */}
            <div className="py-3 border-b border-dashed border-[#343d56] grid grid-cols-2 text-xs gap-y-1">
              <div className="text-slate-400">DATE RECORDED:</div>
              <div className="text-right text-slate-200 font-semibold">{receipt.dateStr}</div>
              <div className="text-slate-400">EXACT TIMESTAMP:</div>
              <div className="text-right text-slate-200 font-semibold">{receipt.timeStr} (UTC)</div>
              <div className="text-slate-400">YEAR / PERIOD:</div>
              <div className="text-right text-slate-200">{receipt.year} Q{Math.ceil(receipt.month / 3)}</div>
              <div className="text-slate-400">DATASET SOURCE:</div>
              <div className="text-right text-sky-300 uppercase">{receipt.source}</div>
            </div>

            {/* Core Item Payload */}
            <div className="py-4 border-b border-dashed border-[#343d56] space-y-2">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">PRIMARY RECORD ITEM:</div>
              <div className="text-sm font-bold text-white bg-[#0e1017] p-2.5 rounded border border-[#22283a]">
                {receipt.primaryTitle}
              </div>
              <div className="text-xs text-slate-300">
                <span className="text-slate-500">CONTEXT: </span>
                {receipt.secondaryTitle}
              </div>
            </div>

            {/* Field Breakdown by Source */}
            <div className="py-3 border-b border-dashed border-[#343d56] space-y-1.5 text-xs">
              {spotify && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Artist:</span>
                    <span className="text-white font-medium">{spotify.artist_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Album:</span>
                    <span className="text-slate-300 truncate max-w-[200px]">{spotify.album_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span className="text-slate-300">{spotify.durationFormatted} ({spotify.ms_played.toLocaleString()} ms)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Platform:</span>
                    <span className="text-slate-300">{spotify.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Start Reason:</span>
                    <span className="text-slate-300">{spotify.reason_start}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">End Reason:</span>
                    <span className="text-slate-300">{spotify.reason_end}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Skipped:</span>
                    <span className={spotify.skipped ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {spotify.skipped ? 'YES (Skipped)' : 'NO (Completed)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shuffle:</span>
                    <span className="text-slate-300">{spotify.shuffle ? 'ON' : 'OFF'}</span>
                  </div>
                </>
              )}

              {household && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-white font-medium">{household.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subcategory:</span>
                    <span className="text-slate-300">{household.subcategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Mode:</span>
                    <span className="text-slate-300">{household.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fiscal Type:</span>
                    <span className={household.income_expense === 'Income' ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {household.income_expense}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1">
                    <span className="text-slate-300">Total Amount:</span>
                    <span className={household.income_expense === 'Income' ? 'text-emerald-400' : 'text-amber-400'}>
                      {household.amountFormatted}
                    </span>
                  </div>
                </>
              )}

              {india && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Merchant:</span>
                    <span className="text-white font-medium">{india.merchant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-slate-300">{india.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-slate-300">{india.city}, {india.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Job Title:</span>
                    <span className="text-slate-300">{india.job}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Anomaly Check:</span>
                    <span className={india.is_fraud ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {india.is_fraud ? 'FLAGGED ANOMALY' : 'PASS (Legitimate)'}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1">
                    <span className="text-slate-300">Transaction Amt:</span>
                    <span className="text-amber-400">{india.amountFormatted}</span>
                  </div>
                </>
              )}
            </div>

            {/* Simulated Barcode */}
            <div className="pt-4 text-center">
              <div className="h-9 w-full flex items-center justify-center space-x-[2px] opacity-75">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-300 h-full"
                    style={{ width: `${(i % 3 === 0 ? 3 : 1.5)}px` }}
                  />
                ))}
              </div>
              <div className="text-[10px] text-slate-400 tracking-widest mt-1">
                AUTH-{receipt.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 16)}
              </div>
            </div>
          </div>

          {/* Three-Tier Data Integrity Breakdown */}
          <div className="p-4 rounded-xl bg-[#141824] border border-[#252b3e] space-y-2.5 text-xs">
            <div className="flex items-center space-x-2 text-sky-400 font-mono font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>DEFENSIBLE RELATIONSHIP TIERS</span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div>
                <span className="px-1.5 py-0.5 rounded bg-[#1e2436] text-slate-300 font-mono text-[10px] font-bold mr-1.5">
                  1. OBSERVED
                </span>
                <span className="text-slate-300">
                  Record logged on {receipt.dateStr} at {receipt.timeStr} ({receipt.source.toUpperCase()}).
                </span>
              </div>
              <div>
                <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-mono text-[10px] font-bold mr-1.5 border border-sky-800/40">
                  2. DERIVED
                </span>
                <span className="text-slate-300">
                  Forms part of the {receipt.year} behavioral signature under the &quot;{receipt.category}&quot; cluster.
                </span>
              </div>
              <div>
                <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] font-bold mr-1.5 border border-purple-800/40">
                  3. INTERPRETATION
                </span>
                <span className="text-slate-400">
                  Digital and fiscal activities are synchronized through temporal proximity without asserting single-individual identity.
                </span>
              </div>
            </div>
          </div>

          {/* Related Receipts section if available */}
          {relatedReceipts.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                TEMPORALLY PROXIMATE RECEIPTS (±7 DAYS)
              </h4>
              <div className="space-y-2">
                {relatedReceipts.slice(0, 3).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated?.(rel)}
                    className="p-3 rounded-lg bg-[#141722] hover:bg-[#1a2030] border border-[#23293a] cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{rel.primaryTitle}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{rel.dateStr} • {rel.timeStr}</div>
                    </div>
                    <span className="text-sky-400 font-mono text-[11px] flex items-center space-x-1">
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#141824] border-t border-[#23293b] flex items-center justify-between gap-3">
          <button
            onClick={() => onExploreThread(receipt)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/20 transition-all focus:ring-2 focus:ring-sky-400"
          >
            <Compass className="w-4 h-4" />
            <span>EXPLORE THIS THREAD (NARRATIVE SEQUENCE)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
