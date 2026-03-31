import { TransactionFormValues } from "@/components/forms/add-transaction-form";
import { InvestmentFormValues } from "@/components/forms/add-investment-form";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function createTransaction(data: TransactionFormValues) {
  const response = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      date: data.date.toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create transaction");
  }

  return response.json();
}

export async function getTransactions() {
  const response = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}

export async function createInvestment(data: InvestmentFormValues) {
  const response = await fetch(`${API_BASE_URL}/api/investments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      date: data.date.toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create investment");
  }

  return response.json();
}

export async function getInvestments() {
  const response = await fetch(`${API_BASE_URL}/api/investments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch investments");
  }

  return response.json();
}

