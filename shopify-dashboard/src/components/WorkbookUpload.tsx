import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  details?: any;
}

export function WorkbookUpload() {
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files",
        variant: "destructive",
      });
      return;
    }

    // Support Excel workbooks and CSV files
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv', // .csv
    ];

    const isValidFile = validTypes.includes(file.type) || 
                       file.name.match(/\.(xlsx|xls|csv)$/i);

    if (!isValidFile) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel workbook (.xlsx, .xls) or CSV file (.csv)",
        variant: "destructive",
      });
      return;
    }

    setProcessingStatus({
      status: 'uploading',
      progress: 10,
      message: 'Uploading file...'
    });

    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('workbooks')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const isCSV = file.name.toLowerCase().endsWith('.csv');
      setProcessingStatus({
        status: 'uploading',
        progress: 30,
        message: isCSV ? 'File uploaded, processing CSV data...' : 'File uploaded, processing workbook...'
      });

      // Create workbook upload record
      const { data: workbookRecord, error: recordError } = await supabase
        .from('workbook_uploads')
        .insert({
          filename: file.name,
          file_path: uploadData.path,
          upload_status: 'completed',
          processing_status: 'pending',
          user_id: user.id
        })
        .select()
        .single();

      if (recordError) throw recordError;

      setProcessingStatus({
        status: 'processing',
        progress: 50,
        message: isCSV ? 'Parsing CSV data...' : 'Parsing workbook sheets...'
      });

      // Process the workbook/CSV
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-workbook', {
        body: {
          workbookId: workbookRecord.id,
          filePath: uploadData.path,
          filename: file.name,
          user_id: user.id
        }
      });

      if (processError) throw processError;

      setProcessingStatus({
        status: 'completed',
        progress: 100,
        message: `Successfully processed ${processResult.recordsCreated} records from ${processResult.sheetsProcessed} ${isCSV ? 'CSV file' : 'sheets'}`,
        details: processResult
      });

      // Invalidate all related queries to refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['financial-records'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-records'] });
      queryClient.invalidateQueries({ queryKey: ['sku-records'] });
      queryClient.invalidateQueries({ queryKey: ['sync-history'] });

      toast({
        title: "File Processed Successfully",
        description: `${processResult.recordsCreated} records imported from ${processResult.sheetsProcessed} ${isCSV ? 'CSV file' : 'sheets'}`,
      });

    } catch (error) {
      console.error('File upload error:', error);
      
      let errorMessage = 'Failed to process file';
      if (error instanceof Error) {
        errorMessage = error.message;
        // Handle specific RLS policy violations
        if (error.message.includes('row-level security')) {
          errorMessage = 'Authentication error: Please try logging out and back in';
        }
      }
      
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: errorMessage
      });
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetUpload = () => {
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
          File Upload & Auto-Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {processingStatus.status === 'idle' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="workbook-file">Upload Files</Label>
              <Input
                id="workbook-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Upload Excel workbooks (.xlsx, .xls) with multiple sheets or individual CSV files (.csv). Data will be automatically analyzed and routed to the appropriate dashboard.
              </p>
            </div>
            
            <div className="rounded-lg border p-3 bg-muted/50">
              <h4 className="font-medium text-sm mb-2">🎯 Smart File Processing:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Excel Workbooks:</strong> Multiple sheets processed and routed automatically</li>
                <li>• <strong>CSV Files:</strong> Individual sheets with smart content detection</li>
                <li>• <strong>Revenue Data:</strong> "Sales", "Revenue", "Income" → Revenue Dashboard</li>
                <li>• <strong>Expense Data:</strong> "Expenses", "Costs", "Bills" → Expenses Dashboard</li>
                <li>• <strong>Inventory Data:</strong> "Inventory", "Products", "SKU" → Inventory Dashboard</li>
                <li>• <strong>Cash Flow Data:</strong> "Cash Flow", "Bank", "Balance" → Cash Flow Dashboard</li>
              </ul>
            </div>
          </>
        )}

        {processingStatus.status !== 'idle' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {processingStatus.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {processingStatus.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
              {(processingStatus.status === 'uploading' || processingStatus.status === 'processing') && (
                <Upload className="h-5 w-5 text-blue-500 animate-pulse" />
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
                  {(processingStatus.details.summary || []).map((sheetInfo: any, index: number) => (
                    <div key={index}>
                      <strong>{sheetInfo.name}:</strong> {sheetInfo.records} records → {sheetInfo.category} ({sheetInfo.type})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(processingStatus.status === 'completed' || processingStatus.status === 'error') && (
              <Button onClick={resetUpload} variant="outline" className="w-full">
                Upload Another File
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}