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
import { generateBuiltInDataset, loadRealDataset } from '@/lib/data/dataset-loader';
import { computeArchiveOverview } from '@/lib/data/data-analyzer';
import { calculateDiscoveries } from '@/lib/data/preset-discoveries';
import { deriveLifeChapters } from '@/lib/data/preset-chapters';
import { buildDatasetIndices, getRelatedReceiptsFromIndices } from '@/lib/data/data-indexer';
import { AnyReceipt, ExplorerFilter } from '@/lib/types';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function Home() {
  // 1. Core State: Ingested & Loaded Life Receipts
  const [receipts, setReceipts] = useState<AnyReceipt[]>([]);
  const [isLoadingDataset, setIsLoadingDataset] = useState(true);
  const [isFullDatasetLoaded, setIsFullDatasetLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'constellation' | 'discoveries' | 'chapters' | 'explorer'>('overview');

  // 2. Modals State
  const [selectedReceipt, setSelectedReceipt] = useState<AnyReceipt | null>(null);
  const [threadAnchorReceipt, setThreadAnchorReceipt] = useState<AnyReceipt | null>(null);
  const [isIntegrityModalOpen, setIsIntegrityModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // 3. Explorer Preset Filter State (when navigated from Discoveries or Chapters)
  const [explorerFilterPreset, setExplorerFilterPreset] = useState<Partial<ExplorerFilter> | undefined>(undefined);

  // Precomputed dataset indices (O(1) Map lookups)
  const datasetIndices = useMemo(() => {
    return buildDatasetIndices(receipts);
  }, [receipts]);

  // Memoized related receipts for modal
  const modalRelatedReceipts = useMemo(() => {
    if (!selectedReceipt) return [];
    return getRelatedReceiptsFromIndices(selectedReceipt, datasetIndices, 3);
  }, [selectedReceipt, datasetIndices]);

  // Load Real Datasets from /data/ on initial mount
  useEffect(() => {
    let isMounted = true;
    async function initData() {
      try {
        setIsLoadingDataset(true);
        const data = await loadRealDataset(false);
        if (isMounted) {
          setReceipts(data);
          setIsLoadingDataset(false);
        }
      } catch (err) {
        console.error('Failed loading initial dataset:', err);
        if (isMounted) {
          setReceipts(generateBuiltInDataset());
          setIsLoadingDataset(false);
        }
      }
    }
    initData();
    return () => { isMounted = false; };
  }, []);

  const handleLoadFullDataset = async () => {
    setIsLoadingDataset(true);
    const fullData = await loadRealDataset(true);
    setReceipts(fullData);
    setIsFullDatasetLoaded(true);
    setIsLoadingDataset(false);
  };

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
        
        {isLoadingDataset ? (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold font-mono text-white">LOADING REAL DATASET ARCHIVES</h2>
              <p className="text-xs text-slate-400 font-mono">Parsing Spotify History, Household Transactions & India Multi-Facet Dataset...</p>
            </div>
          </div>
        ) : (
          <>
            {!isFullDatasetLoaded && receipts.length > 0 && (
              <div className="mb-6 p-3 rounded-xl bg-[#101422] border border-[#21283d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center space-x-2 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                  <span>Real dataset active ({receipts.length.toLocaleString()} records indexed across 2013-2024).</span>
                </div>
                <button
                  onClick={handleLoadFullDataset}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors flex items-center space-x-1.5"
                >
                  <span>LOAD FULL 150,000+ SPOTIFY RECORD ARCHIVE</span>
                </button>
              </div>
            )}

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
          </>
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
        relatedReceipts={modalRelatedReceipts}
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
