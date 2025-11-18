import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FinancialCard } from "@/components/FinancialCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  BarChart3,
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
import RoundsAndInvestments from "@/components/funding/RoundsAndInvestments";
import RoundSelector from "@/components/funding/RoundSelector";
import UseOfFundsList from "@/components/funding/UseOfFundsList";
import LeadInvestorsList from "@/components/funding/LeadInvestorsList";
import NextStepsList from "@/components/funding/NextStepsList";
import FundingOverviewForm from "@/components/funding/FundingOverviewForm";
import { STATUS_COLOR_MAP } from "@/components/funding/statusColors";

const staticRounds = [
  {
    id: "round1",
    round_type: "Seed",
    amount_raised: 500000,
    date: "2024-01-15",
    valuation_pre: 2000000,
    valuation_post: 2500000,
    target_amount: 500000,
    status: "closed",
  },
  {
    id: "round2",
    round_type: "Series A",
    amount_raised: 2000000,
    date: "2025-06-20",
    valuation_pre: 8000000,
    valuation_post: 10000000,
    target_amount: 2500000,
    status: "funded",
  },
  {
    id: "round3",
    round_type: "Series B",
    amount_raised: 0,
    date: null,
    valuation_pre: 20000000,
    valuation_post: null,
    target_amount: 5000000,
    status: "pending",
  },
];

const staticUof = [
  {
    id: "uof1",
    category: "Product Development",
    amount: 200000,
    percentage: 40,
    round_id: "round1",
  },
  {
    id: "uof2",
    category: "Marketing",
    amount: 150000,
    percentage: 30,
    round_id: "round1",
  },
  {
    id: "uof3",
    category: "Hiring",
    amount: 100000,
    percentage: 20,
    round_id: "round1",
  },
  {
    id: "uof4",
    category: "Operations",
    amount: 50000,
    percentage: 10,
    round_id: "round1",
  },
  {
    id: "uof5",
    category: "R&D",
    amount: 1000000,
    percentage: 50,
    round_id: "round2",
  },
  {
    id: "uof6",
    category: "Sales",
    amount: 800000,
    percentage: 40,
    round_id: "round2",
  },
  {
    id: "uof7",
    category: "Admin",
    amount: 200000,
    percentage: 10,
    round_id: "round2",
  },
];

const staticInvestments = [
  {
    id: "inv1",
    round_id: "round1",
    investor_id: "inv-a",
    amount: 250000,
    status: "closed",
    role: "Lead",
  },
  {
    id: "inv2",
    round_id: "round1",
    investor_id: "inv-b",
    amount: 250000,
    status: "closed",
    role: "Participant",
  },
  {
    id: "inv3",
    round_id: "round2",
    investor_id: "inv-c",
    amount: 1500000,
    status: "funded",
    role: "Lead",
  },
  {
    id: "inv4",
    round_id: "round2",
    investor_id: "inv-d",
    amount: 500000,
    status: "funded",
    role: "Participant",
  },
  {
    id: "inv5",
    round_id: "round3",
    investor_id: "inv-e",
    amount: 3000000,
    status: "pending",
    role: "Lead",
  },
];

const staticOverviewRows = [
  {
    round_id: null,
    runway_months: 12,
    cash_on_hand: 1000000,
    monthly_burn: 80000,
    override_total_raised: 2500000,
    override_current_valuation: 10000000,
    override_active_investors: 10,
    notes: "Overall company overview.",
  },
  {
    round_id: "round1",
    runway_months: 6,
    cash_on_hand: 400000,
    monthly_burn: 60000,
    override_total_raised: 500000,
    override_current_valuation: 2500000,
    override_active_investors: 3,
    notes: "Seed round overview.",
  },
  {
    round_id: "round2",
    runway_months: 18,
    cash_on_hand: 1800000,
    monthly_burn: 100000,
    override_total_raised: 2000000,
    override_current_valuation: 10000000,
    override_active_investors: 7,
    notes: "Series A overview.",
  },
];

const chartColors = [
  "#3b82f6",
  "#10b981",
  "#f97316",
  "#8b5cf6",
  "#ef4444",
  "#eab308",
];

// Funding page component
const Funding = () => {
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [overviewOpen, setOverviewOpen] = useState(false);

  const rounds = staticRounds;
  const uof = staticUof;
  const investments = staticInvestments;
  const overviewRows = staticOverviewRows;

  const getOverview = () => {
    if (selectedRoundId)
      return overviewRows.find((r) => r.round_id === selectedRoundId);
    return overviewRows.find((r) => r.round_id === null) ?? overviewRows[0];
  };
  const overview = getOverview();

  const getTotalRaised = () => {
    if (overview?.override_total_raised) return overview.override_total_raised;
    const roundsToConsider = selectedRoundId
      ? rounds.filter((r) => r.id === selectedRoundId)
      : rounds;
    return roundsToConsider.reduce((sum, r) => sum + (r.amount_raised || 0), 0);
  };
  const totalRaised = getTotalRaised();

  const getCurrentValuation = () => {
    if (overview?.override_current_valuation)
      return overview.override_current_valuation;
    const latestRound = [...rounds].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    )[0];
    return latestRound?.valuation_post;
  };
  const currentValuation = getCurrentValuation();

  const getActiveInvestors = () => {
    if (overview?.override_active_investors)
      return overview.override_active_investors;
    const investors = new Set(investments.map((i) => i.investor_id));
    return investors.size;
  };
  const activeInvestors = getActiveInvestors();

  const getFundingRoundsData = () => {
    return rounds.map((round) => {
      const roundInvestments = investments.filter(
        (i) => i.round_id === round.id,
      );
      return {
        round: round.round_type,
        closed: roundInvestments
          .filter((i) => i.status === "closed")
          .reduce((sum, i) => sum + i.amount, 0),
        funded: roundInvestments
          .filter((i) => i.status === "funded")
          .reduce((sum, i) => sum + i.amount, 0),
        pending: roundInvestments
          .filter((i) => i.status === "pending")
          .reduce((sum, i) => sum + i.amount, 0),
      };
    });
  };
  const fundingRoundsData = getFundingRoundsData();

  const getMaxTotal = () => {
    return fundingRoundsData.reduce(
      (max, round) =>
        Math.max(max, round.closed + round.funded + round.pending),
      0,
    );
  };
  const maxTotal = getMaxTotal();

  const getUseOfFundsData = () => {
    const funds = selectedRoundId
      ? uof.filter((f) => f.round_id === selectedRoundId)
      : uof;
    const total = funds.reduce((sum, item) => sum + item.amount, 0);
    if (total === 0) return [];
    return funds.map((item) => ({
      ...item,
      value: (item.amount / total) * 100,
    }));
  };
  const useOfFundsData = getUseOfFundsData();

  const getUseOfFundsByRound = () => {
    if (selectedRoundId) return [];
    const byRound = uof.reduce((acc, item) => {
      if (!acc[item.round_id]) {
        acc[item.round_id] = [];
      }
      acc[item.round_id].push(item);
      return acc;
    }, {});

    return Object.keys(byRound).map((roundId) => {
      const round = rounds.find((r) => r.id === roundId);
      const funds = byRound[roundId];
      const total = funds.reduce((sum, item) => sum + item.amount, 0);
      return {
        key: roundId,
        label: round ? round.round_type : "Unknown Round",
        data: funds.map((item) => ({
          ...item,
          value: total > 0 ? (item.amount / total) * 100 : 0,
        })),
      };
    });
  };
  const useOfFundsByRound = getUseOfFundsByRound();

  const getCategoryColorMap = () => {
    const categories = [...new Set(uof.map((item) => item.category))];
    const map = new Map();
    categories.forEach((cat, i) => {
      map.set(cat, chartColors[i % chartColors.length]);
    });
    return map;
  };
  const categoryColorMap = getCategoryColorMap();

  const formatCurrency = (n) => {
    if (n == null) return "-";
    return `$${Number(n).toLocaleString()}`;
  };

  const legendItems = [
    { key: "closed", label: "Closed" },
    { key: "funded", label: "Funded" },
    { key: "pending", label: "Pending" },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">
              Funding & Investment
            </h1>
            <p className="text-black mt-1">
              Track funding rounds, investor relations, and capital allocation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-gradient-primary text-black border-0"
            >
              <Calendar className="w-3 h-3 mr-1" />
              {selectedRoundId ? "Round Selected" : "All Rounds"}
            </Badge>
            <Button
              className="bg-financial-primary text-white hover:bg-financial-primary/90"
              onClick={() => setOverviewOpen(true)}
            >
              <FileText className="w-4 h-4 mr-1" />
              Edit Overview
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <RoundSelector
            value={selectedRoundId}
            onChange={setSelectedRoundId}
            rounds={rounds}
          />
        </div>

        {/* Funding Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FinancialCard
            title="Total Raised"
            value={formatCurrency(totalRaised)}
            change={0}
            icon={<DollarSign className="h-4 w-4" />}
            variant="revenue"
          />
          <FinancialCard
            title="Current Valuation"
            value={
              currentValuation != null
                ? formatCurrency(currentValuation)
                : "Not calculated"
            }
            icon={<TrendingUp className="h-4 w-4" />}
            variant="neutral"
          />
          <FinancialCard
            title="Active Investors"
            value={activeInvestors ?? "-"}
            change={0}
            icon={<Users className="h-4 w-4" />}
            variant="revenue"
          />
        </div>

        {/* Funding Rounds & Use of Funds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <BarChart3 className="h-5 w-5 text-financial-primary" />
                Funding Rounds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                {/* Custom vertical legend on the far left, centered with the chart */}
                <div className="w-40 h-[300px] flex flex-col justify-center gap-3">
                  {legendItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: STATUS_COLOR_MAP[item.key] }}
                      />
                      <span className="text-black">{item.label}</span>
                    </div>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={fundingRoundsData}
                    margin={{ top: 24, right: 16, left: 56, bottom: 16 }}
                    barCategoryGap={24}
                  >
                    <CartesianGrid
                      stroke="hsl(var(--border))"
                      strokeDasharray="3 3"
                      strokeOpacity={0.6}
                    />
                    <XAxis
                      dataKey="round"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                      domain={[
                        0,
                        Math.max(10, Math.ceil((maxTotal || 0) * 1.25)),
                      ]}
                      tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                      formatter={(value, name) => [
                        `$${Number(value).toLocaleString()}`,
                        name,
                      ]}
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="pending"
                      name="Pending"
                      stackId="status"
                      fill={STATUS_COLOR_MAP.pending}
                      stroke={STATUS_COLOR_MAP.pending}
                      strokeWidth={1}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={56}
                    />
                    <Bar
                      dataKey="funded"
                      name="Funded"
                      stackId="status"
                      fill={STATUS_COLOR_MAP.funded}
                      stroke={STATUS_COLOR_MAP.funded}
                      strokeWidth={1}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={56}
                    />
                    <Bar
                      dataKey="closed"
                      name="Closed"
                      stackId="status"
                      fill={STATUS_COLOR_MAP.closed}
                      stroke={STATUS_COLOR_MAP.closed}
                      strokeWidth={1}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={56}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <BarChart3 className="h-5 w-5 text-financial-primary" />
                Use of Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRoundId ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={useOfFundsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {useOfFundsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              categoryColorMap.get(entry.category) ??
                              chartColors[index % chartColors.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, entry) => [
                          `$${(entry.payload.amount || 0).toLocaleString()} (${value.toFixed(0)}%)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {useOfFundsData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                categoryColorMap.get(item.category) ??
                                chartColors[index % chartColors.length],
                            }}
                          />
                          <span className="text-black">{item.category}</span>
                        </div>
                        <span className="font-semibold text-black">
                          ${item.amount.toLocaleString()} (
                          {item.value.toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                    {/* Total row */}
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                      <span className="font-semibold text-black">Total:</span>
                      <span className="font-semibold text-black">
                        $
                        {(() => {
                          const selectedRound = rounds.find(
                            (r) => r.id === selectedRoundId,
                          );
                          const total =
                            selectedRound?.target_amount ??
                            useOfFundsData.reduce(
                              (sum, item) => sum + item.amount,
                              0,
                            );
                          return total.toLocaleString();
                        })()}{" "}
                        (100%)
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {useOfFundsByRound.length === 0 ? (
                    <div className="text-sm text-black/60">
                      No use of funds data.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {useOfFundsByRound.map((grp, gi) => (
                        <div key={grp.key} className="flex flex-col">
                          <div className="text-sm font-medium text-black mb-2">
                            {grp.label}
                          </div>
                          <div className="w-full h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={grp.data}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  dataKey="value"
                                >
                                  {grp.data.map((entry, index) => (
                                    <Cell
                                      key={`cell-${gi}-${index}`}
                                      fill={
                                        categoryColorMap.get(entry.category) ??
                                        chartColors[index % chartColors.length]
                                      }
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value, name, entry) => [
                                    `$${(entry.payload.amount || 0).toLocaleString()} (${value.toFixed(0)}%)`,
                                    name,
                                  ]}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-2 mt-3">
                            {grp.data.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor:
                                        categoryColorMap.get(item.category) ??
                                        chartColors[index % chartColors.length],
                                    }}
                                  />
                                  <span className="text-black">
                                    {item.category}
                                  </span>
                                </div>
                                <span className="font-semibold text-black">
                                  ${item.amount.toLocaleString()} (
                                  {item.value.toFixed(0)}%)
                                </span>
                              </div>
                            ))}
                            {/* Total row */}
                            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                              <span className="font-semibold text-black">
                                Total:
                              </span>
                              <span className="font-semibold text-black">
                                $
                                {(() => {
                                  const round = rounds.find(
                                    (r) => r.id === grp.key,
                                  );
                                  const total =
                                    round?.target_amount ??
                                    grp.data.reduce(
                                      (sum, item) => sum + item.amount,
                                      0,
                                    );
                                  return total.toLocaleString();
                                })()}{" "}
                                (100%)
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rounds & Investments */}
        <div className="grid grid-cols-1 gap-6">
          <RoundsAndInvestments
            selectedRoundId={selectedRoundId}
            onSelect={(id) => setSelectedRoundId(id)}
            rounds={rounds}
            investments={investments}
          />
        </div>

        {/* Use of Funds */}
        <div className="grid grid-cols-1 gap-6">
          <UseOfFundsList roundId={selectedRoundId} uof={uof} />
        </div>

        {/* Investor Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeadInvestorsList
            roundId={selectedRoundId}
            investments={investments}
          />
          <NextStepsList roundId={selectedRoundId} />
        </div>
      </div>

      <FundingOverviewForm
        open={overviewOpen}
        onOpenChange={(o) => setOverviewOpen(o)}
        initial={overview}
        roundId={selectedRoundId}
      />
    </>
  );
};

export default Funding;
