'use client';

import React from 'react';
import { 
  Sparkles, 
  Share2, 
  Compass, 
  Lightbulb, 
  BookOpen, 
  Layers, 
  Upload, 
  ShieldCheck, 
  Search,
  Database
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'overview' | 'constellation' | 'discoveries' | 'chapters' | 'explorer';
  setActiveTab: (tab: 'overview' | 'constellation' | 'discoveries' | 'chapters' | 'explorer') => void;
  totalReceiptsCount: number;
  onOpenUpload: () => void;
  onOpenIntegrity: () => void;
  onQuickSearch: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  totalReceiptsCount,
  onOpenUpload,
  onOpenIntegrity,
  onQuickSearch
}: HeaderProps) {
  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: Sparkles },
    { id: 'constellation' as const, label: 'Constellation', icon: Share2, badge: 'Interactive' },
    { id: 'discoveries' as const, label: 'Discoveries', icon: Lightbulb, badge: 'Derived' },
    { id: 'chapters' as const, label: 'Life Chapters', icon: BookOpen },
    { id: 'explorer' as const, label: 'Receipt Explorer', icon: Layers }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#222736] bg-[#090a0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#38bdf8] via-[#818cf8] to-[#c084fc] p-[1px] flex items-center justify-center shadow-lg shadow-sky-500/20">
              <div className="h-full w-full bg-[#0c0d12] rounded-[7px] flex items-center justify-center">
                <span className="font-mono font-black text-sm tracking-tighter text-sky-400">LR</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-extrabold text-base tracking-wider text-slate-100">
                  LIFE<span className="text-sky-400">{`//`}</span>RECEIPT
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  ARCHIVE v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
                Nothing happened in isolation.
              </p>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#12151f] p-1.5 rounded-xl border border-[#23293a]" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-sky-400 ${
                    isActive
                      ? 'bg-[#1e2436] text-sky-300 shadow-sm border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a27]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase tracking-wider ${
                      isActive ? 'bg-sky-400/20 text-sky-300' : 'bg-[#1e2333] text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Quick Search trigger */}
            <button
              id="header-search-btn"
              onClick={onQuickSearch}
              className="p-2 rounded-lg bg-[#141722] hover:bg-[#1c2130] text-slate-300 border border-[#252b3d] text-xs transition-colors flex items-center space-x-1.5 focus:ring-1 focus:ring-sky-400"
              title="Search Archive"
              aria-label="Search Archive"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline text-[11px] text-slate-400">Search</span>
            </button>

            {/* Data Integrity Explainer */}
            <button
              id="header-integrity-btn"
              onClick={onOpenIntegrity}
              className="px-2.5 py-1.5 rounded-lg bg-[#141722] hover:bg-[#1a2030] text-slate-300 border border-[#252b3d] text-xs font-medium flex items-center space-x-1.5 transition-colors focus:ring-1 focus:ring-sky-400"
              title="Data Integrity & Relationship Verification"
              aria-label="Data Integrity Policy"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline text-[11px]">Data Integrity</span>
            </button>

            {/* Ingest / Upload CSV */}
            <button
              id="header-upload-btn"
              onClick={onOpenUpload}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium flex items-center space-x-1.5 transition-all shadow-sm shadow-sky-600/30 focus:ring-1 focus:ring-sky-300"
              aria-label="Upload CSV Datasets"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Upload CSV</span>
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-[#1a1f2c] scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#1e2436] text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141824]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
