import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Download, FileSpreadsheet, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

interface ProcessingStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  details?: any;
}

export function GoogleSheetsWorkbook() {
  const [config, setConfig] = useState({
    spreadsheetUrl: '',
  });
  
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  // Fetch sync history
  const { data: lastSync } = useQuery({
    queryKey: ['sync-history', 'google-workbook'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_sync_logs')
        .select('*')
        .eq('integration_name', 'google-workbook')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleSync = async () => {
    if (!config.spreadsheetUrl) {
      toast({
        title: "Missing Information",
        description: "Please enter the Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to process Google Sheets",
        variant: "destructive",
      });
      return;
    }

    setProcessingStatus({
      status: 'processing',
      progress: 20,
      message: 'Connecting to Google Sheets...'
    });

    try {
      // Extract spreadsheet ID from URL
      let spreadsheetId = config.spreadsheetUrl;
      if (spreadsheetId.includes('spreadsheets/d/')) {
        const match = spreadsheetId.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
          spreadsheetId = match[1];
        }
      }

      setProcessingStatus({
        status: 'processing',
        progress: 40,
        message: 'Processing workbook sheets...'
      });

      // Process the Google Sheets workbook
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-google-workbook', {
        body: {
          spreadsheetId,
          spreadsheetUrl: config.spreadsheetUrl,
          user_id: user.id
        }
      });

      if (processError) throw processError;

      setProcessingStatus({
        status: 'completed',
        progress: 100,
        message: `Successfully processed ${processResult.totalRecords || processResult.recordsCreated || 0} records from ${processResult.sheetsProcessed || 0} sheets`,
        details: processResult
      });

      // Invalidate all related queries to refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['financial-records'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-records'] });
      queryClient.invalidateQueries({ queryKey: ['sku-records'] });
      queryClient.invalidateQueries({ queryKey: ['sync-history'] });

      toast({
        title: "Google Sheets Workbook Processed",
        description: `${processResult.totalRecords || processResult.recordsCreated || 0} records imported from ${processResult.sheetsProcessed || 0} sheets`,
      });

    } catch (error) {
      console.error('Google Sheets workbook sync error:', error);
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Failed to process Google Sheets workbook'
      });
      
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : 'Failed to process Google Sheets workbook',
        variant: "destructive",
      });
    }
  };

  const resetSync = () => {
    setProcessingStatus({
      status: 'idle',
      progress: 0,
      message: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-financial-primary" />
          Google Sheets Workbook Sync
        </CardTitle>
        {lastSync && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last sync: {new Date(lastSync.completed_at!).toLocaleString()} 
            ({lastSync.records_processed} records)
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {processingStatus.status === 'idle' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="sheets-url">Google Sheets Workbook URL</Label>
              <Input
                id="sheets-url"
                placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id..."
                value={config.spreadsheetUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, spreadsheetUrl: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Paste the full Google Sheets URL. Make sure the sheet is shared with "Anyone with the link".
              </p>
            </div>
            
            <div className="rounded-lg border p-3 bg-muted/50">
              <h4 className="font-medium text-sm mb-2">🎯 Multi-Sheet Auto-Detection:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Revenue Sheets:</strong> Automatically detects sales, revenue, income data</li>
                <li>• <strong>Expense Sheets:</strong> Identifies costs, expenses, bills automatically</li>
                <li>• <strong>Inventory Sheets:</strong> Finds product, SKU, inventory data</li>
                <li>• <strong>All Sheets:</strong> Processes entire workbook in one operation!</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleSync} 
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Process Google Sheets Workbook
            </Button>
          </>
        )}

        {processingStatus.status !== 'idle' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {processingStatus.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {processingStatus.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
              {processingStatus.status === 'processing' && (
                <Download className="h-5 w-5 text-blue-500 animate-pulse" />
              )}
              <span className="text-sm font-medium">{processingStatus.message}</span>
            </div>
            
            {processingStatus.status !== 'error' && (
              <Progress value={processingStatus.progress} className="w-full" />
            )}

            {processingStatus.details && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <h4 className="font-medium text-sm mb-2">Processing Summary:</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {processingStatus.details.sheetSummary && Object.entries(processingStatus.details.sheetSummary).map(([sheetName, info]: [string, any]) => (
                    <div key={sheetName}>
                      <strong>{sheetName}:</strong> {info.records || 0} records → {info.category} ({info.type})
                    </div>
                  ))}
                  {processingStatus.details.summary && processingStatus.details.summary.map((sheetInfo: any, index: number) => (
                    <div key={index}>
                      <strong>{sheetInfo.name}:</strong> {sheetInfo.records || 0} records → {sheetInfo.category} ({sheetInfo.type})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(processingStatus.status === 'completed' || processingStatus.status === 'error') && (
              <Button onClick={resetSync} variant="outline" className="w-full">
                Process Another Workbook
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}