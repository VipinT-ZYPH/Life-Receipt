import {
  AnyReceipt,
  ArchiveOverviewStats,
  ConstellationNode,
  ConstellationLink,
  ReceiptSource,
  ExplorerFilter
} from '../types';

export function computeArchiveOverview(receipts: AnyReceipt[]): ArchiveOverviewStats {
  if (receipts.length === 0) {
    return {
      totalReceipts: 0,
      spotifyCount: 0,
      householdCount: 0,
      indiaTransCount: 0,
      uniqueArtistsCount: 0,
      uniqueTracksCount: 0,
      uniqueMerchantsCount: 0,
      dateSpanYears: 12,
      startDateStr: '2013-01-01',
      endDateStr: '2024-12-31',
      topArtists: [],
      topCategories: [],
      hourlyDistribution: new Array(24).fill(0),
      yearlyDistribution: [],
      nightActivityPercentage: 0,
      totalListeningHours: 0,
      totalRecordedExpense: 0
    };
  }

  let spotifyCount = 0;
  let householdCount = 0;
  let indiaTransCount = 0;
  let totalMsPlayed = 0;
  let totalExpense = 0;

  const artistMap = new Map<string, number>();
  const trackMap = new Map<string, number>();
  const merchantMap = new Map<string, number>();
  const categoryMap = new Map<string, { count: number; source: ReceiptSource }>();
  const hourlyBins = new Array(24).fill(0);
  const yearlyMap = new Map<number, { spotify: number; household: number; indiaTrans: number }>();

  let nightCount = 0;
  let minDate = receipts[0].dateStr;
  let maxDate = receipts[0].dateStr;

  for (const r of receipts) {
    if (r.dateStr < minDate) minDate = r.dateStr;
    if (r.dateStr > maxDate) maxDate = r.dateStr;

    // Hourly bin
    if (r.hour >= 0 && r.hour < 24) {
      hourlyBins[r.hour]++;
      if (r.hour >= 23 || r.hour <= 4) {
        nightCount++;
      }
    }

    // Yearly tracking
    let yr = yearlyMap.get(r.year);
    if (!yr) {
      yr = { spotify: 0, household: 0, indiaTrans: 0 };
      yearlyMap.set(r.year, yr);
    }

    if (r.source === 'spotify') {
      spotifyCount++;
      yr.spotify++;
      const sp = r as import('../types').SpotifyReceipt;
      totalMsPlayed += sp.ms_played || 0;
      if (sp.artist_name) {
        artistMap.set(sp.artist_name, (artistMap.get(sp.artist_name) || 0) + 1);
      }
      if (sp.track_name) {
        trackMap.set(`${sp.track_name} — ${sp.artist_name}`, (trackMap.get(`${sp.track_name} — ${sp.artist_name}`) || 0) + 1);
      }
      const catKey = sp.category || 'Music';
      const existingCat = categoryMap.get(catKey);
      categoryMap.set(catKey, { count: (existingCat?.count || 0) + 1, source: 'spotify' });
    } else if (r.source === 'household') {
      householdCount++;
      yr.household++;
      const hh = r as import('../types').HouseholdReceipt;
      if (hh.income_expense === 'Expense') {
        totalExpense += hh.amount || 0;
      }
      const catKey = hh.category || 'Household';
      const existingCat = categoryMap.get(catKey);
      categoryMap.set(catKey, { count: (existingCat?.count || 0) + 1, source: 'household' });
    } else if (r.source === 'india_trans') {
      indiaTransCount++;
      yr.indiaTrans++;
      const it = r as import('../types').IndiaTransReceipt;
      totalExpense += it.amt || 0;
      if (it.merchant) {
        merchantMap.set(it.merchant, (merchantMap.get(it.merchant) || 0) + 1);
      }
      const catKey = it.category.replace('_', ' ') || 'Retail';
      const existingCat = categoryMap.get(catKey);
      categoryMap.set(catKey, { count: (existingCat?.count || 0) + 1, source: 'india_trans' });
    }
  }

  const topArtists = Array.from(artistMap.entries())
    .map(([name, count]) => ({ name, count, plays: count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topCategories = Array.from(categoryMap.entries())
    .map(([name, data]) => ({ name, count: data.count, source: data.source }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const startYear = parseInt(minDate.split('-')[0]) || 2013;
  const endYear = parseInt(maxDate.split('-')[0]) || 2024;
  const dateSpanYears = Math.max(1, endYear - startYear + 1);

  const yearlyDistribution = Array.from(yearlyMap.entries())
    .map(([year, counts]) => ({ year, ...counts }))
    .sort((a, b) => a.year - b.year);

  return {
    totalReceipts: receipts.length,
    spotifyCount,
    householdCount,
    indiaTransCount,
    uniqueArtistsCount: artistMap.size,
    uniqueTracksCount: trackMap.size,
    uniqueMerchantsCount: merchantMap.size,
    dateSpanYears,
    startDateStr: minDate,
    endDateStr: maxDate,
    topArtists,
    topCategories,
    hourlyDistribution: hourlyBins,
    yearlyDistribution,
    nightActivityPercentage: Math.round((nightCount / Math.max(1, receipts.length)) * 100),
    totalListeningHours: Math.round(totalMsPlayed / 3600000),
    totalRecordedExpense: Math.round(totalExpense)
  };
}

// Generate Constellation graph with strict defensible links
export function generateConstellationData(
  receipts: AnyReceipt[],
  maxNodes: number = 220,
  filterSource?: ReceiptSource | 'all',
  timeWindowYear?: number | 'all'
): { nodes: ConstellationNode[]; links: ConstellationLink[] } {
  let filtered = receipts;
  if (filterSource && filterSource !== 'all') {
    filtered = filtered.filter(r => r.source === filterSource);
  }
  if (timeWindowYear && timeWindowYear !== 'all') {
    filtered = filtered.filter(r => r.year === timeWindowYear);
  }

  if (filtered.length === 0) {
    return { nodes: [], links: [] };
  }

  // Sample intelligently to preserve diversity across time and types
  const step = Math.max(1, Math.floor(filtered.length / maxNodes));
  const sampledReceipts: AnyReceipt[] = [];
  for (let i = 0; i < filtered.length && sampledReceipts.length < maxNodes; i += step) {
    sampledReceipts.push(filtered[i]);
  }

  // Color mapping
  const sourceColors: Record<ReceiptSource, string> = {
    spotify: '#38bdf8', // Cyan
    household: '#34d399', // Emerald
    india_trans: '#f59e0b' // Amber
  };

  // Node placement with radial layout based on year and hour of day
  const nodes: ConstellationNode[] = sampledReceipts.map((r, idx) => {
    // Angular coordinate based on time of day (0 to 24h -> 0 to 2*PI)
    const angle = (r.hour / 24) * Math.PI * 2 - Math.PI / 2;
    // Radius based on year (2013 closer to center, 2024 towards outer rim)
    const yearNorm = Math.max(0, Math.min(1, (r.year - 2013) / 11));
    const dist = 70 + yearNorm * 380 + (idx % 7) * 8;

    const x = Math.cos(angle) * dist + (Math.sin(idx * 3.7) * 20);
    const y = Math.sin(angle) * dist + (Math.cos(idx * 2.3) * 20);

    return {
      id: `node_${r.id}`,
      receiptId: r.id,
      receipt: r,
      x,
      y,
      radius: r.source === 'spotify' ? 4.5 : (r.source === 'household' ? 5.5 : 6),
      cluster: `${r.year}_${r.source}`,
      source: r.source,
      color: sourceColors[r.source]
    };
  });

  // Calculate links based strictly on defensible criteria
  const links: ConstellationLink[] = [];
  const nodeMap = new Map<string, ConstellationNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  for (let i = 0; i < nodes.length; i++) {
    const nodeA = nodes[i];
    const recA = nodeA.receipt;
    const timeA = new Date(recA.timestamp).getTime();

    // Look for proximate or related nodes
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeB = nodes[j];
      const recB = nodeB.receipt;
      const timeB = new Date(recB.timestamp).getTime();
      const diffHours = Math.abs(timeA - timeB) / (1000 * 60 * 60);

      // Rule 1: Same date or very close time proximity (< 4 hours)
      if (recA.dateStr === recB.dateStr || diffHours < 4) {
        const isCrossSource = recA.source !== recB.source;
        links.push({
          source: nodeA.id,
          target: nodeB.id,
          relationshipType: isCrossSource ? 'time_proximity' : 'same_date',
          strength: isCrossSource ? 0.85 : 0.6,
          explanation: isCrossSource
            ? `Cross-modal temporal sync: ${recA.source.toUpperCase()} & ${recB.source.toUpperCase()} logged on ${recA.dateStr} within hours.`
            : `Consecutive events logged on ${recA.dateStr}.`,
          observedEvidence: `Receipt A (${recA.timeStr}) and Receipt B (${recB.timeStr}) recorded on ${recA.dateStr}.`,
          derivedConnection: `These actions occurred during the same operational time window.`,
          interpretation: `Reflects simultaneous digital and transactional presence.`
        });
      }
      // Rule 2: Recurring Entity (same artist or same merchant)
      else if (
        recA.source === 'spotify' &&
        recB.source === 'spotify' &&
        (recA as import('../types').SpotifyReceipt).artist_name === (recB as import('../types').SpotifyReceipt).artist_name &&
        Math.abs(recA.year - recB.year) <= 1
      ) {
        const artist = (recA as import('../types').SpotifyReceipt).artist_name;
        links.push({
          source: nodeA.id,
          target: nodeB.id,
          relationshipType: 'recurring_entity',
          strength: 0.75,
          explanation: `Shared artist affinity: Repeated engagement with ${artist}.`,
          observedEvidence: `Both records document active playback of tracks by ${artist}.`,
          derivedConnection: `A sustained listening preference for ${artist} during this period.`,
          interpretation: `Indicates a recurring musical anchor across sessions.`
        });
      }
      // Rule 3: Night Owl Synchrony (both recorded between 23:00 and 04:00 in same month/year)
      else if (
        (recA.hour >= 23 || recA.hour <= 4) &&
        (recB.hour >= 23 || recB.hour <= 4) &&
        recA.year === recB.year &&
        recA.month === recB.month &&
        Math.random() < 0.25 // avoid dense clutter
      ) {
        links.push({
          source: nodeA.id,
          target: nodeB.id,
          relationshipType: 'night_owl_cluster',
          strength: 0.5,
          explanation: `Late-night cluster (${recA.hour}:00 & ${recB.hour}:00 during ${recA.year}-${String(recA.month).padStart(2, '0')}).`,
          observedEvidence: `Both timestamps fall strictly within the midnight-to-dawn window (23:00–04:00).`,
          derivedConnection: `Parallel nocturnal activity during the same monthly period.`,
          interpretation: `Highlights late-night digital immersion habits.`
        });
      }

      // Limit link explosion per node
      if (links.length > maxNodes * 2.8) break;
    }
  }

  return { nodes, links };
}

// Build a story sequence / narrative thread around a selected receipt
export function buildStoryThread(receipt: AnyReceipt, allReceipts: AnyReceipt[]): {
  threadId: string;
  anchorReceipt: AnyReceipt;
  chronologicalSequence: Array<{
    receipt: AnyReceipt;
    connectionReason: string;
    connectionType: string;
    timeDeltaFormatted: string;
  }>;
} {
  const anchorTime = new Date(receipt.timestamp).getTime();
  
  // Find receipts within ±7 days or sharing same artist/merchant/category
  const candidates = allReceipts.filter(r => {
    if (r.id === receipt.id) return false;
    const t = new Date(r.timestamp).getTime();
    const daysDiff = Math.abs(t - anchorTime) / (1000 * 60 * 60 * 24);
    
    const sameDate = r.dateStr === receipt.dateStr;
    const sameEntity = (receipt.source === 'spotify' && r.source === 'spotify' && 
      (r as import('../types').SpotifyReceipt).artist_name === (receipt as import('../types').SpotifyReceipt).artist_name);
    const closeTime = daysDiff <= 3;
    
    return sameDate || closeTime || (sameEntity && daysDiff <= 30);
  });

  // Sort chronological
  const sorted = [receipt, ...candidates.slice(0, 8)].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const sequence = sorted.map((item, idx) => {
    const itemTime = new Date(item.timestamp).getTime();
    const diffHours = (itemTime - anchorTime) / (1000 * 60 * 60);
    
    let timeDeltaFormatted = 'Anchor Record';
    if (item.id !== receipt.id) {
      if (Math.abs(diffHours) < 1) {
        timeDeltaFormatted = `${Math.round(diffHours * 60)} mins ${diffHours >= 0 ? 'later' : 'earlier'}`;
      } else if (Math.abs(diffHours) < 24) {
        timeDeltaFormatted = `${Math.round(Math.abs(diffHours))}h ${diffHours >= 0 ? 'later' : 'earlier'}`;
      } else {
        const days = Math.round(Math.abs(diffHours) / 24);
        timeDeltaFormatted = `${days} day${days > 1 ? 's' : ''} ${diffHours >= 0 ? 'later' : 'earlier'}`;
      }
    }

    let connectionReason = 'Primary subject of investigation';
    let connectionType = 'Anchor';

    if (item.id !== receipt.id) {
      if (item.dateStr === receipt.dateStr) {
        connectionType = 'Same-Day Co-occurrence';
        connectionReason = `Recorded on the exact same date (${item.dateStr}) at ${item.timeStr}.`;
      } else if (item.source === receipt.source && item.category === receipt.category) {
        connectionType = 'Category Continuation';
        connectionReason = `Part of an ongoing ${item.category} engagement sequence.`;
      } else {
        connectionType = 'Temporal Proximity';
        connectionReason = `Chronologically adjacent event occurring within the surrounding context window.`;
      }
    }

    return {
      receipt: item,
      connectionReason,
      connectionType,
      timeDeltaFormatted
    };
  });

  return {
    threadId: `thread_${receipt.id}`,
    anchorReceipt: receipt,
    chronologicalSequence: sequence
  };
}

// Filter and search executor for Receipt Explorer
export function filterReceipts(
  receipts: AnyReceipt[],
  filter: ExplorerFilter,
  page: number = 1,
  pageSize: number = 24
): {
  items: AnyReceipt[];
  totalCount: number;
  totalPages: number;
} {
  let result = receipts;

  // Search query (case-insensitive substring match across multiple fields)
  if (filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase().trim();
    result = result.filter(r => {
      if (r.primaryTitle.toLowerCase().includes(q)) return true;
      if (r.secondaryTitle.toLowerCase().includes(q)) return true;
      if (r.category.toLowerCase().includes(q)) return true;
      if (r.dateStr.includes(q)) return true;
      if (r.source === 'spotify') {
        const sp = r as import('../types').SpotifyReceipt;
        if (sp.album_name.toLowerCase().includes(q)) return true;
        if (sp.platform.toLowerCase().includes(q)) return true;
      } else if (r.source === 'household') {
        const hh = r as import('../types').HouseholdReceipt;
        if (hh.note.toLowerCase().includes(q)) return true;
        if (hh.mode.toLowerCase().includes(q)) return true;
      } else if (r.source === 'india_trans') {
        const it = r as import('../types').IndiaTransReceipt;
        if (it.merchant.toLowerCase().includes(q)) return true;
        if (it.city.toLowerCase().includes(q)) return true;
        if (it.job.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }

  // Source filter
  if (filter.sources.length > 0 && filter.sources.length < 3) {
    result = result.filter(r => filter.sources.includes(r.source));
  }

  // Date range filter
  if (filter.dateRange.start) {
    result = result.filter(r => r.dateStr >= filter.dateRange.start);
  }
  if (filter.dateRange.end) {
    result = result.filter(r => r.dateStr <= filter.dateRange.end);
  }

  // Time of day filter
  if (filter.timeOfDay.length > 0 && filter.timeOfDay.length < 4) {
    result = result.filter(r => {
      const h = r.hour;
      let slot: 'morning' | 'afternoon' | 'evening' | 'night' = 'night';
      if (h >= 6 && h < 12) slot = 'morning';
      else if (h >= 12 && h < 17) slot = 'afternoon';
      else if (h >= 17 && h < 22) slot = 'evening';
      else slot = 'night';
      return filter.timeOfDay.includes(slot);
    });
  }

  // Special criteria filters
  if (filter.onlySpecial.skippedOnly) {
    result = result.filter(r => r.source === 'spotify' && (r as import('../types').SpotifyReceipt).skipped);
  }
  if (filter.onlySpecial.fraudOnly) {
    result = result.filter(r => r.source === 'india_trans' && (r as import('../types').IndiaTransReceipt).is_fraud);
  }
  if (filter.onlySpecial.highValueOnly) {
    result = result.filter(r => (r.rawAmount || 0) > 3000);
  }
  if (filter.onlySpecial.shuffleOnly) {
    result = result.filter(r => r.source === 'spotify' && (r as import('../types').SpotifyReceipt).shuffle);
  }
  if (filter.onlySpecial.incomeOnly) {
    result = result.filter(r => r.source === 'household' && (r as import('../types').HouseholdReceipt).income_expense === 'Income');
  }

  // Sorting
  const sorted = [...result].sort((a, b) => {
    switch (filter.sortBy) {
      case 'date_asc':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'amount_desc':
        return (b.rawAmount || 0) - (a.rawAmount || 0);
      case 'duration_desc':
        return ((b as any).ms_played || 0) - ((a as any).ms_played || 0);
      case 'title_asc':
        return a.primaryTitle.localeCompare(b.primaryTitle);
      case 'date_desc':
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const items = sorted.slice(startIndex, startIndex + pageSize);

  return {
    items,
    totalCount,
    totalPages
  };
}
