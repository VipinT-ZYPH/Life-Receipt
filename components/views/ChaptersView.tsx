'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Music, 
  ShoppingBag, 
  CreditCard, 
  Layers, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';
import { LifeChapter, AnyReceipt, ExplorerFilter } from '@/lib/types';

interface ChaptersViewProps {
  chapters: LifeChapter[];
  onExploreChapter: (filterPreset: Partial<ExplorerFilter>) => void;
  onSelectReceipt: (receipt: AnyReceipt) => void;
  allReceipts: AnyReceipt[];
}

export function ChaptersView({
  chapters,
  onExploreChapter,
  onSelectReceipt,
  allReceipts
}: ChaptersViewProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapters[0]?.id || 'chapter_1');

  const activeChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];

  const receiptMap = new Map<string, AnyReceipt>();
  allReceipts.forEach(r => receiptMap.set(r.id, r));

  const representativeReceipts = activeChapter?.representativeReceiptIds
    .map(id => receiptMap.get(id))
    .filter(Boolean) as AnyReceipt[];

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-[#10131d] p-6 rounded-2xl border border-[#212738] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span>EMPIRICAL LIFE CHAPTERS</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40">
              {chapters.length} Distinct Eras
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Derived through variance detection in dominant artists, device platforms, transaction category velocities, and diurnal listening shifts.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-[#151926] px-3 py-1.5 rounded-xl border border-[#242b3e]">
          Span: <span className="text-sky-300 font-bold">2013 — 2024</span>
        </div>
      </div>

      {/* Chapters Chronological Timeline Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {chapters.map((ch, idx) => {
          const isSelected = ch.id === selectedChapterId;
          return (
            <div
              key={ch.id}
              onClick={() => setSelectedChapterId(ch.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#181d2c] border-purple-400 shadow-xl shadow-purple-950/30 -translate-y-1'
                  : 'bg-[#11141e] border-[#22283a] hover:bg-[#151926] hover:border-[#323b54]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isSelected ? 'text-purple-400' : 'text-slate-400'
                  }`}>
                    ERA 0{idx + 1}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {ch.dateRange}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-2 leading-snug">
                  {ch.title.split(': ')[1] || ch.title}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-[#20273a] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">RECEIPTS:</span>
                <span className="text-purple-300 font-bold">{ch.stats.totalReceipts.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Chapter In-Depth Dossier */}
      {activeChapter && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Narrative & Evidence Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="p-6 rounded-2xl bg-[#11141e] border border-[#22283a] space-y-5">
              <div className="flex items-center justify-between border-b border-[#212739] pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-purple-400 uppercase">
                    CHAPTER {activeChapter.index} {`//`} {activeChapter.dateRange}
                  </span>
                  <h2 className="text-2xl font-black text-white mt-1">
                    {activeChapter.title}
                  </h2>
                </div>
                <button
                  id="explore-chapter-btn"
                  onClick={() => onExploreChapter({
                    dateRange: {
                      start: `${activeChapter.startYear}-01-01`,
                      end: `${activeChapter.endYear}-12-31`
                    }
                  })}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-purple-600/30 transition-all"
                >
                  <span>EXPLORE CHAPTER ARCHIVE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Evidence-based Description */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400 uppercase">EVIDENCE-BASED PROFILE:</div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {activeChapter.evidenceDescription}
                </p>
              </div>

              {/* Observed Empirical Signals List */}
              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-mono text-slate-400 uppercase font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>OBSERVED TELEMETRY SIGNALS:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeChapter.observedSignals.map((signal, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#151926] border border-[#242b3e] text-xs text-slate-300 font-mono flex items-start space-x-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{signal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chapter Key Metric Cards */}
              <div className="pt-3 border-t border-[#20273a] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#141824] border border-[#21283a]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">TOTAL PLAYS</div>
                  <div className="text-base font-bold text-white font-mono mt-1">
                    {activeChapter.stats.spotifyPlays.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#141824] border border-[#21283a]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">TRANSACTIONS</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                    {activeChapter.stats.transactionCount.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#141824] border border-[#21283a]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">NOCTURNAL %</div>
                  <div className="text-base font-bold text-amber-400 font-mono mt-1">
                    {activeChapter.stats.nightActivityPercent}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#141824] border border-[#21283a]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">ANCHOR ENTITY</div>
                  <div className="text-xs font-bold text-sky-400 font-mono mt-1 truncate">
                    {activeChapter.stats.dominantArtistOrMerchant}
                  </div>
                </div>
              </div>

            </div>

            {/* Chapter Circadian Hourly Signature */}
            <div className="p-6 rounded-2xl bg-[#11141e] border border-[#22283a] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>CHAPTER HOURLY SIGNATURE (00:00 — 23:00)</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {activeChapter.dateRange}
                </span>
              </div>

              <div className="h-28 flex items-end justify-between gap-1 pt-3 border-b border-[#1d2332]">
                {activeChapter.hourlySignature.map((count, hour) => {
                  const maxH = Math.max(...activeChapter.hourlySignature, 1);
                  const hPct = Math.max(8, (count / maxH) * 100);
                  const isNight = hour >= 23 || hour <= 4;
                  return (
                    <div key={hour} className="flex-1 flex flex-col items-center group relative">
                      <div
                        className={`w-full rounded-t transition-all ${
                          isNight ? 'bg-purple-500' : 'bg-[#242c40]'
                        }`}
                        style={{ height: `${hPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Representative Thermal Receipts for this Chapter */}
          <div className="p-5 rounded-2xl bg-[#11141e] border border-[#22283a] space-y-4">
            <div className="flex items-center justify-between border-b border-[#212739] pb-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                REPRESENTATIVE RECEIPTS
              </span>
              <span className="text-[10px] font-mono text-purple-400">
                Anchor Moments
              </span>
            </div>

            <div className="space-y-3">
              {representativeReceipts.map(rec => (
                <div
                  key={rec.id}
                  onClick={() => onSelectReceipt(rec)}
                  className="p-3.5 rounded-xl bg-[#151926] hover:bg-[#1d2336] border border-[#242b3e] cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-purple-400 uppercase">{rec.source}</span>
                    <span>{rec.dateStr} • {rec.timeStr}</span>
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                    {rec.primaryTitle}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {rec.secondaryTitle}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onExploreChapter({
                dateRange: {
                  start: `${activeChapter.startYear}-01-01`,
                  end: `${activeChapter.endYear}-12-31`
                }
              })}
              className="w-full py-2.5 px-3 rounded-xl bg-[#181e2e] hover:bg-[#222a3e] text-slate-200 text-xs font-mono flex items-center justify-center space-x-1.5 border border-[#252c3e]"
            >
              <span>View All Records in Explorer</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
