import Index from "../pages/Index.jsx";
import { Route, Routes } from "react-router-dom";
import Revenue from "@/pages/Revenue.jsx";
import { RevenueProvider } from "@/contexts/RevenueContext.jsx";
import CEODashboard from "@/pages/CEODashboard.jsx";
import KPIDashboard from "@/pages/KPIDashboard.jsx";
import Goals from "@/pages/Goals.jsx";
import PricingOptimization from "@/pages/PricingOptimization.jsx";
import Funding from "@/pages/Funding.jsx";
import Expenses from "@/pages/Expenses.jsx";
import { ExpenseProvider } from "@/contexts/ExpenseContext.jsx";
import CashFlow from "@/pages/CashFlow.jsx";
import AccountsReceivablePayable from "@/pages/AccountsReceivablePayable.jsx";
import SKUList from "@/pages/SKUList.jsx";
import Inventory from "@/pages/Inventory.jsx";
import PurchaseOrders from "@/pages/PurchaseOrders.jsx";
import UnitEconomics from "@/pages/UnitEconomics.jsx";
import Budgeting from "@/pages/Budgeting.jsx";
import Vendors from "@/pages/Vendors.jsx";
import SocialMedia from "@/pages/SocialMedia.jsx";
import MarketingCampaigns from "@/pages/MarketingCampaigns.jsx";
import MarketingAnalytics from "@/pages/MarketingAnalytics.jsx";
import ShopifyDashboard from "@/pages/ShopifyDashboard.jsx";
import { DashboardLayout } from "@/components/DashboardLayout.js";
import { routes } from "@/utils/routes.jsx";

const routesConfig = routes();

const ALL = [
  ...routesConfig.dashboardItems,
  ...routesConfig.financialItems,
  ...routesConfig.operationsItems,
  ...routesConfig.marketingItems,
  ...routesConfig.integrationsItems,
];

const allRoutes = [
  //Dashboard Items
  { path: "/", element: <Index /> },
  { path: "/ceo", element: <CEODashboard /> },
  { path: "/kpi", element: <KPIDashboard /> },

  //Financial Items
  { path: "/revenue", element: <Revenue /> },
  { title: "Goals", path: "/goals", element: <Goals /> },
  {
    title: "Pricing Optimization",
    path: "/pricing-optimization",
    element: <PricingOptimization />,
  },
  { path: "/funding", element: <Funding /> },
  { path: "/expenses", element: <Expenses /> },
  { path: "/cash-flow", element: <CashFlow /> },
  { path: "/ar-ap", element: <AccountsReceivablePayable /> },

  //Operations Items
  { path: "/sku-list", element: <SKUList /> },
  { path: "/inventory", element: <Inventory /> },
  { path: "/purchase-orders", element: <PurchaseOrders /> },
  { path: "/unit-economics", element: <UnitEconomics /> },
  { path: "/budgeting", element: <Budgeting /> },
  { path: "/vendors", element: <Vendors /> },

  //Marketing Items
  { path: "/social-media", element: <SocialMedia /> },
  {
    path: "/marketing-campaigns",
    element: <MarketingCampaigns />,
  },
  {
    path: "/marketing-analytics",
    element: <MarketingAnalytics />,
  },

  //Integration Items
  { path: "/shopify-dashboard", element: <ShopifyDashboard /> },
];

export default function GenerateRoutes() {
  return (
    <RevenueProvider>
      <ExpenseProvider>
        <Routes>
          <Route element={<DashboardLayout />}>
            {allRoutes.map((r) => (
              <Route path={r.path} element={r.element} key={r.path}></Route>
            ))}
          </Route>
        </Routes>
      </ExpenseProvider>
    </RevenueProvider>
  );
}
