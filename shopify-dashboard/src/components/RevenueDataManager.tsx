import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Database, Trash2, AlertTriangle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFinancialData } from "@/hooks/useFinancialData";

interface RevenueDataManagerProps {
  onDataCleared?: () => void;
}

export function RevenueDataManager({ onDataCleared }: RevenueDataManagerProps) {
  const [isClearing, setIsClearing] = useState(false);
  const { revenueRecords, isLoading } = useFinancialData();

  const handleClearRevenueData = async () => {
    try {
      setIsClearing(true);
      
      // Delete all revenue records
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('record_type', 'revenue');

      if (error) {
        throw error;
      }

      toast.success("All revenue data has been cleared successfully");
      onDataCleared?.();
    } catch (error: any) {
      console.error('Error clearing revenue data:', error);
      toast.error("Failed to clear revenue data: " + error.message);
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Revenue Data Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Revenue Data Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Current revenue records: {revenueRecords.length}</span>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-destructive">Danger Zone</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete all revenue transaction data. This action cannot be undone.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={isClearing || revenueRecords.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isClearing ? "Clearing..." : "Clear All Revenue Data"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      This will permanently delete <strong>{revenueRecords.length} revenue records</strong> from your database.
                    </p>
                    <p>
                      This action cannot be undone. All revenue transactions, including:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Transaction amounts and dates</li>
                      <li>Customer information</li>
                      <li>Chart of account mappings</li>
                      <li>Transaction descriptions and metadata</li>
                    </ul>
                    <p>will be permanently removed.</p>
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>After clearing:</strong> Your revenue analytics will show no data until you import new transactions.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearRevenueData}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Yes, delete all revenue data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {revenueRecords.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No revenue data to manage</p>
            <p className="text-xs">Import revenue data to see management options</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}