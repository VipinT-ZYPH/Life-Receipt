import os
import json
import pandas as pd
import numpy as np

os.makedirs('public/data', exist_ok=True)

# 1. Process Spotify Dataset
print("Processing Spotify dataset...")
sp = pd.read_csv('Dataset/archive/spotify_history.csv')

# Convert timestamp
sp_dt = pd.to_datetime(sp['ts'], utc=True, errors='coerce')
valid_sp = sp_dt.notna()
sp = sp[valid_sp].copy()
sp_dt = sp_dt[valid_sp]

sp['id'] = 'sp_' + sp.index.astype(str)
sp['source'] = 'spotify'
sp['timestamp'] = sp_dt.dt.strftime('%Y-%m-%dT%H:%M:%SZ')
sp['dateStr'] = sp_dt.dt.strftime('%Y-%m-%d')
sp['timeStr'] = sp_dt.dt.strftime('%H:%M')
sp['hour'] = sp_dt.dt.hour
sp['dayOfWeek'] = sp_dt.dt.dayofweek
sp['year'] = sp_dt.dt.year
sp['month'] = sp_dt.dt.month

sp['track_name'] = sp['track_name'].fillna('Unknown Track')
sp['artist_name'] = sp['artist_name'].fillna('Unknown Artist')
sp['album_name'] = sp['album_name'].fillna('Unknown Album')
sp['primaryTitle'] = sp['track_name']
sp['secondaryTitle'] = sp['artist_name']

GENRE_MAP = {
    'The Beatles': 'Classic Rock / Pop',
    'The Killers': 'Indie Rock / Alternative',
    'John Mayer': 'Blues Rock / Pop',
    'Bob Dylan': 'Folk Rock / Singer-Songwriter',
    'Paul McCartney': 'Classic Rock',
    'Coldplay': 'Alternative Pop / Rock',
    'Taylor Swift': 'Pop / Country',
    'Radiohead': 'Art Rock / Electronic',
    'Pink Floyd': 'Progressive Rock',
    'Eminem': 'Hip Hop',
    'Oasis': 'Britpop',
    'Red Hot Chili Peppers': 'Funk Rock',
    'Arctic Monkeys': 'Indie Rock',
    'Foo Fighters': 'Hard Rock',
    'Fleetwood Mac': 'Soft Rock',
    'Led Zeppelin': 'Hard Rock / Blues',
    'U2': 'Rock',
    'Bruce Springsteen': 'Heartland Rock',
    'Queen': 'Arena Rock',
    'Ed Sheeran': 'Acoustic Pop'
}

sp['category'] = sp['artist_name'].map(GENRE_MAP).fillna('Audio Track')
sp['spotify_track_uri'] = sp['spotify_track_uri'].fillna('')
sp['platform'] = sp['platform'].fillna('Desktop/Mobile')
ms = sp['ms_played'].fillna(0).astype(int)
sp['ms_played'] = ms
sp['durationFormatted'] = (ms // 60000).astype(str) + ':' + ((ms % 60000) // 1000).astype(str).str.zfill(2)
sp['reason_start'] = sp['reason_start'].fillna('clickrow')
sp['reason_end'] = sp['reason_end'].fillna('trackdone')
sp['shuffle'] = sp['shuffle'].fillna(False).astype(bool)
sp['skipped'] = sp['skipped'].fillna(False).astype(bool)

spotify_cols = [
    'id', 'source', 'timestamp', 'dateStr', 'timeStr', 'hour', 'dayOfWeek', 'year', 'month',
    'primaryTitle', 'secondaryTitle', 'category', 'spotify_track_uri', 'platform', 'ms_played',
    'durationFormatted', 'track_name', 'artist_name', 'album_name', 'reason_start', 'reason_end',
    'shuffle', 'skipped'
]
spotify_records = sp[spotify_cols].to_dict(orient='records')
print(f"Spotify items processed: {len(spotify_records)}")

with open('public/data/spotify.json', 'w', encoding='utf-8') as f:
    json.dump(spotify_records, f, separators=(',', ':'))

# 2. Process Household Dataset
print("Processing Household dataset...")
hh = pd.read_csv('Dataset/archive (1)/Daily Household Transactions.csv')
hh_dt = pd.to_datetime(hh['Date'], dayfirst=True, errors='coerce').fillna(pd.to_datetime('2016-01-01'))

hh['id'] = 'hh_' + hh.index.astype(str)
hh['source'] = 'household'
hh['timestamp'] = hh_dt.dt.strftime('%Y-%m-%dT%H:%M:%SZ')
hh['dateStr'] = hh_dt.dt.strftime('%Y-%m-%d')
hh['timeStr'] = hh_dt.dt.strftime('%H:%M')
hh['hour'] = hh_dt.dt.hour
hh['dayOfWeek'] = hh_dt.dt.dayofweek
hh['year'] = hh_dt.dt.year
hh['month'] = hh_dt.dt.month

hh['category'] = hh['Category'].fillna('General')
hh['subcategory'] = hh['Subcategory'].fillna('')
hh['note'] = hh['Note'].fillna('')
hh['mode'] = hh['Mode'].fillna('Cash')

hh['primaryTitle'] = np.where(hh['subcategory'] != '', hh['category'] + ' — ' + hh['subcategory'], hh['category'])
hh['secondaryTitle'] = np.where(hh['note'] != '', hh['note'], hh['mode'])

amt = hh['Amount'].fillna(0.0).astype(float)
hh['rawAmount'] = amt
hh['amount'] = amt
inc_exp_raw = hh['Income/Expense'].fillna('Expense').astype(str).str.lower()
hh['income_expense'] = np.where(inc_exp_raw.str.contains('income'), 'Income', 'Expense')
hh['currency'] = hh['Currency'].fillna('INR')

hh['amountFormatted'] = np.where(
    hh['income_expense'] == 'Income',
    '+₹' + amt.apply(lambda x: f"{x:,.2f}"),
    '-₹' + amt.apply(lambda x: f"{x:,.2f}")
)

hh_cols = [
    'id', 'source', 'timestamp', 'dateStr', 'timeStr', 'hour', 'dayOfWeek', 'year', 'month',
    'primaryTitle', 'secondaryTitle', 'category', 'amountFormatted', 'rawAmount', 'mode',
    'subcategory', 'note', 'amount', 'income_expense', 'currency'
]
household_records = hh[hh_cols].to_dict(orient='records')
print(f"Household items processed: {len(household_records)}")

with open('public/data/household.json', 'w', encoding='utf-8') as f:
    json.dump(household_records, f, separators=(',', ':'))

# 3. Process India Multi-Facet Transactions
print("Processing India Transactions dataset...")
in_df = pd.read_csv('Dataset/archive (2)/Augmented_IndiaTransactMultiFacet2024.csv')
in_dt = pd.to_datetime(in_df['trans_date_trans_time'], errors='coerce').fillna(pd.to_datetime('2023-01-01'))

in_df['id'] = 'in_' + in_df.index.astype(str)
in_df['source'] = 'india_trans'
in_df['timestamp'] = in_dt.dt.strftime('%Y-%m-%dT%H:%M:%SZ')
in_df['dateStr'] = in_dt.dt.strftime('%Y-%m-%d')
in_df['timeStr'] = in_dt.dt.strftime('%H:%M')
in_df['hour'] = in_dt.dt.hour
in_df['dayOfWeek'] = in_dt.dt.dayofweek
in_df['year'] = in_dt.dt.year
in_df['month'] = in_dt.dt.month

merchant = in_df['merchant'].fillna('Unknown Merchant').astype(str)
in_df['merchant'] = merchant
category = in_df['category'].fillna('Retail').astype(str)
in_df['category'] = category
city = in_df['city'].fillna('India').astype(str)
in_df['city'] = city

is_fraud_col = (in_df['is_fraud'] == 1.0) | (merchant.str.startswith('fraud_'))
in_df['is_fraud'] = is_fraud_col.astype(bool)

in_df['primaryTitle'] = np.where(in_df['is_fraud'], '⚠️ ' + merchant, merchant)
cat_formatted = category.str.replace('_', ' ').str.title()
in_df['secondaryTitle'] = cat_formatted + ' • ' + city

amt = in_df['amt'].fillna(0.0).astype(float)
in_df['rawAmount'] = amt
in_df['amt'] = amt
in_df['amountFormatted'] = '-₹' + amt.apply(lambda x: f"{x:,.2f}")

in_df['trans_id'] = in_df['trans_id'].fillna('TXN_UNK').astype(str)
in_df['first'] = in_df['first'].fillna('').astype(str)
in_df['last'] = in_df['last'].fillna('').astype(str)
in_df['gender'] = in_df['gender'].fillna('U').astype(str)
in_df['state'] = in_df['state'].fillna('').astype(str)
in_df['lat'] = in_df['lat'].fillna(12.97).astype(float)
in_df['long'] = in_df['long'].fillna(77.59).astype(float)
in_df['job'] = in_df['job'].fillna('Professional').astype(str)
in_df['dob'] = in_df['dob'].fillna('1990-01-01').astype(str)
in_df['merch_lat'] = in_df['merch_lat'].fillna(12.97).astype(float)
in_df['merch_long'] = in_df['merch_long'].fillna(77.59).astype(float)
in_df['customer_id'] = in_df['customer_id'].fillna('').astype(str)

india_cols = [
    'id', 'source', 'timestamp', 'dateStr', 'timeStr', 'hour', 'dayOfWeek', 'year', 'month',
    'primaryTitle', 'secondaryTitle', 'category', 'amountFormatted', 'rawAmount', 'trans_id',
    'merchant', 'amt', 'first', 'last', 'gender', 'city', 'state', 'lat', 'long', 'job',
    'dob', 'merch_lat', 'merch_long', 'is_fraud', 'customer_id'
]
india_records = in_df[india_cols].to_dict(orient='records')
print(f"India items processed: {len(india_records)}")

with open('public/data/india_trans.json', 'w', encoding='utf-8') as f:
    json.dump(india_records, f, separators=(',', ':'))

print("All datasets processed successfully!")
