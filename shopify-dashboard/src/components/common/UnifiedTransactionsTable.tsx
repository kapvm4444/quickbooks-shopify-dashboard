import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Edit2, Save, X, Filter, Repeat, Check, ChevronLeft, ChevronRight, ArrowUpDown, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatters/numberFormatters";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { FinancialRecord } from "@/types/business";
import { UnifiedFilterToolbar, FilterState } from "./UnifiedFilterToolbar";
import { UnifiedBulkEditPanel } from "./UnifiedBulkEditPanel";
import { useUnifiedFilters } from "@/hooks/useUnifiedFilters";

interface ChartAccount {
  account_code: string;
  account_name: string;
}

interface EditingRow {
  id: string;
  payee: string;
  chartAccountCode: string;
  chartAccountName: string;
  description: string;
  transactionDate: string;
}

interface UnifiedTransactionsTableProps {
  recordType: 'revenue' | 'expense';
}

const ITEMS_PER_PAGE = 20;

type SortField = 'transaction_date' | 'amount' | 'payee' | 'chart_account_name' | 'description';

export function UnifiedTransactionsTable({ recordType }: UnifiedTransactionsTableProps) {
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>('transaction_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTransactions, setSelectedTransactions] = useState<FinancialRecord[]>([]);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    payeeSearch: '',
    descriptionSearch: '',
    chartAccountCode: '',
    minAmount: '',
    maxAmount: '',
    startDate: undefined,
    endDate: undefined,
    recurringFilter: 'all',
  });

  const { data: transactionRecords = [], isLoading, refetch } = useSupabaseQuery<FinancialRecord>(
    [`${recordType}-records-all`],
    'financial_records',
    '*',
    { record_type: recordType }
  );

  const { data: chartAccounts = [] } = useSupabaseQuery<ChartAccount>(
    ['chart-accounts'],
    'chart_of_accounts',
    'account_code, account_name',
    { is_active: true }
  );

  // Apply filters
  const { filteredTransactions } = useUnifiedFilters(transactionRecords, filters);

  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'transaction_date':
          aValue = new Date(a.transaction_date).getTime();
          bValue = new Date(b.transaction_date).getTime();
          break;
        case 'amount':
          aValue = Number(a.amount);
          bValue = Number(b.amount);
          break;
        case 'payee':
          aValue = (a.payee || '').toLowerCase();
          bValue = (b.payee || '').toLowerCase();
          break;
        case 'chart_account_name':
          aValue = (a.chart_account_name || '').toLowerCase();
          bValue = (b.chart_account_name || '').toLowerCase();
          break;
        case 'description':
          aValue = (a.description || '').toLowerCase();
          bValue = (b.description || '').toLowerCase();
          break;
        default:
          aValue = 0;
          bValue = 0;
      }
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    return sorted;
  }, [filteredTransactions, sortField, sortDirection]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    return sortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedTransactions, currentPage]);

  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(0);
  };

  const toggleTransactionSelection = (transaction: FinancialRecord) => {
    const isSelected = selectedTransactions.some(t => t.id === transaction.id);
    if (isSelected) {
      setSelectedTransactions(prev => prev.filter(t => t.id !== transaction.id));
    } else {
      setSelectedTransactions(prev => [...prev, transaction]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.length === paginatedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(paginatedTransactions);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const startEditing = (transaction: FinancialRecord) => {
    setEditingRow({
      id: transaction.id,
      payee: transaction.payee || '',
      chartAccountCode: transaction.chart_account_code || '',
      chartAccountName: transaction.chart_account_name || '',
      description: transaction.description || '',
      transactionDate: transaction.transaction_date.split('T')[0]
    });
  };

  const cancelEditing = () => {
    setEditingRow(null);
  };

  const saveChanges = async () => {
    if (!editingRow) return;

    try {
      // Format date to avoid timezone issues by setting time to noon
      const dateValue = editingRow.transactionDate;
      const formattedDate = dateValue ? `${dateValue}T12:00:00.000Z` : editingRow.transactionDate;
      
      const { error } = await supabase
        .from('financial_records')
        .update({
          payee: editingRow.payee,
          chart_account_code: editingRow.chartAccountCode,
          chart_account_name: editingRow.chartAccountName,
          description: editingRow.description,
          transaction_date: formattedDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRow.id);

      if (error) throw error;

      toast.success("Transaction updated successfully");
      setEditingRow(null);
      refetch();
    } catch (error: any) {
      toast.error("Failed to update transaction: " + error.message);
    }
  };

  const updateEditingField = (field: keyof EditingRow, value: string) => {
    if (!editingRow) return;
    setEditingRow({ ...editingRow, [field]: value });
  };

  const handleIndividualDelete = async (transactionId: string) => {
    try {
      console.log('Attempting to delete transaction:', transactionId);
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', transactionId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      toast.success("Transaction deleted successfully");
      refetch();
    } catch (error: any) {
      console.error('Failed to delete transaction:', error);
      toast.error("Failed to delete transaction: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{recordType === 'revenue' ? 'Revenue' : 'Expense'} Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayLabel = recordType === 'revenue' ? 'Revenue' : 'Expense';

  return (
    <div className="space-y-4">
      <UnifiedFilterToolbar
        filters={filters}
        onFiltersChange={setFilters}
        chartAccounts={chartAccounts}
        isCollapsed={isFilterCollapsed}
        onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
      />
      
      <UnifiedBulkEditPanel
        selectedTransactions={selectedTransactions}
        onSelectionChange={setSelectedTransactions}
        chartAccounts={chartAccounts}
        onRefresh={refetch}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{displayLabel} Transactions</span>
              {filteredTransactions.length !== transactionRecords.length && (
                <Badge variant="secondary">
                  {filteredTransactions.length} of {transactionRecords.length}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Total: {formatCurrency(sortedTransactions.reduce((sum, t) => sum + Number(t.amount), 0))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('transaction_date')}
                >
                  <div className="flex items-center gap-2">
                    Date {getSortIcon('transaction_date')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('payee')}
                >
                  <div className="flex items-center gap-2">
                    {recordType === 'revenue' ? 'Customer' : 'Payee'} {getSortIcon('payee')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('chart_account_name')}
                >
                  <div className="flex items-center gap-2">
                    Chart Account {getSortIcon('chart_account_name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center gap-2">
                    Description {getSortIcon('description')}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Amount {getSortIcon('amount')}
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => {
                const isEditing = editingRow?.id === transaction.id;
                const isSelected = selectedTransactions.some(t => t.id === transaction.id);
                
                return (
                  <TableRow 
                    key={transaction.id}
                    className={isSelected ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleTransactionSelection(transaction)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editingRow.transactionDate}
                          onChange={(e) => updateEditingField('transactionDate', e.target.value)}
                          className="h-8"
                        />
                      ) : (
                        new Date(transaction.transaction_date).toLocaleDateString()
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingRow.payee}
                          onChange={(e) => updateEditingField('payee', e.target.value)}
                          className="h-8"
                          placeholder={`Enter ${recordType === 'revenue' ? 'customer' : 'payee'}`}
                        />
                      ) : (
                        <span className={!transaction.payee ? 'text-muted-foreground italic' : ''}>
                          {transaction.payee || `No ${recordType === 'revenue' ? 'customer' : 'payee'}`}
                        </span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editingRow.chartAccountCode}
                            onChange={(e) => updateEditingField('chartAccountCode', e.target.value)}
                            className="h-8"
                            placeholder="Account code"
                          />
                          <Select
                            value={editingRow.chartAccountCode}
                            onValueChange={(value) => {
                              const account = chartAccounts.find(acc => acc.account_code === value);
                              updateEditingField('chartAccountCode', value);
                              updateEditingField('chartAccountName', account?.account_name || '');
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue 
                                placeholder={
                                  editingRow.chartAccountCode ? (
                                    (() => {
                                      const selectedAccount = chartAccounts.find(acc => acc.account_code === editingRow.chartAccountCode);
                                      return selectedAccount 
                                        ? `${selectedAccount.account_code} - ${selectedAccount.account_name}`
                                        : editingRow.chartAccountCode;
                                    })()
                                  ) : (
                                    "Select account"
                                  )
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {chartAccounts.map((account) => (
                                <SelectItem key={account.account_code} value={account.account_code}>
                                  {account.account_code} - {account.account_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="text-sm">
                          {transaction.chart_account_code && (
                            <span className="font-mono text-xs bg-muted px-1 rounded">
                              {transaction.chart_account_code}
                            </span>
                          )}
                          {transaction.chart_account_name && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {transaction.chart_account_name}
                            </div>
                          )}
                          {!transaction.chart_account_code && !transaction.chart_account_name && (
                            <span className="text-xs text-muted-foreground italic">
                              {transaction.category || 'Uncategorized'}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingRow.description}
                          onChange={(e) => updateEditingField('description', e.target.value)}
                          className="h-8"
                          placeholder="Enter description"
                        />
                      ) : (
                        <span className="text-sm">{transaction.description}</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(transaction.amount))}
                    </TableCell>
                    
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={saveChanges}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(transaction)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleIndividualDelete(transaction.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </div>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}