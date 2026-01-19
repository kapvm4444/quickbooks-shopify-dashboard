import React, { createContext, useContext } from "react";
import { useCombinedExpenses } from "@/hooks/useCombinedExpenses";

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const {
    expenseRecords,
    isLoading,
    error,
    refetch,
  } = useCombinedExpenses();

  const value = {
    expenseRecords,
    isLoading,
    error,
    refetch,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
}
