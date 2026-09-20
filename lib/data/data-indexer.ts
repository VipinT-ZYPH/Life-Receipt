import { AnyReceipt, SpotifyReceipt, HouseholdReceipt, IndiaTransReceipt } from '../types';

export interface DatasetIndices {
  idMap: Map<string, AnyReceipt>;
  dateMap: Map<string, AnyReceipt[]>;
  categoryMap: Map<string, AnyReceipt[]>;
  artistMap: Map<string, AnyReceipt[]>;
}

/**
 * Builds precomputed O(1) lookup maps from an array of receipts.
 * Executed once when dataset loads or changes, preventing repeated linear scans.
 */
export function buildDatasetIndices(receipts: AnyReceipt[]): DatasetIndices {
  const idMap = new Map<string, AnyReceipt>();
  const dateMap = new Map<string, AnyReceipt[]>();
  const categoryMap = new Map<string, AnyReceipt[]>();
  const artistMap = new Map<string, AnyReceipt[]>();

  for (let i = 0; i < receipts.length; i++) {
    const r = receipts[i];
    
    // 1. ID Index
    idMap.set(r.id, r);

    // 2. Date Index
    const dateList = dateMap.get(r.dateStr);
    if (dateList) {
      dateList.push(r);
    } else {
      dateMap.set(r.dateStr, [r]);
    }

    // 3. Category Index
    if (r.category) {
      const catList = categoryMap.get(r.category);
      if (catList) {
        catList.push(r);
      } else {
        categoryMap.set(r.category, [r]);
      }
    }

    // 4. Artist Index (for Spotify receipts)
    if (r.source === 'spotify') {
      const sp = r as SpotifyReceipt;
      if (sp.artist_name) {
        const artistList = artistMap.get(sp.artist_name);
        if (artistList) {
          artistList.push(r);
        } else {
          artistMap.set(sp.artist_name, [r]);
        }
      }
    }
  }

  return { idMap, dateMap, categoryMap, artistMap };
}

/**
 * Efficient helper to find receipts related to a target receipt
 * using precomputed indices rather than scanning the entire array.
 */
export function getRelatedReceiptsFromIndices(
  targetReceipt: AnyReceipt,
  indices: DatasetIndices,
  maxCount: number = 3
): AnyReceipt[] {
  const related: AnyReceipt[] = [];
  const addedIds = new Set<string>([targetReceipt.id]);

  // 1. Same date matches
  const sameDateList = indices.dateMap.get(targetReceipt.dateStr);
  if (sameDateList) {
    for (let i = 0; i < sameDateList.length; i++) {
      const r = sameDateList[i];
      if (!addedIds.has(r.id)) {
        related.push(r);
        addedIds.add(r.id);
        if (related.length >= maxCount) return related;
      }
    }
  }

  // 2. Same category matches
  if (targetReceipt.category) {
    const sameCatList = indices.categoryMap.get(targetReceipt.category);
    if (sameCatList) {
      for (let i = 0; i < sameCatList.length; i++) {
        const r = sameCatList[i];
        if (!addedIds.has(r.id)) {
          related.push(r);
          addedIds.add(r.id);
          if (related.length >= maxCount) return related;
        }
      }
    }
  }

  // 3. Same artist matches (for Spotify)
  if (targetReceipt.source === 'spotify') {
    const sp = targetReceipt as SpotifyReceipt;
    if (sp.artist_name) {
      const sameArtistList = indices.artistMap.get(sp.artist_name);
      if (sameArtistList) {
        for (let i = 0; i < sameArtistList.length; i++) {
          const r = sameArtistList[i];
          if (!addedIds.has(r.id)) {
            related.push(r);
            addedIds.add(r.id);
            if (related.length >= maxCount) return related;
          }
        }
      }
    }
  }

  return related;
}
