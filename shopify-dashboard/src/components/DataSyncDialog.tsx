import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useDataSync } from "@/hooks/useDataSync";
import { useSyncPreferences, ColumnMapping } from "@/hooks/useSyncPreferences";
import { GoogleSheetsWorkbook } from "@/components/GoogleSheetsWorkbook";
import { WorkbookUpload } from "@/components/WorkbookUpload";
import { QuickBooksOAuth } from "@/components/QuickBooksOAuth";
import { supabase } from "@/integrations/supabase/client";

interface DataSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageKey: string;
}

export function DataSyncDialog({ open, onOpenChange, pageKey }: DataSyncDialogProps) {
  const { toast } = useToast();
  const { syncGoogleSheets, syncQuickBooks, isLoading } = useDataSync();
  const { saveSource, loadSource, saveMappingTemplate, listMappingTemplates, loadMappingTemplate } = useSyncPreferences(pageKey);

  const [tab, setTab] = useState("google-sheet");

  // Google Sheet config
  const [gsUrl, setGsUrl] = useState("");
  const [gsSheet, setGsSheet] = useState("");
  const [gsType, setGsType] = useState<'revenue' | 'expense' | 'asset' | 'liability'>('revenue');
  const [useMapping, setUseMapping] = useState(false);
  const [mapping, setMapping] = useState<ColumnMapping>({});

  // Scheduling
  const [enableSchedule, setEnableSchedule] = useState(false);
  const [cron, setCron] = useState("0 8 * * *"); // default daily at 8am

  // QuickBooks
  const [qbSyncType, setQbSyncType] = useState<string>('all');
  const [qbConnection, setQbConnection] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    const remembered = loadSource();
    if (remembered) {
      // Preload remembered per-page source
      if (remembered.sourceType === 'google_sheet') {
        setTab('google-sheet');
        const cfg = remembered.config || {};
        setGsUrl(cfg.spreadsheetUrl || cfg.spreadsheetId || '');
        setGsSheet(cfg.range || '');
        if (cfg.recordType) setGsType(cfg.recordType);
        if (remembered.mapping) {
          setUseMapping(true);
          setMapping(remembered.mapping);
        }
      }
      if (remembered.sourceType === 'quickbooks') {
        setTab('quickbooks');
        if (remembered.config?.syncType) setQbSyncType(remembered.config.syncType);
      }
    }
  }, [open, loadSource]);

  const spreadsheetId = useMemo(() => {
    if (!gsUrl) return '';
    if (gsUrl.includes('spreadsheets/d/')) {
      const match = gsUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : gsUrl;
    }
    return gsUrl;
  }, [gsUrl]);

  const handleSyncGoogleSheet = async () => {
    if (!spreadsheetId || !gsSheet) {
      toast({ title: "Missing info", description: "Enter URL and sheet name", variant: "destructive" });
      return;
    }
    try {
      const result = await syncGoogleSheets({
        spreadsheetId,
        range: gsSheet,
        recordType: gsType,
        mapping: useMapping ? mapping as any : undefined,
        pageKey,
      });

      saveSource({
        sourceType: 'google_sheet',
        config: { spreadsheetId, range: gsSheet, recordType: gsType },
        mapping: useMapping ? mapping : undefined,
      });

      toast({ title: "Synced", description: `Processed ${result.recordsProcessed} records` });
      onOpenChange(false);
    } catch (e) {
      // toast handled by hook
    }
  };

  const handleSaveSchedule = async () => {
    if (!enableSchedule) return;
    if (!spreadsheetId || !gsSheet) {
      toast({ title: "Missing info", description: "Enter URL and sheet name", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from('data_sync_schedules').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      page_key: pageKey,
      source_type: 'google_sheet',
      source_config: { spreadsheetId, range: gsSheet, recordType: gsType },
      cron,
      enabled: true,
    });
    if (error) {
      toast({ title: "Schedule error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Schedule saved", description: `Will run on: ${cron}` });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Sync data for this page</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="google-sheet">Google Sheet</TabsTrigger>
            <TabsTrigger value="google-workbook">GSheet Workbook</TabsTrigger>
            <TabsTrigger value="excel">Excel/CSV</TabsTrigger>
            <TabsTrigger value="quickbooks">QuickBooks</TabsTrigger>
          </TabsList>

          <TabsContent value="google-sheet" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Google Sheets URL</Label>
              <Input placeholder="https://docs.google.com/spreadsheets/d/..." value={gsUrl} onChange={e => setGsUrl(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Sheet name or range</Label>
                <Input placeholder="Sheet1 or Sheet1!A:E" value={gsSheet} onChange={e => setGsSheet(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Record type</Label>
                <Select value={gsType} onValueChange={(v: any) => setGsType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-1">
                <Label>Enable Column Mapping</Label>
                <p className="text-xs text-muted-foreground">Map your sheet headers to amount, description, account, date.</p>
              </div>
              <Switch checked={useMapping} onCheckedChange={setUseMapping} />
            </div>

            {useMapping && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label>Amount header</Label>
                  <Input placeholder="Amount" value={mapping.amount || ''} onChange={e => setMapping(m => ({ ...m, amount: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Description header</Label>
                  <Input placeholder="Description" value={mapping.description || ''} onChange={e => setMapping(m => ({ ...m, description: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Account header</Label>
                  <Input placeholder="Account" value={mapping.account_name || ''} onChange={e => setMapping(m => ({ ...m, account_name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Date header</Label>
                  <Input placeholder="Date" value={mapping.transaction_date || ''} onChange={e => setMapping(m => ({ ...m, transaction_date: e.target.value }))} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-1">
                <Label>Auto-sync schedule</Label>
                <p className="text-xs text-muted-foreground">Use cron format (e.g., 0 8 * * * for daily at 8am)</p>
              </div>
              <Switch checked={enableSchedule} onCheckedChange={setEnableSchedule} />
            </div>
            {enableSchedule && (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label>Cron expression</Label>
                  <Input value={cron} onChange={e => setCron(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={handleSaveSchedule} className="w-full">Save schedule</Button>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                if (useMapping) saveMappingTemplate('default', mapping);
                saveSource({ sourceType: 'google_sheet', config: { spreadsheetId, range: gsSheet, recordType: gsType }, mapping });
                toast({ title: 'Preferences saved' });
              }}>Remember settings</Button>
              <Button onClick={handleSyncGoogleSheet} disabled={isLoading}>Sync now</Button>
            </div>
          </TabsContent>

          <TabsContent value="google-workbook" className="mt-4">
            <GoogleSheetsWorkbook />
          </TabsContent>

          <TabsContent value="excel" className="mt-4">
            <WorkbookUpload />
          </TabsContent>

          <TabsContent value="quickbooks" className="space-y-4 mt-4">
            <QuickBooksOAuth onConnectionChange={(connected, conn) => setQbConnection(connected ? conn : null)} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Sync type</Label>
                <Select value={qbSyncType} onValueChange={(v) => setQbSyncType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
            </div>
            <div className="flex justify-end">
              <Button onClick={async () => {
                if (!qbConnection) {
                  toast({ title: 'Not connected', description: 'Connect QuickBooks first', variant: 'destructive' });
                  return;
                }
                try {
                  const result = await syncQuickBooks({ companyId: qbConnection.company_id, syncType: qbSyncType, pageKey });
                  saveSource({ sourceType: 'quickbooks', config: { syncType: qbSyncType } });
                  toast({ title: 'QuickBooks synced', description: `Processed ${result.recordsProcessed} records` });
                  onOpenChange(false);
                } catch {}
              }}>Sync now</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
