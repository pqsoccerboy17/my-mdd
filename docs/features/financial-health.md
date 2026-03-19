---
sidebar_position: 4
title: Financial Health
sidebar_label: Financial Health
---

# Financial Health

The Financial Health dashboard provides personal finance visibility directly within MDD HQ. It tracks net worth, cash flow, and account balances powered by data from Monarch Money.

Route: `/financial-health`

## Overview

The financial health module gives a consolidated view of personal finances without needing to open a separate financial app. It displays:

- **Net worth** - Total assets minus liabilities over time
- **Cash flow** - Income vs. expenses by month
- **Account balances** - Current balances across all linked accounts
- **Trends** - Historical charts showing financial trajectory

:::warning
The Financial Health feature is controlled by the `PERSONAL_FINANCE` feature flag, which defaults to **OFF**. This is a security-sensitive flag because financial data requires additional privacy protection.
:::

## Privacy Gate

The financial health dashboard includes a **privacy gate** that requires explicit user action before displaying any financial data. This prevents accidental exposure during screen sharing or over-the-shoulder viewing.

When you navigate to `/financial-health`:

1. The privacy gate is displayed with a "Show Financial Data" button
2. No financial data is loaded or rendered until the gate is dismissed
3. The gate resets on page refresh or navigation away
4. The `FinancialDataProvider` context manages the gate state

This is a deliberate design choice -- financial data should never appear unexpectedly.

## Data Source: Monarch Money

[Monarch Money](https://www.monarchmoney.com/) is the external financial aggregation service that connects to bank accounts, credit cards, and investment accounts. MDD does not connect to financial institutions directly -- it reads aggregated data from Monarch.

### Sync Process

Financial data sync uses a **local script** rather than a serverless function. This is because Monarch Money authentication requires email/password credentials that should not be stored in Vercel environment variables.

The sync script (`sync-monarch`) runs locally and:

1. Authenticates with Monarch Money using `MONARCH_EMAIL` and `MONARCH_PASSWORD` environment variables
2. Fetches account balances, transactions, and net worth history
3. Writes snapshot data to the `financial_snapshots` table in Supabase
4. Each snapshot includes a timestamp, account breakdown, and computed aggregates

:::note
The `MONARCH_EMAIL` and `MONARCH_PASSWORD` variables are only set in the local development environment, never in Vercel. Financial sync is a manual, local-only operation.
:::

### Sync Frequency

Financial data is synced manually by running the local sync script. There is no automated cron for financial sync -- this is intentional to keep financial credentials off the server.

```bash
# Run the Monarch Money sync locally
node scripts/sync-monarch.js
```

## FinancialDataProvider

The `FinancialDataProvider` React context manages financial data state:

| Property | Type | Description |
|---|---|---|
| `isGateOpen` | boolean | Whether the privacy gate is active |
| `dismissGate()` | function | Dismiss the privacy gate and load data |
| `snapshots` | array | Financial snapshot history |
| `latestSnapshot` | object | Most recent financial snapshot |
| `isLoading` | boolean | Whether data is being fetched |
| `error` | string or null | Error state |

The provider fetches data from Supabase only after the privacy gate is dismissed. This means no financial queries are made until the user explicitly requests to see the data.

## Static JSON Fallback

If no financial snapshots exist in Supabase (e.g., fresh deployment or Monarch sync has not run), the financial health dashboard falls back to a static JSON file with sample data. This ensures the UI renders correctly even without live data.

The fallback data structure matches the `financial_snapshots` table schema so all chart and display components work identically with real or fallback data.

## Dashboard Components

### Net Worth Chart

A time-series line chart showing total net worth over time. Assets and liabilities are shown as separate series with net worth as the difference. The chart uses recharts for rendering.

### Cash Flow Summary

Monthly cash flow displayed as a bar chart comparing income (inflows) and expenses (outflows). The net cash flow (income minus expenses) is highlighted.

### Account Balances

A table showing current balances for each linked account, grouped by type:

| Account Type | Examples |
|---|---|
| Checking | Primary checking accounts |
| Savings | Savings and money market accounts |
| Investment | Brokerage, 401k, IRA accounts |
| Credit Card | Credit card balances (liabilities) |
| Loan | Mortgages, auto loans, student loans |

### Trend Indicators

Key metrics display trend arrows and percentage changes compared to the previous period:

- Net worth change (month over month)
- Savings rate trend
- Expense category changes

## Database Table

Financial data is stored in the `financial_snapshots` table:

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `snapshot_date` | timestamp | When the snapshot was taken |
| `accounts` | jsonb | Account balances by type |
| `net_worth` | numeric | Computed net worth |
| `cash_flow` | jsonb | Income and expense breakdown |
| `created_at` | timestamp | Record creation time |

## Related Pages

- [Environment Variables](../config/environment) - Monarch Money credentials
- [Feature Flags](../config/feature-flags) - PERSONAL_FINANCE flag
- [Schema Overview](../data/overview) - Full database schema
