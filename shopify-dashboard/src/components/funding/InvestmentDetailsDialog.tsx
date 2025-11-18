import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, FileText, User, Building, Shield } from "lucide-react";

interface InvestmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment: {
    id: string;
    investor_id: string;
    amount: number | null;
    role: string | null;
    status: string | null;
    security_type: string | null;
    other_terms: string | null;
    description: string | null;
    notes: string | null;
    share_price?: number | null;
    num_shares?: number | null;
    valuation_cap?: number | null;
    discount?: number | null;
    interest_rate?: number | null;
    maturity_date?: string | null;
    pro_rata_rights?: boolean | null;
    board_seat?: boolean | null;
    liquidation_preference?: string | null;
  };
  investorName: string;
}

export default function InvestmentDetailsDialog({
  open,
  onOpenChange,
  investment,
  investorName,
}: InvestmentDetailsDialogProps) {
  const formatCurrency = (n?: number | null) => 
    n == null ? "-" : `$${Number(n).toLocaleString()}`;
  
  const formatDate = (d?: string | null) => 
    d ? new Date(d).toLocaleDateString() : "-";
  
  const formatPercentage = (n?: number | null) => 
    n == null ? "-" : `${Number(n)}%`;

  // Parse other_terms JSON to get selected terms
  const parseOtherTerms = (termsJson: string | null) => {
    if (!termsJson) return [];
    try {
      const parsed = JSON.parse(termsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const selectedTerms = parseOtherTerms(investment.other_terms);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Investment Details - {investorName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Investor</div>
                <div className="font-semibold">{investorName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Amount</div>
                <div className="font-semibold text-primary">{formatCurrency(investment.amount)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Role</div>
                <Badge variant="secondary" className="capitalize">
                  {investment.role || "participant"}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge 
                  variant={investment.status === 'closed' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {investment.status || "committed"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Financial Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Financial Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Security Type</div>
                <div className="font-medium">{investment.security_type || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Share Price</div>
                <div className="font-medium">{formatCurrency(investment.share_price)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Number of Shares</div>
                <div className="font-medium">{investment.num_shares?.toLocaleString() || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Valuation Cap</div>
                <div className="font-medium">{formatCurrency(investment.valuation_cap)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Discount Rate</div>
                <div className="font-medium">{formatPercentage(investment.discount)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Interest Rate</div>
                <div className="font-medium">{formatPercentage(investment.interest_rate)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Maturity Date</div>
                <div className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(investment.maturity_date)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Liquidation Preference</div>
                <div className="font-medium">{investment.liquidation_preference || "-"}</div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Terms & Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Legal Terms & Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Pro-Rata Rights</div>
                  <Badge variant={investment.pro_rata_rights ? "default" : "secondary"}>
                    {investment.pro_rata_rights ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Board Seat</div>
                  <Badge variant={investment.board_seat ? "default" : "secondary"}>
                    {investment.board_seat ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              
              {selectedTerms.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Additional Terms</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTerms.map((term, index) => (
                      <Badge key={index} variant="outline">
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(investment.description || investment.notes) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {investment.description && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Description</div>
                    <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                      {investment.description}
                    </div>
                  </div>
                )}
                {investment.notes && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Notes</div>
                    <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                      {investment.notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}