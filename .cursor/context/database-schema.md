# Database Schema (PostgreSQL)

## Transactions Table (Budget)
- `id`: uuid (PK)
- `type`: enum ('income', 'expense')
- `category`: string (e.g., 'Food', 'Salary')
- `amount`: decimal
- `date`: timestamp
- `notes`: text (optional)

## Investment_Transactions Table
- `id`: uuid (PK)
- `ticker`: string (e.g., 'AAPL', 'BTC')
- `type`: enum ('stock', 'etf', 'crypto')
- `action`: enum ('buy', 'sell')
- `units`: decimal
- `price_per_unit`: decimal
- `date`: timestamp

## Calculations (Logic)
- **Current Holding**: Sum of (Buy Units) - Sum of (Sell Units).
- **Average Buy Price**: (Total Invested Amount) / (Total Units Bought).