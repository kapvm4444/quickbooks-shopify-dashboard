/**
 * Centralized route definitions for better organization and maintainability
 */
import React, { Suspense } from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthPage from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { LoadingState } from "@/components/ui/enhanced-loading";

// Lazy load pages for better performance
const Index = React.lazy(() => import("@/pages/Index"));
const CEODashboard = React.lazy(() => import("@/pages/CEODashboard"));
const Revenue = React.lazy(() => import("@/pages/Revenue"));
const Expenses = React.lazy(() => import("@/pages/Expenses"));
const KPIDashboard = React.lazy(() => import("@/pages/KPIDashboard"));
const Goals = React.lazy(() => import("@/pages/Goals"));
const PricingOptimization = React.lazy(
  () => import("@/pages/PricingOptimization"),
);
const Funding = React.lazy(() => import("@/pages/Funding"));
const CashFlow = React.lazy(() => import("@/pages/CashFlow"));
const SKUList = React.lazy(() => import("@/pages/SKUList"));
const Inventory = React.lazy(() => import("@/pages/Inventory"));
const PurchaseOrders = React.lazy(() => import("@/pages/PurchaseOrders"));
const UnitEconomics = React.lazy(() => import("@/pages/UnitEconomics"));
const Budgeting = React.lazy(() => import("@/pages/Budgeting"));
const Vendors = React.lazy(() => import("@/pages/Vendors"));
const SocialMedia = React.lazy(() => import("@/pages/SocialMedia"));
const MarketingCampaigns = React.lazy(
  () => import("@/pages/MarketingCampaigns"),
);
const MarketingAnalytics = React.lazy(
  () => import("@/pages/MarketingAnalytics"),
);
const ShopifyDashboard = React.lazy(() => import("@/pages/ShopifyDashboard"));
const QuickBooksCallback = React.lazy(
  () => import("@/pages/QuickBooksCallback"),
);
const AccountsReceivablePayable = React.lazy(
  () => import("@/pages/AccountsReceivablePayable"),
);

// Enhanced loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingState
      message="Loading page..."
      size="lg"
      variant="card"
      className="w-64"
    />
  </div>
);

// Route configuration for better maintainability
export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  protected?: boolean;
}

// Main application routes
const mainRoutes: RouteConfig[] = [
  { path: "/", element: <Index />, protected: true },
  { path: "/ceo", element: <CEODashboard />, protected: true },
  { path: "/revenue", element: <Revenue />, protected: true },
  { path: "/expenses", element: <Expenses />, protected: true },
  { path: "/kpi", element: <KPIDashboard />, protected: true },
  { path: "/goals", element: <Goals />, protected: true },
  {
    path: "/pricing-optimization",
    element: <PricingOptimization />,
    protected: true,
  },
  { path: "/funding", element: <Funding />, protected: true },
  { path: "/cash-flow", element: <CashFlow />, protected: true },
  { path: "/ar-ap", element: <AccountsReceivablePayable />, protected: true },
  { path: "/sku-list", element: <SKUList />, protected: true },
  { path: "/inventory", element: <Inventory />, protected: true },
  { path: "/purchase-orders", element: <PurchaseOrders />, protected: true },
  { path: "/unit-economics", element: <UnitEconomics />, protected: true },
  { path: "/budgeting", element: <Budgeting />, protected: true },
  { path: "/vendors", element: <Vendors />, protected: true },
  { path: "/social-media", element: <SocialMedia />, protected: true },
  {
    path: "/marketing-campaigns",
    element: <MarketingCampaigns />,
    protected: true,
  },
  {
    path: "/marketing-analytics",
    element: <MarketingAnalytics />,
    protected: true,
  },
  {
    path: "/shopify-dashboard",
    element: <ShopifyDashboard />,
    protected: true,
  },
  {
    path: "/quickbooks/callback",
    element: <QuickBooksCallback />,
    protected: true,
  },
];

// Legacy route redirects
const redirectRoutes = [
  { from: "/financial-model", to: "/pricing-optimization" },
  { from: "/launch-budget", to: "/budgeting" },
];

/**
 * Generates all route elements with proper protection and suspense boundaries
 */
export function generateRoutes(): React.ReactElement[] {
  const routes: React.ReactElement[] = [];

  // Auth route (not protected)
  routes.push(<Route key="auth" path="/auth" element={<AuthPage />} />);

  // Main application routes
  mainRoutes.forEach(({ path, element, protected: isProtected }) => {
    const routeElement = isProtected ? (
      <ProtectedRoute>{element}</ProtectedRoute>
    ) : (
      element
    );

    routes.push(<Route key={path} path={path} element={routeElement} />);
  });

  // Legacy redirects
  redirectRoutes.forEach(({ from, to }) => {
    routes.push(
      <Route key={from} path={from} element={<Navigate to={to} replace />} />,
    );
  });

  // 404 fallback (must be last)
  routes.push(<Route key="404" path="*" element={<NotFound />} />);

  return routes;
}

/**
 * Higher-order component that wraps routes with Suspense
 */
export function withSuspense(children: React.ReactNode): React.ReactElement {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

/**
 * Get route metadata for navigation purposes
 */
export function getRouteMetadata() {
  return {
    mainRoutes: mainRoutes.map((route) => ({
      path: route.path,
      protected: route.protected,
    })),
    redirectCount: redirectRoutes.length,
    totalRoutes: mainRoutes.length + redirectRoutes.length + 2, // +2 for auth and 404
  };
}
