import React, { useState, useMemo } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit, Search, Download, Upload, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { ChartOfAccounts } from '@/types/business';
import { handleError, showErrorToUser } from '@/lib/error-handling';
import { getDetailTypesForAccountType } from '@/lib/qbo-detail-types';

interface FullChartOfAccountsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FullChartOfAccountsDialog: React.FC<FullChartOfAccountsDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccounts | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: 'expense' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
    parent_account_id: '',
    qbo_detail_type: '',
  });

  const { data: allAccounts = [], refetch } = useSupabaseQuery<ChartOfAccounts[]>(
    ['chart-of-accounts-all'],
    'chart_of_accounts' as any,
    '*',
    showInactive ? {} : { is_active: true }
  ) as { data: ChartOfAccounts[], refetch: () => void };

  const filteredAccounts = useMemo(() => {
    return allAccounts.filter(account => {
      const matchesSearch = 
        account.account_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.account_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || account.account_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [allAccounts, searchTerm, filterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const accountData = {
        user_id: user.id,
        account_code: formData.account_code,
        account_name: formData.account_name,
        account_type: formData.account_type,
        parent_account_id: formData.parent_account_id || null,
        qbo_detail_type: formData.qbo_detail_type || null,
        is_active: true,
      };

      if (editingAccount) {
        const { error } = await supabase
          .from('chart_of_accounts')
          .update(accountData)
          .eq('id', editingAccount.id);
        
        if (error) throw error;
        toast.success('Account updated successfully');
      } else {
        const { error } = await supabase
          .from('chart_of_accounts')
          .insert(accountData);
        
        if (error) throw error;
        toast.success('Account created successfully');
      }

      resetForm();
      refetch();
      } catch (error) {
        handleError(error as Error, { operation: 'saveAccount', component: 'FullChartOfAccountsDialog' });
        showErrorToUser('Failed to save account');
    }
  };

  const resetForm = () => {
    setFormData({
      account_code: '',
      account_name: '',
      account_type: 'expense',
      parent_account_id: '',
      qbo_detail_type: '',
    });
    setEditingAccount(null);
    setIsEditing(false);
  };

  const handleEdit = (account: ChartOfAccounts) => {
    setFormData({
      account_code: account.account_code,
      account_name: account.account_name,
      account_type: account.account_type,
      parent_account_id: account.parent_account_id || '',
      qbo_detail_type: (account as any).qbo_detail_type || '',
    });
    setEditingAccount(account);
    setIsEditing(true);
  };

  const handleDelete = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('chart_of_accounts')
        .update({ is_active: false })
        .eq('id', accountId);
      
      if (error) throw error;
      toast.success('Account deactivated successfully');
      refetch();
    } catch (error) {
      handleError(error as Error, { operation: 'deactivateAccount', component: 'FullChartOfAccountsDialog' });
      showErrorToUser('Failed to deactivate account');
    }
  };

  const handleReactivate = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('chart_of_accounts')
        .update({ is_active: true })
        .eq('id', accountId);
      
      if (error) throw error;
      toast.success('Account reactivated successfully');
      refetch();
    } catch (error) {
      handleError(error as Error, { operation: 'reactivateAccount', component: 'FullChartOfAccountsDialog' });
      showErrorToUser('Failed to reactivate account');
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'liability': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'equity': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'revenue': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'expense': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const accountStats = useMemo(() => {
    const stats = {
      total: allAccounts.length,
      active: allAccounts.filter(a => a.is_active).length,
      byType: {} as Record<string, number>
    };
    
    allAccounts.forEach(account => {
      if (account.is_active) {
        stats.byType[account.account_type] = (stats.byType[account.account_type] || 0) + 1;
      }
    });
    
    return stats;
  }, [allAccounts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Complete Chart of Accounts Management</DialogTitle>
          <DialogDescription>
            Manage all your chart of accounts with advanced filtering and editing capabilities.
          </DialogDescription>
        </DialogHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold">{accountStats.active}</div>
            <div className="text-sm text-muted-foreground">Active Accounts</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold">{accountStats.byType.expense || 0}</div>
            <div className="text-sm text-muted-foreground">Expense Accounts</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold">{accountStats.byType.revenue || 0}</div>
            <div className="text-sm text-muted-foreground">Revenue Accounts</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold">{accountStats.byType.asset || 0}</div>
            <div className="text-sm text-muted-foreground">Asset Accounts</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="asset">Assets</SelectItem>
              <SelectItem value="liability">Liabilities</SelectItem>
              <SelectItem value="equity">Equity</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowInactive(!showInactive)}
            className="whitespace-nowrap"
          >
            {showInactive ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </Button>
          <Button onClick={() => setIsEditing(true)} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-muted p-4 rounded-lg mb-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="account_code">Account Code</Label>
                <Input
                  id="account_code"
                  value={formData.account_code}
                  onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                  placeholder="e.g., 7050"
                  required
                />
              </div>
              <div>
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  placeholder="e.g., Office Supplies"
                  required
                />
              </div>
              <div>
                <Label htmlFor="account_type">Account Type</Label>
                <Select 
                  value={formData.account_type} 
                  onValueChange={(value: any) => setFormData({ ...formData, account_type: value, qbo_detail_type: '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="qbo_detail_type">QBO Detail Type</Label>
                <Select 
                  value={formData.qbo_detail_type} 
                  onValueChange={(value: string) => setFormData({ ...formData, qbo_detail_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select detail type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDetailTypesForAccountType(formData.account_type).map((detailType) => (
                      <SelectItem key={detailType} value={detailType}>
                        {detailType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end space-x-2">
                <Button type="submit" className="flex-1">
                  {editingAccount ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Accounts Table */}
        <div className="flex-1 overflow-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>QBO Detail Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow 
                  key={account.id}
                  className={!account.is_active ? 'opacity-60' : ''}
                >
                  <TableCell className="font-mono font-medium">{account.account_code}</TableCell>
                  <TableCell className="font-medium">{account.account_name}</TableCell>
                  <TableCell>
                    <Badge className={getAccountTypeColor(account.account_type)}>
                      {account.account_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(account as any).qbo_detail_type || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.is_active ? 'default' : 'secondary'}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {account.is_active ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReactivate(account.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground text-center pt-4">
          Showing {filteredAccounts.length} of {allAccounts.length} accounts
        </div>
      </DialogContent>
    </Dialog>
  );
};