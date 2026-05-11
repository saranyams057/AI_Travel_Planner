export default function WeatherTab({ data }) {
  if (!data) return <p style={{ color: 'var(--muted)' }}>No weather data available.</p>

  const forecast = data.forecast || []
  const iconMap = { 'Sunny': '☀️', 'Clear Sky': '🌤️', 'Partly Cloudy': '⛅', 'Cloudy': '☁️', 'Light Rain': '🌦️', 'Rain': '🌧️', 'Heavy Rain': '⛈️', 'Snow': '❄️', 'Windy': '💨', 'Warm & Pleasant': '🌻', 'Light Breeze': '🍃' }

  const getIcon = (condition) => {
    for (const [key, icon] of Object.entries(iconMap)) {
      if (condition?.toLowerCase().includes(key.toLowerCase())) return icon
    }
    return '🌤️'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Forecast Grid */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 20 }}>Day-wise Forecast</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {forecast.map((day, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 'var(--radius)', padding: '22px 18px',
              boxShadow: '0 2px 12px rgba(13,17,23,0.06)', border: '1px solid rgba(201,168,76,0.1)',
              textAlign: 'center', transition: 'transform 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <p style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>{day.date}</p>
              <div style={{ fontSize: 42, marginBottom: 12, lineHeight: 1 }}>{getIcon(day.condition)}</div>
              <p style={{ color: 'var(--ink)', fontSize: 13, fontWeight: 500, marginBottom: 12 }}>{day.condition}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                <div>
                  <p style={{ color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase' }}>Low</p>
                  <p style={{ color: 'var(--teal)', fontWeight: 700, fontSize: 18 }}>{day.temp_min}°</p>
                </div>
                <div style={{ width: 1, background: 'rgba(201,168,76,0.2)' }} />
                <div>
                  <p style={{ color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase' }}>High</p>
                  <p style={{ color: '#e53e3e', fontWeight: 700, fontSize: 18 }}>{day.temp_max}°</p>
                </div>
              </div>
              {day.humidity && (
                <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 10 }}>💧 {day.humidity}% humidity</p>
              )}
              {day.wind_kph && (
                <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4 }}>💨 {day.wind_kph} km/h</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Packing Tips based on weather */}
      <div style={{ background: 'linear-gradient(135deg, rgba(26,95,122,0.08), rgba(45,139,186,0.04))', borderRadius: 'var(--radius)', padding: 28, border: '1px solid rgba(26,95,122,0.15)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 16, color: 'var(--teal)' }}>🎒 Packing Tips Based on Weather</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {generatePackingTips(forecast).map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'white', borderRadius: 'var(--radius-sm)', padding: '12px 16px', boxShadow: '0 1px 4px rgba(13,17,23,0.06)' }}>
              <span style={{ fontSize: 18 }}>{tip.icon}</span>
              <p style={{ color: 'var(--ink)', fontSize: 13, lineHeight: 1.5 }}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function generatePackingTips(forecast) {
  const tips = [
    { icon: '🧴', text: 'Carry sunscreen SPF 50+ for sunny days' },
    { icon: '💧', text: 'Stay hydrated — carry a reusable water bottle' },
    { icon: '👟', text: 'Comfortable walking shoes are a must' },
    { icon: '📱', text: 'Keep a portable charger for all-day outings' },
  ]
  const hasRain = forecast.some(d => d.condition?.toLowerCase().includes('rain'))
  const hasCold = forecast.some(d => d.temp_min < 15)
  const hasHeat = forecast.some(d => d.temp_max > 32)
  if (hasRain) tips.push({ icon: '☂️', text: 'Pack a compact umbrella or rain jacket' })
  if (hasCold) tips.push({ icon: '🧣', text: 'Bring warm layers — evenings can get chilly' })
  if (hasHeat) tips.push({ icon: '🕶️', text: 'Sunglasses and a hat are essential for hot days' })
  return tips
}
