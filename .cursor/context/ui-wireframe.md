# UI & Layout Architecture

## 📱 Global Layout (Responsive)
- **Desktop**: Top Navigation Bar with persistent links.
- **Mobile**: Bottom Navigation or Collapsible Sidebar for easy thumb access.
- **Theme**: Light/Dark mode support (default to clean light "Fintech" white).

## 🏠 Dashboard - Budget Tab (Primary)
### 1. Header Actions
- **Button**: "Add Transaction" (Primary Action, opens Modal).
### 2. Summary Widgets (Row)
- **Cards**: Total Income, Total Expenses, Net Savings (Amount + Percentage of income).
### 3. Visualizations
- **Pie Chart**: Expenses grouped by Category (Food, Rent, etc.).
- **Trend Line**: (Optional) 6-month Income vs Expense comparison.
### 4. Data View
- **Table**: Recent Transactions (Date, Category, Amount with +/- coloring).

## 💰 Dashboard - Investments Tab
### 1. Header Actions
- **Button**: "Add Investment" (Primary Action, opens Modal).
### 2. Portfolio Overview
- **Metric Cards**: Total Invested, Current Value, Total P&L (with green/red indicators).
### 3. Allocation Chart
- **Pie Chart**: Breakdown by Asset Type (Stock vs ETF vs Crypto).
### 4. Holdings Gallery
- **Grid/Cards**: Each asset (e.g., AAPL) shows: 
  - Ticker, Units, Avg Price, and a "Manual Price Update" button.
### 5. History
- **Table**: List of Buy/Sell actions with timestamps.

## 🛠 Component Rules
- **Modals**: All "Add" forms must be accessible via centered Modals (`shadcn/dialog`).
- **Charts**: Use `recharts`. Ensure they are responsive (`ResponsiveContainer`).
- **Tables**: Use `lucide-react` icons for categories (e.g., 🍔 for Food, 🏠 for Rent).