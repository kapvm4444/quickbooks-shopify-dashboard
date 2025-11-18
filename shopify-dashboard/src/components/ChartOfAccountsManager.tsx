import React, { useState } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { ChartOfAccounts } from '@/types/business';
import { handleError, showErrorToUser } from '@/lib/error-handling';
import { getDetailTypesForAccountType } from '@/lib/qbo-detail-types';

interface ChartOfAccountsManagerProps {
  onSelect?: (account: ChartOfAccounts) => void;
  selectedAccountId?: string;
}

export const ChartOfAccountsManager: React.FC<ChartOfAccountsManagerProps> = ({ 
  onSelect, 
  selectedAccountId 
}) => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccounts | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: 'expense' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
    parent_account_id: '',
    qbo_detail_type: '',
  });

  const { data: accountsData = [], refetch } = useSupabaseQuery<ChartOfAccounts[]>(
    ['chart-of-accounts'],
    'chart_of_accounts',
    '*',
    { is_active: true }
  ) as { data: ChartOfAccounts[], refetch: () => void };

  // Sort accounts numerically by account_code
  const accounts = [...accountsData].sort((a, b) => {
    const codeA = parseInt(a.account_code) || 0;
    const codeB = parseInt(b.account_code) || 0;
    return codeA - codeB;
  });

  // No auto-population - user will manually add accounts

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showErrorToUser('You must be logged in to manage accounts');
      return;
    }

    // Validate form data
    if (!formData.account_code.trim()) {
      toast.error('Account code is required');
      return;
    }
    
    if (!formData.account_name.trim()) {
      toast.error('Account name is required');
      return;
    }

    try {
      const accountData = {
        user_id: user.id,
        account_code: formData.account_code.trim(),
        account_name: formData.account_name.trim(),
        account_type: formData.account_type,
        parent_account_id: formData.parent_account_id || null,
        qbo_detail_type: formData.qbo_detail_type || null,
      };

      if (editingAccount) {
        const { error } = await supabase
          .from('chart_of_accounts')
          .update(accountData)
          .eq('id', editingAccount.id);
        
        if (error) {
          handleError(error, { operation: 'updateAccount', component: 'ChartOfAccountsManager' });
          showErrorToUser('Failed to update account');
          return;
        }
        toast.success('Account updated successfully');
      } else {
        
        // First check if an account with this code already exists (including inactive ones)
        const { data: existingAccount } = await supabase
          .from('chart_of_accounts')
          .select('id, is_active')
          .eq('user_id', user.id)
          .eq('account_code', formData.account_code.trim())
          .maybeSingle();

        if (existingAccount) {
          if (existingAccount.is_active) {
            toast.error('An account with this code already exists');
            return;
          } else {
            // Reactivate the existing inactive account
            const { error } = await supabase
              .from('chart_of_accounts')
              .update({
                ...accountData,
                is_active: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingAccount.id);
            
            if (error) {
              handleError(error, { operation: 'reactivateAccount', component: 'ChartOfAccountsManager' });
              showErrorToUser('Failed to reactivate account');
              return;
            }
            toast.success('Account reactivated successfully');
          }
        } else {
          // Create new account
          const { data, error } = await supabase
            .from('chart_of_accounts')
            .insert(accountData)
            .select();
          
          if (error) {
            handleError(error, { operation: 'createAccount', component: 'ChartOfAccountsManager' });
            showErrorToUser('Failed to create account');
            return;
          }
          
          toast.success('Account created successfully');
        }
      }

      setFormData({
        account_code: '',
        account_name: '',
        account_type: 'expense' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
        parent_account_id: '',
        qbo_detail_type: '',
      });
      setEditingAccount(null);
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      handleError(error as Error, { operation: 'saveAccount', component: 'ChartOfAccountsManager' });
      showErrorToUser('An unexpected error occurred');
    }
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
    setIsDialogOpen(true);
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
      handleError(error as Error, { operation: 'deactivateAccount', component: 'ChartOfAccountsManager' });
      showErrorToUser('Failed to deactivate account');
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-blue-100 text-blue-800';
      case 'liability': return 'bg-red-100 text-red-800';
      case 'equity': return 'bg-purple-100 text-purple-800';
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Chart of Accounts</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setFormData({
                account_code: '',
                account_name: '',
                account_type: 'expense' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
                parent_account_id: '',
                qbo_detail_type: '',
              });
              setEditingAccount(null);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="e.g., Office Supplies & Software"
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
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAccount ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Show accounts based on expanded state */}
            {(isExpanded ? accounts : accounts.slice(0, 5)).map((account) => (
              <TableRow 
                key={account.id}
                className={selectedAccountId === account.id ? 'bg-muted' : ''}
                onClick={() => onSelect?.(account)}
              >
                <TableCell className="font-mono">{account.account_code}</TableCell>
                <TableCell>{account.account_name}</TableCell>
                <TableCell>
                  <Badge className={getAccountTypeColor(account.account_type)}>
                    {account.account_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(account);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(account.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Show expand/collapse button only if there are more than 5 accounts */}
        {accounts.length > 5 && (
          <div className="mt-4 flex justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="text-xs text-muted-foreground mr-2">
                {isExpanded 
                  ? `Showing all ${accounts.length} accounts` 
                  : `Showing 5 of ${accounts.length} accounts`
                }
              </span>
              <ChevronDown 
                className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};