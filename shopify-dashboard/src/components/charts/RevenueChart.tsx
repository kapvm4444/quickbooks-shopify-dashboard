import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useFinancialData } from '@/hooks/useFinancialData'
import { Loader2 } from 'lucide-react'

export function RevenueChart() {
  const { chartData, isLoading } = useFinancialData()

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="text-lg mb-2">No Revenue Data Found</div>
          <div className="text-sm">Upload sales transactions to see revenue trends</div>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [
            `$${(value as number).toLocaleString()}`, 
            name === 'revenue' ? 'Revenue' : 'Expenses'
          ]}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stackId="1" 
          stroke="hsl(var(--financial-revenue))" 
          fill="hsl(var(--financial-revenue))" 
          fillOpacity={0.6}
        />
        <Area 
          type="monotone" 
          dataKey="expenses" 
          stackId="2" 
          stroke="hsl(var(--financial-expense))" 
          fill="hsl(var(--financial-expense))" 
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}