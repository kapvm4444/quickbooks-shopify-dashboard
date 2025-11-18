import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/utils/performance/queryConfig";

export interface PricingScenario {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_ai_generated: boolean;
  created_from_scenario_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ScenarioSkuPricing {
  id: string;
  scenario_id: string;
  sku_id: string;
  price: number;
  discount_percent?: number;
  volume_tier_1_qty?: number;
  volume_tier_1_price?: number;
  volume_tier_2_qty?: number;
  volume_tier_2_price?: number;
  volume_tier_3_qty?: number;
  volume_tier_3_price?: number;
}

export interface PricingRecommendation {
  id: string;
  user_id: string;
  sku_id: string;
  recommended_price: number;
  confidence_score: number;
  expected_roi?: number;
  expected_margin_percent?: number;
  reasoning?: string;
  recommendation_type: 'optimize' | 'bundle' | 'seasonal' | 'upsell';
  created_at: string;
}

export interface PricingInsight {
  id: string;
  user_id: string;
  insight_type: 'high_margin' | 'underperforming' | 'bundle_opportunity' | 'seasonal';
  title: string;
  description: string;
  affected_skus?: any;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'dismissed' | 'implemented';
  created_at: string;
}

export const usePricingData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch pricing scenarios with optimized caching
  const {
    data: scenarios = [],
    isLoading: scenariosLoading,
    error: scenariosError
  } = useQuery({
    queryKey: QUERY_KEYS.PRICING_SCENARIOS(user?.id || ''),
    queryFn: async () => {

      const { data, error } = await supabase
        .from('pricing_scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PricingScenario[];
    },
    enabled: !!user?.id,
  });

  // Fetch pricing recommendations with optimized caching
  const {
    data: recommendations = [],
    isLoading: recommendationsLoading,
    error: recommendationsError
  } = useQuery({
    queryKey: QUERY_KEYS.PRICING_RECOMMENDATIONS(user?.id || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_recommendations')
        .select(`
          *,
          skus (
            id,
            sku,
            name,
            category,
            price,
            cost
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (PricingRecommendation & { skus: any })[];
    },
    enabled: !!user?.id,
  });

  // Fetch pricing insights with optimized caching
  const {
    data: insights = [],
    isLoading: insightsLoading,
    error: insightsError
  } = useQuery({
    queryKey: QUERY_KEYS.PRICING_INSIGHTS(user?.id || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_insights')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PricingInsight[];
    },
    enabled: !!user?.id,
  });

  // Fetch scenario SKU pricing
  const getScenarioSkuPricing = (scenarioId: string) => {
    return useQuery({
      queryKey: ['scenario-sku-pricing', scenarioId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('scenario_sku_pricing')
          .select(`
            *,
            skus (
              id,
              sku,
              name,
              category,
              cost
            )
          `)
          .eq('scenario_id', scenarioId);

        if (error) throw error;
        return data as (ScenarioSkuPricing & { skus: any })[];
      },
      enabled: !!scenarioId,
    });
  };

  // Generate AI recommendations
  const generateRecommendations = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-pricing-optimizer', {
        body: {
          action: 'generate_recommendations'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-insights'] });
      toast.success('AI recommendations generated successfully');
    },
    onError: (error) => {
      console.error('Failed to generate recommendations:', error);
      toast.error('Failed to generate AI recommendations');
    },
  });

  // Create scenario
  const createScenario = useMutation({
    mutationFn: async (scenarioData: { 
      name: string; 
      description?: string; 
      sku_pricing?: any[] 
    }) => {
      const { data, error } = await supabase.functions.invoke('ai-pricing-optimizer', {
        body: {
          action: 'create_scenario',
          data: scenarioData
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-scenarios'] });
      toast.success('Pricing scenario created successfully');
    },
    onError: (error) => {
      console.error('Failed to create scenario:', error);
      toast.error('Failed to create pricing scenario');
    },
  });

  // Clone scenario
  const cloneScenario = useMutation({
    mutationFn: async (scenarioId: string) => {
      // First get the original scenario and its pricing
      const { data: scenario, error: scenarioError } = await supabase
        .from('pricing_scenarios')
        .select('*')
        .eq('id', scenarioId)
        .single();

      if (scenarioError) throw scenarioError;

      const { data: skuPricing, error: pricingError } = await supabase
        .from('scenario_sku_pricing')
        .select('*')
        .eq('scenario_id', scenarioId);

      if (pricingError) throw pricingError;

      // Create new scenario
      const { data: newScenario, error: createError } = await supabase
        .from('pricing_scenarios')
        .insert({
          user_id: user!.id,
          name: `${scenario.name} (Copy)`,
          description: scenario.description,
          is_ai_generated: false,
          created_from_scenario_id: scenarioId
        })
        .select()
        .single();

      if (createError) throw createError;

      // Copy SKU pricing
      if (skuPricing.length > 0) {
        const { error: copyError } = await supabase
          .from('scenario_sku_pricing')
          .insert(
            skuPricing.map(pricing => ({
              scenario_id: newScenario.id,
              sku_id: pricing.sku_id,
              price: pricing.price,
              discount_percent: pricing.discount_percent,
              volume_tier_1_qty: pricing.volume_tier_1_qty,
              volume_tier_1_price: pricing.volume_tier_1_price,
              volume_tier_2_qty: pricing.volume_tier_2_qty,
              volume_tier_2_price: pricing.volume_tier_2_price,
              volume_tier_3_qty: pricing.volume_tier_3_qty,
              volume_tier_3_price: pricing.volume_tier_3_price,
            }))
          );

        if (copyError) throw copyError;
      }

      return newScenario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-scenarios'] });
      toast.success('Scenario cloned successfully');
    },
    onError: (error) => {
      console.error('Failed to clone scenario:', error);
      toast.error('Failed to clone scenario');
    },
  });

  // Delete scenario
  const deleteScenario = useMutation({
    mutationFn: async (scenarioId: string) => {
      const { error } = await supabase
        .from('pricing_scenarios')
        .delete()
        .eq('id', scenarioId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-scenarios'] });
      toast.success('Scenario deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete scenario:', error);
      toast.error('Failed to delete scenario');
    },
  });

  // Dismiss insight
  const dismissInsight = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('pricing_insights')
        .update({ status: 'dismissed' })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-insights'] });
      toast.success('Insight dismissed');
    },
    onError: (error) => {
      console.error('Failed to dismiss insight:', error);
      toast.error('Failed to dismiss insight');
    },
  });

  return {
    // Data
    scenarios,
    recommendations,
    insights,
    
    // Loading states
    scenariosLoading,
    recommendationsLoading,
    insightsLoading,
    
    // Errors
    scenariosError,
    recommendationsError,
    insightsError,
    
    // Mutations
    generateRecommendations,
    createScenario,
    cloneScenario,
    deleteScenario,
    dismissInsight,
    
    // Utilities
    getScenarioSkuPricing,
  };
};