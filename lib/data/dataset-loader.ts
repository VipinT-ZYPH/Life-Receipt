import Papa from 'papaparse';
import { AnyReceipt, SpotifyReceipt, HouseholdReceipt, IndiaTransReceipt, ReceiptSource } from '../types';

let cachedReceipts: AnyReceipt[] | null = null;

// Async fetcher for real dataset JSON files located in public/data/
export async function loadRealDataset(loadFullSpotify: boolean = false): Promise<AnyReceipt[]> {
  if (cachedReceipts && !loadFullSpotify) {
    return cachedReceipts;
  }

  try {
    const spotifyFile = loadFullSpotify ? '/data/spotify.json' : '/data/spotify_sample.json';
    
    const [spRes, hhRes, inRes] = await Promise.all([
      fetch(spotifyFile).then(r => r.ok ? r.json() : []),
      fetch('/data/household.json').then(r => r.ok ? r.json() : []),
      fetch('/data/india_trans.json').then(r => r.ok ? r.json() : [])
    ]);

    const combined: AnyReceipt[] = [...spRes, ...hhRes, ...inRes];

    // Sort chronologically
    combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (!loadFullSpotify) {
      cachedReceipts = combined;
    }

    return combined;
  } catch (error) {
    console.error('Failed to load real datasets from /data/:', error);
    return generateBuiltInDatasetFallback();
  }
}

// Fallback generator in case JSON fetch fails or in SSG node environment
export function generateBuiltInDataset(): AnyReceipt[] {
  if (cachedReceipts && cachedReceipts.length > 0) {
    return cachedReceipts;
  }
  return generateBuiltInDatasetFallback();
}

function generateBuiltInDatasetFallback(): AnyReceipt[] {
  const receipts: AnyReceipt[] = [];
  const now = new Date();

  // Basic initial fallback structure
  for (let i = 0; i < 50; i++) {
    const dateObj = new Date(now.getTime() - i * 86400000);
    const dateStr = dateObj.toISOString().split('T')[0];
    receipts.push({
      id: `sp_fallback_${i}`,
      source: 'spotify',
      timestamp: dateObj.toISOString(),
      dateStr,
      timeStr: '14:30',
      hour: 14,
      dayOfWeek: dateObj.getUTCDay(),
      year: dateObj.getUTCFullYear(),
      month: dateObj.getUTCMonth() + 1,
      primaryTitle: 'The Beatles — Let It Be',
      secondaryTitle: 'The Beatles',
      category: 'Classic Rock',
      spotify_track_uri: 'spotify:track:fallback',
      platform: 'iOS',
      ms_played: 240000,
      durationFormatted: '4:00',
      track_name: 'Let It Be',
      artist_name: 'The Beatles',
      album_name: 'Let It Be',
      reason_start: 'clickrow',
      reason_end: 'trackdone',
      shuffle: false,
      skipped: false
    });
  }

  return receipts;
}

// In-browser CSV Parser for user-supplied custom CSV file upload
export async function parseCsvFile(file: File): Promise<{ receipts: AnyReceipt[]; format: ReceiptSource; totalParsed: number }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const rows = results.data as Record<string, any>[];
        if (!rows || rows.length === 0) {
          reject(new Error('CSV file is empty or could not be parsed.'));
          return;
        }

        const firstRow = rows[0];
        let format: ReceiptSource = 'spotify';

        if ('spotify_track_uri' in firstRow || 'track_name' in firstRow || 'ms_played' in firstRow) {
          format = 'spotify';
        } else if ('Income/Expense' in firstRow || 'Subcategory' in firstRow || 'Mode' in firstRow) {
          format = 'household';
        } else if ('trans_id' in firstRow || 'merch_lat' in firstRow || 'is_fraud' in firstRow || 'merchant' in firstRow) {
          format = 'india_trans';
        }

        const parsedReceipts: AnyReceipt[] = [];

        rows.forEach((row, idx) => {
          try {
            if (format === 'spotify') {
              const ts = row.ts || row.timestamp || new Date().toISOString();
              const dateObj = new Date(ts);
              const isValidDate = !isNaN(dateObj.getTime());
              const safeDate = isValidDate ? dateObj : new Date();
              const dateStr = safeDate.toISOString().split('T')[0];
              const hour = safeDate.getUTCHours();
              const timeStr = `${String(hour).padStart(2, '0')}:${String(safeDate.getUTCMinutes()).padStart(2, '0')}`;
              const msPlayed = Number(row.ms_played) || 180000;
              const durationMinutes = Math.floor(msPlayed / 60000);
              const durationSeconds = Math.floor((msPlayed % 60000) / 1000);

              parsedReceipts.push({
                id: `sp_up_${idx}`,
                source: 'spotify',
                timestamp: safeDate.toISOString(),
                dateStr,
                timeStr,
                hour,
                dayOfWeek: safeDate.getUTCDay(),
                year: safeDate.getUTCFullYear(),
                month: safeDate.getUTCMonth() + 1,
                primaryTitle: String(row.track_name || 'Unknown Track'),
                secondaryTitle: String(row.artist_name || 'Unknown Artist'),
                category: String(row.genre || 'Audio Stream'),
                spotify_track_uri: String(row.spotify_track_uri || `spotify:track:${idx}`),
                platform: String(row.platform || 'Desktop/Mobile'),
                ms_played: msPlayed,
                durationFormatted: `${durationMinutes}:${String(durationSeconds).padStart(2, '0')}`,
                track_name: String(row.track_name || 'Unknown Track'),
                artist_name: String(row.artist_name || 'Unknown Artist'),
                album_name: String(row.album_name || 'Unknown Album'),
                reason_start: String(row.reason_start || 'clickrow'),
                reason_end: String(row.reason_end || 'trackdone'),
                shuffle: Boolean(row.shuffle),
                skipped: Boolean(row.skipped)
              });
            } else if (format === 'household') {
              const dateStr = String(row.Date || '2016-01-01');
              const dateObj = new Date(dateStr);
              const safeDate = !isNaN(dateObj.getTime()) ? dateObj : new Date('2016-01-01');
              const amt = Math.abs(Number(row.Amount) || 0);
              const isInc = String(row['Income/Expense'] || '').toLowerCase().includes('income');

              parsedReceipts.push({
                id: `hh_up_${idx}`,
                source: 'household',
                timestamp: safeDate.toISOString(),
                dateStr: safeDate.toISOString().split('T')[0],
                timeStr: '12:00',
                hour: 12,
                dayOfWeek: safeDate.getUTCDay(),
                year: safeDate.getUTCFullYear(),
                month: safeDate.getUTCMonth() + 1,
                primaryTitle: `${row.Category || 'General'} — ${row.Subcategory || 'Expense'}`,
                secondaryTitle: String(row.Note || 'Household record'),
                category: String(row.Category || 'General'),
                amountFormatted: isInc ? `+₹${amt.toLocaleString()}` : `-₹${amt.toLocaleString()}`,
                rawAmount: amt,
                mode: String(row.Mode || 'Cash'),
                subcategory: String(row.Subcategory || ''),
                note: String(row.Note || ''),
                amount: amt,
                income_expense: isInc ? 'Income' : 'Expense',
                currency: String(row.Currency || 'INR')
              });
            } else {
              const dt = row.trans_date_trans_time || row.Date || new Date().toISOString();
              const dateObj = new Date(dt);
              const safeDate = !isNaN(dateObj.getTime()) ? dateObj : new Date();
              const amt = Number(row.amt || row.amount || 0);
              const isFraud = Boolean(row.is_fraud || String(row.merchant || '').startsWith('fraud_'));

              parsedReceipts.push({
                id: `in_up_${idx}`,
                source: 'india_trans',
                timestamp: safeDate.toISOString(),
                dateStr: safeDate.toISOString().split('T')[0],
                timeStr: `${String(safeDate.getUTCHours()).padStart(2, '0')}:${String(safeDate.getUTCMinutes()).padStart(2, '0')}`,
                hour: safeDate.getUTCHours(),
                dayOfWeek: safeDate.getUTCDay(),
                year: safeDate.getUTCFullYear(),
                month: safeDate.getUTCMonth() + 1,
                primaryTitle: String(row.merchant || 'Merchant Transaction'),
                secondaryTitle: `${String(row.category || 'Retail')} • ${String(row.city || 'India')}`,
                category: String(row.category || 'Retail'),
                amountFormatted: `-₹${amt.toLocaleString()}`,
                rawAmount: amt,
                trans_id: String(row.trans_id || `TXN_${idx}`),
                merchant: String(row.merchant || 'Unknown'),
                amt,
                first: String(row.first || 'Customer'),
                last: String(row.last || ''),
                gender: String(row.gender || 'U'),
                city: String(row.city || 'Bengaluru'),
                state: String(row.state || 'Karnataka'),
                lat: Number(row.lat) || 12.97,
                long: Number(row.long) || 77.59,
                job: String(row.job || 'Professional'),
                dob: String(row.dob || '1990-01-01'),
                merch_lat: Number(row.merch_lat) || 12.97,
                merch_long: Number(row.merch_long) || 77.59,
                is_fraud: isFraud,
                customer_id: String(row.customer_id || '')
              });
            }
          } catch (e) {
            console.warn('Row parsing error:', e);
          }
        });

        resolve({ receipts: parsedReceipts, format, totalParsed: parsedReceipts.length });
      },
      error: (err) => reject(err)
    });
  });
}
