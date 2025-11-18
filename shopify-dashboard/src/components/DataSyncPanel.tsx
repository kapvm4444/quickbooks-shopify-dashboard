
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickBooksOAuth } from "./QuickBooksOAuth";
import { WorkbookUpload } from "./WorkbookUpload";
import { GoogleSheetsWorkbook } from "./GoogleSheetsWorkbook";
import { GoogleSheetsSync } from "./GoogleSheetsSync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataSync } from "@/hooks/useDataSync";
import { useState } from "react";
import { Loader2, Download, Calculator, Upload, FileSpreadsheet, TableProperties, Sheet } from "lucide-react";

export function DataSyncPanel() {
  const { syncQuickBooks, isLoading } = useDataSync();
  const [syncType, setSyncType] = useState('all');
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState<any>(null);

  const handleQuickBooksSync = async () => {
    if (!isConnected || !connection) {
      alert('Please connect to QuickBooks first');
      return;
    }
    await syncQuickBooks({ 
      companyId: connection.company_id,
      syncType 
    });
  };

  const handleConnectionChange = (connected: boolean, connectionData?: any) => {
    setIsConnected(connected);
    setConnection(connectionData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Data Integration</h2>
        <p className="text-muted-foreground">Import your financial data from multiple sources</p>
      </div>
      
      <Tabs defaultValue="single-sheet" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single-sheet" className="flex items-center gap-2">
            <Sheet className="h-4 w-4" />
            Single Sheet
          </TabsTrigger>
          <TabsTrigger value="quickbooks" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            QuickBooks
          </TabsTrigger>
          <TabsTrigger value="excel" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Excel Workbooks
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <TableProperties className="h-4 w-4" />
            Google Workbooks
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="single-sheet" className="space-y-4">
          <GoogleSheetsSync />
        </TabsContent>
        
        <TabsContent value="quickbooks" className="space-y-4">
          <QuickBooksOAuth onConnectionChange={handleConnectionChange} />
          
          {isConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-financial-accent" />
                  Sync QuickBooks Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="sync-type" className="text-sm font-medium">Sync Type</label>
                  <Select value={syncType} onValueChange={setSyncType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Revenue & Expenses</SelectItem>
                      <SelectItem value="revenue">All Revenue Transactions</SelectItem>
                      <SelectItem value="expenses">All Expense Transactions</SelectItem>
                      <SelectItem value="Invoice">Invoices Only</SelectItem>
                      <SelectItem value="SalesReceipt">Sales Receipts Only</SelectItem>
                      <SelectItem value="Payment">Payments Only</SelectItem>
                      <SelectItem value="Deposit">Deposits Only</SelectItem>
                      <SelectItem value="Bill">Bills Only</SelectItem>
                      <SelectItem value="Expense">Direct Expenses Only</SelectItem>
                      <SelectItem value="Check">Checks Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleQuickBooksSync} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Sync QuickBooks Data
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="excel" className="space-y-4">
          <WorkbookUpload />
        </TabsContent>
        
        <TabsContent value="google" className="space-y-4">
          <GoogleSheetsWorkbook />
        </TabsContent>
      </Tabs>
    </div>
  );
}
