import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface SKUCostDetail {
  id: string;
  user_id: string;
  sku_id: string;
  unit_cost: number;
  packaging_cost: number;
  shipping_cost: number;
  warehousing_cost: number;
  duties_customs_cost: number;
  pick_pack_cost: number;
  storage_cost: number;
  outbound_shipping_cost: number;
  labor_cost: number;
  assembly_cost: number;
  export_cost: number;
  quality_control_cost: number;
  compliance_cost: number;
  other_cost_1: number;
  other_cost_1_description?: string;
  other_cost_2: number;
  other_cost_2_description?: string;
  total_landed_cost: number;
  target_margin_percent: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SKUCostInput {
  sku_id: string;
  unit_cost?: number;
  packaging_cost?: number;
  shipping_cost?: number;
  warehousing_cost?: number;
  duties_customs_cost?: number;
  pick_pack_cost?: number;
  storage_cost?: number;
  outbound_shipping_cost?: number;
  labor_cost?: number;
  assembly_cost?: number;
  export_cost?: number;
  quality_control_cost?: number;
  compliance_cost?: number;
  other_cost_1?: number;
  other_cost_1_description?: string;
  other_cost_2?: number;
  other_cost_2_description?: string;
  target_margin_percent?: number;
  notes?: string;
}

export const useSKUCostDetails = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sku-cost-details", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("sku_cost_details")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as SKUCostDetail[];
    },
    enabled: !!user,
  });
};

export const useCreateSKUCostDetail = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: SKUCostInput) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("sku_cost_details")
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sku-cost-details"] });
      queryClient.invalidateQueries({ queryKey: ["financial-records"] });
      toast.success("SKU cost details created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create SKU cost details: " + error.message);
    },
  });
};

export const useUpdateSKUCostDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<SKUCostInput> }) => {
      const { data, error } = await supabase
        .from("sku_cost_details")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sku-cost-details"] });
      queryClient.invalidateQueries({ queryKey: ["financial-records"] });
      toast.success("SKU cost details updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update SKU cost details: " + error.message);
    },
  });
};

export const useDeleteSKUCostDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sku_cost_details")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sku-cost-details"] });
      queryClient.invalidateQueries({ queryKey: ["financial-records"] });
      toast.success("SKU cost details deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete SKU cost details: " + error.message);
    },
  });
};