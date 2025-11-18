import { useMemo } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';

interface Investment {
  id: string;
  round_id: string | null;
  investor_id: string;
  amount: number | null;
  status: string | null;
  role: string | null;
  security_type: string | null;
  valuation_cap: number | null;
  discount: number | null;
  share_price: number | null;
}

interface FundingRound {
  id: string;
  round_type: string;
  amount_raised: number | null;
  date: string | null;
  valuation_pre: number | null;
  valuation_post: number | null;
  status: string | null;
}

interface FundingOverview {
  override_current_valuation: number | null;
  round_id: string | null;
}

export function useValuationCalculator(selectedRoundId?: string | null) {
  // Fetch all investments with detailed terms
  const { data: investments = [] } = useSupabaseQuery<Investment>(
    ['funding_round_investments_valuation'],
    'funding_round_investments',
    'id, round_id, investor_id, amount, status, role, security_type, valuation_cap, discount, share_price'
  );

  // Fetch funding rounds
  const { data: rounds = [] } = useSupabaseQuery<FundingRound>(
    ['funding_rounds_valuation'],
    'funding_rounds',
    'id, round_type, amount_raised, date, valuation_pre, valuation_post, status'
  );

  // Fetch funding overview for overrides
  const { data: overviewRows = [] } = useSupabaseQuery<FundingOverview>(
    ['funding_overview_valuation'],
    'funding_overview',
    'override_current_valuation, round_id'
  );

  const calculatedValuation = useMemo(() => {
    // 1. Check for manual override first
    const overview = selectedRoundId 
      ? overviewRows.find(r => r.round_id === selectedRoundId)
      : overviewRows.find(r => r.round_id === null) ?? overviewRows[0];
    
    if (overview?.override_current_valuation) {
      return {
        value: overview.override_current_valuation,
        method: 'manual_override',
        confidence: 'high',
        description: 'Manually set valuation'
      };
    }

    // 2. Calculate from investment terms
    const relevantInvestments = selectedRoundId 
      ? investments.filter(inv => inv.round_id === selectedRoundId)
      : investments;

    // Filter only funded/closed investments for valuation calculation
    const fundedInvestments = relevantInvestments.filter(inv => 
      inv.status === 'closed' || inv.status === 'funded' || inv.status === 'received'
    );

    if (fundedInvestments.length > 0) {
      // Find the most recent round with investments
      const roundsWithInvestments = rounds.filter(round => 
        fundedInvestments.some(inv => inv.round_id === round.id)
      ).sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA; // Most recent first
      });

      if (roundsWithInvestments.length > 0) {
        const latestRound = roundsWithInvestments[0];
        const roundInvestments = fundedInvestments.filter(inv => inv.round_id === latestRound.id);

        // Check for equity rounds with share price
        const equityInvestments = roundInvestments.filter(inv => 
          inv.security_type === 'Common Stock' || inv.security_type === 'Preferred Stock'
        );

        if (equityInvestments.length > 0 && equityInvestments[0].share_price) {
          // For equity rounds, use post-money valuation
          const totalInvestment = roundInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
          const preMoney = latestRound.valuation_pre || 0;
          const postMoney = preMoney + totalInvestment;
          
          return {
            value: postMoney,
            method: 'equity_round',
            confidence: 'high',
            description: `Based on ${latestRound.round_type} equity round`
          };
        }

        // Check for SAFE investments
        const safeInvestments = roundInvestments.filter(inv => 
          inv.security_type === 'SAFE' && inv.valuation_cap
        );

        if (safeInvestments.length > 0) {
          // Use the lowest valuation cap as the effective valuation
          const minValuationCap = Math.min(...safeInvestments.map(inv => inv.valuation_cap || Infinity));
          
          return {
            value: minValuationCap,
            method: 'safe_valuation_cap',
            confidence: 'medium',
            description: `Based on SAFE valuation cap (${latestRound.round_type})`
          };
        }

        // Check for convertible notes
        const convertibleNotes = roundInvestments.filter(inv => 
          inv.security_type === 'Convertible Note' && inv.valuation_cap
        );

        if (convertibleNotes.length > 0) {
          const minValuationCap = Math.min(...convertibleNotes.map(inv => inv.valuation_cap || Infinity));
          
          return {
            value: minValuationCap,
            method: 'convertible_note_cap',
            confidence: 'medium',
            description: `Based on convertible note valuation cap (${latestRound.round_type})`
          };
        }
      }
    }

    // 3. Fallback to round valuation data
    const relevantRounds = selectedRoundId 
      ? rounds.filter(r => r.id === selectedRoundId)
      : rounds;

    const sortedRounds = relevantRounds
      .filter(r => r.valuation_post || r.valuation_pre)
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA; // Most recent first
      });

    if (sortedRounds.length > 0) {
      const latestRound = sortedRounds[0];
      const valuation = latestRound.valuation_post || latestRound.valuation_pre;
      
      return {
        value: valuation!,
        method: 'round_valuation',
        confidence: 'medium',
        description: `Based on ${latestRound.round_type} round valuation`
      };
    }

    // 4. No valuation data available
    return {
      value: null,
      method: 'unknown',
      confidence: 'low',
      description: 'No valuation data available'
    };
  }, [investments, rounds, overviewRows, selectedRoundId]);

  return calculatedValuation;
}