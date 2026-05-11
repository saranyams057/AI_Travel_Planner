import { Shield, Heart, BookOpen, FileText, Phone, AlertTriangle } from 'lucide-react'

function Section({ icon, title, color = 'var(--teal)', children }) {
  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 28, boxShadow: '0 2px 12px rgba(13,17,23,0.06)', border: '1px solid rgba(201,168,76,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ListItems({ items, icon = '✦', color = 'var(--gold)' }) {
  if (!items?.length) return null
  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: 'var(--ink)', fontSize: 14, lineHeight: 1.5 }}>
          <span style={{ color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{icon}</span> {item}
        </li>
      ))}
    </ul>
  )
}

export default function PrecautionsTab({ data, tripType }) {
  if (!data) return <p style={{ color: 'var(--muted)' }}>No precautions data available.</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
      {/* Visa (international only) */}
      {data.visa && (
        <Section icon={<FileText size={18} />} title="Visa Requirements" color="var(--teal)">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <span className="tag">{data.visa.visaType || 'Tourist Visa'}</span>
            {data.visa.processingTime && <span className="tag">⏱ {data.visa.processingTime}</span>}
            {data.visa.fee && <span className="tag">💰 {data.visa.fee}</span>}
          </div>
          {data.visa.requirements && (
            <>
              <p style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Requirements</p>
              <ListItems items={data.visa.requirements} icon="📄" color="var(--teal)" />
            </>
          )}
          {data.visa.tips && (
            <div style={{ marginTop: 16, borderTop: '1px solid rgba(201,168,76,0.15)', paddingTop: 16 }}>
              <p style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Tips</p>
              <ListItems items={data.visa.tips} icon="💡" color="var(--gold)" />
            </div>
          )}
        </Section>
      )}

      {/* Health */}
      {data.health && (
        <Section icon={<Heart size={18} />} title="Health & Medical" color="#e53e3e">
          {data.health.vaccinations?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Vaccinations</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {data.health.vaccinations.map((v, i) => <span key={i} className="tag" style={{ fontSize: 12 }}>💉 {v}</span>)}
              </div>
            </div>
          )}
          {data.health.medicines?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Medicines to Carry</p>
              <ListItems items={data.health.medicines} icon="💊" color="#e53e3e" />
            </div>
          )}
          {data.health.waterSafety && <p style={{ color: 'var(--ink)', fontSize: 14, marginTop: 10 }}>💧 {data.health.waterSafety}</p>}
          {data.health.foodSafety && <p style={{ color: 'var(--ink)', fontSize: 14, marginTop: 8 }}>🍽️ {data.health.foodSafety}</p>}
        </Section>
      )}

      {/* Safety */}
      {data.safety && (
        <Section icon={<Shield size={18} />} title="Safety" color="#805ad5">
          {data.safety.generalTips?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ListItems items={data.safety.generalTips} icon="🛡️" color="#805ad5" />
            </div>
          )}
          {data.safety.emergencyNumbers && (
            <div style={{ marginTop: 16, background: 'rgba(128,90,213,0.06)', borderRadius: 'var(--radius-sm)', padding: 16, border: '1px solid rgba(128,90,213,0.15)' }}>
              <p style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Emergency Numbers</p>
              {Object.entries(data.safety.emergencyNumbers).map(([key, val], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(128,90,213,0.08)', fontSize: 14 }}>
                  <span style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                  <span style={{ color: '#805ad5', fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Culture */}
      {data.culture && (
        <Section icon={<BookOpen size={18} />} title="Culture & Etiquette" color="var(--gold)">
          {data.culture.dresscode && <p style={{ color: 'var(--ink)', fontSize: 14, marginBottom: 16, padding: '10px 14px', background: 'rgba(201,168,76,0.08)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--gold)' }}>👗 {data.culture.dresscode}</p>}
          {data.culture.dosList?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ color: '#38a169', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>✅ Do's</p>
              <ListItems items={data.culture.dosList} icon="✅" color="#38a169" />
            </div>
          )}
          {data.culture.dontsList?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <p style={{ color: '#e53e3e', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>❌ Don'ts</p>
              <ListItems items={data.culture.dontsList} icon="❌" color="#e53e3e" />
            </div>
          )}
        </Section>
      )}

      {/* Documents Checklist */}
      {data.documentsChecklist?.length > 0 && (
        <Section icon={<FileText size={18} />} title="Documents Checklist" color="var(--teal)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.documentsChecklist.map((doc, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--cream)', fontSize: 14, color: 'var(--ink)' }}>
                <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
                {doc}
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Packing Essentials */}
      {data.packingEssentials?.length > 0 && (
        <Section icon={<AlertTriangle size={18} />} title="Packing Essentials" color="var(--gold)">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.packingEssentials.map((item, i) => (
              <span key={i} className="tag" style={{ fontSize: 13 }}>🎒 {item}</span>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
