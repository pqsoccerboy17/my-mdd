---
sidebar_position: 5
title: CC Tracker
sidebar_label: CC Tracker
---

# CC Tracker

The CC Tracker is a credit card rewards management tool built into MDD HQ. It helps optimize which credit card to use for different spending categories based on reward structures.

Route: `/tools/cc-tracker`

## Overview

Managing multiple credit cards with different reward structures is a common optimization problem. The CC Tracker provides:

- **Card registry** - All credit cards with their reward categories and rates
- **Category recommendations** - Which card to use for each spending category
- **Usage monitoring** - Track spending against card-specific thresholds or annual fee justification
- **Reward comparison** - Side-by-side comparison of reward rates across cards

## How It Works

### Card Profiles

Each credit card in the tracker has a profile containing:

| Field | Description |
|---|---|
| Card name | Name of the credit card |
| Issuer | Card issuer (Chase, Amex, etc.) |
| Annual fee | Annual fee amount (0 for no-fee cards) |
| Reward categories | List of spending categories with reward rates |
| Base rate | Default reward rate for non-category spending |
| Sign-up bonus | Active sign-up bonus details and progress |
| Notes | Free-form notes about the card |

### Category Optimization

The tracker maps spending categories to the highest-reward card:

| Category | Example Cards | Decision Logic |
|---|---|---|
| Dining | Card with highest dining multiplier | Compare dining rates across all cards |
| Travel | Card with highest travel multiplier | Compare travel rates, consider portal vs. direct |
| Groceries | Card with highest grocery multiplier | Compare grocery rates, check caps |
| Gas | Card with highest gas multiplier | Compare gas rates |
| Online Shopping | Card with highest online rate | Compare online shopping rates |
| General | Highest flat-rate card | Best base rate for uncategorized spending |

### Usage Tracking

For cards with annual fees, the tracker monitors whether enough rewards have been earned to justify the fee. This includes:

- Total rewards earned year-to-date
- Annual fee break-even threshold
- Projected annual rewards based on spending patterns
- Recommendation to keep or cancel before the next fee cycle

## Data Storage

### Supabase Table

The CC Tracker uses the `cc_tracker` table in Supabase:

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `card_name` | text | Name of the credit card |
| `issuer` | text | Card issuer |
| `annual_fee` | numeric | Annual fee amount |
| `categories` | jsonb | Reward categories and rates |
| `base_rate` | numeric | Default reward percentage |
| `notes` | text | Free-form notes |
| `created_at` | timestamp | When the card was added |
| `updated_at` | timestamp | Last modification time |

### localStorage Persistence

Card data is also cached in localStorage for offline access. The sync pattern follows the same approach as the rest of MDD HQ:

1. Read from localStorage for instant rendering
2. Fetch latest from Supabase in the background
3. Update localStorage if Supabase has newer data
4. Write changes to both localStorage and Supabase

This ensures the CC Tracker loads instantly even when offline and syncs when connectivity is available.

## UI Components

### Card List

The main view shows all tracked cards in a list or grid layout. Each card displays:

- Card name and issuer
- Top reward categories with rates
- Annual fee (highlighted in red if not yet justified)
- Quick actions (edit, delete)

### Category Lookup

A search interface where you type a spending category and the tracker shows which card to use for the best reward rate. This is the primary decision-support feature.

### Card Detail

Clicking a card opens a detail view with:

- Full reward category breakdown
- Usage statistics
- Annual fee justification analysis
- Notes and reminders

## Workflow

A typical CC Tracker workflow:

1. **Add cards** - Enter all credit cards with their reward structures
2. **Check before spending** - Use the category lookup to find the optimal card
3. **Monitor usage** - Review usage tracking to ensure annual fees are justified
4. **Update as needed** - Modify card profiles when reward structures change
5. **Cancel decisions** - Use the fee justification data to decide which cards to keep

:::tip
The CC Tracker is most useful during the first few months after getting a new card with a sign-up bonus spend requirement. Use the usage monitoring to track progress toward the bonus threshold.
:::

## Related Pages

- [Platform Features](./platform) - Other MDD HQ tools
- [Schema Overview](../data/overview) - Full database schema
