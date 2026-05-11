import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Compass, ArrowLeft, Search, Sliders, ExternalLink, MapPin, Clock, DollarSign, ChevronRight, Loader } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const interests = ['Adventure', 'Culture', 'Food', 'Relaxation', 'Pilgrimage', 'Wildlife', 'History', 'Shopping']

export default function ExplorePage() {
  const navigate = useNavigate()
  const [inputMode, setInputMode] = useState('structured') // 'free' | 'structured'
  const [freeText, setFreeText] = useState('')
  const [form, setForm] = useState({
    trip_type: 'international',
    num_days: 5,
    budget_level: 'moderate',
    group_type: 'family',
    climate_preference: 'beach',
    interests: [],
    starting_region: 'India'
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')

  const toggleInterest = (interest) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter(i => i !== interest)
        : [...f.interests, interest]
    }))
  }

  const handleSearch = async () => {
    setLoading(true)
    setError('')
    setResults([])
    try {
      const payload = inputMode === 'free'
        ? { free_text: freeText }
        : form

      const res = await axios.post(`${API_BASE}/api/explore`, payload)
      setResults(res.data.destinations || [])
    } catch (err) {
      setError('Failed to fetch destinations. Please check your API keys and backend.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, var(--ink) 0%, var(--teal) 100%)',
        padding: '80px 60px 60px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(201,168,76,0.06)' }} />
        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'rgba(255,255,255,0.65)', background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 14, marginBottom: 32, fontFamily: 'var(--font-body)'
        }}>
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Compass size={32} color="var(--gold)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', fontWeight: 400 }}>
            Explore <em style={{ color: 'var(--gold-light)' }}>Places</em>
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, maxWidth: 500, lineHeight: 1.6 }}>
          Don't know where to go? Tell us your preferences and our AI will discover the perfect destinations for you.
        </p>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 40, border: '2px solid rgba(201,168,76,0.25)', borderRadius: 50, overflow: 'hidden', width: 'fit-content' }}>
          {[
            { id: 'structured', label: '⚙️ Guided Input', icon: <Sliders size={15} /> },
            { id: 'free', label: '✍️ Free Text', icon: <Search size={15} /> },
          ].map(m => (
            <button key={m.id} onClick={() => setInputMode(m.id)} style={{
              padding: '12px 28px', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
              background: inputMode === m.id ? 'var(--gold)' : 'transparent',
              color: inputMode === m.id ? 'var(--ink)' : 'var(--muted)',
              transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 7
            }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* INPUT FORM */}
        <div style={{
          background: 'white', borderRadius: 'var(--radius)',
          padding: 40, boxShadow: 'var(--shadow)', marginBottom: 48,
          border: '1px solid rgba(201,168,76,0.12)'
        }}>
          {inputMode === 'free' ? (
            <div>
              <label className="input-label">Describe your dream trip</label>
              <textarea
                className="input-field"
                rows={5}
                placeholder={'E.g., "5-day international beach trip for a couple on a moderate budget, love seafood and local culture"\nOr: "Family trip to hill station for 3 days under ₹40,000"'}
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
              {/* Trip Type */}
              <div>
                <label className="input-label">Trip Type</label>
                <select className="input-field" value={form.trip_type} onChange={e => setForm({ ...form, trip_type: e.target.value })}>
                  <option value="international">🌍 International</option>
                  <option value="domestic">🇮🇳 Domestic</option>
                </select>
              </div>
              {/* Days */}
              <div>
                <label className="input-label">Number of Days</label>
                <input type="number" className="input-field" min={1} max={30} value={form.num_days} onChange={e => setForm({ ...form, num_days: parseInt(e.target.value) })} />
              </div>
              {/* Budget */}
              <div>
                <label className="input-label">Budget Level</label>
                <select className="input-field" value={form.budget_level} onChange={e => setForm({ ...form, budget_level: e.target.value })}>
                  <option value="budget">💰 Budget</option>
                  <option value="moderate">💳 Moderate</option>
                  <option value="luxury">👑 Luxury</option>
                </select>
              </div>
              {/* Group */}
              <div>
                <label className="input-label">Travel Group</label>
                <select className="input-field" value={form.group_type} onChange={e => setForm({ ...form, group_type: e.target.value })}>
                  <option value="solo">🧳 Solo</option>
                  <option value="couple">💑 Couple</option>
                  <option value="family">👨‍👩‍👧 Family</option>
                  <option value="friends">👫 Friends</option>
                </select>
              </div>
              {/* Climate */}
              <div>
                <label className="input-label">Climate Preference</label>
                <select className="input-field" value={form.climate_preference} onChange={e => setForm({ ...form, climate_preference: e.target.value })}>
                  <option value="beach">🏖️ Beach</option>
                  <option value="mountains">🏔️ Mountains</option>
                  <option value="desert">🏜️ Desert</option>
                  <option value="city">🏙️ City</option>
                  <option value="forest">🌲 Forest</option>
                  <option value="snow">❄️ Snow</option>
                </select>
              </div>
              {/* Starting Region */}
              <div>
                <label className="input-label">Starting From</label>
                <input type="text" className="input-field" placeholder="India" value={form.starting_region} onChange={e => setForm({ ...form, starting_region: e.target.value })} />
              </div>
              {/* Interests - full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Interests (select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                  {interests.map(interest => (
                    <button key={interest} onClick={() => toggleInterest(interest)} style={{
                      padding: '8px 18px', borderRadius: 50, border: '1.5px solid',
                      cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                      transition: 'all 0.2s',
                      background: form.interests.includes(interest) ? 'var(--gold)' : 'transparent',
                      borderColor: form.interests.includes(interest) ? 'var(--gold)' : 'rgba(201,168,76,0.3)',
                      color: form.interests.includes(interest) ? 'var(--ink)' : 'var(--muted)'
                    }}>{interest}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && <p style={{ color: '#e53e3e', marginTop: 16, fontSize: 14 }}>{error}</p>}

          <button className="btn-primary" onClick={handleSearch} disabled={loading} style={{
            marginTop: 32, display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px 40px', fontSize: 16
          }}>
            {loading ? <><Loader size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Finding destinations...</> : <><Search size={18} /> Suggest Places</>}
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="loading-spinner" style={{ marginBottom: 24 }} />
            <p style={{ color: 'var(--muted)', fontSize: 16 }}>Our AI agents are finding the best destinations for you...</p>
            <p style={{ color: 'var(--gold)', fontSize: 13, marginTop: 8 }}>This may take 15-30 seconds</p>
          </div>
        )}

        {/* RESULTS */}
        {results.length > 0 && (
          <div className="fade-in-up">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 32, color: 'var(--ink)' }}>
              ✨ Recommended Destinations
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
              {results.map((place, i) => (
                <DestinationCard key={i} place={place} onPlan={() => navigate(`/plan?destination=${encodeURIComponent(place.placeName)}`)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DestinationCard({ place, onPlan }) {
  const [imgError, setImgError] = useState(false)
  const fallback = `https://source.unsplash.com/600x400/?${encodeURIComponent(place.placeName)},travel`

  return (
    <div className="card" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img
          src={imgError ? fallback : (place.image || fallback)}
          alt={place.placeName}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.target.style.transform = 'none'}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,17,23,0.6) 0%, transparent 50%)' }} />
        <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(place.highlights || []).slice(0, 2).map((h, i) => (
              <span key={i} className="tag" style={{ background: 'rgba(201,168,76,0.85)', color: 'var(--ink)', border: 'none', fontSize: 11 }}>{h}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 22px' }}>
        <a href={place.googleLink} target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', fontWeight: 600 }}>{place.placeName}</h3>
          <ExternalLink size={14} color="var(--teal-light)" />
        </a>

        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          {place.description}
        </p>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          {place.bestTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--teal)', fontSize: 13 }}>
              <Clock size={13} /> {place.bestTime}
            </div>
          )}
          {place.estimatedBudget && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--teal)', fontSize: 13 }}>
              <DollarSign size={13} /> {place.estimatedBudget}
            </div>
          )}
        </div>

        {place.activities && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {place.activities.slice(0, 4).map((a, i) => (
              <span key={i} className="tag" style={{ fontSize: 11 }}>{a}</span>
            ))}
          </div>
        )}

        {place.whyVisit && (
          <p style={{ color: 'var(--teal)', fontSize: 13, fontStyle: 'italic', marginBottom: 20, borderLeft: '3px solid var(--gold)', paddingLeft: 12 }}>
            {place.whyVisit}
          </p>
        )}

        <button className="btn-primary" onClick={onPlan} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, padding: '13px 20px'
        }}>
          <MapPin size={16} /> Plan Trip to {place.placeName?.split(',')[0]}
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
