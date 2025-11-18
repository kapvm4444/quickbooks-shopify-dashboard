import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";

export interface FilterState {
  payeeSearch: string;
  descriptionSearch: string;
  chartAccountCode: string;
  minAmount: string;
  maxAmount: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  recurringFilter: 'all' | 'recurring' | 'one-time';
}

interface UnifiedFilterToolbarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  chartAccounts: Array<{ account_code: string; account_name: string }>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function UnifiedFilterToolbar({ 
  filters, 
  onFiltersChange, 
  chartAccounts,
  isCollapsed,
  onToggleCollapse 
}: UnifiedFilterToolbarProps) {
  const debouncedPayeeSearch = useDebouncedValue(filters.payeeSearch, 300);
  const debouncedDescriptionSearch = useDebouncedValue(filters.descriptionSearch, 300);
  const debouncedMinAmount = useDebouncedValue(filters.minAmount, 500);
  const debouncedMaxAmount = useDebouncedValue(filters.maxAmount, 500);

  const hasActiveFilters = 
    filters.payeeSearch ||
    filters.descriptionSearch ||
    filters.chartAccountCode ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.startDate ||
    filters.endDate;

  const clearFilters = () => {
    onFiltersChange({
      payeeSearch: '',
      descriptionSearch: '',
      chartAccountCode: '',
      minAmount: '',
      maxAmount: '',
      startDate: undefined,
      endDate: undefined,
      recurringFilter: 'all',
    });
  };

  const updateFilter = (key: keyof FilterState, value: string | Date | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleCollapse}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          {hasActiveFilters && (
            <div className="text-sm text-muted-foreground">
              {Object.values(filters).filter(Boolean).length} filter(s) active
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Payee/Customer Search */}
            <div>
              <label className="text-sm font-medium mb-2 block">Customer/Payee</label>
              <Input
                placeholder="Search customer/payee..."
                value={filters.payeeSearch}
                onChange={(e) => updateFilter('payeeSearch', e.target.value)}
                className="h-9"
              />
            </div>

            {/* Description Search */}
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Input
                placeholder="Search description..."
                value={filters.descriptionSearch}
                onChange={(e) => updateFilter('descriptionSearch', e.target.value)}
                className="h-9"
              />
            </div>

            {/* Chart Account Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Chart Account</label>
              <Select
                value={filters.chartAccountCode}
                onValueChange={(value) => updateFilter('chartAccountCode', value === 'all' ? '' : value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All accounts</SelectItem>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  {chartAccounts.map((account) => (
                    <SelectItem key={account.account_code} value={account.account_code}>
                      {account.account_code} - {account.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Amount Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => updateFilter('minAmount', e.target.value)}
                  className="h-9"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => updateFilter('maxAmount', e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 w-full justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => updateFilter('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 w-full justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => updateFilter('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}