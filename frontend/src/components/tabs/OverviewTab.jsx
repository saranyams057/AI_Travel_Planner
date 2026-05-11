import { useState } from 'react'
import { Star, ExternalLink, Clock, DollarSign, MapPin, Zap } from 'lucide-react'

export default function OverviewTab({ data, places }) {
  if (!data) return <p style={{ color: 'var(--muted)' }}>No overview data available.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Hero Card */}
      <div style={{
        position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden',
        height: 340, boxShadow: 'var(--shadow-lg)'
      }}>
        <img
          src={data.heroImage || `https://source.unsplash.com/1200x400/?${encodeURIComponent(data.destination)},travel`}
          alt={data.destination}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = `https://source.unsplash.com/1200x400/?travel,landscape` }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(13,17,23,0.85) 0%, rgba(13,17,23,0.3) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: 48, transform: 'translateY(-50%)' }}>
          <p style={{ color: 'var(--gold)', fontSize: 13, letterSpacing: 2, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
            Your Trip
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: 'white', fontWeight: 400, marginBottom: 10, lineHeight: 1.2 }}>
            {data.destination}
          </h2>
          {data.tagline && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, fontStyle: 'italic', maxWidth: 380 }}>
              "{data.tagline}"
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {data.quickStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          {Object.entries(data.quickStats).map(([key, val], i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 'var(--radius-sm)', padding: '20px 18px',
              boxShadow: '0 2px 12px rgba(13,17,23,0.06)', border: '1px solid rgba(201,168,76,0.1)',
              textAlign: 'center'
            }}>
              <p style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p style={{ color: 'var(--ink)', fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)' }}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Highlights + Packing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {data.highlights && (
          <div style={{
            background: 'white', borderRadius: 'var(--radius)', padding: 28,
            boxShadow: '0 2px 12px rgba(13,17,23,0.06)', border: '1px solid rgba(201,168,76,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Star size={18} color="var(--gold)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Trip Highlights</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.highlights.map((h, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: 'var(--ink)', fontSize: 14, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, marginTop: 1 }}>✦</span> {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.packingSuggestions && (
          <div style={{
            background: 'white', borderRadius: 'var(--radius)', padding: 28,
            boxShadow: '0 2px 12px rgba(13,17,23,0.06)', border: '1px solid rgba(201,168,76,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Zap size={18} color="var(--teal)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Packing Essentials</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.packingSuggestions.map((item, i) => (
                <span key={i} className="tag">{item}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Weather Summary */}
      {data.weatherSummary && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(26,95,122,0.08), rgba(45,139,186,0.05))',
          borderRadius: 'var(--radius)', padding: 24,
          border: '1px solid rgba(26,95,122,0.15)'
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 10, color: 'var(--teal)' }}>
            🌤️ Weather Overview
          </h3>
          <p style={{ color: 'var(--ink)', lineHeight: 1.7, fontSize: 15 }}>{data.weatherSummary}</p>
        </div>
      )}

      {/* Best Places to Visit */}
      {places && places.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 24 }}>
            🗺️ Best Places to Visit
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {places.map((place, i) => (
              <PlaceCard key={i} place={place} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlaceCard({ place }) {
  const [imgErr, setImgErr] = useState(false)
  const fallback = `https://source.unsplash.com/600x400/?${encodeURIComponent(place.placeName)},landmark`

  return (
    <div className="card" style={{ borderRadius: 'var(--radius)' }}>
      <div style={{ height: 170, overflow: 'hidden', position: 'relative' }}>
        <img
          src={imgErr ? fallback : (place.image || fallback)}
          alt={place.placeName}
          onError={() => setImgErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.target.style.transform = 'none'}
        />
        {place.category && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            background: 'var(--gold)', color: 'var(--ink)',
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 50, letterSpacing: 0.5
          }}>{place.category}</span>
        )}
      </div>
      <div style={{ padding: '16px 18px' }}>
        <a href={place.googleLink} target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', fontWeight: 600 }}>{place.placeName}</h4>
          <ExternalLink size={13} color="var(--teal-light)" />
        </a>
        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{place.description}</p>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--teal)' }}>
          {place.visitDuration && <span><Clock size={11} style={{ marginRight: 4 }} />{place.visitDuration}</span>}
          {place.estimatedCost && <span><DollarSign size={11} style={{ marginRight: 4 }} />{place.estimatedCost}</span>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
          {(place.activities || []).slice(0, 3).map((a, i) => (
            <span key={i} className="tag" style={{ fontSize: 10 }}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
