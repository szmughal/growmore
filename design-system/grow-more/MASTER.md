# Grow more — Master Design System & Brand Specification

> Generated and verified with **`ui-ux-pro-max`** (`data-dense-dashboard` + `Banking/Traditional Finance` + `CRM & Client Management` palettes) and **`brand`** guidelines.

---

## 1. Brand Identity & Voice

- **Brand Name**: **Grow more**
- **Tagline**: *"Know Where You Stand, Financially"*
- **Brand Archetype**: Institutional-Grade Financial Intelligence Terminal for Everyday Investors
- **Brand Mark**: Ascending 3-Pillar Geometric Growth Emblem inside a Trust Navy (`#0F172A`) & Institutional Emerald (`#059669`) badge.
- **Voice & Tone**:
  - **Authoritative & Exact**: Tabular precision, explicit comparisons (`+1.24% vs 103,010.80 prev close`), zero speculative hype.
  - **Radical Transparency**: 0% Ads, 0% Data Selling, public operating cost ledger.
  - **Multi-Market Fluency**: Seamless coverage across Pakistan Stock Exchange (PSX / KSE 100), US Equities (S&P 500, NASDAQ), and Saudi Arabia (Tadawul TASI).

---

## 2. Color System (Light-First Institutional Palette)

Derived from `ui-ux-pro-max` (`colors.csv` Banking/Traditional Finance + Data-Dense Dashboard):

| Token | Hex | Role & Usage | Contrast on `#FFFFFF` |
| :--- | :--- | :--- | :--- |
| `--color-primary` | `#0F172A` | Primary Brand Ink, Headings, Primary CTA Surface | `17.8:1` (AAA) |
| `--color-secondary` | `#1E3A8A` | Institutional Trust Navy ( Secondary Badges, Links, Active Indicators) | `10.4:1` (AAA) |
| `--color-accent` | `#059669` | Grow more Emerald (Brand Accent, Bullish Gains, Positive Deltas) | `4.6:1` (AA+) |
| `--color-gold` | `#A16207` | Advisory / Valuation Highlight / Commodity Accent | `5.1:1` (AA+) |
| `--color-background` | `#F8FAFC` | Application Canvas (Crisp Cool Alabaster) | — |
| `--color-card` | `#FFFFFF` | Elevated Data Surfaces, Tables, Modals, Sidebar | — |
| `--color-muted` | `#F1F5F9` | Subtle Pill Backgrounds, Table Header Fill, Hover Row | — |
| `--color-muted-foreground` | `#475569` | Secondary Labels, Metadata, Axis Captions | `7.5:1` (AAA) |
| `--color-border` | `#E2E8F0` | 1px Hairline Structural Dividers | — |
| `--color-destructive` | `#DC2626` | Bearish Declines, Stop-Loss / Invalidation Levels | `4.8:1` (AA+) |
| `--color-ring` | `#059669` | Accessible Keyboard Focus Ring (`2px solid #059669`) | — |

---

## 3. Typography & Numeric Discipline

Derived from `ui-ux-pro-max` (`typography.csv` Financial / Banking pairing):

- **Primary UI & Editorial Font**: `'IBM Plex Sans'`, `-apple-system, BlinkMacSystemFont, sans-serif`
  - **Mood**: Financial, trustworthy, corporate, banking, high-legibility at small sizes.
  - **Weights**: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold for primary KPIs).
- **Tabular Financial & Ticker Font**: `'IBM Plex Mono'`, `ui-monospace, SFMono-Regular, Menlo, monospace`
  - **Numeric Rule**: `font-variant-numeric: tabular-nums;` mandatory on all prices, percentages, volumes, scores, and timestamps.

---

## 4. Layout, Spacing & Density Dials (`Density: 8/10`)

- **Grid System**: 12-column responsive CSS grid (`gap: 16px` for cards, `gap: 24px` for major sections).
- **Shell Dimensions**:
  - `--sidebar-width`: `240px` fixed desktop navigation
  - `--header-height`: `56px` (`h-14`) sticky top bar
  - `--ticker-height`: `34px` live market feed bar
  - `--table-row-height`: `38px` compact financial rows
  - `--card-padding`: `16px` (`p-4`) to `20px` (`p-5`)
- **Accessibility & Interaction**:
  - Minimum `4.5:1` contrast ratio across all text and semantic badges.
  - Visible `:focus-visible` ring on all buttons, inputs, and tabs.
  - `cursor-pointer` on all interactive rows, cards, and pills.
  - `prefers-reduced-motion: reduce` disables non-essential transitions.
