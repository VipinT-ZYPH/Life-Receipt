# LIFE//RECEIPT 

### Nothing happened in isolation.

**LIFE//RECEIPT** is an interactive digital-life archive built for the **WebRush — Your Life, In Receipts** challenge.

Instead of simply displaying thousands of digital records as a timeline, LIFE//RECEIPT transforms fragmented activity data into **discoverable patterns, relationships, and stories**.

The experience follows a simple idea:

> **Raw Data → Insights → Connections → Story**

Users can explore the archive, discover behavioral patterns, investigate connected moments, and navigate through meaningful chapters derived from the underlying data.


## What Makes It Different

A traditional timeline answers:

> **"What happened?"**

LIFE//RECEIPT tries to answer:

> **"What can we discover when these moments are viewed together?"**

The application combines data exploration with interactive storytelling so users can move from individual receipts to larger patterns.

For example:

```text
Individual Receipt
       ↓
Related Activity
       ↓
Recurring Pattern
       ↓
Discovery
       ↓
Life Chapter
```

Every discovery is grounded in the supplied dataset rather than being a fabricated narrative.


# Core Experiences

## 1. Life Overview

A high-level view of the digital archive.

It surfaces derived statistics such as:

* Total recorded moments
* Listening activity
* Unique artists and tracks
* Transaction activity
* Recorded time periods
* Major categories
* Behavioral patterns

The overview is designed to create curiosity and encourage exploration rather than functioning as a conventional analytics dashboard.


## 2. Life Constellation

The central interactive visualization.

Digital-life records are represented as nodes that can be explored and connected.

Connections are based on observable relationships such as:

* Temporal proximity
* Shared dates
* Recurring entities
* Categories
* Time-of-day patterns
* Period-based behavior
* Other measurable relationships in the dataset

Selecting a connection reveals **why the records are connected** and allows the user to explore the underlying evidence.

The goal is to make relationships between otherwise disconnected records visible.


## 3. Discoveries

LIFE//RECEIPT derives patterns from the datasets and presents them as interactive discoveries.

Examples include:

* Most frequently played artists
* Most frequently played tracks
* Listening patterns by time of day
* Late-night activity
* Weekday vs weekend behavior
* Monthly activity patterns
* Spending categories
* Recurring merchants
* Spending trends
* Activity spikes
* Changes in behavior over time

Each discovery links back to the underlying records so users can investigate the evidence behind the insight.


## 4. Life Chapters

Instead of presenting the data as a simple:

```text
2013 → 2014 → 2015 → 2016 → ...
```

the application identifies meaningful periods based on changes and patterns in the data.

A chapter may represent:

* A major change in activity
* A change in listening behavior
* A new recurring pattern
* An unusual activity period
* A shift in transaction behavior
* A significant concentration of activity

Each chapter contains supporting statistics and representative receipts.

The intention is to turn data into an interactive narrative without inventing unsupported personal events.


## 5. Receipt Explorer

A searchable archive for exploring the underlying records.

Users can:

* Search receipts
* Filter by category
* Filter by date
* Sort records
* Explore individual receipts
* View related records
* Navigate from discoveries back to the original data

This provides direct access to the evidence behind the higher-level storytelling experience.


# Datasets

The project works with three supplied datasets.

### Spotify History

Approximately **150,000 listening records** containing information such as:

* Track
* Artist
* Album
* Timestamp
* Platform
* Listening duration
* Shuffle state
* Skip state
* Playback context

The dataset spans approximately **2013–2024**.


### Daily Household Transactions

Approximately **2,400 transaction records** containing:

* Date
* Mode
* Category
* Subcategory
* Note
* Amount
* Income/Expense
* Currency

The dataset spans approximately **2015–2018**.

### India Transactions

Approximately **10,000 transaction records** containing information including:

* Transaction date/time
* Merchant
* Category
* Amount
* City
* State
* Geographic coordinates
* Customer information
* Transaction attributes

The dataset spans approximately **2022–2024**.


# Data Relationship Model

The datasets do not contain a guaranteed common identifier connecting every record across all three sources.

Therefore, the application does **not** falsely assume that every record belongs to one continuously identifiable individual.

Instead, relationships are derived from observable characteristics such as:

```text
Timestamp
   ↓
Date proximity
   ↓
Recurring behavior
   ↓
Category/entity relationships
   ↓
Statistical patterns
   ↓
Discoveries
```

The interface distinguishes between:

### Observed Data

Information directly present in the dataset.

### Derived Connection

A relationship calculated from measurable attributes.

### Interpretation

A human-readable explanation of what the observed pattern may indicate.

This approach keeps the storytelling grounded in the available evidence.


# From Data to Story

The core architecture follows:

```text
                RAW RECEIPTS
                     │
                     ▼
             DATA PROCESSING
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Patterns   Entities   Time Series
          │          │          │
          └──────────┼──────────┘
                     ▼
                CONNECTIONS
                     │
                     ▼
                DISCOVERIES
                     │
                     ▼
                LIFE CHAPTERS
                     │
                     ▼
                  STORY
```

This allows users to move between different levels of abstraction without losing access to the original evidence.


# Performance

The datasets contain a large number of records, particularly the Spotify history.

The application therefore avoids rendering the entire dataset directly into the DOM.

Performance considerations include:

* Precomputed derived statistics
* Efficient filtering
* Memoized calculations
* Aggregated visualizations
* Selective rendering
* Lightweight dependencies
* Avoiding unnecessary React re-renders
* Rendering only the records relevant to the current view

The goal is to keep exploration responsive even when working with large datasets.


# Responsive Design

The application is designed for:

* Mobile
* Tablet
* Laptop
* Desktop
* Large displays

Complex visualizations have responsive alternatives so that the core discovery experience remains usable on smaller screens.

The interface avoids:

* Horizontal overflow
* Clipped content
* Overlapping controls
* Unusable mobile forms


# Accessibility

Accessibility is treated as part of the core product experience.

The application uses:

* Semantic HTML
* Logical heading hierarchy
* Accessible buttons and controls
* Keyboard navigation
* Visible focus states
* Accessible forms
* Appropriate ARIA attributes
* Sufficient contrast
* Reduced-motion considerations

Important information and functionality are not dependent solely on hover interactions.


# Technology Stack

* **Next.js 15 (App Router)**
* **React 19**
* **TypeScript**
* **Tailwind CSS v4**
* **Lucide React Icons**
* **PapaParse** (Client-side CSV ingestion)
* **Frontend-Only Data Pipeline** (Client-side indexing & memory state)

No backend server or API keys required.


# Architecture

The codebase strictly enforces separation of concerns across a 5-layer pipeline:

```text
RAW DATA  ──►  NORMALIZATION / INDEXING  ──►  ANALYTICS  ──►  CONNECTIONS  ──►  PRESENTATION / UI
```

Project Directory Layout:

```text
Life-Receipt/
├── app/
│   ├── layout.tsx         # Root HTML/Font Layout
│   ├── page.tsx           # Primary App Container & State Manager
│   └── globals.css        # Core Design Tokens & Glassmorphism Utility
│
├── components/
│   ├── layout/            # Navigation Header & Status Footers
│   ├── views/             # Core Experiences (Overview, Constellation, Discoveries, Chapters, Explorer)
│   ├── receipt/           # Thermal Receipt Cards & Detail Slips
│   └── modals/            # Story Thread, Data Integrity, & CSV Upload Modals
│
├── lib/
│   ├── data/
│   │   ├── dataset-loader.ts    # Dataset Fetching & In-Browser CSV Parsing
│   │   ├── data-indexer.ts     # Precomputed O(1) Map/Set Lookup Indices
│   │   ├── data-analyzer.ts    # Overview Stats, Constellation Links & Story Threads
│   │   ├── preset-discoveries.ts# Empirical Insight Detections
│   │   └── preset-chapters.ts   # Behavioral Life Chapter Eras
│   ├── types.ts           # Strictly-typed Data Models & Filters
│   └── utils.ts           # Classnames & Helper Utilities
```

The architecture separates:

**Raw Data → Indexing → State → Feature Components → Presentation**

keeping calculations out of render passes and ensuring maximum performance.



# Example Discovery Flow

A typical user journey looks like:

```text
Open LIFE//RECEIPT
        ↓
See Life Overview
        ↓
Discover an unusual pattern
        ↓
Open the Discovery
        ↓
View supporting visualization
        ↓
Inspect underlying receipts
        ↓
Explore connected records
        ↓
Enter the relevant Life Chapter
        ↓
Understand the larger pattern
```

The user is therefore encouraged to investigate rather than simply consume a static dashboard.



# Data Integrity

LIFE//RECEIPT does not intentionally fabricate personal events, relationships, or emotional states.

Where a conclusion is derived rather than directly recorded, the application presents it as a pattern or interpretation and provides access to the supporting records.

This is important because the purpose of the project is to **discover meaning from data**, not manufacture a fictional narrative.


# Running Locally

Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local development URL shown by Vite.


# Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```



# Deployment

The project is designed to be deployable as a static frontend application.

Compatible hosting platforms include:

* Vercel
* Netlify
* GitHub Pages
* Cloudflare Pages
* Other static frontend hosting platforms



# Design Philosophy

LIFE//RECEIPT is built around one principle:

> **A receipt is just a fragment. A collection of receipts becomes a pattern. A pattern can become a story.**

The application doesn't attempt to tell users what their life means.

It gives them the tools to **explore the evidence, connect the fragments, and discover the story themselves.**



# Built For

**WebRush — Advanced Track**

### Your Life, In Receipts 

**One Dataset. Hundreds of Moments. Infinite Stories.**

Built as a frontend-only interactive data storytelling experience.
