import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface SKUUpdateInput {
  current_po_number?: string;
  name?: string;
  category?: string;
  price?: number;
  cost?: number;
  quantity?: number;
  status?: string;
}

export const useUpdateSKU = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: SKUUpdateInput }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("skus")
        .update(input)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-records"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-data"] });
      toast.success("SKU updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update SKU: " + error.message);
    },
  });
};