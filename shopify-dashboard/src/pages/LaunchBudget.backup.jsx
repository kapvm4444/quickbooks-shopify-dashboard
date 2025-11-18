import { DashboardLayout } from "@/components/DashboardLayout";
import { FinancialCard } from "@/components/FinancialCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  DollarSign,
  Target,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const budgetAllocation = [
  {
    category: "Marketing & Advertising",
    allocated: 45000,
    spent: 32500,
    remaining: 12500,
    color: "#2563eb",
  },
  {
    category: "Product Development",
    allocated: 35000,
    spent: 28750,
    remaining: 6250,
    color: "#16a34a",
  },
  {
    category: "Operations Setup",
    allocated: 25000,
    spent: 22000,
    remaining: 3000,
    color: "#dc2626",
  },
  {
    category: "Inventory",
    allocated: 40000,
    spent: 35000,
    remaining: 5000,
    color: "#f59e0b",
  },
  {
    category: "Contingency",
    allocated: 15000,
    spent: 2500,
    remaining: 12500,
    color: "#8b5cf6",
  },
];

const launchMilestones = [
  {
    milestone: "Market Research",
    budget: 5000,
    spent: 5000,
    status: "Complete",
    dueDate: "2025-03-15",
  },
  {
    milestone: "Product Development",
    budget: 35000,
    spent: 28750,
    status: "In Progress",
    dueDate: "2025-07-30",
  },
  {
    milestone: "Marketing Campaign",
    budget: 25000,
    spent: 18500,
    status: "In Progress",
    dueDate: "2025-08-15",
  },
  {
    milestone: "Inventory Procurement",
    budget: 40000,
    spent: 35000,
    status: "In Progress",
    dueDate: "2025-08-30",
  },
  {
    milestone: "Launch Event",
    budget: 15000,
    spent: 0,
    status: "Pending",
    dueDate: "2025-09-15",
  },
];

const LaunchBudget = () => {
  const totalAllocated = budgetAllocation.reduce(
    (sum, item) => sum + item.allocated,
    0,
  );
  const totalSpent = budgetAllocation.reduce(
    (sum, item) => sum + item.spent,
    0,
  );
  const totalRemaining = totalAllocated - totalSpent;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Launch Budget</h1>
            <p className="text-black mt-1">
              Track product launch expenses and milestone progress
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-gradient-primary text-black border-0"
            >
              <Calendar className="w-3 h-3 mr-1" />
              Q3 2025 Launch
            </Badge>
            <Button className="bg-financial-primary text-white hover:bg-financial-primary/90">
              <Plus className="w-4 h-4 mr-1" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FinancialCard
            title="Total Budget"
            value={`$${totalAllocated.toLocaleString()}`}
            change={0}
            icon={<DollarSign className="h-4 w-4" />}
            variant="default"
          />
          <FinancialCard
            title="Amount Spent"
            value={`$${totalSpent.toLocaleString()}`}
            change={(totalSpent / totalAllocated) * 100 - 100}
            icon={<TrendingUp className="h-4 w-4" />}
            variant="expense"
          />
          <FinancialCard
            title="Remaining Budget"
            value={`$${totalRemaining.toLocaleString()}`}
            change={0}
            icon={<Target className="h-4 w-4" />}
            variant="revenue"
          />
          <FinancialCard
            title="Budget Utilization"
            value={`${((totalSpent / totalAllocated) * 100).toFixed(1)}%`}
            change={0}
            icon={<Rocket className="h-4 w-4" />}
            variant="default"
          />
        </div>

        {/* Budget Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Target className="h-5 w-5 text-financial-primary" />
                Budget Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={budgetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="allocated"
                  >
                    {budgetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Allocated",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {budgetAllocation.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-black">{item.category}</span>
                    </div>
                    <span className="font-semibold text-black">
                      ${item.allocated.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <BarChart className="h-5 w-5 text-financial-accent" />
                Spending vs Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetAllocation} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="allocated" fill="#e5e7eb" name="Allocated" />
                  <Bar dataKey="spent" fill="#2563eb" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Budget Breakdown */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <DollarSign className="h-5 w-5 text-financial-revenue" />
              Budget Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetAllocation.map((item, index) => (
                <div
                  key={index}
                  className="space-y-2 p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-black">{item.category}</h4>
                    <Badge
                      variant="secondary"
                      className={
                        item.spent / item.allocated > 0.9
                          ? "bg-red-100 text-red-800"
                          : item.spent / item.allocated > 0.7
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }
                    >
                      {((item.spent / item.allocated) * 100).toFixed(0)}% used
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-black">
                      <span>Spent: ${item.spent.toLocaleString()}</span>
                      <span>Remaining: ${item.remaining.toLocaleString()}</span>
                    </div>
                    <Progress
                      value={(item.spent / item.allocated) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Launch Milestones */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Rocket className="h-5 w-5 text-financial-accent" />
              Launch Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {launchMilestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {milestone.status === "Complete" ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : milestone.status === "In Progress" ? (
                        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-black">
                        {milestone.milestone}
                      </h4>
                      <p className="text-sm text-black">
                        Due: {milestone.dueDate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-black">
                      ${milestone.spent.toLocaleString()} / $
                      {milestone.budget.toLocaleString()}
                    </p>
                    <Badge
                      variant="secondary"
                      className={
                        milestone.status === "Complete"
                          ? "bg-green-100 text-green-800"
                          : milestone.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {milestone.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Budget Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-yellow-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-black">
                    High Utilization
                  </span>
                </div>
                <p className="text-xs text-black">
                  Operations Setup at 88% of budget with 2 months remaining
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-black">
                    On Track
                  </span>
                </div>
                <p className="text-xs text-black">
                  Marketing campaign spending aligned with timeline
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <TrendingUp className="h-5 w-5 text-financial-revenue" />
                Cost Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-2">
                <span className="text-sm text-black">Vendor Negotiations</span>
                <span className="font-semibold text-black">-$3.2K</span>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-sm text-black">Bulk Discounts</span>
                <span className="font-semibold text-black">-$1.8K</span>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-sm text-black">Process Improvements</span>
                <span className="font-semibold text-black">-$2.5K</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm font-medium text-black">
                    Total Savings
                  </span>
                  <span className="font-bold text-financial-revenue">
                    -$7.5K
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Calendar className="h-5 w-5 text-financial-accent" />
                Next Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-financial-revenue/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-financial-revenue" />
                  <span className="text-sm font-medium text-black">
                    Finalize Inventory
                  </span>
                </div>
                <p className="text-xs text-black">
                  Complete procurement by August 30th
                </p>
              </div>

              <div className="p-3 rounded-lg bg-financial-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="h-4 w-4 text-financial-primary" />
                  <span className="text-sm font-medium text-black">
                    Launch Event Planning
                  </span>
                </div>
                <p className="text-xs text-black">
                  Begin event planning and vendor bookings
                </p>
              </div>

              <div className="p-3 rounded-lg bg-financial-accent/10">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-financial-accent" />
                  <span className="text-sm font-medium text-black">
                    Budget Review
                  </span>
                </div>
                <p className="text-xs text-black">
                  Weekly budget review meetings through launch
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LaunchBudget;
