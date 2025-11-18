
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Download, FileSpreadsheet, CheckCircle, AlertCircle, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface SheetPreview {
  name: string;
  headers: string[];
  sampleData: string[][];
  detectedType: 'revenue' | 'expense' | 'sku' | 'inventory';
  confidence: number;
}

interface ProcessingStatus {
  status: 'idle' | 'loading-sheets' | 'previewing' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  details?: any;
}

export function GoogleSheetsSync() {
  const [config, setConfig] = useState({
    spreadsheetUrl: '',
    selectedSheet: '',
    dataType: '' as 'revenue' | 'expense' | 'sku' | 'inventory' | '',
    syncMode: 'append' as 'append' | 'replace'
  });
  
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [sheetPreviews, setSheetPreviews] = useState<SheetPreview[]>([]);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sync history
  const { data: lastSync } = useQuery({
    queryKey: ['sync-history', 'google-sheets-single'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_sync_logs')
        .select('*')
        .eq('integration_name', 'google_sheets')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const extractSpreadsheetId = (url: string) => {
    if (url.includes('spreadsheets/d/')) {
      const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : url;
    }
    return url;
  };

  const loadSheets = async () => {
    if (!config.spreadsheetUrl) return;

    setProcessingStatus({
      status: 'loading-sheets',
      progress: 30,
      message: 'Loading spreadsheet information...'
    });

    try {
      const spreadsheetId = extractSpreadsheetId(config.spreadsheetUrl);
      
      // Use server-side function to securely access Google Sheets API
      const { data, error } = await supabase.functions.invoke('preview-google-sheet', {
        body: {
          spreadsheetId,
          action: 'list_sheets'
        }
      });
      
      if (error) {
        throw new Error('Failed to access Google Sheets. Please ensure the sheet is shared publicly.');
      }

      setAvailableSheets(data.sheets || []);
      setProcessingStatus({
        status: 'idle',
        progress: 0,
        message: 'Sheets loaded successfully'
      });

    } catch (error) {
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Failed to load sheets'
      });
    }
  };

  const previewSheet = async () => {
    if (!config.spreadsheetUrl || !config.selectedSheet) return;

    setProcessingStatus({
      status: 'previewing',
      progress: 50,
      message: 'Loading sheet preview...'
    });

    try {
      const spreadsheetId = extractSpreadsheetId(config.spreadsheetUrl);
      
      const { data, error } = await supabase.functions.invoke('preview-google-sheet', {
        body: {
          spreadsheetId,
          sheetName: config.selectedSheet
        }
      });

      if (error) throw error;

      setSheetPreviews([data.preview]);
      setProcessingStatus({
        status: 'previewing',
        progress: 100,
        message: 'Preview loaded'
      });

    } catch (error) {
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Failed to preview sheet'
      });
    }
  };

  const syncSheet = async () => {
    if (!config.spreadsheetUrl || !config.selectedSheet) {
      toast({
        title: "Missing Information",
        description: "Please select a spreadsheet and sheet",
        variant: "destructive",
      });
      return;
    }

    setProcessingStatus({
      status: 'processing',
      progress: 20,
      message: 'Starting sync...'
    });

    try {
      const spreadsheetId = extractSpreadsheetId(config.spreadsheetUrl);
      const range = config.selectedSheet;

      setProcessingStatus({
        status: 'processing',
        progress: 60,
        message: 'Syncing data...'
      });

      const { data, error } = await supabase.functions.invoke('sync-google-sheets', {
        body: {
          spreadsheetId,
          range,
          recordType: config.dataType || 'revenue',
          syncMode: config.syncMode
        }
      });

      if (error) throw error;

      setProcessingStatus({
        status: 'completed',
        progress: 100,
        message: `Successfully synced ${data.recordsProcessed} records`,
        details: data
      });

      // Invalidate all related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ['financial-records'] });
      queryClient.invalidateQueries({ queryKey: ['social-media-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-orders'] });
      queryClient.invalidateQueries({ queryKey: ['website-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['sync-history'] });

      toast({
        title: "Google Sheets Sync Complete",
        description: `${data.recordsProcessed} records imported successfully`,
      });

    } catch (error) {
      console.error('Google Sheets sync error:', error);
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Failed to sync Google Sheets'
      });
      
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : 'Failed to sync Google Sheets',
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
    setSheetPreviews([]);
    setAvailableSheets([]);
    setConfig(prev => ({ ...prev, selectedSheet: '', dataType: '' }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-financial-primary" />
          Single Google Sheet Sync
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
              <Label htmlFor="sheet-url">Google Sheets URL</Label>
              <div className="flex gap-2">
                <Input
                  id="sheet-url"
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id..."
                  value={config.spreadsheetUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, spreadsheetUrl: e.target.value }))}
                />
                <Button onClick={loadSheets} variant="outline">
                  Load Sheets
                </Button>
              </div>
            </div>

            {availableSheets.length > 0 && (
              <div className="space-y-2">
                <Label>Select Sheet/Tab</Label>
                <Select value={config.selectedSheet} onValueChange={(value) => setConfig(prev => ({ ...prev, selectedSheet: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a sheet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSheets.map((sheet) => (
                      <SelectItem key={sheet} value={sheet}>{sheet}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {config.selectedSheet && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Data Type</Label>
                    <Select value={config.dataType} onValueChange={(value: any) => setConfig(prev => ({ ...prev, dataType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-detect or choose..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expense">Expenses</SelectItem>
                        <SelectItem value="sku">SKU/Products</SelectItem>
                        <SelectItem value="inventory">Inventory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sync Mode</Label>
                    <Select value={config.syncMode} onValueChange={(value: any) => setConfig(prev => ({ ...prev, syncMode: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="append">Append New Data</SelectItem>
                        <SelectItem value="replace">Replace Existing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={previewSheet} variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Data
                  </Button>
                  <Button onClick={syncSheet} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Sync Data
                  </Button>
                </div>
              </>
            )}
            
            <div className="rounded-lg border p-3 bg-muted/50">
              <h4 className="font-medium text-sm mb-2">📋 Required Sheet Format:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Revenue:</strong> Description, Amount, Date, Category</li>
                <li>• <strong>Expenses:</strong> Description, Amount, Date, Category, Account</li>
                <li>• <strong>SKU:</strong> SKU#, Description, Sale Price, Cost (optional)</li>
                <li>• <strong>Inventory:</strong> Item, Quantity, Value, Category</li>
              </ul>
            </div>
          </>
        )}

        {processingStatus.status === 'previewing' && sheetPreviews.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Data Preview</span>
            </div>
            
            {sheetPreviews.map((preview, index) => (
              <div key={index} className="rounded-lg border p-3 bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{preview.name}</h4>
                  <Badge variant={preview.confidence > 0.7 ? 'default' : 'secondary'}>
                    {preview.detectedType} ({Math.round(preview.confidence * 100)}% confidence)
                  </Badge>
                </div>
                
                <div className="text-xs space-y-1">
                  <div><strong>Headers:</strong> {preview.headers.join(', ')}</div>
                  <div><strong>Sample Data:</strong></div>
                  <div className="bg-background rounded p-2 font-mono text-xs">
                    {preview.sampleData.slice(0, 3).map((row, i) => (
                      <div key={i}>{row.join(' | ')}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button onClick={syncSheet} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Confirm & Sync
              </Button>
              <Button onClick={resetSync} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {processingStatus.status !== 'idle' && processingStatus.status !== 'previewing' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {processingStatus.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {processingStatus.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
              {(processingStatus.status === 'processing' || processingStatus.status === 'loading-sheets') && (
                <Download className="h-5 w-5 text-blue-500 animate-pulse" />
              )}
              <span className="text-sm font-medium">{processingStatus.message}</span>
            </div>
            
            {processingStatus.status !== 'error' && (
              <Progress value={processingStatus.progress} className="w-full" />
            )}

            {processingStatus.details && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <h4 className="font-medium text-sm mb-2">Sync Results:</h4>
                <div className="text-xs text-muted-foreground">
                  Records processed: {processingStatus.details.recordsProcessed}
                </div>
              </div>
            )}

            {(processingStatus.status === 'completed' || processingStatus.status === 'error') && (
              <Button onClick={resetSync} variant="outline" className="w-full">
                Sync Another Sheet
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
