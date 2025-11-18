// File: src/lib/quickbooks-utils.ts
// - Transforms and normalizes raw QuickBooks data for use in the application.

export type NormalizedRecord = {
  id: string;
  date: string; // ISO format
  total: number;
  lines?: {
    accountId?: string;
    accountName?: string;
    amount: number;
    itemId?: string;
    itemName?: string;
  }[];
  entity?: { id?: string; name?: string }; // Customer or Vendor
  class?: string;
  department?: string;
};

export function normalizeQBRecord(
  raw: any,
  kind: "revenue" | "expense",
): NormalizedRecord {
  const id =
    raw.Id ?? raw.id ?? `${kind}-${Math.random().toString(36).slice(2, 9)}`;
  const date =
    raw.TxnDate ?? raw.txnDate ?? raw.date ?? new Date().toISOString();
  const total = Number(
    raw.TotalAmt ?? raw.totalAmt ?? raw.Total ?? raw.Amount ?? 0,
  );

  const entity = raw.CustomerRef
    ? { id: raw.CustomerRef.value, name: raw.CustomerRef.name }
    : raw.VendorRef
      ? { id: raw.VendorRef.value, name: raw.VendorRef.name }
      : raw.customer
        ? { id: raw.customer.id, name: raw.customer.name }
        : raw.vendor
          ? { id: raw.vendor.id, name: raw.vendor.name }
          : undefined;

  const lines = (raw.Line ?? raw.lines ?? []).map((l: any) => ({
    accountId: l.AccountRef?.value ?? l.accountId,
    accountName: l.AccountRef?.name ?? l.accountName,
    amount: Number(l.Amount ?? l.amount ?? 0),
    itemId:
      l.SalesItemLineDetail?.ItemRef?.value ?? l.ItemRef?.value ?? l.itemId,
    itemName:
      l.SalesItemLineDetail?.ItemRef?.name ?? l.ItemRef?.name ?? l.itemName,
  }));

  return {
    id,
    date: new Date(date).toISOString(),
    total,
    lines,
    entity,
    class: raw.ClassRef?.name,
    department: raw.DepartmentRef?.name,
  };
}

export function groupByMonth(records: NormalizedRecord[]) {
  const buckets: Record<string, NormalizedRecord[]> = {};
  for (const r of records) {
    const d = new Date(r.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!buckets[key]) {
      buckets[key] = [];
    }
    buckets[key].push(r);
  }
  return buckets;
}

export function sumTotals(records: NormalizedRecord[]): number {
  return records.reduce((sum, record) => sum + (Number(record.total) || 0), 0);
}

export function mapToChartSeries(records: NormalizedRecord[]) {
  const buckets = groupByMonth(records);
  const series = Object.keys(buckets).map((key) => ({
    name: key,
    value: sumTotals(buckets[key]),
  }));
  // Ensure chronological order
  series.sort((a, b) => a.name.localeCompare(b.name));
  return series;
}
