'use client';

import React, { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Shuffle, 
  MapPin, 
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Discovery, AnyReceipt, ExplorerFilter } from '@/lib/types';

interface DiscoveriesViewProps {
  discoveries: Discovery[];
  onShowReceipts: (filterPreset: Partial<ExplorerFilter>) => void;
  onSelectReceipt: (receipt: AnyReceipt) => void;
  allReceipts: AnyReceipt[];
}

export function DiscoveriesView({
  discoveries,
  onShowReceipts,
  onSelectReceipt,
  allReceipts
}: DiscoveriesViewProps) {
  const [selectedDiscoveryId, setSelectedDiscoveryId] = useState<string>(discoveries[0]?.id || 'disc_night_shift');

  const activeDiscovery = discoveries.find(d => d.id === selectedDiscoveryId) || discoveries[0];

  const receiptMap = React.useMemo(() => {
    const map = new Map<string, AnyReceipt>();
    allReceipts.forEach(r => map.set(r.id, r));
    return map;
  }, [allReceipts]);

  const sampleReceipts = React.useMemo(() => {
    if (!activeDiscovery) return [];
    return activeDiscovery.sampleReceiptIds
      .map(id => receiptMap.get(id))
      .filter(Boolean) as AnyReceipt[];
  }, [activeDiscovery, receiptMap]);

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-[#10131d] p-6 rounded-2xl border border-[#212738] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span>EMPIRICAL DISCOVERIES & INSIGHTS</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40">
              {discoveries.length} Derived Patterns
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Calculated algorithmically from actual dataset records. Each discovery explicitly delineates Observed Data, Derived Connections, and Objective Interpretations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 text-xs font-mono border border-emerald-800/40 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Hallucination Proof</span>
          </span>
        </div>
      </div>

      {/* Discovery Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {discoveries.map(d => {
          const isSelected = d.id === selectedDiscoveryId;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDiscoveryId(d.id)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#1a2133] border-sky-400 shadow-lg shadow-sky-950/30'
                  : 'bg-[#11141e] border-[#22283a] hover:bg-[#161a27] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase ${isSelected ? 'text-sky-400' : 'text-slate-400'}`}>
                  {d.category.replace('_', ' ')}
                </span>
                <h3 className={`text-xs font-semibold mt-1 line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {d.title}
                </h3>
              </div>
              <div className="mt-3 font-mono font-bold text-sm text-amber-400">
                {d.keyMetric}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Discovery Detail Canvas */}
      {activeDiscovery && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Discovery Narrative & Three Tiers */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Headline Card */}
            <div className="p-6 rounded-2xl bg-[#11141e] border border-[#22283a] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-800/40 uppercase">
                  {activeDiscovery.category.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  METRIC: <strong className="text-white font-mono">{activeDiscovery.keyMetric}</strong> ({activeDiscovery.metricLabel})
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {activeDiscovery.title}
                </h2>
                <p className="text-sm text-slate-300 mt-1 font-mono">
                  {activeDiscovery.tagline}
                </p>
              </div>

              {/* Three-Tier Explicit Breakdown (MANDATE) */}
              <div className="space-y-3 pt-2">
                {/* 1. OBSERVED DATA */}
                <div className="p-4 rounded-xl bg-[#151926] border border-[#242c40] space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>1. OBSERVED DATA (EMPIRICAL MEASUREMENTS)</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed pl-4">
                    {activeDiscovery.observedData}
                  </p>
                </div>

                {/* 2. DERIVED CONNECTION */}
                <div className="p-4 rounded-xl bg-[#151926] border border-[#242c40] space-y-1">
                  <div className="flex items-center space-x-2 text-sky-400 font-mono font-bold text-xs">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    <span>2. DERIVED CONNECTION (STATISTICAL INFERENCE)</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed pl-4">
                    {activeDiscovery.derivedConnection}
                  </p>
                </div>

                {/* 3. INTERPRETATION */}
                <div className="p-4 rounded-xl bg-[#151926] border border-[#242c40] space-y-1">
                  <div className="flex items-center space-x-2 text-purple-400 font-mono font-bold text-xs">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    <span>3. OBJECTIVE INTERPRETATION</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-4">
                    {activeDiscovery.interpretation}
                  </p>
                </div>
              </div>

              {/* Show Receipts Action CTA */}
              <div className="pt-3 border-t border-[#1e2436] flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Convert this insight directly into underlying evidence
                </span>
                <button
                  id="show-receipts-discovery-btn"
                  onClick={() => onShowReceipts(activeDiscovery.filterPreset)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold font-mono flex items-center space-x-2 shadow-lg shadow-amber-600/20 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>SHOW RECEIPTS IN ARCHIVE</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>

            </div>

            {/* Embedded Evidence Chart Visualizer */}
            <div className="p-6 rounded-2xl bg-[#11141e] border border-[#22283a] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span>EMPIRICAL DISTRIBUTION GRAPH</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Sample Size: {allReceipts.length.toLocaleString()}
                </span>
              </div>

              {/* Render dynamic chart depending on chartType */}
              <div className="pt-4 space-y-3">
                {activeDiscovery.chartData.map((item, idx) => {
                  const maxVal = Math.max(...activeDiscovery.chartData.map(d => d.value), 1);
                  const barWidth = Math.max(6, (item.value / maxVal) * 100);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={item.highlight ? 'text-amber-300 font-bold' : 'text-slate-300'}>
                          {item.label}
                        </span>
                        <span className="text-slate-400">
                          {item.value.toLocaleString()} {item.secondaryValue ? `(${item.secondaryValue}%)` : ''}
                        </span>
                      </div>
                      <div className="h-3 w-full bg-[#181d2a] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.highlight
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Side Evidence Sample Receipts */}
          <div className="p-5 rounded-2xl bg-[#11141e] border border-[#22283a] space-y-4">
            <div className="flex items-center justify-between border-b border-[#212739] pb-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                UNDERLYING EVIDENCE FRAGMENTS
              </span>
              <span className="text-[10px] font-mono text-sky-400">
                {sampleReceipts.length} Sample Receipts
              </span>
            </div>

            <div className="space-y-3">
              {sampleReceipts.length > 0 ? (
                sampleReceipts.map(rec => (
                  <div
                    key={rec.id}
                    onClick={() => onSelectReceipt(rec)}
                    className="p-3.5 rounded-xl bg-[#151926] hover:bg-[#1c2234] border border-[#242b3e] cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="text-sky-400 uppercase">{rec.source}</span>
                      <span>{rec.dateStr} • {rec.timeStr}</span>
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                      {rec.primaryTitle}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {rec.secondaryTitle}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-[#141824] text-xs text-slate-400 text-center font-mono">
                  Loading verified evidence samples...
                </div>
              )}
            </div>

            <button
              onClick={() => onShowReceipts(activeDiscovery.filterPreset)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#181e2e] hover:bg-[#222a3e] text-slate-200 text-xs font-mono flex items-center justify-center space-x-1.5 border border-[#252c3e]"
            >
              <span>Explore All Matching Records</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
