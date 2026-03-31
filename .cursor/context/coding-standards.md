# Coding Standards & Best Practices

## General Rules
- Use **Functional Components** and **Arrow Functions**.
- Favor **Server Components** for data fetching; **Client Components** only for interactivity.
- Use **TypeScript** strictly (avoid `any` and avoid `unknown`).

## UI/UX
- Use **Mobile-first design**.
- Maintain a clean, "Fintech" aesthetic (lots of white space, subtle borders, high contrast for numbers).
- Use `shadcn/ui` components for buttons, inputs, and modals.

## Data Handling
- Use **Zod** for form validation.
- All financial calculations (P&L, Average Price) should be in a dedicated `/lib/financeutils.ts` file to ensure accuracy and testability.