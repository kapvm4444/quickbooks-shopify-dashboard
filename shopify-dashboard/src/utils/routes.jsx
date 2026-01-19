import { lazy } from "react";

const Index = lazy(() => import("@/pages/Index.jsx"));
const CEODashboard = lazy(() => import("@/pages/CEODashboard.jsx"));
const KPIDashboard = lazy(() => import("@/pages/KPIDashboard.jsx"));
const Revenue = lazy(() => import("@/pages/Revenue.jsx"));
const Goals = lazy(() => import("@/pages/Goals.jsx"));
const PricingOptimization = lazy(
  () => import("@/pages/PricingOptimization.jsx"),
);
const Funding = lazy(() => import("@/pages/Funding.jsx"));
const Expenses = lazy(() => import("@/pages/Expenses.jsx"));
const CashFlow = lazy(() => import("@/pages/CashFlow.jsx"));
const AccountsReceivablePayable = lazy(
  () => import("@/pages/AccountsReceivablePayable.jsx"),
);
const SKUList = lazy(() => import("@/pages/SKUList.jsx"));
const Inventory = lazy(() => import("@/pages/Inventory.jsx"));
const PurchaseOrders = lazy(() => import("@/pages/PurchaseOrders.jsx"));
const UnitEconomics = lazy(() => import("@/pages/UnitEconomics.jsx"));
const Budgeting = lazy(() => import("@/pages/Budgeting.jsx"));
const Vendors = lazy(() => import("@/pages/Vendors.jsx"));
const SocialMedia = lazy(() => import("@/pages/SocialMedia.jsx"));
const MarketingCampaigns = lazy(() => import("@/pages/MarketingCampaigns.jsx"));
const MarketingAnalytics = lazy(() => import("@/pages/MarketingAnalytics.jsx"));
const ShopifyDashboard = lazy(() => import("@/pages/ShopifyDashboard.jsx"));
import {
  Activity,
  BarChart2,
  BarChart3,
  Calculator,
  DollarSign,
  FileText,
  Home,
  Megaphone,
  Package,
  PieChart,
  Rocket,
  Share2,
  ShoppingCart,
  Store,
  Tags,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

export const routes = () => ({
  //Dashboard Items
  dashboardItems: [
    {
      isActive: false,
      title: "Overview",
      path: "/",
      element: <Index />,
      icon: Home,
    },
    {
      isActive: false,
      title: "CEO Dashboard",
      path: "/ceo",
      element: <CEODashboard />,
      icon: BarChart3,
    },
    {
      isActive: false,
      title: "KPI Dashboard",
      path: "/kpi",
      element: <KPIDashboard />,
      icon: Activity,
    },
  ],

  //Financial Items
  financialItems: [
    {
      isActive: false,
      title: "Goals",
      path: "/goals",
      element: <Goals />,
      icon: Target,
    },
    {
      isActive: false,
      title: "Pricing Optimization",
      path: "/pricing-optimization",
      element: <PricingOptimization />,
      icon: Tags,
    },
    {
      isActive: false,
      title: "Funding",
      path: "/funding",
      element: <Funding />,
      icon: DollarSign,
    },
    {
      isActive: true,
      title: "Revenue",
      path: "/revenue",
      element: <Revenue />,
      icon: TrendingUp,
    },
    {
      isActive: true,
      title: "Expenses",
      path: "/expenses",
      element: <Expenses />,
      icon: PieChart,
    },
    {
      isActive: false,
      title: "Cash Flow Forecast",
      path: "/cash-flow",
      element: <CashFlow />,
      icon: Activity,
    },
    {
      isActive: false,
      title: "AR/AP Management",
      path: "/ar-ap",
      element: <AccountsReceivablePayable />,
      icon: FileText,
    },
  ],

  //Operations Items
  operationsItems: [
    {
      isActive: false,
      title: "SKU List",
      path: "/sku-list",
      element: <SKUList />,
      icon: Package,
    },
    {
      isActive: false,
      title: "Inventory",
      path: "/inventory",
      element: <Inventory />,
      icon: Package,
    },
    {
      isActive: false,
      title: "Purchase Orders",
      path: "/purchase-orders",
      element: <PurchaseOrders />,
      icon: ShoppingCart,
    },
    {
      isActive: false,
      title: "Unit Economics",
      path: "/unit-economics",
      element: <UnitEconomics />,
      icon: Calculator,
    },
    {
      isActive: false,
      title: "Budgeting",
      path: "/budgeting",
      element: <Budgeting />,
      icon: Rocket,
    },
    {
      isActive: false,
      title: "Vendors & Partners",
      path: "/vendors",
      element: <Vendors />,
      icon: Users,
    },
  ],

  //Marketing Items
  marketingItems: [
    {
      isActive: false,
      title: "Social Media",
      path: "/social-media",
      element: <SocialMedia />,
      icon: Share2,
    },
    {
      isActive: false,
      title: "Marketing Campaigns",
      path: "/marketing-campaigns",
      element: <MarketingCampaigns />,
      icon: Megaphone,
    },
    {
      isActive: false,
      title: "Marketing Analytics",
      path: "/marketing-analytics",
      element: <MarketingAnalytics />,
      icon: BarChart2,
    },
  ],

  //Integration Items
  integrationsItems: [
    {
      isActive: true,
      title: "Shopify Dashboard",
      path: "/shopify-dashboard",
      element: <ShopifyDashboard />,
      icon: Store,
    },
  ],
});
