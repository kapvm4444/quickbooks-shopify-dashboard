import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useFinancialData } from '@/hooks/useFinancialData';
import { handleError, showErrorToUser } from '@/lib/error-handling';

interface ExpenseDataManagerProps {
  onDataCleared?: () => void;
}

export const ExpenseDataManager: React.FC<ExpenseDataManagerProps> = ({ onDataCleared }) => {
  const [isClearing, setIsClearing] = useState(false);
  const { expenseRecords, isLoading } = useFinancialData();

  const handleClearExpenseData = async () => {
    setIsClearing(true);
    
    try {
      const { data: deletedCount, error } = await supabase.rpc('clear_user_expense_data');
      
      if (error) throw error;
      
      toast.success(`Successfully cleared ${deletedCount} expense records`);
      onDataCleared?.();
    } catch (error) {
      handleError(error as Error, { operation: 'clearExpenseData', component: 'ExpenseDataManager' });
      showErrorToUser('Failed to clear expense data');
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Data Management...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Data Management
        </CardTitle>
        <CardDescription>
          Manage your expense data. Use with caution as these actions cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Current Expense Records:</span>
            <span className="text-lg font-bold">{expenseRecords.length}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            These are all expense records currently in your database from all sources (CSV uploads, QuickBooks, etc.)
          </p>
        </div>

        <div className="border border-destructive rounded-lg p-4 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-destructive mb-2">Clear All Expense Data</h4>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete all {expenseRecords.length} expense records from your database. 
                This action cannot be undone. Your chart of accounts will remain unchanged.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={expenseRecords.length === 0 || isClearing}
                    className="w-full sm:w-auto"
                  >
                    {isClearing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Clearing Data...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Expense Data
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        This action will permanently delete <strong>{expenseRecords.length} expense records</strong> from your database.
                      </p>
                      <p className="text-destructive font-medium">
                        This action cannot be undone.
                      </p>
                      <p>
                        Your chart of accounts and other data will remain unchanged. Only expense transactions will be removed.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearExpenseData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Delete All Expense Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">After Clearing Data</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• You can upload a new CSV file with properly mapped chart of accounts</li>
            <li>• Your existing chart of accounts structure will remain intact</li>
            <li>• New imports will use the updated account mapping</li>
            <li>• All revenue and other non-expense data will be preserved</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};