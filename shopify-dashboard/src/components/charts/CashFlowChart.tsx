import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', inflow: 85000, outflow: 65000, balance: 120000 },
  { month: 'Feb', inflow: 92000, outflow: 58000, balance: 154000 },
  { month: 'Mar', inflow: 108000, outflow: 72000, balance: 190000 },
  { month: 'Apr', inflow: 95000, outflow: 68000, balance: 217000 },
  { month: 'May', inflow: 112000, outflow: 75000, balance: 254000 },
  { month: 'Jun', inflow: 125000, outflow: 82000, balance: 297000 },
]

export function CashFlowChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [
            `$${(value as number).toLocaleString()}`, 
            name === 'inflow' ? 'Cash Inflow' : 
            name === 'outflow' ? 'Cash Outflow' : 'Cash Balance'
          ]}
        />
        <Line 
          type="monotone" 
          dataKey="inflow" 
          stroke="hsl(var(--financial-revenue))" 
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--financial-revenue))' }}
          name="Cash Inflow"
        />
        <Line 
          type="monotone" 
          dataKey="outflow" 
          stroke="hsl(var(--financial-expense))" 
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--financial-expense))' }}
          name="Cash Outflow"
        />
        <Line 
          type="monotone" 
          dataKey="balance" 
          stroke="hsl(var(--financial-primary))" 
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--financial-primary))' }}
          name="Cash Balance"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}