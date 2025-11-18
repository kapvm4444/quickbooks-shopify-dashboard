import { supabase } from "@/integrations/supabase/client";

export async function seedFundingDemoData(userId: string) {
  // Clean up existing demo data first
  await supabase.from("funding_next_steps").delete().eq("user_id", userId).ilike("description", "%DEMO_SEED%");
  await supabase.from("use_of_funds").delete().eq("user_id", userId).eq("notes", "DEMO_SEED");
  await supabase.from("funding_round_investments").delete().eq("user_id", userId).eq("notes", "DEMO_SEED");
  await supabase.from("funding_rounds").delete().eq("user_id", userId).eq("notes", "DEMO_SEED");
  await supabase.from("investors").delete().eq("user_id", userId).eq("notes", "DEMO_SEED");

  // Helper to find or create investor
  const findOrCreateInvestor = async (name: string, email: string) => {
    const { data: byEmail } = await supabase
      .from("investors")
      .select("id")
      .eq("user_id", userId)
      .eq("email", email)
      .maybeSingle();
    if (byEmail?.id) return byEmail.id as string;
    
    const { data: byName } = await supabase
      .from("investors")
      .select("id")
      .eq("user_id", userId)
      .eq("name", name)
      .maybeSingle();
    if (byName?.id) return byName.id as string;
    
    const { data: created, error: insErr } = await supabase
      .from("investors")
      .insert({ user_id: userId, name, email, notes: "DEMO_SEED" })
      .select("id")
      .maybeSingle();
    if (insErr) throw insErr;
    return (created?.id as string) ?? "";
  };

  const johnId = await findOrCreateInvestor("John Doe", "john.doe@example.com");
  const mariaId = await findOrCreateInvestor("Maria Smith", "maria.smith@example.com");
  const joseId = await findOrCreateInvestor("Jose Perez", "jose.perez@example.com");

  // Helper to upsert round
  const upsertRound = async (payload: any, match: { round_type: string; start_date?: string | null }) => {
    const query = supabase
      .from("funding_rounds")
      .select("id")
      .eq("user_id", userId)
      .eq("round_type", match.round_type);
    const { data: existing } = await (match.start_date
      ? query.eq("start_date", match.start_date).maybeSingle()
      : query.maybeSingle());
    if (existing?.id) return existing.id as string;
    
    const { data: inserted, error } = await supabase
      .from("funding_rounds")
      .insert({ ...payload, user_id: userId, notes: "DEMO_SEED" })
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return (inserted?.id as string) ?? "";
  };

  // Round 1: Convertible Note
  const cnRoundId = await upsertRound(
    {
      round_type: "Convertible Note",
      target_amount: 200000,
      status: "active",
      start_date: "2025-08-01",
      end_date: "2025-08-31",
    },
    { round_type: "Convertible Note", start_date: "2025-08-01" }
  );

  // CN investments
  const cnInvestments = [
    { 
      investor_id: johnId, 
      amount: 25000, 
      status: "closed",
      role: "participant",
      security_type: "Convertible Note",
      description: "Early investor backing after product prototype",
      valuation_cap: 2000000,
      interest_rate: 8,
      maturity_date: "2027-08-01",
      other_terms: JSON.stringify(["Anti-Dilution Protection", "Information Rights"])
    },
    { 
      investor_id: mariaId, 
      amount: 125000, 
      status: "funded",
      role: "lead",
      security_type: "Convertible Note",
      description: "Lead investor with strong domain expertise in fintech",
      valuation_cap: 2000000,
      discount: 20,
      interest_rate: 8,
      maturity_date: "2027-08-01",
      pro_rata_rights: true,
      board_seat: false,
      other_terms: JSON.stringify(["Most Favored Nation", "Pro Rata Rights", "Anti-Dilution Protection"])
    },
    { 
      investor_id: joseId, 
      amount: 10000, 
      status: "pending",
      role: "participant",
      security_type: "Convertible Note",
      description: "Angel investor with operational experience",
      valuation_cap: 2000000,
      discount: 15,
      interest_rate: 8,
      maturity_date: "2027-08-01"
    },
  ];

  for (const inv of cnInvestments) {
    await supabase.from("funding_round_investments").insert({
      user_id: userId,
      round_id: cnRoundId,
      investor_id: inv.investor_id,
      amount: inv.amount,
      status: inv.status,
      role: inv.role,
      security_type: inv.security_type,
      description: inv.description,
      valuation_cap: inv.valuation_cap,
      discount: inv.discount,
      interest_rate: inv.interest_rate,
      maturity_date: inv.maturity_date,
      pro_rata_rights: inv.pro_rata_rights,
      board_seat: inv.board_seat,
      other_terms: inv.other_terms,
      currency: "USD",
      notes: "DEMO_SEED",
    });
  }

  // Helper for random splits
  const randomSplit = (parts: number) => {
    const cuts = Array.from({ length: parts - 1 }, () => Math.random());
    cuts.sort((a, b) => a - b);
    const segs: number[] = [];
    let prev = 0;
    for (const c of cuts) {
      segs.push(c - prev);
      prev = c;
    }
    segs.push(1 - prev);
    return segs;
  };

  const categories = [
    "Product Development",
    "Marketing",
    "Operations",
    "Hiring",
    "Legal",
  ];

  // Use of Funds for CN
  const cnPercents = randomSplit(categories.length);
  let cnSumAmt = 0;
  const cnTarget = 200000;
  for (let i = 0; i < categories.length; i++) {
    const pct = Math.round(cnPercents[i] * 100);
    let amt = Math.round((pct / 100) * cnTarget);
    if (i === categories.length - 1) amt = cnTarget - cnSumAmt;
    cnSumAmt += amt;
    await supabase.from("use_of_funds").insert({
      user_id: userId,
      round_id: cnRoundId,
      category: categories[i],
      amount: amt,
      notes: "DEMO_SEED",
    });
  }

  // Next Steps for CN
  const nextOwners = ["Founder", "CFO", "COO"];
  const nextStatuses = ["open", "in_progress", "completed"];
  const randBetween = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const t = s + Math.random() * (e - s);
    return new Date(t).toISOString().slice(0, 10);
  };
  
  const cnSteps = [
    "Send term sheet to lead",
    "Schedule investor update call",
    "Prepare diligence docs",
    "Finalize cap table review",
  ];
  
  for (const desc of cnSteps) {
    await supabase.from("funding_next_steps").insert({
      user_id: userId,
      round_id: cnRoundId,
      description: `${desc} (DEMO_SEED)`,
      owner: nextOwners[Math.floor(Math.random() * nextOwners.length)],
      status: nextStatuses[Math.floor(Math.random() * nextStatuses.length)],
      due_date: randBetween("2025-08-01", "2025-08-31"),
    });
  }

  // Round 2: Pre-Seed
  const psRoundId = await upsertRound(
    {
      round_type: "Pre-Seed",
      target_amount: 100000,
      status: "planned",
      start_date: "2025-09-01",
      end_date: "2025-10-01",
    },
    { round_type: "Pre-Seed", start_date: "2025-09-01" }
  );

  // Pre-Seed investments
  const psInvestments = [
    { 
      investor_id: johnId, 
      amount: 40000, 
      status: "funded",
      role: "lead",
      security_type: "SAFE (Simple Agreement for Future Equity)",
      description: "Lead SAFE investor providing strategic guidance",
      valuation_cap: 500000,
      discount: 15,
      pro_rata_rights: true,
      other_terms: JSON.stringify(["Most Favored Nation", "Pro Rata Rights"])
    },
    { 
      investor_id: mariaId, 
      amount: 35000, 
      status: "closed",
      role: "participant",
      security_type: "SAFE (Simple Agreement for Future Equity)",
      description: "Follow-on investment from convertible note round",
      valuation_cap: 500000,
      discount: 10
    },
    { 
      investor_id: joseId, 
      amount: 25000, 
      status: "pending",
      role: "participant",
      security_type: "SAFE (Simple Agreement for Future Equity)",
      description: "Angel investment with advisory support",
      valuation_cap: 500000,
      discount: 15,
      other_terms: JSON.stringify(["Advisory Equity Pool Access"])
    },
  ];

  for (const inv of psInvestments) {
    await supabase.from("funding_round_investments").insert({
      user_id: userId,
      round_id: psRoundId,
      investor_id: inv.investor_id,
      amount: inv.amount,
      status: inv.status,
      role: inv.role,
      security_type: inv.security_type,
      description: inv.description,
      valuation_cap: inv.valuation_cap,
      discount: inv.discount,
      pro_rata_rights: inv.pro_rata_rights,
      other_terms: inv.other_terms,
      currency: "USD",
      notes: "DEMO_SEED",
    });
  }

  // Use of Funds for Pre-Seed
  const psPercents = randomSplit(categories.length);
  let psSumAmt = 0;
  const psTarget = 100000;
  for (let i = 0; i < categories.length; i++) {
    const pct = Math.round(psPercents[i] * 100);
    let amt = Math.round((pct / 100) * psTarget);
    if (i === categories.length - 1) amt = psTarget - psSumAmt;
    psSumAmt += amt;
    await supabase.from("use_of_funds").insert({
      user_id: userId,
      round_id: psRoundId,
      category: categories[i],
      amount: amt,
      notes: "DEMO_SEED",
    });
  }

  // Next Steps for Pre-Seed
  const psSteps = [
    "Identify potential angels",
    "Draft investor memo",
    "Line up demo day pitch",
  ];
  
  for (const desc of psSteps) {
    await supabase.from("funding_next_steps").insert({
      user_id: userId,
      round_id: psRoundId,
      description: `${desc} (DEMO_SEED)`,
      owner: nextOwners[Math.floor(Math.random() * nextOwners.length)],
      status: nextStatuses[Math.floor(Math.random() * nextStatuses.length)],
      due_date: randBetween("2025-09-01", "2025-10-01"),
    });
  }
}
