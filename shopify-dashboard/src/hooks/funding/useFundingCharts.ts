import { useMemo } from "react";
import { normalizeStatus } from "@/components/funding/statusColors";

interface Investment {
  id: string;
  round_id: string | null;
  investor_id: string;
  amount: number | null;
  status: string | null;
}

interface FundingRound {
  id: string;
  round_type: string;
  amount_raised: number | null;
}

interface UseOfFunds {
  id: string;
  category: string;
  amount: number | null;
  percentage: number | null;
  round_id: string | null;
}

export function useFundingCharts(
  rounds: FundingRound[],
  investments: Investment[],
  uof: UseOfFunds[]
) {
  const fundingRoundsData = useMemo(() => {
    type Acc = Record<string, { pending: number; funded: number; closed: number }>;
    const acc: Acc = {};

    const addTo = (key: string, status: 'pending' | 'funded' | 'closed', amount: number) => {
      if (!acc[key]) acc[key] = { pending: 0, funded: 0, closed: 0 };
      acc[key][status] += amount;
    };

    investments.forEach((inv) => {
      const key = inv.round_id ?? "unassigned";
      const amt = Number(inv.amount ?? 0);
      const s = normalizeStatus(inv.status);
      if (!s) return;
      addTo(key, s, amt);
    });

    const rows = rounds.map((r) => {
      const sums = acc[r.id] ?? { pending: 0, funded: 0, closed: 0 };
      let { pending, funded, closed } = sums;

      if (!investments.length) {
        funded = Number(r.amount_raised ?? 0);
      }

      const total = pending + funded + closed;
      return {
        round: r.round_type,
        pending,
        funded,
        closed,
        total,
      };
    });

    if (acc["unassigned"]) {
      const s = acc["unassigned"];
      const total = s.pending + s.funded + s.closed;
      rows.push({
        round: "Unassigned",
        pending: s.pending,
        funded: s.funded,
        closed: s.closed,
        total,
      });
    }

    return rows;
  }, [investments, rounds]);

  const maxTotal = useMemo(() => {
    return fundingRoundsData.reduce((m, d) => Math.max(m, d.total), 0);
  }, [fundingRoundsData]);

  const useOfFundsData = useMemo(() => {
    if (uof.length === 0) return [];
    
    const hasStoredPercentages = uof.some(x => x.percentage != null);
    
    if (hasStoredPercentages) {
      return uof.map((x) => ({
        category: x.category,
        value: x.percentage ?? 0,
        amount: x.amount ?? 0,
      }));
    }
    
    const total = uof.reduce((acc, x) => acc + (x.amount ?? 0), 0) || 1;
    return uof.map((x) => ({
      category: x.category,
      value: ((x.amount ?? 0) / total) * 100,
      amount: x.amount ?? 0,
    }));
  }, [uof]);

  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
    "hsl(var(--chart-7))",
    "hsl(var(--chart-8))",
    "hsl(var(--chart-9))",
    "hsl(var(--chart-10))",
  ];

  const categoryColorMap = useMemo(() => {
    const palette = chartColors;
    const map = new Map<string, string>();
    const used = new Set<number>();

    const categories = Array.from(new Set(uof.map((x) => x.category)));
    categories.forEach((cat, idx) => {
      let colorIdx = -1;
      for (let candidate = 0; candidate < palette.length; candidate++) {
        if (!used.has(candidate)) {
          colorIdx = candidate;
          break;
        }
      }
      if (colorIdx === -1) colorIdx = idx % palette.length;
      used.add(colorIdx);
      map.set(cat, palette[colorIdx]);
    });

    return map;
  }, [uof]);

  const useOfFundsByRound = useMemo(() => {
    if (!uof.length) return [] as { key: string; label: string; data: { category: string; value: number; amount: number }[] }[];

    const roundLabel = new Map<string, string>();
    rounds.forEach((r) => roundLabel.set(r.id, r.round_type));

    const groups = new Map<string, { items: UseOfFunds[]; label: string }>();

    for (const row of uof) {
      const key = row.round_id ?? 'unassigned';
      if (!groups.has(key)) {
        groups.set(key, {
          items: [],
          label: key === 'unassigned' ? 'Unassigned' : (roundLabel.get(key) ?? 'Unknown'),
        });
      }
      groups.get(key)!.items.push(row);
    }

    const result: { key: string; label: string; data: { category: string; value: number; amount: number }[] }[] = [];

    groups.forEach((group, key) => {
      const items = group.items;
      const hasStoredPercentages = items.some(x => x.percentage != null);
      
      let data;
      if (hasStoredPercentages) {
        data = items.map((x) => ({ 
          category: x.category, 
          value: x.percentage ?? 0, 
          amount: x.amount ?? 0 
        }));
      } else {
        const total = items.reduce((acc, x) => acc + (x.amount ?? 0), 0) || 1;
        data = items.map((x) => ({ 
          category: x.category, 
          value: ((x.amount ?? 0) / total) * 100, 
          amount: x.amount ?? 0 
        }));
      }
      
      result.push({ key, label: group.label, data });
    });

    const order = new Map<string, number>();
    rounds.forEach((r, idx) => order.set(r.id, idx));
    result.sort((a, b) => {
      const aUn = a.key === 'unassigned';
      const bUn = b.key === 'unassigned';
      if (aUn && !bUn) return 1;
      if (!aUn && bUn) return -1;
      return (order.get(a.key) ?? 999) - (order.get(b.key) ?? 999);
    });

    return result;
  }, [uof, rounds]);

  return {
    fundingRoundsData,
    maxTotal,
    useOfFundsData,
    categoryColorMap,
    useOfFundsByRound,
    chartColors
  };
}
