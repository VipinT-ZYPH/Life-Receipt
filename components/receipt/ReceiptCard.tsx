'use client';

import React from 'react';
import { 
  Music, 
  ShoppingBag, 
  CreditCard, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  RotateCcw, 
  Shuffle, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { AnyReceipt, SpotifyReceipt, HouseholdReceipt, IndiaTransReceipt } from '@/lib/types';

interface ReceiptCardProps {
  receipt: AnyReceipt;
  onSelect: (receipt: AnyReceipt) => void;
  onExploreThread?: (receipt: AnyReceipt) => void;
  compact?: boolean;
}

export function ReceiptCard({ receipt, onSelect, onExploreThread, compact = false }: ReceiptCardProps) {
  const isSpotify = receipt.source === 'spotify';
  const isHousehold = receipt.source === 'household';
  const isIndia = receipt.source === 'india_trans';

  const spotify = isSpotify ? (receipt as SpotifyReceipt) : null;
  const household = isHousehold ? (receipt as HouseholdReceipt) : null;
  const india = isIndia ? (receipt as IndiaTransReceipt) : null;

  const sourceConfig = {
    spotify: {
      badge: 'Spotify Play',
      badgeBg: 'bg-sky-950/60 text-sky-400 border-sky-800/40',
      icon: Music,
      accentBorder: 'hover:border-sky-500/40'
    },
    household: {
      badge: 'Household Record',
      badgeBg: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
      icon: ShoppingBag,
      accentBorder: 'hover:border-emerald-500/40'
    },
    india_trans: {
      badge: 'Commerce Record',
      badgeBg: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
      icon: CreditCard,
      accentBorder: 'hover:border-amber-500/40'
    }
  };

  const currentCfg = sourceConfig[receipt.source];
  const SourceIcon = currentCfg.icon;

  if (compact) {
    return (
      <div 
        id={`receipt-card-compact-${receipt.id}`}
        onClick={() => onSelect(receipt)}
        className={`p-3 rounded-lg bg-[#141722] border border-[#23293b] ${currentCfg.accentBorder} cursor-pointer transition-all duration-150 hover:bg-[#1a1f2e] group flex items-center justify-between space-x-3`}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 rounded-md bg-[#1d2232] text-slate-300">
            <SourceIcon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-mono font-medium text-slate-200 truncate group-hover:text-white">
              {receipt.primaryTitle}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {receipt.secondaryTitle} • {receipt.dateStr}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {receipt.amountFormatted ? (
            <span className="text-xs font-mono font-semibold text-amber-400">
              {receipt.amountFormatted}
            </span>
          ) : spotify ? (
            <span className="text-[11px] font-mono text-slate-400">
              {spotify.durationFormatted}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      id={`receipt-card-${receipt.id}`}
      onClick={() => onSelect(receipt)}
      className={`relative flex flex-col justify-between p-4 rounded-xl bg-[#12151f] border border-[#212738] ${currentCfg.accentBorder} cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 group overflow-hidden`}
    >
      {/* Top Header metadata */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${currentCfg.badgeBg}`}>
            <SourceIcon className="w-3 h-3" />
            <span>{currentCfg.badge}</span>
          </span>

          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{receipt.dateStr}</span>
            <span className="text-slate-500">•</span>
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{receipt.timeStr}</span>
          </div>
        </div>

        {/* Primary and secondary titles */}
        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-1">
          {receipt.primaryTitle}
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5 line-clamp-1">
          {receipt.secondaryTitle}
        </p>

        {/* Specific source data attributes */}
        <div className="mt-3 pt-3 border-t border-[#1c2232] flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
          {spotify && (
            <>
              <span className="px-1.5 py-0.5 rounded bg-[#181d2a] text-slate-300">
                {spotify.platform}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#181d2a] text-slate-300">
                {spotify.durationFormatted}
              </span>
              {spotify.skipped && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-400 border border-rose-900/40">
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Skipped</span>
                </span>
              )}
              {spotify.shuffle && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-900/40">
                  <Shuffle className="w-2.5 h-2.5" />
                  <span>Shuffle</span>
                </span>
              )}
            </>
          )}

          {household && (
            <>
              <span className="px-1.5 py-0.5 rounded bg-[#181d2a] text-slate-300">
                {household.mode}
              </span>
              <span className="font-semibold text-emerald-400">
                {household.amountFormatted}
              </span>
            </>
          )}

          {india && (
            <>
              <span className="px-1.5 py-0.5 rounded bg-[#181d2a] text-slate-300">
                {india.city}
              </span>
              <span className="font-semibold text-amber-400">
                {india.amountFormatted}
              </span>
              {india.is_fraud && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/50">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                  <span>Anomaly</span>
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer hover hint & Explore thread trigger */}
      <div className="mt-3.5 pt-2 border-t border-[#181e2b] flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-mono text-[10px]">
          ID: {receipt.id.slice(0, 14)}...
        </span>

        <div className="flex items-center space-x-2">
          {onExploreThread && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExploreThread(receipt);
              }}
              className="text-sky-400 hover:text-sky-300 font-medium inline-flex items-center space-x-0.5 text-[11px] focus:outline-none"
              title="Explore thread sequence"
            >
              <span>Thread</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
          <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
            <FileText className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
