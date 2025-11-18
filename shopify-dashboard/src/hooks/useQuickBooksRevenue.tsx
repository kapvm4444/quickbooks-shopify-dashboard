import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

// Base URL for your backend API
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Custom error type for QuickBooks authentication
interface QuickBooksAuthError extends Error {
  isQuickBooksAuth: boolean;
}

// Transform QuickBooks SalesReceipt data to match the UI structure
const transformSalesReceiptToRevenueRecord = (salesReceipt: any) => {
  const records: any[] = [];

  // Process each line item from the sales receipt
  salesReceipt.Line?.forEach((line: any) => {
    if (line.SalesItemLineDetail && line.Amount > 0) {
      const accountRef = line.SalesItemLineDetail.ItemAccountRef;

      records.push({
        id: `${salesReceipt.Id}-${line.Id}`,
        transaction_date: salesReceipt.TxnDate,
        description: line.Description || "Sales Transaction",
        amount: line.Amount,
        category: "Sales",
        chart_account_name: accountRef?.name || "Revenue",
        chart_account_code: accountRef?.value || "4000",
      });
    }
  });

  // If no line items with details, create one record for the total
  if (records.length === 0 && salesReceipt.TotalAmt > 0) {
    records.push({
      id: salesReceipt.Id,
      transaction_date: salesReceipt.TxnDate,
      description: "Sales Receipt",
      amount: salesReceipt.TotalAmt,
      category: "Sales",
      chart_account_name: "Sales Revenue",
      chart_account_code: "4000",
    });
  }

  return records;
};

// Fetch revenue data from your backend
const fetchRevenueData = async () => {
  const response = await fetch(`${BASE_URL}/api/salesreceipts`);

  // Check for QuickBooks connection issues (401 = Not connected)
  if (response.status === 401) {
    const error = new Error("QuickBooks not connected") as QuickBooksAuthError;
    error.isQuickBooksAuth = true;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch revenue data: ${response.statusText}`);
  }

  const salesReceipts = await response.json();

  // Handle empty response
  if (
    !salesReceipts ||
    !Array.isArray(salesReceipts) ||
    salesReceipts.length === 0
  ) {
    return [];
  }

  // Transform the QuickBooks data to match UI structure
  const transformedRecords: any[] = [];

  salesReceipts.forEach((receipt: any) => {
    const records = transformSalesReceiptToRevenueRecord(receipt);
    transformedRecords.push(...records);
  });

  return transformedRecords;
};

export function useQuickBooksRevenue() {
  const { toast } = useToast();
  const toastShownRef = useRef(false);

  const query = useQuery({
    queryKey: ["quickbooks-revenue"],
    queryFn: fetchRevenueData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry on 401 errors
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Only fetch once
  });

  // Handle ?connected=true redirect from QuickBooks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      console.log("✅ Detected QuickBooks redirect, refetching revenue...");
      // Remove the query parameter
      window.history.replaceState({}, "", window.location.pathname);
      // Reset toast flag and refetch
      toastShownRef.current = false;
      query.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle errors - only show toast once
  useEffect(() => {
    if (query.isError && !toastShownRef.current) {
      const error = query.error as QuickBooksAuthError;

      if (error?.isQuickBooksAuth) {
        toastShownRef.current = true; // Mark toast as shown

        // QuickBooks not connected - show persistent toast with connect button
        const connectToQuickBooks = async () => {
          try {
            const response = await fetch(`${BASE_URL}/api/auth/url`);
            if (response.ok) {
              const { authUrl } = await response.json();
              window.location.href = authUrl;
            } else {
              toast({
                title: "Error",
                description:
                  "Failed to get QuickBooks auth URL. Please try again.",
                variant: "destructive",
                duration: 5000,
              });
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to connect to QuickBooks. Please try again.",
              variant: "destructive",
              duration: 5000,
            });
          }
        };

        toast({
          title: "QuickBooks Not Connected",
          description:
            "Please connect your QuickBooks account to view revenue data.",
          variant: "destructive",
          duration: Infinity, // Toast stays until dismissed
          action: (
            <button
              onClick={connectToQuickBooks}
              className="bg-white text-destructive border border-destructive px-3 py-1 rounded text-sm hover:bg-destructive hover:text-white transition-colors"
            >
              Connect QuickBooks
            </button>
          ),
        });
      } else {
        // Other errors - show regular error toast
        toast({
          title: "Error Loading Revenue",
          description:
            error?.message || "Failed to load revenue data from QuickBooks",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  }, [query.isError, query.error, toast]);

  return query;
}
