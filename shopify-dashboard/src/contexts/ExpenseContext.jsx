import React, { createContext, useContext } from "react";
import { useQuickBooksExpenses } from "@/hooks/useQuickBooksExpenses";

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const {
    data: expenseRecords = [],
    isLoading,
    error,
    refetch,
  } = useQuickBooksExpenses();

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
