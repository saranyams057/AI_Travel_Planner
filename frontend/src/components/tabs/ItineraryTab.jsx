import { useState } from 'react'
import { ChevronDown, ChevronUp, Sun, Coffee, Moon, Utensils } from 'lucide-react'

const periodConfig = {
  morning: { icon: <Coffee size={16} />, label: 'Morning', color: '#f6ad55', bg: 'rgba(246,173,85,0.1)' },
  afternoon: { icon: <Sun size={16} />, label: 'Afternoon', color: 'var(--teal)', bg: 'rgba(26,95,122,0.08)' },
  evening: { icon: <Moon size={16} />, label: 'Evening', color: '#805ad5', bg: 'rgba(128,90,213,0.08)' },
}

export default function ItineraryTab({ data }) {
  const [openDay, setOpenDay] = useState(0)
  const days = data?.days || []

  if (!days.length) return <p style={{ color: 'var(--muted)' }}>No itinerary data available.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 8 }}>
        Click on each day to expand the detailed schedule.
      </p>
      {days.map((day, i) => (
        <DayCard key={i} day={day} index={i} isOpen={openDay === i} onToggle={() => setOpenDay(openDay === i ? -1 : i)} />
      ))}
    </div>
  )
}

function DayCard({ day, index, isOpen, onToggle }) {
  return (
    <div style={{
      background: 'white', borderRadius: 'var(--radius)',
      boxShadow: isOpen ? 'var(--shadow)' : '0 2px 8px rgba(13,17,23,0.05)',
      border: `1px solid ${isOpen ? 'rgba(201,168,76,0.4)' : 'rgba(201,168,76,0.1)'}`,
      overflow: 'hidden', transition: 'all 0.3s ease'
    }}>
      {/* Day Header */}
      <button onClick={onToggle} style={{
        width: '100%', padding: '20px 28px', background: 'none', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
        fontFamily: 'var(--font-body)', textAlign: 'left'
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: isOpen ? 'var(--gold)' : 'rgba(201,168,76,0.12)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.3s'
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: isOpen ? 'var(--ink)' : 'var(--muted)', lineHeight: 1 }}>DAY</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: isOpen ? 'var(--ink)' : 'var(--teal)', lineHeight: 1 }}>{day.day || index + 1}</span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>
              {day.theme || `Day ${day.day || index + 1}`}
            </span>
            {day.date && <span style={{ color: 'var(--muted)', fontSize: 13 }}>{day.date}</span>}
          </div>
          {day.weather_note && (
            <p style={{ color: 'var(--teal)', fontSize: 13, marginTop: 4 }}>🌤️ {day.weather_note}</p>
          )}
        </div>
        {isOpen ? <ChevronUp size={20} color="var(--muted)" /> : <ChevronDown size={20} color="var(--muted)" />}
      </button>

      {/* Day Content */}
      {isOpen && (
        <div style={{ padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Activities */}
          {['morning', 'afternoon', 'evening'].map(period => {
            const cfg = periodConfig[period]
            const activity = day[period]
            if (!activity) return null
            return (
              <div key={period} style={{
                background: cfg.bg, borderRadius: 'var(--radius-sm)',
                padding: '16px 20px', borderLeft: `4px solid ${cfg.color}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: cfg.color }}>
                  {cfg.icon}
                  <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>{cfg.label}</span>
                </div>
                <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>
                  {activity.activity}
                </p>
                {activity.place && <p style={{ color: 'var(--teal)', fontSize: 13, marginBottom: 6 }}>📍 {activity.place}</p>}
                {activity.duration && <p style={{ color: 'var(--muted)', fontSize: 12 }}>⏱ {activity.duration}</p>}
                {activity.tip && (
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8, fontStyle: 'italic', borderTop: `1px solid ${cfg.color}20`, paddingTop: 8 }}>
                    💡 {activity.tip}
                  </p>
                )}
              </div>
            )
          })}

          {/* Meals */}
          {day.meals && (
            <div style={{
              background: 'rgba(201,168,76,0.06)', borderRadius: 'var(--radius-sm)',
              padding: '16px 20px', border: '1px solid rgba(201,168,76,0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--gold)' }}>
                <Utensils size={16} />
                <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Meals</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                {['breakfast', 'lunch', 'dinner'].map(meal => day.meals[meal] && (
                  <div key={meal}>
                    <p style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{meal}</p>
                    <p style={{ color: 'var(--ink)', fontSize: 14, fontWeight: 500 }}>{day.meals[meal]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day Tip */}
          {day.day_tip && (
            <div style={{
              background: 'rgba(26,95,122,0.06)', borderRadius: 'var(--radius-sm)',
              padding: '14px 18px', border: '1px solid rgba(26,95,122,0.15)',
              display: 'flex', gap: 10, alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: 18 }}>🏅</span>
              <p style={{ color: 'var(--teal)', fontSize: 14, lineHeight: 1.6 }}>
                <strong>Insider Tip:</strong> {day.day_tip}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
