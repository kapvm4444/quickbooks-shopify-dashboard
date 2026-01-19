
import React, { createContext, useContext } from "react";
import { useCombinedRevenue } from "@/hooks/useCombinedRevenue";

const RevenueContext = createContext();

export function RevenueProvider({ children }) {
  const {
    revenueRecords,
    isLoading,
    error,
    refetch,
  } = useCombinedRevenue();

  const value = {
    revenueRecords,
    isLoading,
    error,
    refetch,
  };

  return (
    <RevenueContext.Provider value={value}>{children}</RevenueContext.Provider>
  );
}

export function useRevenue() {
  const context = useContext(RevenueContext);
  if (context === undefined) {
    throw new Error("useRevenue must be used within a RevenueProvider");
  }
  return context;
}
