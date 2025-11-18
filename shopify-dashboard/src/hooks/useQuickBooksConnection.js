import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useQuickBooksConnection() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      toast({
        title: "QuickBooks Connected!",
        description:
          "Successfully connected to QuickBooks. Refreshing your data...",
        variant: "default",
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
  }, [location.search, queryClient, toast]);

  return null;
}
