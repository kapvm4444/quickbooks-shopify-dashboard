import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoundRow { id: string; round_type: string; date: string | null; }

export default function RoundSelector({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  const { data = [] } = useSupabaseQuery<RoundRow>(["funding_rounds"], "funding_rounds", "id, round_type, date");
  const current = value ?? "all";
  return (
    <Select value={current} onValueChange={(v) => onChange(v === "all" ? null : v)}>
      <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select round" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All rounds</SelectItem>
        {data.map((r) => (
          <SelectItem key={r.id} value={r.id}>{r.round_type}{r.date ? ` • ${r.date}` : ""}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
