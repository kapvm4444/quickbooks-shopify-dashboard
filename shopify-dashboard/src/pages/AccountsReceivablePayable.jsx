import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ARTransactionForm } from "@/components/ar-ap/ARTransactionForm";
import { APTransactionForm } from "@/components/ar-ap/APTransactionForm";
import { TransactionTable } from "@/components/ar-ap/TransactionTable";
import { ARAPSummaryCards } from "@/components/ar-ap/ARAPSummaryCards";
import { AgingAnalysisCards } from "@/components/ar-ap/AgingAnalysisCards";
import { AgingAnalysisTable } from "@/components/ar-ap/AgingAnalysisTable";
import { calculateAgingBuckets } from "@/utils/calculations/agingAnalysis";
import { formatCurrency } from "@/utils/formatters/numberFormatters";

const staticARTransactions = [
  {
    id: "ar1",
    customer_name: "Client A",
    amount: 1500,
    due_date: "2025-11-20",
    status: "outstanding",
    issue_date: "2025-10-21",
  },
  {
    id: "ar2",
    customer_name: "Client B",
    amount: 2500,
    due_date: "2025-10-10",
    status: "overdue",
    issue_date: "2025-09-10",
  },
  {
    id: "ar3",
    customer_name: "Client C",
    amount: 1000,
    due_date: "2025-10-15",
    status: "paid",
    issue_date: "2025-09-15",
    paid_date: "2025-10-14",
  },
];

const staticAPTransactions = [
  {
    id: "ap1",
    vendor_name: "Supplier X",
    amount: 800,
    due_date: "2025-11-25",
    status: "outstanding",
    issue_date: "2025-10-26",
  },
  {
    id: "ap2",
    vendor_name: "Supplier Y",
    amount: 1200,
    due_date: "2025-10-05",
    status: "overdue",
    issue_date: "2025-09-05",
  },
  {
    id: "ap3",
    vendor_name: "Supplier Z",
    amount: 2000,
    due_date: "2025-10-20",
    status: "paid",
    issue_date: "2025-09-20",
    paid_date: "2025-10-18",
  },
];

export default function AccountsReceivablePayable() {
  const arTransactions = staticARTransactions;
  const apTransactions = staticAPTransactions;
  const arLoading = false;
  const apLoading = false;

  // Calculate aging analysis for AR
  const arAgingAnalysis = useMemo(() => {
    return calculateAgingBuckets(arTransactions);
  }, [arTransactions]);

  // Calculate aging analysis for AP
  const apAgingAnalysis = useMemo(() => {
    return calculateAgingBuckets(apTransactions);
  }, [apTransactions]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              AR/AP Management
            </h1>
            <p className="text-muted-foreground">
              Manage your Accounts Receivable and Accounts Payable transactions
            </p>
          </div>
        </div>

        <ARAPSummaryCards
          arTransactions={arTransactions}
          apTransactions={apTransactions}
        />

        <Tabs defaultValue="ar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
            <TabsTrigger value="ap">Accounts Payable</TabsTrigger>
          </TabsList>

          <TabsContent value="ar" className="space-y-6">
            <AgingAnalysisCards
              buckets={arAgingAnalysis.buckets}
              title="AR Aging Analysis"
            />

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add New AR Entry</CardTitle>
                  <CardDescription>
                    Create a new accounts receivable transaction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ARTransactionForm type="ar" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AR Summary</CardTitle>
                  <CardDescription>
                    Quick overview of your receivables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Outstanding
                      </span>
                      <span className="font-medium">
                        {formatCurrency(
                          arTransactions
                            .filter((t) => t.status === "outstanding")
                            .reduce((sum, t) => sum + t.amount, 0),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Overdue
                      </span>
                      <span className="font-medium text-destructive">
                        {formatCurrency(
                          arTransactions
                            .filter((t) => t.status === "overdue")
                            .reduce((sum, t) => sum + t.amount, 0),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Paid
                      </span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(
                          arTransactions
                            .filter((t) => t.status === "paid")
                            .reduce((sum, t) => sum + t.amount, 0),
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AR Transactions</CardTitle>
                <CardDescription>
                  All your accounts receivable transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable
                  data={arTransactions}
                  type="ar"
                  isLoading={arLoading}
                />
              </CardContent>
            </Card>

            <AgingAnalysisTable
              transactions={arAgingAnalysis.transactions}
              title="AR Aging Details"
            />
          </TabsContent>

          <TabsContent value="ap" className="space-y-6">
            <AgingAnalysisCards
              buckets={apAgingAnalysis.buckets}
              title="AP Aging Analysis"
            />

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add New AP Entry</CardTitle>
                  <CardDescription>
                    Create a new accounts payable transaction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <APTransactionForm type="ap" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AP Summary</CardTitle>
                  <CardDescription>
                    Quick overview of your payables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Outstanding
                      </span>
                      <span className="font-medium">
                        {formatCurrency(
                          apTransactions
                            .filter((t) => t.status === "outstanding")
                            .reduce((sum, t) => sum + t.amount, 0),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Overdue
                      </span>
                      <span className="font-medium text-destructive">
                        {formatCurrency(
                          apTransactions
                            .filter((t) => t.status === "overdue")
                            .reduce((sum, t) => sum + t.amount, 0),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Paid
                      </span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(
                          apTransactions
                            .filter((t) => t.status === "paid")
                            .reduce((sum, t) => sum + t.amount, 0),
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AP Transactions</CardTitle>
                <CardDescription>
                  All your accounts payable transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable
                  data={apTransactions}
                  type="ap"
                  isLoading={apLoading}
                />
              </CardContent>
            </Card>

            <AgingAnalysisTable
              transactions={apAgingAnalysis.transactions}
              title="AP Aging Details"
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
