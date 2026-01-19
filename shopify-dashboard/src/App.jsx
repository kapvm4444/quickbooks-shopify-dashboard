import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import GenerateRoutes from "./utils/GenerateRoutes.jsx";
import { useQuickBooksConnection } from "./hooks/useQuickBooksConnection.js";
import { ExpenseProvider } from "./contexts/ExpenseContext.jsx";
import { RevenueProvider } from "./contexts/RevenueContext.jsx";
import { AuthProvider } from "./hooks/useAuth";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as HotToaster } from "react-hot-toast";

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
        <BrowserRouter>
          <ExpenseProvider>
            <RevenueProvider>
              <AuthProvider>
                <AppWithConnection />
              </AuthProvider>
            </RevenueProvider>
          </ExpenseProvider>
        </BrowserRouter>
        <ShadcnToaster />
        <HotToaster position="top-right" reverseOrder={false} />
      </QueryClientProvider>
    </>
  );
}
