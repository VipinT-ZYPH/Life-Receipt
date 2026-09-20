'use client';

import React from 'react';
import { 
  Sparkles, 
  Share2, 
  Lightbulb, 
  BookOpen, 
  Layers, 
  ArrowRight, 
  Clock, 
  Calendar, 
  Music, 
  ShoppingBag, 
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Activity,
  Zap,
  Globe
} from 'lucide-react';
import { ArchiveOverviewStats, AnyReceipt } from '@/lib/types';

interface OverviewViewProps {
  stats: ArchiveOverviewStats;
  onNavigate: (tab: 'constellation' | 'discoveries' | 'chapters' | 'explorer') => void;
  onSelectReceipt: (receipt: AnyReceipt) => void;
  recentSampleReceipts: AnyReceipt[];
  onOpenIntegrity: () => void;
}

export function OverviewView({
  stats,
  onNavigate,
  onSelectReceipt,
  recentSampleReceipts,
  onOpenIntegrity
}: OverviewViewProps) {
  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      
      {/* Hero Header & Curiosity Statistics */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#131722] via-[#0e1017] to-[#090a0f] border border-[#23293c] p-6 sm:p-10 shadow-2xl">
        {/* Background ambient grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        
        {/* Glowing atmospheric orb */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          {/* Tagline & Archive badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1b2234] border border-[#2c3752] text-xs font-mono text-sky-400 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
            <span className="tracking-wide">DIGITAL LIFE ARCHIVE // DEFENSIBLE PATTERN RECONSTRUCTION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-sans leading-[1.15]">
            Nothing happened <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400">
              in isolation.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Reconstructing a digital journey from scattered fragments of music streaming telemetry, daily domestic household ledgers, and multi-facet commerce receipts.
          </p>

          {/* Primary CTA button cluster */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              id="hero-start-exploring-btn"
              onClick={() => onNavigate('constellation')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm flex items-center space-x-2 shadow-xl shadow-sky-600/25 transition-all transform hover:-translate-y-0.5 focus:ring-2 focus:ring-sky-400"
            >
              <Share2 className="w-4 h-4" />
              <span>START EXPLORING CONSTELLATION</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              id="hero-view-discoveries-btn"
              onClick={() => onNavigate('discoveries')}
              className="px-5 py-3.5 rounded-xl bg-[#171c2a] hover:bg-[#20273a] text-slate-200 border border-[#29324a] font-medium text-sm flex items-center space-x-2 transition-colors focus:ring-1 focus:ring-sky-400"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Explore Discoveries</span>
            </button>

            <button
              onClick={onOpenIntegrity}
              className="px-4 py-3.5 rounded-xl bg-transparent hover:bg-[#141722] text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center space-x-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Methodology & Integrity</span>
            </button>
          </div>
        </div>

        {/* High-Level Calculated Curiosity Stat Grid */}
        <div className="relative z-10 mt-12 pt-8 border-t border-[#232a3d] grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 rounded-2xl bg-[#121520]/80 border border-[#212738]">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              TEMPORAL SPAN
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {stats.dateSpanYears} Years
            </div>
            <div className="text-xs text-sky-400 font-mono mt-0.5">
              {stats.startDateStr.slice(0, 4)} — {stats.endDateStr.slice(0, 4)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121520]/80 border border-[#212738]">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              TOTAL RECORDED MOMENTS
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {stats.totalReceipts.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 font-mono mt-0.5">
              3 Disparate Datasets
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121520]/80 border border-[#212738]">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              UNIQUE ARTISTS & TRACKS
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {stats.uniqueArtistsCount} / {stats.uniqueTracksCount}
            </div>
            <div className="text-xs text-purple-400 font-mono mt-0.5">
              {stats.totalListeningHours.toLocaleString()}h Streamed
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121520]/80 border border-[#212738]">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              NOCTURNAL INTENSITY
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {stats.nightActivityPercentage}%
            </div>
            <div className="text-xs text-amber-400 font-mono mt-0.5">
              23:00 — 04:00 Window
            </div>
          </div>
        </div>
      </section>

      {/* Dataset Provenance Architecture Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-mono flex items-center space-x-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>DATASET PROVENANCE & ANCHOR STREAMS</span>
            </h2>
            <p className="text-xs text-slate-400">
              Observable telemetry fragments ingested and cross-analyzed in browser memory
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Dataset 1: Spotify */}
          <div className="p-5 rounded-2xl bg-[#11141d] border border-[#222738] hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/40">
                  <Music className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/30">
                  2013 — 2024
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-3">Spotify Listening Telemetry</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                ~150,000 listening events containing track URIs, artist names, albums, platform devices, skip flags, and playback triggers.
              </p>
            </div>
            <div className="pt-3 border-t border-[#1c2130] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">INDEXED PLAYS:</span>
              <span className="text-sky-300 font-bold">{stats.spotifyCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Dataset 2: Household */}
          <div className="p-5 rounded-2xl bg-[#11141d] border border-[#222738] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  <ShoppingBag className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/30">
                  2015 — 2018
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-3">Daily Household Ledger</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                2,461 granular expense and income records documenting groceries, utilities, transit passes, notes, and payment modes.
              </p>
            </div>
            <div className="pt-3 border-t border-[#1c2130] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">INDEXED ENTRIES:</span>
              <span className="text-emerald-300 font-bold">{stats.householdCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Dataset 3: India Multi-Facet */}
          <div className="p-5 rounded-2xl bg-[#11141d] border border-[#222738] hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800/40">
                  <CreditCard className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/30">
                  2022 — 2024
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-3">Augmented India Commerce</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                10,267 urban transaction receipts with merchant metadata, geolocated coordinates, job titles, quick-commerce, and fraud detection.
              </p>
            </div>
            <div className="pt-3 border-t border-[#1c2130] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">INDEXED TXNS:</span>
              <span className="text-amber-300 font-bold">{stats.indiaTransCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Density Rhythm: Diurnal 24-Hour Circadian Signature & Yearly Volume */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 24-Hour Circadian Clock Activity */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#11141d] border border-[#222738] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>CIRCADIAN TIME DENSITY (00:00 — 23:00 UTC)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Aggregated activity volume across all 24 hours of the day
              </p>
            </div>
            <span className="text-[11px] font-mono text-sky-400 px-2 py-0.5 rounded bg-[#181e2e]">
              Peak: 23:00 — 02:00
            </span>
          </div>

          <div className="h-40 flex items-end justify-between gap-1 pt-4 border-b border-[#1d2332]">
            {stats.hourlyDistribution.map((count, hour) => {
              const maxCount = Math.max(...stats.hourlyDistribution, 1);
              const heightPercent = Math.max(8, (count / maxCount) * 100);
              const isNight = hour >= 23 || hour <= 4;
              return (
                <div key={hour} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-9 hidden group-hover:flex px-2 py-1 bg-[#1e2436] border border-[#2f3952] rounded text-[10px] font-mono text-white whitespace-nowrap z-20 shadow-lg pointer-events-none">
                    {String(hour).padStart(2, '0')}:00 — {count.toLocaleString()} moments
                  </div>
                  <div
                    className={`w-full rounded-t transition-all duration-200 group-hover:brightness-125 ${
                      isNight ? 'bg-gradient-to-t from-indigo-700 to-sky-400' : 'bg-[#232b3e]'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[9px] font-mono text-slate-400 mt-1.5 hidden sm:block">
                    {hour % 3 === 0 ? hour : ''}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded bg-sky-400" />
              <span>Night Shift Window (23:00–04:00)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded bg-[#232b3e]" />
              <span>Daytime Operational Hours</span>
            </span>
          </div>
        </div>

        {/* Top Recurring Entities */}
        <div className="p-6 rounded-2xl bg-[#11141d] border border-[#222738] space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>DOMINANT ANCHOR ARTISTS</span>
            </h3>
            <p className="text-xs text-slate-400">
              Highest recurring listening concentration
            </p>
          </div>

          <div className="space-y-2.5">
            {stats.topArtists.slice(0, 5).map((artist, idx) => (
              <div key={artist.name} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2 truncate">
                  <span className="text-slate-400 font-bold">{idx + 1}.</span>
                  <span className="text-slate-200 font-medium truncate">{artist.name}</span>
                </div>
                <span className="text-sky-400 font-bold">{artist.plays.toLocaleString()} plays</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('explorer')}
            className="w-full py-2 px-3 rounded-xl bg-[#181d2b] hover:bg-[#20273a] text-slate-300 text-xs font-mono flex items-center justify-center space-x-1.5 transition-colors border border-[#252c3e]"
          >
            <span>Search All In Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </section>

      {/* Experience Quick-Access Modules */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-mono flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>PRIMARY EXPLORATION EXPERIENCES</span>
          </h2>
          <p className="text-xs text-slate-400">
            Four interactive modes designed to uncover the story behind the receipts
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('constellation')}
            className="p-5 rounded-2xl bg-[#121622] border border-[#232a3d] hover:border-sky-500/50 cursor-pointer transition-all duration-200 hover:-translate-y-1 group"
          >
            <div className="p-3 rounded-xl bg-sky-950/60 text-sky-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
              Life Constellation
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Interactive 2D network visualization linking records via defensible temporal and categorical affinities.
            </p>
            <span className="text-xs text-sky-400 font-mono mt-3 inline-flex items-center space-x-1">
              <span>Launch Graph</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div
            onClick={() => onNavigate('discoveries')}
            className="p-5 rounded-2xl bg-[#121622] border border-[#232a3d] hover:border-amber-500/50 cursor-pointer transition-all duration-200 hover:-translate-y-1 group"
          >
            <div className="p-3 rounded-xl bg-amber-950/60 text-amber-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              Discoveries & Insights
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Algorithmic pattern detections with empirical proof, observed data vs interpretation tags, and instant receipt drilldowns.
            </p>
            <span className="text-xs text-amber-400 font-mono mt-3 inline-flex items-center space-x-1">
              <span>Inspect Insights</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div
            onClick={() => onNavigate('chapters')}
            className="p-5 rounded-2xl bg-[#121622] border border-[#232a3d] hover:border-purple-500/50 cursor-pointer transition-all duration-200 hover:-translate-y-1 group"
          >
            <div className="p-3 rounded-xl bg-purple-950/60 text-purple-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              Life Chapters
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Chronological eras derived from empirical behavioral shifts rather than generic calendar years.
            </p>
            <span className="text-xs text-purple-400 font-mono mt-3 inline-flex items-center space-x-1">
              <span>Read Chapters</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div
            onClick={() => onNavigate('explorer')}
            className="p-5 rounded-2xl bg-[#121622] border border-[#232a3d] hover:border-emerald-500/50 cursor-pointer transition-all duration-200 hover:-translate-y-1 group"
          >
            <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Receipt Explorer
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              High-performance searchable archive with multi-faceted filtering, thermal slips, and related records.
            </p>
            <span className="text-xs text-emerald-400 font-mono mt-3 inline-flex items-center space-x-1">
              <span>Search Archive</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
