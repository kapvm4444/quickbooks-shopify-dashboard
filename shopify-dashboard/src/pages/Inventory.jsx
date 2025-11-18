import { DashboardLayout } from "@/components/DashboardLayout";
import { FinancialCard } from "@/components/FinancialCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const staticInventoryByCategory = [
  { category: "Electronics", quantity: 150 },
  { category: "Office Supplies", quantity: 300 },
  { category: "Furniture", quantity: 50 },
  { category: "Accessories", quantity: 500 },
];

const staticSkuList = [
  {
    id: "SKU001",
    name: "Wireless Mouse",
    quantity: 50,
    cost: 25,
    current_po_number: "PO123",
    status: "Active",
  },
  {
    id: "SKU002",
    name: "Mechanical Keyboard",
    quantity: 20,
    cost: 120,
    current_po_number: "PO123",
    status: "Active",
  },
  {
    id: "SKU003",
    name: "A4 Paper Ream",
    quantity: 150,
    cost: 5,
    current_po_number: "PO124",
    status: "Active",
  },
  {
    id: "SKU004",
    name: "Desk Chair",
    quantity: 10,
    cost: 250,
    current_po_number: "PO125",
    status: "Low Stock",
  },
  {
    id: "SKU005",
    name: "USB-C Hub",
    quantity: 75,
    cost: 45,
    current_po_number: "PO126",
    status: "Active",
  },
];

const staticUnitEconomics = {
  skuEconomics: [
    { sku_id: "SKU001", total_landed_cost: 27 },
    { sku_id: "SKU002", total_landed_cost: 125 },
    { sku_id: "SKU003", total_landed_cost: 5.5 },
    { sku_id: "SKU004", total_landed_cost: 260 },
    { sku_id: "SKU005", total_landed_cost: 48 },
  ],
  totalSKUs: 5,
};

const Inventory = () => {
  const isLoading = false;

  // Extract inventory data from static data
  const inventoryByCategory = staticInventoryByCategory;
  const inventoryList = staticSkuList;
  const unitEconomics = staticUnitEconomics;

  // Calculate inventory value using unit economics data when available
  const totalValue =
    unitEconomics.skuEconomics.length > 0
      ? unitEconomics.skuEconomics.reduce((sum, sku) => {
          const quantity =
            inventoryList.find((s) => s.id === sku.sku_id)?.quantity || 0;
          return sum + sku.total_landed_cost * quantity;
        }, 0)
      : inventoryList.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  const totalItems =
    unitEconomics.totalSKUs > 0
      ? unitEconomics.totalSKUs
      : inventoryList.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  // Transform category data for chart
  const chartData = inventoryByCategory.map((cat) => ({
    category: cat.category,
    current: cat.quantity,
    target: 0,
    turnover: 0,
  }));

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">
              Inventory Management
            </h1>
            <p className="text-black mt-1">
              Track stock levels, turnover rates, and reorder points
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-black border-black hover:bg-muted/50"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
            <Button className="bg-financial-primary text-white hover:bg-financial-primary/90">
              <Download className="w-4 h-4 mr-1" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Inventory Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FinancialCard
            title="Total Inventory Value"
            value={`$${totalValue.toLocaleString()}`}
            change={0}
            icon={<Package className="h-4 w-4" />}
            variant="default"
          />
          <FinancialCard
            title="Items in Stock"
            value={totalItems.toLocaleString()}
            change={0}
            icon={<BarChart3 className="h-4 w-4" />}
            variant="default"
          />
          <FinancialCard
            title="Avg. Turnover Rate"
            value="0x"
            change={0}
            icon={<TrendingDown className="h-4 w-4" />}
            variant="revenue"
          />
          <FinancialCard
            title="Low Stock Alerts"
            value="0"
            change={0}
            icon={<AlertTriangle className="h-4 w-4" />}
            variant="expense"
          />
        </div>

        {/* Inventory by Category */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <BarChart3 className="h-5 w-5 text-financial-primary" />
              Inventory by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current" fill="#2563eb" name="Current Stock" />
                <Bar dataKey="target" fill="#93c5fd" name="Target Level" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Levels and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <h3 className="text-sm font-medium text-foreground mb-1">
                  No low stock items
                </h3>
                <p className="text-sm">All items are currently in stock.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <TrendingDown className="h-5 w-5 text-financial-accent" />
                Turnover Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <TrendingDown className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <h3 className="text-sm font-medium text-foreground mb-1">
                  No turnover data
                </h3>
                <p className="text-sm">
                  Connect your inventory data to analyze turnover rates
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Package className="h-5 w-5 text-financial-primary" />
              Inventory Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-black">
                      SKU#
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-black">
                      Description
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-black">
                      Quantity
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-black">
                      Unit Cost
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-black">
                      Total Value
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-black">
                      PO#
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-black">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryList.length > 0 ? (
                    inventoryList.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded text-black font-mono">
                            {item.sku || item.id}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-black font-medium">
                          {item.name || "Unknown Item"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            {item.quantity || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-black">
                          ${(item.cost || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-black">
                          $
                          {(
                            (item.cost || 0) * (item.quantity || 0)
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <code className="text-xs bg-muted px-2 py-1 rounded text-black font-mono">
                            {item.current_po_number || "-"}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={
                              item.status === "Active" ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {item.status || "Unknown"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                        <h3 className="text-sm font-medium text-foreground mb-1">
                          No inventory data
                        </h3>
                        <p className="text-sm">
                          Connect your data sources to view inventory items
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Package className="h-5 w-5 text-financial-primary" />
                Reorder Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <h3 className="text-sm font-medium text-foreground mb-1">
                  No reorder recommendations
                </h3>
                <p className="text-sm">
                  Add inventory data to get reorder recommendations
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <BarChart3 className="h-5 w-5 text-financial-revenue" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <h3 className="text-sm font-medium text-foreground mb-1">
                  No performance data
                </h3>
                <p className="text-sm">
                  Connect your systems to track performance metrics
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Calendar className="h-5 w-5 text-financial-accent" />
                Upcoming Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <h3 className="text-sm font-medium text-foreground mb-1">
                  No upcoming actions
                </h3>
                <p className="text-sm">
                  Actions will appear here based on your inventory data
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Inventory;
