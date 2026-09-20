'use client';

import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  ArrowUpDown, 
  Download, 
  RotateCcw, 
  Music, 
  ShoppingBag, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Compass,
  AlertTriangle,
  Shuffle
} from 'lucide-react';
import { AnyReceipt, ExplorerFilter, ReceiptSource } from '@/lib/types';
import { filterReceipts } from '@/lib/data/data-analyzer';
import { ReceiptCard } from '@/components/receipt/ReceiptCard';

interface ExplorerViewProps {
  receipts: AnyReceipt[];
  onSelectReceipt: (receipt: AnyReceipt) => void;
  onExploreThread: (receipt: AnyReceipt) => void;
  initialFilter?: Partial<ExplorerFilter>;
}

export function ExplorerView({
  receipts,
  onSelectReceipt,
  onExploreThread,
  initialFilter
}: ExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilter?.searchQuery || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const [selectedSources, setSelectedSources] = useState<ReceiptSource[]>(initialFilter?.sources || ['spotify', 'household', 'india_trans']);
  const [dateStart, setDateStart] = useState(initialFilter?.dateRange?.start || '');
  const [dateEnd, setDateEnd] = useState(initialFilter?.dateRange?.end || '');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<('morning' | 'afternoon' | 'evening' | 'night')[]>(initialFilter?.timeOfDay || []);
  const [specialFilters, setSpecialFilters] = useState(initialFilter?.onlySpecial || {});
  const [sortBy, setSortBy] = useState<ExplorerFilter['sortBy']>(initialFilter?.sortBy || 'date_desc');

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Debounce search query changes by 150ms
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [prevInitialFilter, setPrevInitialFilter] = useState(initialFilter);

  if (initialFilter !== prevInitialFilter) {
    setPrevInitialFilter(initialFilter);
    if (initialFilter) {
      if (initialFilter.searchQuery !== undefined) {
        setSearchQuery(initialFilter.searchQuery);
        setDebouncedSearchQuery(initialFilter.searchQuery);
      }
      if (initialFilter.sources) setSelectedSources(initialFilter.sources);
      if (initialFilter.dateRange) {
        setDateStart(initialFilter.dateRange.start || '');
        setDateEnd(initialFilter.dateRange.end || '');
      }
      if (initialFilter.timeOfDay) setSelectedTimeOfDay(initialFilter.timeOfDay);
      if (initialFilter.onlySpecial) setSpecialFilters(initialFilter.onlySpecial);
      if (initialFilter.sortBy) setSortBy(initialFilter.sortBy);
      setCurrentPage(1);
    }
  }

  // Compile active filter object using debounced search
  const activeFilter: ExplorerFilter = useMemo(() => ({
    searchQuery: debouncedSearchQuery,
    sources: selectedSources,
    dateRange: { start: dateStart, end: dateEnd },
    categories: [],
    timeOfDay: selectedTimeOfDay,
    onlySpecial: specialFilters,
    sortBy
  }), [debouncedSearchQuery, selectedSources, dateStart, dateEnd, selectedTimeOfDay, specialFilters, sortBy]);

  // Execute filtering & pagination
  const { items, totalCount, totalPages } = useMemo(() => {
    return filterReceipts(receipts, activeFilter, currentPage, pageSize);
  }, [receipts, activeFilter, currentPage, pageSize]);

  const toggleSource = (src: ReceiptSource) => {
    if (selectedSources.includes(src)) {
      if (selectedSources.length === 1) return; // keep at least 1
      setSelectedSources(selectedSources.filter(s => s !== src));
    } else {
      setSelectedSources([...selectedSources, src]);
    }
    setCurrentPage(1);
  };

  const toggleTimeOfDay = (slot: 'morning' | 'afternoon' | 'evening' | 'night') => {
    if (selectedTimeOfDay.includes(slot)) {
      setSelectedTimeOfDay(selectedTimeOfDay.filter(s => s !== slot));
    } else {
      setSelectedTimeOfDay([...selectedTimeOfDay, slot]);
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedSources(['spotify', 'household', 'india_trans']);
    setDateStart('');
    setDateEnd('');
    setSelectedTimeOfDay([]);
    setSpecialFilters({});
    setSortBy('date_desc');
    setCurrentPage(1);
  };

  // Export current filtered results as JSON or CSV
  const handleExport = (format: 'json' | 'csv') => {
    const { items: allFiltered } = filterReceipts(receipts, activeFilter, 1, 100000);
    let blob: Blob;
    let filename = `life_receipts_export_${new Date().toISOString().split('T')[0]}.${format}`;

    if (format === 'json') {
      blob = new Blob([JSON.stringify(allFiltered, null, 2)], { type: 'application/json' });
    } else {
      const headers = ['id', 'source', 'date', 'time', 'primaryTitle', 'secondaryTitle', 'category', 'amount'];
      const rows = allFiltered.map(r => [
        r.id,
        r.source,
        r.dateStr,
        r.timeStr,
        `"${r.primaryTitle.replace(/"/g, '""')}"`,
        `"${r.secondaryTitle.replace(/"/g, '""')}"`,
        `"${r.category.replace(/"/g, '""')}"`,
        r.rawAmount || ''
      ]);
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      blob = new Blob([csvContent], { type: 'text/csv' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      
      {/* Search & Main Filter Controls */}
      <div className="p-5 rounded-2xl bg-[#10131d] border border-[#212738] space-y-4 shadow-xl">
        
        {/* Top Search Input & Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="explorer-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by track, artist, album, merchant, city, note, or ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#161a26] border border-[#262e42] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors font-mono"
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-[#161a26] p-1 rounded-xl border border-[#252b3d]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-[#242c40] text-sky-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Thermal Receipt Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-[#242c40] text-sky-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Dense Data Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Export Dropdown / Trigger */}
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-2 rounded-xl bg-[#161a26] hover:bg-[#1f2536] border border-[#252b3d] text-slate-300 text-xs font-mono flex items-center space-x-1.5 transition-colors"
              title="Export filtered records as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Reset Filter Button */}
            <button
              onClick={resetFilters}
              className="p-2 rounded-xl bg-[#161a26] hover:bg-[#1f2536] border border-[#252b3d] text-slate-400 hover:text-slate-200 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Granular Multi-Facet Filter Pills */}
        <div className="pt-2 border-t border-[#1c2232] flex flex-wrap items-center gap-2 text-xs font-mono">
          
          {/* Dataset Sources */}
          <div className="flex items-center space-x-1 pr-2 border-r border-[#222838]">
            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">DATASETS:</span>
            <button
              onClick={() => toggleSource('spotify')}
              className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center space-x-1 ${
                selectedSources.includes('spotify')
                  ? 'bg-sky-950/80 border-sky-600 text-sky-300'
                  : 'bg-[#141722] border-[#222838] text-slate-400'
              }`}
            >
              <Music className="w-3 h-3" />
              <span>Spotify</span>
            </button>
            <button
              onClick={() => toggleSource('household')}
              className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center space-x-1 ${
                selectedSources.includes('household')
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  : 'bg-[#141722] border-[#222838] text-slate-400'
              }`}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Household</span>
            </button>
            <button
              onClick={() => toggleSource('india_trans')}
              className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center space-x-1 ${
                selectedSources.includes('india_trans')
                  ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                  : 'bg-[#141722] border-[#222838] text-slate-400'
              }`}
            >
              <CreditCard className="w-3 h-3" />
              <span>Commerce</span>
            </button>
          </div>

          {/* Time of Day Slots */}
          <div className="flex items-center space-x-1 pr-2 border-r border-[#222838]">
            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">CIRCADIAN:</span>
            {(['morning', 'afternoon', 'evening', 'night'] as const).map(slot => (
              <button
                key={slot}
                onClick={() => toggleTimeOfDay(slot)}
                className={`px-2 py-0.5 rounded-lg border text-[11px] capitalize transition-colors ${
                  selectedTimeOfDay.includes(slot)
                    ? 'bg-[#242b3e] border-sky-400 text-sky-300'
                    : 'bg-[#141722] border-[#222838] text-slate-400'
                }`}
              >
                {slot === 'night' ? 'Night (23-06)' : slot}
              </button>
            ))}
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center space-x-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#161a26] border border-[#252b3d] text-slate-300 text-xs rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:border-sky-500"
            >
              <option value="date_desc">Date: Newest to Oldest</option>
              <option value="date_asc">Date: Oldest to Newest</option>
              <option value="amount_desc">Amount: Highest to Lowest</option>
              <option value="duration_desc">Play Duration: Longest</option>
              <option value="title_asc">Title: A to Z</option>
            </select>
          </div>

        </div>

        {/* Special Behavioral Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
          <button
            onClick={() => setSpecialFilters(f => ({ ...f, skippedOnly: !f.skippedOnly }))}
            className={`px-2.5 py-0.5 rounded-full border transition-colors ${
              specialFilters.skippedOnly ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-[#141824] text-slate-400 border-[#222838]'
            }`}
          >
            {specialFilters.skippedOnly ? '✓ ' : ''}Skipped Only
          </button>
          <button
            onClick={() => setSpecialFilters(f => ({ ...f, shuffleOnly: !f.shuffleOnly }))}
            className={`px-2.5 py-0.5 rounded-full border transition-colors ${
              specialFilters.shuffleOnly ? 'bg-purple-950 text-purple-300 border-purple-700' : 'bg-[#141824] text-slate-400 border-[#222838]'
            }`}
          >
            {specialFilters.shuffleOnly ? '✓ ' : ''}Shuffle Plays
          </button>
          <button
            onClick={() => setSpecialFilters(f => ({ ...f, fraudOnly: !f.fraudOnly }))}
            className={`px-2.5 py-0.5 rounded-full border transition-colors ${
              specialFilters.fraudOnly ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-[#141824] text-slate-400 border-[#222838]'
            }`}
          >
            {specialFilters.fraudOnly ? '✓ ' : ''}Commerce Anomalies
          </button>
          <button
            onClick={() => setSpecialFilters(f => ({ ...f, highValueOnly: !f.highValueOnly }))}
            className={`px-2.5 py-0.5 rounded-full border transition-colors ${
              specialFilters.highValueOnly ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-[#141824] text-slate-400 border-[#222838]'
            }`}
          >
            {specialFilters.highValueOnly ? '✓ ' : ''}High Value &gt;₹3,000
          </button>
          <button
            onClick={() => setSpecialFilters(f => ({ ...f, incomeOnly: !f.incomeOnly }))}
            className={`px-2.5 py-0.5 rounded-full border transition-colors ${
              specialFilters.incomeOnly ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-[#141824] text-slate-400 border-[#222838]'
            }`}
          >
            {specialFilters.incomeOnly ? '✓ ' : ''}Income Receipts
          </button>
        </div>

      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
        <div>
          MATCHING RECEIPTS: <strong className="text-white font-bold">{totalCount.toLocaleString()}</strong> RECORDS
        </div>
        <div>
          PAGE {currentPage} OF {totalPages}
        </div>
      </div>

      {/* Results Content Area */}
      {items.length > 0 ? (
        viewMode === 'grid' ? (
          /* Thermal Receipt Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(receipt => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                onSelect={onSelectReceipt}
                onExploreThread={onExploreThread}
              />
            ))}
          </div>
        ) : (
          /* Dense Data Table View */
          <div className="rounded-2xl bg-[#11141e] border border-[#212739] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#161a27] text-slate-400 border-b border-[#23293c]">
                  <tr>
                    <th className="p-3">SOURCE</th>
                    <th className="p-3">DATE & TIME</th>
                    <th className="p-3">TITLE / MERCHANT</th>
                    <th className="p-3">CONTEXT / SUB</th>
                    <th className="p-3">CATEGORY</th>
                    <th className="p-3 text-right">VALUE / DURATION</th>
                    <th className="p-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2232] text-slate-200">
                  {items.map(rec => (
                    <tr
                      key={rec.id}
                      onClick={() => onSelectReceipt(rec)}
                      className="hover:bg-[#181e2e] cursor-pointer transition-colors"
                    >
                      <td className="p-3 uppercase text-[11px] font-bold">
                        <span className={`px-2 py-0.5 rounded ${
                          rec.source === 'spotify'
                            ? 'bg-sky-950 text-sky-400'
                            : rec.source === 'household'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}>
                          {rec.source}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {rec.dateStr} <span className="text-slate-500">{rec.timeStr}</span>
                      </td>
                      <td className="p-3 font-semibold text-white max-w-[200px] truncate">
                        {rec.primaryTitle}
                      </td>
                      <td className="p-3 text-slate-400 max-w-[180px] truncate">
                        {rec.secondaryTitle}
                      </td>
                      <td className="p-3 text-slate-400">
                        {rec.category}
                      </td>
                      <td className="p-3 text-right font-bold">
                        {rec.amountFormatted ? (
                          <span className="text-amber-400">{rec.amountFormatted}</span>
                        ) : (
                          <span className="text-slate-300">{(rec as any).durationFormatted || '-'}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); onExploreThread(rec); }}
                          className="px-2 py-1 rounded bg-[#1e2436] hover:bg-sky-900 text-sky-300 text-[10px]"
                        >
                          Thread
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-[#11141e] border border-[#212739] text-center space-y-4">
          <div className="p-4 rounded-2xl bg-[#161a28] text-slate-400 w-fit mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">
            NO MATCHING LIFE RECEIPTS FOUND
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search keywords, clearing specific dataset filters, or resetting date boundaries.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#20273a] text-xs font-mono">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl bg-[#151926] hover:bg-[#1e2436] disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 flex items-center space-x-1.5 border border-[#232a3d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Page</span>
            <span className="font-bold text-white px-2 py-1 bg-[#1a2030] rounded border border-[#27314a]">
              {currentPage}
            </span>
            <span className="text-slate-400">of {totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl bg-[#151926] hover:bg-[#1e2436] disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 flex items-center space-x-1.5 border border-[#232a3d] transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
