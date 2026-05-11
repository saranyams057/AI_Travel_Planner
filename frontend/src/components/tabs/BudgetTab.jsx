import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingDown } from 'lucide-react'

export default function BudgetTab({ data }) {
  if (!data) return <p style={{ color: 'var(--muted)' }}>No budget data available.</p>

  const { breakdown = {}, grandTotal = {}, savingTips = [], chartData = [] } = data

  const defaultColors = ['#c9a84c', '#1a5f7a', '#e8c97a', '#2d8bba', '#805ad5', '#38a169']
  const chartItems = chartData.length > 0 ? chartData : Object.entries(breakdown).map(([name, val], i) => ({
    name, value: Math.round(100 / Object.keys(breakdown).length), color: defaultColors[i % defaultColors.length]
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Grand Total Banner */}
      {grandTotal.groupTotal && (
        <div style={{
          background: 'linear-gradient(135deg, var(--teal) 0%, var(--ink) 100%)',
          borderRadius: 'var(--radius)', padding: '32px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20
        }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Total Trip Cost</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--gold-light)', fontWeight: 700 }}>{grandTotal.groupTotal}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 }}>for the entire group</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Per Person</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'white', fontWeight: 600 }}>{grandTotal.perPerson}</p>
            {data.budgetLevel && <span style={{ background: 'rgba(201,168,76,0.2)', color: 'var(--gold-light)', padding: '4px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, marginTop: 8, display: 'inline-block' }}>{data.budgetLevel}</span>}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Breakdown Table */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 28, boxShadow: '0 2px 12px rgba(13,17,23,0.06)', border: '1px solid rgba(201,168,76,0.1)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20 }}>Cost Breakdown</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(201,168,76,0.2)' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Category</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Per Person</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(breakdown).map(([key, val], i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                  <td style={{ padding: '14px 0', color: 'var(--ink)', fontSize: 15, fontWeight: 500, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</td>
                  <td style={{ padding: '14px 0', textAlign: 'right', color: 'var(--muted)', fontSize: 14 }}>{val?.perPerson || '-'}</td>
                  <td style={{ padding: '14px 0', textAlign: 'right', color: 'var(--teal)', fontWeight: 700, fontSize: 15 }}>{val?.total || val?.groupTotal || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pie Chart */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 28, boxShadow: '0 2px 12px rgba(13,17,23,0.06)', border: '1px solid rgba(201,168,76,0.1)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20 }}>Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={chartItems} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${value}%`} labelLine={false}>
                {chartItems.map((entry, i) => (
                  <Cell key={i} fill={entry.color || defaultColors[i % defaultColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `${val}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Saving Tips */}
      {savingTips.length > 0 && (
        <div style={{ background: 'rgba(201,168,76,0.06)', borderRadius: 'var(--radius)', padding: 28, border: '1px solid rgba(201,168,76,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <TrendingDown size={20} color="var(--gold)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Money-Saving Tips</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {savingTips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'white', borderRadius: 'var(--radius-sm)', padding: '14px 16px', boxShadow: '0 1px 4px rgba(13,17,23,0.06)' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 16, marginTop: 1 }}>{i + 1}</span>
                <p style={{ color: 'var(--ink)', fontSize: 14, lineHeight: 1.5 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
