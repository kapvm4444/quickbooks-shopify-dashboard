import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import GenerateRoutes from "./utils/GenerateRoutes.jsx";
import { useQuickBooksConnection } from "./hooks/useQuickBooksConnection.js";
import { ExpenseProvider } from "./contexts/ExpenseContext.jsx";
import { RevenueProvider } from "./contexts/RevenueContext.jsx";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

function AppWithConnection() {
  useQuickBooksConnection(); // Handle QuickBooks connection callbacks
  return <GenerateRoutes />;
}

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        <ExpenseProvider>
          <RevenueProvider>
            <BrowserRouter>
              <AppWithConnection />
            </BrowserRouter>
          </RevenueProvider>
        </ExpenseProvider>
        <Toaster />
      </QueryClientProvider>
    </>
  );
}
