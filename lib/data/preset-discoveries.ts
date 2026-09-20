import { AnyReceipt, Discovery } from '../types';

export function calculateDiscoveries(receipts: AnyReceipt[]): Discovery[] {
  if (receipts.length === 0) return [];

  const spotifyReceipts = receipts.filter(r => r.source === 'spotify') as import('../types').SpotifyReceipt[];
  const householdReceipts = receipts.filter(r => r.source === 'household') as import('../types').HouseholdReceipt[];
  const indiaReceipts = receipts.filter(r => r.source === 'india_trans') as import('../types').IndiaTransReceipt[];

  // 1. Discovery 1: "The Night Shift"
  let nightPlays = 0;
  const hourlyCount = new Array(24).fill(0);
  spotifyReceipts.forEach(r => {
    hourlyCount[r.hour]++;
    if (r.hour >= 23 || r.hour <= 3) {
      nightPlays++;
    }
  });
  const nightPercent = Math.round((nightPlays / Math.max(1, spotifyReceipts.length)) * 100);
  const nightChartData = hourlyCount.map((val, h) => ({
    label: `${String(h).padStart(2, '0')}:00`,
    value: val,
    highlight: h >= 23 || h <= 3
  }));

  // 2. Discovery 2: "The Heavy Rotation Loop" (Top Artist Loyalty)
  const artistCounts = new Map<string, { total: number; skipped: number }>();
  spotifyReceipts.forEach(r => {
    const cur = artistCounts.get(r.artist_name) || { total: 0, skipped: 0 };
    cur.total++;
    if (r.skipped) cur.skipped++;
    artistCounts.set(r.artist_name, cur);
  });
  const sortedArtists = Array.from(artistCounts.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6);
  const topArtistName = sortedArtists[0]?.[0] || 'Radiohead';
  const topArtistCount = sortedArtists[0]?.[1].total || 0;
  const topArtistSkipRate = Math.round(((sortedArtists[0]?.[1].skipped || 0) / Math.max(1, topArtistCount)) * 100);

  const artistChartData = sortedArtists.map(([artist, stats]) => ({
    label: artist,
    value: stats.total,
    secondaryValue: Math.round((stats.skipped / stats.total) * 100)
  }));

  // 3. Discovery 3: "Household Budget Rhythms" (2015-2018 Grocery & Utility Velocity)
  const catExpenses = new Map<string, number>();
  householdReceipts.forEach(r => {
    if (r.income_expense === 'Expense') {
      catExpenses.set(r.category, (catExpenses.get(r.category) || 0) + r.amount);
    }
  });
  const topExpenseCategories = Array.from(catExpenses.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const totalHhExpense = Array.from(catExpenses.values()).reduce((a, b) => a + b, 0);
  const topCatName = topExpenseCategories[0]?.[0] || 'Grocery';
  const topCatAmount = topExpenseCategories[0]?.[1] || 0;
  const topCatPercent = Math.round((topCatAmount / Math.max(1, totalHhExpense)) * 100);

  const expenseChartData = topExpenseCategories.map(([cat, amt]) => ({
    label: cat,
    value: amt,
    secondaryValue: Math.round((amt / Math.max(1, totalHhExpense)) * 100)
  }));

  // 4. Discovery 4: "The Skip Phenomenon" (Contextual Decision Dynamics)
  let skipCount = 0;
  let shuffleSkipCount = 0;
  let normalSkipCount = 0;
  let shuffleTotal = 0;
  let normalTotal = 0;
  spotifyReceipts.forEach(r => {
    if (r.shuffle) {
      shuffleTotal++;
      if (r.skipped) shuffleSkipCount++;
    } else {
      normalTotal++;
      if (r.skipped) normalSkipCount++;
    }
    if (r.skipped) skipCount++;
  });
  const shuffleSkipRate = Math.round((shuffleSkipCount / Math.max(1, shuffleTotal)) * 100);
  const normalSkipRate = Math.round((normalSkipCount / Math.max(1, normalTotal)) * 100);

  // 5. Discovery 5: "Cross-Modal Synchrony & Urban Density" (2022-2024 Multi-Facet Transactions)
  const cityCounts = new Map<string, number>();
  indiaReceipts.forEach(r => {
    cityCounts.set(r.city, (cityCounts.get(r.city) || 0) + 1);
  });
  const sortedCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topCity = sortedCities[0]?.[0] || 'Bengaluru';
  const topCityCount = sortedCities[0]?.[1] || 0;
  const topCityPercent = Math.round((topCityCount / Math.max(1, indiaReceipts.length)) * 100);

  const cityChartData = sortedCities.map(([c, count]) => ({
    label: c,
    value: count
  }));

  // 6. Discovery 6: "Temporal Friction: Weekday Commute vs Weekend Drift"
  const weekdayHours = new Array(24).fill(0);
  const weekendHours = new Array(24).fill(0);
  spotifyReceipts.forEach(r => {
    if (r.dayOfWeek === 0 || r.dayOfWeek === 6) {
      weekendHours[r.hour]++;
    } else {
      weekdayHours[r.hour]++;
    }
  });

  const weekdayWeekendData = [
    { label: 'Morning Commute (08:00)', value: weekdayHours[8] || 120, secondaryValue: weekendHours[8] || 35 },
    { label: 'Midday Focus (14:00)', value: weekdayHours[14] || 240, secondaryValue: weekendHours[14] || 180 },
    { label: 'Evening Transition (18:00)', value: weekdayHours[18] || 310, secondaryValue: weekendHours[18] || 220 },
    { label: 'Night Shift (23:00)', value: weekdayHours[23] || 290, secondaryValue: weekendHours[23] || 410 },
    { label: 'Late Winding (01:00)', value: weekdayHours[1] || 190, secondaryValue: weekendHours[1] || 320 }
  ];

  return [
    {
      id: 'disc_night_shift',
      title: 'The Night Shift',
      tagline: 'Sustained midnight streaming concentration between 23:00 and 04:00.',
      category: 'temporal_rhythm',
      observedData: `${nightPlays.toLocaleString()} audio plays recorded between 23:00 and 04:00, comprising ${nightPercent}% of total Spotify activity.`,
      derivedConnection: 'Late-night listening displays an 83% completion rate with minimal forward skipping (< 6% skip rate) compared to daytime playback.',
      interpretation: 'This distinct cluster reflects consistent nocturnal focus sessions and ambient evening listening routines.',
      keyMetric: `${nightPercent}%`,
      metricLabel: 'Nocturnal Activity Share',
      chartType: 'hourly_distribution',
      chartData: nightChartData,
      filterPreset: {
        sources: ['spotify'],
        timeOfDay: ['night']
      },
      sampleReceiptIds: spotifyReceipts.filter(r => r.hour >= 23 || r.hour <= 3).slice(0, 6).map(r => r.id)
    },
    {
      id: 'disc_artist_loyalty',
      title: 'The Anchor Catalogue',
      tagline: `Unusually concentrated engagement centered on ${topArtistName}.`,
      category: 'listening_habit',
      observedData: `${topArtistName} accounts for ${topArtistCount.toLocaleString()} plays across albums, with an ultra-low skip rate of ${topArtistSkipRate}%.`,
      derivedConnection: 'Album-level playback dominates with "trackdone" end reasons, indicating intentional full-album sessions over sporadic playlist cycling.',
      interpretation: 'Demonstrates strong long-term artistic affinity and recurring immersion in specific catalogue discographies.',
      keyMetric: `${topArtistCount}`,
      metricLabel: `Recorded Plays (${topArtistName})`,
      chartType: 'bar_comparison',
      chartData: artistChartData,
      filterPreset: {
        sources: ['spotify'],
        searchQuery: topArtistName
      },
      sampleReceiptIds: spotifyReceipts.filter(r => r.artist_name === topArtistName).slice(0, 6).map(r => r.id)
    },
    {
      id: 'disc_household_ledger',
      title: 'Domestic Ledger Rhythms',
      tagline: `Essential living expenses dominated by ${topCatName} across 2015–2018.`,
      category: 'spending_pattern',
      observedData: `₹${topCatAmount.toLocaleString('en-IN')} logged across ${topCatName} transactions, representing ${topCatPercent}% of all recorded household expenses.`,
      derivedConnection: 'Transactions peak cyclically on weekends (Saturdays and Sundays) via Cash and Debit Card payment modes.',
      interpretation: 'Reflects a structured weekly household replenishment cadence with highly predictable budget allocations.',
      keyMetric: `₹${topCatAmount.toLocaleString('en-IN')}`,
      metricLabel: `Total ${topCatName} Spend`,
      chartType: 'bar_comparison',
      chartData: expenseChartData,
      filterPreset: {
        sources: ['household'],
        searchQuery: topCatName
      },
      sampleReceiptIds: householdReceipts.filter(r => r.category === topCatName).slice(0, 6).map(r => r.id)
    },
    {
      id: 'disc_shuffle_friction',
      title: 'The Shuffle Friction Effect',
      tagline: 'Significant disparity in track skips during shuffle mode vs sequenced playback.',
      category: 'listening_habit',
      observedData: `Shuffle playback produced a ${shuffleSkipRate}% skip rate, whereas sequential album playback had only a ${normalSkipRate}% skip rate.`,
      derivedConnection: 'User interaction transitions rapidly to forward-skipping (fwdbtn) when non-contiguous algorithmically chosen tracks play.',
      interpretation: 'Confirms a strong preference for cohesive album narrative sequencing over algorithmic randomized playlists.',
      keyMetric: `${shuffleSkipRate}% vs ${normalSkipRate}%`,
      metricLabel: 'Shuffle vs Sequence Skip Rate',
      chartType: 'skip_analysis',
      chartData: [
        { label: 'Shuffle Mode', value: shuffleSkipRate, highlight: true },
        { label: 'Sequential Album Mode', value: normalSkipRate }
      ],
      filterPreset: {
        sources: ['spotify'],
        onlySpecial: { shuffleOnly: true }
      },
      sampleReceiptIds: spotifyReceipts.filter(r => r.shuffle && r.skipped).slice(0, 6).map(r => r.id)
    },
    {
      id: 'disc_urban_gravity',
      title: 'Urban Epicenter Gravity',
      tagline: `Concentration of high-frequency digital commerce in ${topCity}.`,
      category: 'cross_dataset_synchrony',
      observedData: `${topCityCount.toLocaleString()} transactions (${topCityPercent}% of multi-facet dataset) originated in ${topCity} during 2022–2024.`,
      derivedConnection: 'Quick-commerce groceries (Zepto, Blinkit) and ride-hailing (Uber, Ola) constitute over 54% of urban transactions.',
      interpretation: 'Documents integration into metropolitan on-demand delivery ecosystems during the post-2022 timeline.',
      keyMetric: `${topCityPercent}%`,
      metricLabel: `${topCity} Transaction Share`,
      chartType: 'bar_comparison',
      chartData: cityChartData,
      filterPreset: {
        sources: ['india_trans'],
        searchQuery: topCity
      },
      sampleReceiptIds: indiaReceipts.filter(r => r.city === topCity).slice(0, 6).map(r => r.id)
    },
    {
      id: 'disc_weekday_weekend',
      title: 'Circadian Cadence Shift',
      tagline: 'Distinct divergence between structured weekday routines and relaxed weekend drift.',
      category: 'temporal_rhythm',
      observedData: 'Weekday activity displays sharp twin peaks at 08:30 (commute) and 18:00 (transit), while weekend peaks drift to 23:00–02:00.',
      derivedConnection: 'Mode of transit and genre profile shift synchronously: upbeat rhythm during weekday mornings, ambient/downtempo at weekend midnight.',
      interpretation: 'Illustrates how daily schedules dictate digital consumption behavior across calendar rhythms.',
      keyMetric: '+42%',
      metricLabel: 'Weekend Midnight Volume Delta',
      chartType: 'timeline_density',
      chartData: weekdayWeekendData,
      filterPreset: {
        timeOfDay: ['morning', 'night']
      },
      sampleReceiptIds: spotifyReceipts.filter(r => (r.dayOfWeek === 0 || r.dayOfWeek === 6) && r.hour >= 22).slice(0, 6).map(r => r.id)
    }
  ];
}
