'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { OverviewView } from '@/components/views/OverviewView';
import { ConstellationView } from '@/components/views/ConstellationView';
import { DiscoveriesView } from '@/components/views/DiscoveriesView';
import { ChaptersView } from '@/components/views/ChaptersView';
import { ExplorerView } from '@/components/views/ExplorerView';
import { ThermalReceiptModal } from '@/components/receipt/ThermalReceiptModal';
import { StoryThreadModal } from '@/components/modals/StoryThreadModal';
import { DataIntegrityModal } from '@/components/modals/DataIntegrityModal';
import { CsvUploadModal } from '@/components/modals/CsvUploadModal';
import { generateBuiltInDataset } from '@/lib/data/dataset-loader';
import { computeArchiveOverview } from '@/lib/data/data-analyzer';
import { calculateDiscoveries } from '@/lib/data/preset-discoveries';
import { deriveLifeChapters } from '@/lib/data/preset-chapters';
import { AnyReceipt, ExplorerFilter } from '@/lib/types';
import { ShieldCheck, Info } from 'lucide-react';

export default function Home() {
  // 1. Core State: Ingested & Seeded Life Receipts
  const [receipts, setReceipts] = useState<AnyReceipt[]>(() => generateBuiltInDataset());
  const [activeTab, setActiveTab] = useState<'overview' | 'constellation' | 'discoveries' | 'chapters' | 'explorer'>('overview');

  // 2. Modals State
  const [selectedReceipt, setSelectedReceipt] = useState<AnyReceipt | null>(null);
  const [threadAnchorReceipt, setThreadAnchorReceipt] = useState<AnyReceipt | null>(null);
  const [isIntegrityModalOpen, setIsIntegrityModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // 3. Explorer Preset Filter State (when navigated from Discoveries or Chapters)
  const [explorerFilterPreset, setExplorerFilterPreset] = useState<Partial<ExplorerFilter> | undefined>(undefined);

  // 4. Precompute high-level overview metrics, discoveries, and chapters
  const overviewStats = useMemo(() => {
    return computeArchiveOverview(receipts);
  }, [receipts]);

  const discoveries = useMemo(() => {
    return calculateDiscoveries(receipts);
  }, [receipts]);

  const chapters = useMemo(() => {
    return deriveLifeChapters(receipts);
  }, [receipts]);

  // Handle custom CSV ingestion
  const handleReceiptsImported = (newReceipts: AnyReceipt[], format: string) => {
    setReceipts(prev => [...newReceipts, ...prev]);
    setActiveTab('explorer');
  };

  // Navigate to explorer with preset filter
  const handleNavigateToExplorerWithFilter = (filter: Partial<ExplorerFilter>) => {
    setExplorerFilterPreset(filter);
    setActiveTab('explorer');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      
      {/* Top Application Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalReceiptsCount={receipts.length}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenIntegrity={() => setIsIntegrityModalOpen(true)}
        onQuickSearch={() => setActiveTab('explorer')}
      />

      {/* Main Experience Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {activeTab === 'overview' && (
          <OverviewView
            stats={overviewStats}
            onNavigate={setActiveTab}
            onSelectReceipt={setSelectedReceipt}
            recentSampleReceipts={receipts.slice(0, 6)}
            onOpenIntegrity={() => setIsIntegrityModalOpen(true)}
          />
        )}

        {activeTab === 'constellation' && (
          <ConstellationView
            receipts={receipts}
            onSelectReceipt={setSelectedReceipt}
            onExploreThread={setThreadAnchorReceipt}
          />
        )}

        {activeTab === 'discoveries' && (
          <DiscoveriesView
            discoveries={discoveries}
            onShowReceipts={handleNavigateToExplorerWithFilter}
            onSelectReceipt={setSelectedReceipt}
            allReceipts={receipts}
          />
        )}

        {activeTab === 'chapters' && (
          <ChaptersView
            chapters={chapters}
            onExploreChapter={handleNavigateToExplorerWithFilter}
            onSelectReceipt={setSelectedReceipt}
            allReceipts={receipts}
          />
        )}

        {activeTab === 'explorer' && (
          <ExplorerView
            receipts={receipts}
            onSelectReceipt={setSelectedReceipt}
            onExploreThread={setThreadAnchorReceipt}
            initialFilter={explorerFilterPreset}
          />
        )}

      </main>

      {/* Bottom Global Status Footer */}
      <footer className="bg-[#0b0e16] border-t border-[#1a1f2e] py-6 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center space-x-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">
              LIFE//RECEIPT ARCHIVE • {receipts.length.toLocaleString()} RECORDS IN-MEMORY
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsIntegrityModalOpen(true)}
              className="hover:text-emerald-400 transition-colors flex items-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scientific Data Integrity</span>
            </button>
            <span>•</span>
            <span>WebRush Advanced Frontend Challenge</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ThermalReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        relatedReceipts={
          selectedReceipt
            ? receipts
                .filter(
                  r =>
                    r.id !== selectedReceipt.id &&
                    (r.category === selectedReceipt.category ||
                      r.dateStr === selectedReceipt.dateStr)
                )
                .slice(0, 3)
            : []
        }
        onSelectRelated={(rec) => setSelectedReceipt(rec)}
        onExploreThread={(rec) => {
          setSelectedReceipt(null);
          setThreadAnchorReceipt(rec);
        }}
      />

      <StoryThreadModal
        receipt={threadAnchorReceipt}
        allReceipts={receipts}
        onClose={() => setThreadAnchorReceipt(null)}
        onSelectReceipt={(rec) => {
          setThreadAnchorReceipt(null);
          setSelectedReceipt(rec);
        }}
      />

      <DataIntegrityModal
        isOpen={isIntegrityModalOpen}
        onClose={() => setIsIntegrityModalOpen(false)}
      />

      <CsvUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onReceiptsImported={handleReceiptsImported}
      />

    </div>
  );
}
