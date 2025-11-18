import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

// Base URL for your backend API
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Custom error type for QuickBooks authentication
interface QuickBooksAuthError extends Error {
  isQuickBooksAuth: boolean;
}

// Transform QuickBooks Bills to expense records
const transformBillToExpenseRecord = (bill: any) => {
  const records: any[] = [];

  // Process each line item from the bill
  bill.Line?.forEach((line: any) => {
    if (line.Amount > 0) {
      let accountName = "Expense";
      let accountCode = "6000";

      // Get account info from line item
      if (
        line.DetailType === "ItemBasedExpenseLineDetail" &&
        line.ItemBasedExpenseLineDetail?.ItemRef
      ) {
        // For item-based expenses, use item name as description
        accountName =
          line.Description || line.ItemBasedExpenseLineDetail.ItemRef.name;
      } else if (
        line.DetailType === "AccountBasedExpenseLineDetail" &&
        line.AccountBasedExpenseLineDetail?.AccountRef
      ) {
        // For account-based expenses, use account reference
        accountName = line.AccountBasedExpenseLineDetail.AccountRef.name;
        accountCode = line.AccountBasedExpenseLineDetail.AccountRef.value;
      }

      records.push({
        id: `bill-${bill.Id}-${line.Id}`,
        transaction_date: bill.TxnDate,
        description: line.Description || "Bill Expense",
        amount: line.Amount,
        category: "Bills",
        chart_account_name: accountName,
        chart_account_code: accountCode,
        vendor_name: bill.VendorRef?.name || "Unknown Vendor",
        due_date: bill.DueDate,
        is_recurring: false, // Bills don't typically have recurring info
      });
    }
  });

  // If no line items, create one record for the total
  if (records.length === 0 && bill.TotalAmt > 0) {
    records.push({
      id: bill.Id,
      transaction_date: bill.TxnDate,
      description: `Bill - ${bill.VendorRef?.name || "Vendor"}`,
      amount: bill.TotalAmt,
      category: "Bills",
      chart_account_name: "Accounts Payable",
      chart_account_code: "2000",
      vendor_name: bill.VendorRef?.name || "Unknown Vendor",
      due_date: bill.DueDate,
      is_recurring: false,
    });
  }

  return records;
};

// Transform QuickBooks Purchases to expense records
const transformPurchaseToExpenseRecord = (purchase: any) => {
  const records: any[] = [];

  // Process each line item from the purchase
  purchase.Line?.forEach((line: any) => {
    if (line.Amount > 0) {
      let accountName = "Expense";
      let accountCode = "6000";

      // Get account info from line item
      if (
        line.DetailType === "AccountBasedExpenseLineDetail" &&
        line.AccountBasedExpenseLineDetail?.AccountRef
      ) {
        accountName = line.AccountBasedExpenseLineDetail.AccountRef.name;
        accountCode = line.AccountBasedExpenseLineDetail.AccountRef.value;
      }

      records.push({
        id: `purchase-${purchase.Id}-${line.Id}`,
        transaction_date: purchase.TxnDate,
        description: line.Description || `${accountName} Expense`,
        amount: line.Amount,
        category: "Direct Expenses",
        chart_account_name: accountName,
        chart_account_code: accountCode,
        payment_method: purchase.AccountRef?.name || "Unknown",
        payment_type: purchase.PaymentType || "Unknown",
        is_recurring: false,
      });
    }
  });

  // If no line items, create one record for the total
  if (records.length === 0 && purchase.TotalAmt > 0) {
    records.push({
      id: purchase.Id,
      transaction_date: purchase.TxnDate,
      description: "Direct Purchase",
      amount: purchase.TotalAmt,
      category: "Direct Expenses",
      chart_account_name: purchase.AccountRef?.name || "Expense",
      chart_account_code: "6000",
      payment_method: purchase.AccountRef?.name || "Unknown",
      payment_type: purchase.PaymentType || "Unknown",
      is_recurring: false,
    });
  }

  return records;
};

// Fetch expense data from your backend
const fetchExpenseData = async () => {
  try {
    // Fetch both Bills and Purchases in parallel
    const [billsResponse, purchasesResponse] = await Promise.all([
      fetch(`${BASE_URL}/api/bills`),
      fetch(`${BASE_URL}/api/purchases`),
    ]);

    // Check for QuickBooks connection issues (401 = Not connected)
    if (billsResponse.status === 401 || purchasesResponse.status === 401) {
      const error = new Error(
        "QuickBooks not connected",
      ) as QuickBooksAuthError;
      error.isQuickBooksAuth = true;
      throw error;
    }

    if (!billsResponse.ok) {
      throw new Error(`Failed to fetch bills: ${billsResponse.statusText}`);
    }
    if (!purchasesResponse.ok) {
      throw new Error(
        `Failed to fetch purchases: ${purchasesResponse.statusText}`,
      );
    }

    const bills = await billsResponse.json();
    const purchases = await purchasesResponse.json();

    const transformedRecords: any[] = [];

    // Transform Bills data
    if (bills && Array.isArray(bills)) {
      bills.forEach((bill: any) => {
        const records = transformBillToExpenseRecord(bill);
        transformedRecords.push(...records);
      });
    }

    // Transform Purchases data
    if (purchases && Array.isArray(purchases)) {
      purchases.forEach((purchase: any) => {
        const records = transformPurchaseToExpenseRecord(purchase);
        transformedRecords.push(...records);
      });
    }

    return transformedRecords;
  } catch (error) {
    throw error;
  }
};

export function useQuickBooksExpenses() {
  const { toast } = useToast();
  const toastShownRef = useRef(false);

  const query = useQuery({
    queryKey: ["quickbooks-expenses"],
    queryFn: fetchExpenseData,
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
      console.log("✅ Detected QuickBooks redirect, refetching expenses...");
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
              console.log(authUrl);
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
            "Please connect your QuickBooks account to view expense data.",
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
          title: "Error Loading Expenses",
          description:
            error?.message || "Failed to load expense data from QuickBooks",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  }, [query.isError, query.error, toast]);

  return query;
}
