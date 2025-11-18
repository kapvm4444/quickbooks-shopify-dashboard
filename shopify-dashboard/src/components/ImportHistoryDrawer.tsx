import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

interface ImportHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageKey: string;
}

interface RunRow {
  id: string;
  source_type: string;
  source_identifier: string | null;
  started_at: string;
  completed_at: string | null;
  status: string;
  records_created: number;
  records_updated: number;
  summary: any;
}

interface DiffRow {
  id: string;
  run_id: string;
  change_type: string;
  record_external_id: string | null;
  before: any;
  after: any;
  error: string | null;
  created_at: string;
}

export function ImportHistoryDrawer({ open, onOpenChange, pageKey }: ImportHistoryDrawerProps) {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [selectedRun, setSelectedRun] = useState<RunRow | null>(null);
  const [diffs, setDiffs] = useState<DiffRow[] | null>(null);
  const [loadingDiffs, setLoadingDiffs] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data, error } = await supabase
        .from('data_import_runs')
        .select('*')
        .eq('page_key', pageKey)
        .order('started_at', { ascending: false })
        .limit(20);
      if (!error && data) setRuns(data as any);
    })();
  }, [open, pageKey]);

  const loadDiffs = async (run: RunRow) => {
    setSelectedRun(run);
    setLoadingDiffs(true);
    const { data, error } = await supabase
      .from('data_import_diffs')
      .select('*')
      .eq('run_id', run.id)
      .limit(200);
    setLoadingDiffs(false);
    if (!error) setDiffs(data as any);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0">
        <DrawerHeader>
          <DrawerTitle>Import history</DrawerTitle>
        </DrawerHeader>
        <div className="grid grid-cols-12 gap-0 max-h-[70vh] overflow-hidden">
          <div className="col-span-5 overflow-auto border-r">
            <div className="p-3 space-y-2">
              {runs.map((run) => (
                <button key={run.id} onClick={() => loadDiffs(run)} className={`w-full text-left rounded-md border p-2 hover:bg-muted ${selectedRun?.id===run.id ? 'bg-muted' : ''}`}>
                  <div className="text-sm font-medium">{run.source_type} • {run.status}</div>
                  <div className="text-xs text-muted-foreground">{new Date(run.started_at).toLocaleString()}</div>
                  <div className="text-xs">+{run.records_created} / ~{run.records_updated}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-7 overflow-auto">
            <div className="p-4">
              {selectedRun ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Run details</div>
                      <div className="text-xs text-muted-foreground">{selectedRun.source_identifier || 'N/A'}</div>
                    </div>
                    <div className="text-xs">{selectedRun.status}</div>
                  </div>
                  <Separator />
                  {loadingDiffs && <div className="text-sm">Loading diffs…</div>}
                  {!loadingDiffs && diffs && diffs.length === 0 && (
                    <div className="text-sm text-muted-foreground">No diffs recorded for this run.</div>
                  )}
                  {!loadingDiffs && diffs && diffs.length > 0 && (
                    <div className="space-y-2">
                      {diffs.map(d => (
                        <div key={d.id} className="rounded-md border p-2">
                          <div className="text-xs font-medium">{d.change_type} • {d.record_external_id || ''}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <pre className="bg-muted p-2 rounded overflow-auto">{JSON.stringify(d.before, null, 2)}</pre>
                            <pre className="bg-muted p-2 rounded overflow-auto">{JSON.stringify(d.after, null, 2)}</pre>
                          </div>
                          {d.error && <div className="text-xs text-red-600">{d.error}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Select a run to view details.</div>
              )}
            </div>
          </div>
        </div>
        <div className="p-3 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
