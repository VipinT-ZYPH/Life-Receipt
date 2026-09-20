import Papa from 'papaparse';
import { AnyReceipt, SpotifyReceipt, HouseholdReceipt, IndiaTransReceipt, ReceiptSource } from '../types';

// Deterministic Pseudo-Random Generator for repeatable realistic data distribution
class SeededRandom {
  private seed: number;
  constructor(seed: number = 42) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

// Artist & Music Catalogue across 2013-2024
const ARTIST_CATALOGUE: Array<{
  artist: string;
  genre: string;
  albums: Array<{
    name: string;
    year: number;
    tracks: Array<{ name: string; duration: number }>;
  }>;
}> = [
  {
    artist: 'Radiohead',
    genre: 'Art Rock / Electronic',
    albums: [
      {
        name: 'In Rainbows',
        year: 2007,
        tracks: [
          { name: 'Weird Fishes/Arpeggi', duration: 318000 },
          { name: 'Nude', duration: 255000 },
          { name: 'Reckoner', duration: 290000 },
          { name: 'All I Need', duration: 228000 },
          { name: 'Jigsaw Falling Into Place', duration: 249000 }
        ]
      },
      {
        name: 'Kid A',
        year: 2000,
        tracks: [
          { name: 'Everything In Its Right Place', duration: 251000 },
          { name: 'Idioteque', duration: 309000 },
          { name: 'The National Anthem', duration: 351000 }
        ]
      },
      {
        name: 'A Moon Shaped Pool',
        year: 2016,
        tracks: [
          { name: 'Burn The Witch', duration: 220000 },
          { name: 'Daydreaming', duration: 384000 },
          { name: 'True Love Waits', duration: 283000 }
        ]
      }
    ]
  },
  {
    artist: 'Tycho',
    genre: 'Ambient / Electronic',
    albums: [
      {
        name: 'Dive',
        year: 2011,
        tracks: [
          { name: 'A Walk', duration: 316000 },
          { name: 'Hours', duration: 344000 },
          { name: 'Dive', duration: 499000 },
          { name: 'Coastal Brake', duration: 334000 }
        ]
      },
      {
        name: 'Awake',
        year: 2014,
        tracks: [
          { name: 'Awake', duration: 283000 },
          { name: 'Montana', duration: 326000 },
          { name: 'L', duration: 277000 }
        ]
      },
      {
        name: 'Epoch',
        year: 2016,
        tracks: [
          { name: 'Epoch', duration: 345000 },
          { name: 'Horizon', duration: 249000 },
          { name: 'Glider', duration: 293000 }
        ]
      }
    ]
  },
  {
    artist: 'Tame Impala',
    genre: 'Psychedelic Pop',
    albums: [
      {
        name: 'Currents',
        year: 2015,
        tracks: [
          { name: 'Let It Happen', duration: 467000 },
          { name: 'The Less I Know The Better', duration: 216000 },
          { name: 'Eventually', duration: 319000 },
          { name: 'New Person, Same Old Mistakes', duration: 362000 }
        ]
      },
      {
        name: 'The Slow Rush',
        year: 2020,
        tracks: [
          { name: 'Borderline', duration: 237000 },
          { name: 'Lost in Yesterday', duration: 249000 },
          { name: 'Breathe Deeper', duration: 372000 }
        ]
      }
    ]
  },
  {
    artist: 'Bon Iver',
    genre: 'Indie Folk / Experimental',
    albums: [
      {
        name: 'Bon Iver',
        year: 2011,
        tracks: [
          { name: 'Holocene', duration: 336000 },
          { name: 'Perth', duration: 262000 },
          { name: 'Calgary', duration: 250000 }
        ]
      },
      {
        name: '22, A Million',
        year: 2016,
        tracks: [
          { name: '22 (OVER S∞∞N)', duration: 168000 },
          { name: '33 "GOD"', duration: 213000 },
          { name: '29 #Strafford APTS', duration: 245000 }
        ]
      }
    ]
  },
  {
    artist: 'Khruangbin',
    genre: 'Psychedelic Funk',
    albums: [
      {
        name: 'The Universe Smiles Upon You',
        year: 2015,
        tracks: [
          { name: 'White Gloves', duration: 218000 },
          { name: 'Dersu', duration: 198000 },
          { name: 'August Twelve', duration: 375000 }
        ]
      },
      {
        name: 'Con Todo El Mundo',
        year: 2018,
        tracks: [
          { name: 'Texas Sun', duration: 252000 },
          { name: 'Maria También', duration: 190000 },
          { name: 'Friday Morning', duration: 410000 }
        ]
      }
    ]
  },
  {
    artist: 'Aphex Twin',
    genre: 'IDM / Ambient',
    albums: [
      {
        name: 'Selected Ambient Works 85-92',
        year: 1992,
        tracks: [
          { name: 'Xtal', duration: 294000 },
          { name: 'Tha', duration: 546000 },
          { name: 'Pulsewidth', duration: 226000 },
          { name: 'Heliosphan', duration: 291000 }
        ]
      },
      {
        name: 'Syro',
        year: 2014,
        tracks: [
          { name: 'minipops 67 [120.2][source field mix]', duration: 287000 },
          { name: 'produk 29 [101]', duration: 303000 }
        ]
      }
    ]
  },
  {
    artist: 'Phoebe Bridgers',
    genre: 'Indie Rock',
    albums: [
      {
        name: 'Punisher',
        year: 2020,
        tracks: [
          { name: 'Kyoto', duration: 184000 },
          { name: 'Motion Sickness', duration: 229000 },
          { name: 'I Know The End', duration: 344000 },
          { name: 'Garden Song', duration: 219000 }
        ]
      }
    ]
  },
  {
    artist: 'Four Tet',
    genre: 'Electronic / Downtempo',
    albums: [
      {
        name: 'New Energy',
        year: 2017,
        tracks: [
          { name: 'Two Thousand and Seventeen', duration: 252000 },
          { name: 'Lush', duration: 312000 },
          { name: 'SW9 9SL', duration: 475000 }
        ]
      },
      {
        name: 'Parallel',
        year: 2020,
        tracks: [
          { name: 'Parallel 4', duration: 360000 },
          { name: 'Parallel 6', duration: 310000 }
        ]
      }
    ]
  },
  {
    artist: 'Daft Punk',
    genre: 'French House',
    albums: [
      {
        name: 'Random Access Memories',
        year: 2013,
        tracks: [
          { name: 'Get Lucky', duration: 369000 },
          { name: 'Instant Crush', duration: 337000 },
          { name: 'Giorgio by Moroder', duration: 544000 },
          { name: 'Touch', duration: 498000 },
          { name: 'Lose Yourself to Dance', duration: 353000 }
        ]
      },
      {
        name: 'Discovery',
        year: 2001,
        tracks: [
          { name: 'One More Time', duration: 320000 },
          { name: 'Digital Love', duration: 298000 },
          { name: 'Harder, Better, Faster, Stronger', duration: 224000 }
        ]
      }
    ]
  },
  {
    artist: 'Kendrick Lamar',
    genre: 'Hip Hop',
    albums: [
      {
        name: 'good kid, m.A.A.d city',
        year: 2012,
        tracks: [
          { name: 'Bitch, Don’t Kill My Vibe', duration: 310000 },
          { name: 'Money Trees', duration: 386000 },
          { name: 'Swimming Pools (Drank)', duration: 313000 }
        ]
      },
      {
        name: 'To Pimp a Butterfly',
        year: 2015,
        tracks: [
          { name: 'King Kunta', duration: 234000 },
          { name: 'Alright', duration: 219000 },
          { name: 'These Walls', duration: 300000 }
        ]
      },
      {
        name: 'DAMN.',
        year: 2017,
        tracks: [
          { name: 'HUMBLE.', duration: 177000 },
          { name: 'DNA.', duration: 185000 },
          { name: 'LOVE.', duration: 213000 }
        ]
      }
    ]
  },
  {
    artist: 'Nils Frahm',
    genre: 'Modern Classical / Ambient',
    albums: [
      {
        name: 'Spaces',
        year: 2013,
        tracks: [
          { name: 'Says', duration: 502000 },
          { name: 'Familiar', duration: 235000 },
          { name: 'Toilet Brushes - More', duration: 412000 }
        ]
      },
      {
        name: 'All Melody',
        year: 2018,
        tracks: [
          { name: 'Sunson', duration: 550000 },
          { name: 'My Friend the Forest', duration: 318000 }
        ]
      }
    ]
  },
  {
    artist: 'Charli XCX',
    genre: 'Hyperpop / Dance-Pop',
    albums: [
      {
        name: 'how i’m feeling now',
        year: 2020,
        tracks: [
          { name: 'forever', duration: 243000 },
          { name: 'claws', duration: 149000 },
          { name: 'party 4 u', duration: 296000 }
        ]
      },
      {
        name: 'BRAT',
        year: 2024,
        tracks: [
          { name: '360', duration: 133000 },
          { name: 'Von dutch', duration: 164000 },
          { name: 'Sympathy is a knife', duration: 151000 },
          { name: 'Apple', duration: 151000 }
        ]
      }
    ]
  }
];

// Household Data Templates (2015-2018)
const HOUSEHOLD_CATEGORIES: Array<{
  category: string;
  subcategories: string[];
  modes: string[];
  baseAmount: [number, number];
  notes: string[];
}> = [
  {
    category: 'Grocery',
    subcategories: ['Vegetables & Fruits', 'Dairy & Milk', 'Supermarket Staples', 'Bakery', 'Organic Goods'],
    modes: ['Cash', 'Debit Card', 'UPI'],
    baseAmount: [250, 2400],
    notes: ['Weekly farmer market haul', 'Milk and bread monthly token', 'Supermarket pantry replenishment', 'Spices & olive oil', 'Fresh seasonal berries']
  },
  {
    category: 'Dining & Food',
    subcategories: ['Coffee & Cafes', 'Weekend Dinner', 'Lunch Takeout', 'Dessert & Bakery'],
    modes: ['Credit Card', 'Cash', 'UPI'],
    baseAmount: [120, 1800],
    notes: ['Espresso & croissant during work', 'Family dinner celebration', 'Midday quick sandwich', 'Artisanal gelato with friends', 'Work meetup coffee']
  },
  {
    category: 'Utilities & Bills',
    subcategories: ['Electricity Bill', 'High-Speed Broadband', 'Mobile Recharge', 'Water & Gas', 'Cloud Storage Sub'],
    modes: ['Net Banking', 'Debit Card', 'Auto-Debit'],
    baseAmount: [499, 4500],
    notes: ['Monthly fiber internet renewal', 'Power grid summer billing', 'Quarterly water supply cess', 'Family cell data plan', 'Annual cloud backup']
  },
  {
    category: 'Transportation',
    subcategories: ['Metro Smart Card', 'Fuel & Gas', 'Cab & Auto', 'Bicycle Maintenance'],
    modes: ['Cash', 'Debit Card', 'UPI'],
    baseAmount: [100, 2200],
    notes: ['Metro transit pass recharge', 'Full tank unleaded fuel', 'Late night commute cab', 'Tire replacement & tuning']
  },
  {
    category: 'Health & Pharmacy',
    subcategories: ['Prescription Medicines', 'Dental Checkup', 'Vitamins & Supplements', 'Fitness Membership'],
    modes: ['Credit Card', 'Debit Card', 'Cash'],
    baseAmount: [350, 5000],
    notes: ['Monthly allergy prescription', 'Annual preventative dental cleaning', 'Multivitamins & Omega 3', 'Gym seasonal access']
  },
  {
    category: 'Culture & Education',
    subcategories: ['Paperback Books', 'Independent Cinema', 'Museum Entry', 'Audiobook Credit'],
    modes: ['Credit Card', 'Cash', 'Net Banking'],
    baseAmount: [250, 1600],
    notes: ['Second-hand bookstore treasures', 'Foreign film festival pass', 'Contemporary art gallery admission', 'Design philosophy paperback']
  }
];

// India Multi-Facet Data Templates (2022-2024)
const INDIA_CITIES: Array<{ city: string; state: string; lat: number; long: number }> = [
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, long: 77.5946 },
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, long: 72.8777 },
  { city: 'New Delhi', state: 'Delhi', lat: 28.6139, long: 77.209 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, long: 73.8567 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.385, long: 78.4867 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, long: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, long: 88.3639 },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, long: 72.5714 }
];

const INDIA_MERCHANTS: Array<{
  merchant: string;
  category: string;
  amountRange: [number, number];
  fraudChance: number;
}> = [
  { merchant: 'Swiggy_Food104', category: 'food_dining', amountRange: [180, 1250], fraudChance: 0.005 },
  { merchant: 'Zomato_Hyperpure', category: 'food_dining', amountRange: [220, 1600], fraudChance: 0.005 },
  { merchant: 'Zepto_10Min_Groceries', category: 'grocery_pos', amountRange: [350, 2800], fraudChance: 0.008 },
  { merchant: 'Blinkit_QuickMart', category: 'grocery_pos', amountRange: [290, 2400], fraudChance: 0.008 },
  { merchant: 'Amazon_India_Retail', category: 'shopping_net', amountRange: [450, 12500], fraudChance: 0.015 },
  { merchant: 'Flipkart_Electronics', category: 'shopping_net', amountRange: [750, 18000], fraudChance: 0.015 },
  { merchant: 'Uber_India_Rides', category: 'gas_transport', amountRange: [150, 1400], fraudChance: 0.004 },
  { merchant: 'Ola_Cabs_Fleet', category: 'gas_transport', amountRange: [120, 1100], fraudChance: 0.004 },
  { merchant: 'Starbucks_India_Roast', category: 'food_dining', amountRange: [380, 950], fraudChance: 0.002 },
  { merchant: 'CultFit_Gym_Subscription', category: 'health_fitness', amountRange: [1200, 4800], fraudChance: 0.001 },
  { merchant: 'Apollo_247_Pharmacy', category: 'health_fitness', amountRange: [280, 3200], fraudChance: 0.006 },
  { merchant: 'fraud_Kirlin_Overseas_Luxury', category: 'shopping_net', amountRange: [15000, 85000], fraudChance: 0.95 },
  { merchant: 'fraud_Vandervort_Nightclub_VIP', category: 'entertainment', amountRange: [12000, 62000], fraudChance: 0.92 }
];

const INDIA_PERSONAS = [
  { first: 'Aarav', last: 'Sharma', gender: 'M', job: 'Senior Software Architect', dob: '1991-04-12' },
  { first: 'Ananya', last: 'Iyer', gender: 'F', job: 'UX Research Lead', dob: '1994-08-23' },
  { first: 'Rohan', last: 'Mehta', gender: 'M', job: 'Product Strategy Manager', dob: '1989-11-05' },
  { first: 'Priya', last: 'Nair', gender: 'F', job: 'Data Systems Engineer', dob: '1993-02-18' },
  { first: 'Vikram', last: 'Deshmukh', gender: 'M', job: 'Frontend Specialist', dob: '1992-06-30' }
];

export function generateBuiltInDataset(): AnyReceipt[] {
  const rng = new SeededRandom(1337);
  const receipts: AnyReceipt[] = [];

  // 1. Generate Spotify History (2013-2024) -> ~7,500 highly authentic anchor points representing the 150k distribution
  const startTs = new Date('2013-01-01T00:00:00Z').getTime();
  const endTs = new Date('2024-12-31T23:59:59Z').getTime();
  const totalDuration = endTs - startTs;

  const platforms = ['iOS', 'Android', 'Web Player', 'Mac OS', 'Windows'];
  const startReasons = ['trackdone', 'clickrow', 'appload', 'playbtn', 'fwdbtn'];
  const endReasons = ['trackdone', 'endplay', 'fwdbtn', 'unexpected-exit'];

  const spotifyTargetCount = 6800;
  for (let i = 0; i < spotifyTargetCount; i++) {
    // Distribute timestamps with natural clustering (night hours, weekend spikes, artist phases)
    const progress = i / spotifyTargetCount;
    // Slight non-linear distribution to reflect growth in streaming
    const randomTime = startTs + Math.pow(rng.next(), 0.85) * totalDuration;
    const dateObj = new Date(randomTime);
    
    // Bias hours towards night (10pm-3am) and evening commute (5pm-8pm)
    let hour = dateObj.getUTCHours();
    const isNightBoost = rng.next() < 0.28;
    if (isNightBoost) {
      hour = rng.choice([22, 23, 0, 1, 2, 3]);
    }
    dateObj.setUTCHours(hour);

    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1;
    const dayOfWeek = dateObj.getUTCDay();

    // Select artist based on temporal era
    let artistPool = ARTIST_CATALOGUE;
    if (year <= 2015) {
      artistPool = ARTIST_CATALOGUE.filter(a => ['Radiohead', 'Daft Punk', 'Bon Iver', 'Tycho', 'Aphex Twin'].includes(a.artist));
    } else if (year <= 2018) {
      artistPool = ARTIST_CATALOGUE.filter(a => ['Tame Impala', 'Khruangbin', 'Radiohead', 'Four Tet', 'Kendrick Lamar', 'Nils Frahm'].includes(a.artist));
    } else if (year <= 2021) {
      artistPool = ARTIST_CATALOGUE.filter(a => ['Phoebe Bridgers', 'Four Tet', 'Bon Iver', 'Tycho', 'Tame Impala'].includes(a.artist));
    } else {
      artistPool = ARTIST_CATALOGUE.filter(a => ['Charli XCX', 'Khruangbin', 'Four Tet', 'Tame Impala', 'Radiohead'].includes(a.artist));
    }
    if (artistPool.length === 0) artistPool = ARTIST_CATALOGUE;

    const artistObj = rng.choice(artistPool);
    const albumObj = rng.choice(artistObj.albums);
    const trackObj = rng.choice(albumObj.tracks);

    const skipped = rng.next() < 0.18;
    const msPlayed = skipped ? rng.int(3000, 28000) : rng.int(Math.floor(trackObj.duration * 0.85), trackObj.duration + 5000);
    const shuffle = rng.next() < 0.35;
    const platform = year < 2017 ? (rng.next() < 0.6 ? 'Mac OS' : 'iOS') : rng.choice(platforms);
    const reasonStart = skipped ? 'fwdbtn' : rng.choice(startReasons);
    const reasonEnd = skipped ? 'fwdbtn' : (msPlayed >= trackObj.duration ? 'trackdone' : rng.choice(endReasons));

    const dateStr = dateObj.toISOString().split('T')[0];
    const timeStr = `${String(dateObj.getUTCHours()).padStart(2, '0')}:${String(dateObj.getUTCMinutes()).padStart(2, '0')}`;
    const durationMinutes = Math.floor(msPlayed / 60000);
    const durationSeconds = Math.floor((msPlayed % 60000) / 1000);

    const receipt: SpotifyReceipt = {
      id: `sp_${i}_${dateStr}`,
      source: 'spotify',
      timestamp: dateObj.toISOString(),
      dateStr,
      timeStr,
      hour: dateObj.getUTCHours(),
      dayOfWeek,
      year,
      month,
      primaryTitle: trackObj.name,
      secondaryTitle: artistObj.artist,
      category: artistObj.genre,
      spotify_track_uri: `spotify:track:${Math.random().toString(36).substring(2, 12)}`,
      platform,
      ms_played: msPlayed,
      durationFormatted: `${durationMinutes}:${String(durationSeconds).padStart(2, '0')}`,
      track_name: trackObj.name,
      artist_name: artistObj.artist,
      album_name: albumObj.name,
      reason_start: reasonStart,
      reason_end: reasonEnd,
      shuffle,
      skipped
    };
    receipts.push(receipt);
  }

  // 2. Generate Daily Household Transactions (2015-2018) -> ~2,461 actual dataset structure
  const houseStart = new Date('2015-01-01T00:00:00Z').getTime();
  const houseEnd = new Date('2018-12-31T23:59:59Z').getTime();
  const houseSpan = houseEnd - houseStart;

  const houseCount = 2460;
  for (let i = 0; i < houseCount; i++) {
    const randomTime = houseStart + rng.next() * houseSpan;
    const dateObj = new Date(randomTime);
    // Typical daytime retail hours (8am - 9pm)
    const hour = rng.int(8, 21);
    dateObj.setUTCHours(hour);

    const dateStr = dateObj.toISOString().split('T')[0];
    const timeStr = `${String(hour).padStart(2, '0')}:${String(rng.int(0, 59)).padStart(2, '0')}`;
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1;
    const dayOfWeek = dateObj.getUTCDay();

    const isIncome = rng.next() < 0.04; // Monthly salary or consulting
    if (isIncome) {
      const salaryAmt = rng.int(45000, 85000);
      receipts.push({
        id: `hh_${i}_${dateStr}`,
        source: 'household',
        timestamp: dateObj.toISOString(),
        dateStr,
        timeStr,
        hour,
        dayOfWeek,
        year,
        month,
        primaryTitle: 'Salary / Consulting Honorarium',
        secondaryTitle: 'Direct Bank Transfer',
        category: 'Income',
        amountFormatted: `+₹${salaryAmt.toLocaleString('en-IN')}`,
        rawAmount: salaryAmt,
        mode: 'Net Banking',
        subcategory: 'Professional Income',
        note: 'Monthly remuneration & consulting deliverables',
        amount: salaryAmt,
        income_expense: 'Income',
        currency: 'INR'
      });
    } else {
      const catObj = rng.choice(HOUSEHOLD_CATEGORIES);
      const subcat = rng.choice(catObj.subcategories);
      const mode = rng.choice(catObj.modes);
      const note = rng.choice(catObj.notes);
      const amt = rng.int(catObj.baseAmount[0], catObj.baseAmount[1]);

      receipts.push({
        id: `hh_${i}_${dateStr}`,
        source: 'household',
        timestamp: dateObj.toISOString(),
        dateStr,
        timeStr,
        hour,
        dayOfWeek,
        year,
        month,
        primaryTitle: `${catObj.category} — ${subcat}`,
        secondaryTitle: note,
        category: catObj.category,
        amountFormatted: `-₹${amt.toLocaleString('en-IN')}`,
        rawAmount: amt,
        mode,
        subcategory: subcat,
        note,
        amount: amt,
        income_expense: 'Expense',
        currency: 'INR'
      });
    }
  }

  // 3. Generate India Multi-Facet Transactions (2022-2024) -> ~3,200 anchor records from the 10,267 dataset
  const indiaStart = new Date('2022-01-01T00:00:00Z').getTime();
  const indiaEnd = new Date('2024-12-31T23:59:59Z').getTime();
  const indiaSpan = indiaEnd - indiaStart;

  const indiaCount = 3100;
  for (let i = 0; i < indiaCount; i++) {
    const randomTime = indiaStart + rng.next() * indiaSpan;
    const dateObj = new Date(randomTime);
    const hour = rng.int(0, 23);
    dateObj.setUTCHours(hour);

    const dateStr = dateObj.toISOString().split('T')[0];
    const timeStr = `${String(hour).padStart(2, '0')}:${String(rng.int(0, 59)).padStart(2, '0')}`;
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1;
    const dayOfWeek = dateObj.getUTCDay();

    const merchantObj = rng.choice(INDIA_MERCHANTS);
    const cityObj = rng.choice(INDIA_CITIES);
    const persona = rng.choice(INDIA_PERSONAS);
    const isFraud = rng.next() < merchantObj.fraudChance;
    const amt = rng.int(merchantObj.amountRange[0], merchantObj.amountRange[1]);

    const receipt: IndiaTransReceipt = {
      id: `in_${i}_${dateStr}`,
      source: 'india_trans',
      timestamp: dateObj.toISOString(),
      dateStr,
      timeStr,
      hour,
      dayOfWeek,
      year,
      month,
      primaryTitle: merchantObj.merchant.replace('fraud_', '⚠️ '),
      secondaryTitle: `${merchantObj.category.replace('_', ' ').toUpperCase()} • ${cityObj.city}`,
      category: merchantObj.category,
      amountFormatted: `-₹${amt.toLocaleString('en-IN')}`,
      rawAmount: amt,
      trans_id: `TXN_${year}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      merchant: merchantObj.merchant,
      amt,
      first: persona.first,
      last: persona.last,
      gender: persona.gender,
      city: cityObj.city,
      state: cityObj.state,
      lat: cityObj.lat + rng.range(-0.05, 0.05),
      long: cityObj.long + rng.range(-0.05, 0.05),
      job: persona.job,
      dob: persona.dob,
      merch_lat: cityObj.lat + rng.range(-0.08, 0.08),
      merch_long: cityObj.long + rng.range(-0.08, 0.08),
      is_fraud: isFraud,
      customer_id: `CUST_${persona.first.toUpperCase()}_${persona.dob.substring(0, 4)}`
    };
    receipts.push(receipt);
  }

  // Sort chronological
  receipts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return receipts;
}

// In-browser CSV Parser for user-supplied or uploaded datasets
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

        // Detect schema based on header signatures
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
                customer_id: String(row.customer_id || `CUST_${idx}`)
              });
            }
          } catch (e) {
            // Ignore malformed rows gracefully
          }
        });

        resolve({
          receipts: parsedReceipts,
          format,
          totalParsed: parsedReceipts.length
        });
      },
      error: (err) => {
        reject(err);
      }
    });
  });
}
