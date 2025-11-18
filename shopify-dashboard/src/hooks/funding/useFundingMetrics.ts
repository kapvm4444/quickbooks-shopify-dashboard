import { useMemo } from "react";
import { normalizeStatus } from "@/components/funding/statusColors";
import { useValuationCalculator } from "@/hooks/useValuationCalculator";

interface Investment {
  id: string;
  round_id: string | null;
  investor_id: string;
  amount: number | null;
  status: string | null;
  role: string | null;
}

interface FundingRound {
  id: string;
  round_type: string;
  amount_raised: number | null;
  date: string | null;
  valuation_pre: number | null;
  valuation_post: number | null;
  target_amount: number | null;
}

interface LeadInvestor {
  id: string;
  round_id: string | null;
}

interface FundingOverview {
  override_total_raised?: number | null;
  override_current_valuation?: number | null;
  override_active_investors?: number | null;
  round_id: string | null;
}

export function useFundingMetrics(
  selectedRoundId: string | null,
  rounds: FundingRound[],
  investments: Investment[],
  leadInvestors: LeadInvestor[],
  overview?: FundingOverview
) {
  const totalRaised = useMemo(() => {
    if (overview?.override_total_raised != null) return overview.override_total_raised;

    if (investments.length > 0) {
      const sumFunded = investments.reduce((acc, inv) => {
        const s = normalizeStatus(inv.status);
        return s === 'funded' ? acc + (inv.amount ?? 0) : acc;
      }, 0);
      return sumFunded;
    }

    const sumRounds = rounds.reduce((acc, r) => acc + (r.amount_raised ?? 0), 0);
    return sumRounds;
  }, [overview, investments, rounds]);

  const valuationData = useValuationCalculator(selectedRoundId);
  const currentValuation = valuationData.value;

  const activeInvestors = useMemo(() => {
    if (overview?.override_active_investors != null) return overview.override_active_investors;

    if (investments.length > 0) {
      const uniq = new Set(investments.map((i) => i.investor_id));
      return uniq.size;
    }

    return leadInvestors.length;
  }, [overview, investments, leadInvestors]);

  return {
    totalRaised,
    currentValuation,
    currentValuationData: valuationData,
    activeInvestors
  };
}
