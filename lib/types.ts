export type ReceiptSource = 'spotify' | 'household' | 'india_trans';

export interface BaseReceipt {
  id: string;
  source: ReceiptSource;
  timestamp: string; // ISO string
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (0 = Sun)
  year: number;
  month: number; // 1-12
  primaryTitle: string; // Track name or Merchant or Category
  secondaryTitle: string; // Artist or Subcategory or Job
  category: string;
  amountFormatted?: string;
  rawAmount?: number;
}

export interface SpotifyReceipt extends BaseReceipt {
  source: 'spotify';
  spotify_track_uri: string;
  platform: string; // 'Android', 'iOS', 'Web Player', 'Mac OS', 'Windows'
  ms_played: number;
  durationFormatted: string;
  track_name: string;
  artist_name: string;
  album_name: string;
  reason_start: string; // 'trackdone', 'clickrow', 'appload', 'playbtn', 'fwdbtn'
  reason_end: string; // 'trackdone', 'endplay', 'fwdbtn', 'unexpected-exit'
  shuffle: boolean;
  skipped: boolean;
}

export interface HouseholdReceipt extends BaseReceipt {
  source: 'household';
  mode: string; // 'Cash', 'Credit Card', 'Debit Card', 'Net Banking', 'UPI'
  category: string;
  subcategory: string;
  note: string;
  amount: number;
  income_expense: 'Income' | 'Expense';
  currency: string;
}

export interface IndiaTransReceipt extends BaseReceipt {
  source: 'india_trans';
  trans_id: string;
  merchant: string;
  category: string;
  amt: number;
  first: string;
  last: string;
  gender: string;
  city: string;
  state: string;
  lat: number;
  long: number;
  job: string;
  dob: string;
  merch_lat: number;
  merch_long: number;
  is_fraud: boolean;
  customer_id: string;
}

export type AnyReceipt = SpotifyReceipt | HouseholdReceipt | IndiaTransReceipt;

export interface ConstellationNode {
  id: string;
  receiptId: string;
  receipt: AnyReceipt;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  radius: number;
  cluster: string;
  source: ReceiptSource;
  color: string;
  highlighted?: boolean;
}

export interface ConstellationLink {
  source: string; // node id
  target: string; // node id
  relationshipType: 'time_proximity' | 'same_date' | 'same_category' | 'recurring_entity' | 'behavioral_shift' | 'night_owl_cluster';
  explanation: string;
  strength: number; // 0.1 to 1.0
  observedEvidence: string;
  derivedConnection: string;
  interpretation: string;
}

export interface Discovery {
  id: string;
  title: string;
  tagline: string;
  category: 'listening_habit' | 'spending_pattern' | 'temporal_rhythm' | 'cross_dataset_synchrony' | 'anomaly_detection';
  observedData: string;
  derivedConnection: string;
  interpretation: string;
  keyMetric: string;
  metricLabel: string;
  chartType: 'hourly_distribution' | 'bar_comparison' | 'timeline_density' | 'category_pie' | 'skip_analysis';
  chartData: Array<{ label: string; value: number; secondaryValue?: number; highlight?: boolean }>;
  filterPreset: Partial<ExplorerFilter>;
  sampleReceiptIds: string[];
}

export interface LifeChapter {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  dateRange: string;
  startYear: number;
  endYear: number;
  evidenceDescription: string;
  observedSignals: string[];
  stats: {
    totalReceipts: number;
    spotifyPlays: number;
    transactionCount: number;
    dominantCategory: string;
    dominantArtistOrMerchant: string;
    nightActivityPercent: number;
    skipRatePercent?: number;
  };
  representativeReceiptIds: string[];
  hourlySignature: number[]; // 24 bins
  categorySignature: Array<{ label: string; count: number }>;
}

export interface ExplorerFilter {
  searchQuery: string;
  sources: ReceiptSource[];
  dateRange: { start: string; end: string };
  categories: string[];
  timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[];
  onlySpecial: {
    skippedOnly?: boolean;
    fraudOnly?: boolean;
    highValueOnly?: boolean;
    shuffleOnly?: boolean;
    incomeOnly?: boolean;
  };
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'duration_desc' | 'title_asc';
}

export interface ArchiveOverviewStats {
  totalReceipts: number;
  spotifyCount: number;
  householdCount: number;
  indiaTransCount: number;
  uniqueArtistsCount: number;
  uniqueTracksCount: number;
  uniqueMerchantsCount: number;
  dateSpanYears: number;
  startDateStr: string;
  endDateStr: string;
  topArtists: Array<{ name: string; count: number; plays: number }>;
  topCategories: Array<{ name: string; count: number; source: ReceiptSource }>;
  hourlyDistribution: number[]; // 24 hours
  yearlyDistribution: Array<{ year: number; spotify: number; household: number; indiaTrans: number }>;
  nightActivityPercentage: number;
  totalListeningHours: number;
  totalRecordedExpense: number;
}
