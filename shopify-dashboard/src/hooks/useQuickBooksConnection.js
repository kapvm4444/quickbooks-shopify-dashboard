import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { default as hotToast } from "react-hot-toast";

export function useQuickBooksConnection() {
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if user just returned from QuickBooks connection
    const urlParams = new URLSearchParams(location.search);
    const isConnected = urlParams.get("connected") === "true";

    if (isConnected) {
      // Clear the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Store connection status in localStorage for persistence
      localStorage.setItem("quickbooks-connected", "true");
      localStorage.setItem(
        "quickbooks-connected-timestamp",
        Date.now().toString(),
      );

      // Show success toast
      hotToast.success("QuickBooks Connected!", {
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#18181b',
          color: '#fafafa',
          border: '1px solid #27272a',
          fontSize: '14px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#3b82f6',
          secondary: '#18181b',
        },
      });

      // Invalidate and refetch all QuickBooks queries
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["quickbooks-revenue"] });
        queryClient.invalidateQueries({ queryKey: ["quickbooks-expenses"] });

        // Refetch the data
        queryClient.refetchQueries({ queryKey: ["quickbooks-revenue"] });
        queryClient.refetchQueries({ queryKey: ["quickbooks-expenses"] });
      }, 1000); // Small delay to let the toast show
    }
  }, [location.search, queryClient]);

  return null;
}
