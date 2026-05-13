import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Map, Loader, CheckCircle, AlertTriangle, Download } from 'lucide-react'
import OverviewTab from '../components/tabs/OverviewTab'
import ItineraryTab from '../components/tabs/ItineraryTab'
import TransportHotelsTab from '../components/tabs/TransportHotelsTab'
import BudgetTab from '../components/tabs/BudgetTab'
import WeatherTab from '../components/tabs/WeatherTab'
import PrecautionsTab from '../components/tabs/PrecautionsTab'
import { downloadPlanPdf } from '../utils/pdfReport'
import { observeApiCall } from '../utils/observability'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const TABS = [
  { id: 'overview', label: '📋 Overview' },
  { id: 'itinerary', label: '📅 Day-wise' },
  { id: 'transport', label: '🚗 Transport & Hotels' },
  { id: 'budget', label: '💰 Budget' },
  { id: 'weather', label: '🌤️ Weather' },
  { id: 'precautions', label: '⚠️ Precautions' },
]

export default function PlanPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefillDest = searchParams.get('destination') || ''

  const [form, setForm] = useState({
    destination: prefillDest,
    starting_location: '',
    num_people: 2,
    group_type: 'family',
    start_date: '',
    num_days: 5,
    budget_level: 'moderate',
    trip_type: 'international',
    transport_modes: ['flight'],
    additional_requirements: ''
  })

  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState('')

  const loadingSteps = [
    'Discovering best places in your destination...',
    'Building your day-wise itinerary...',
    'Finding flights, trains & hotels...',
    'Calculating your budget breakdown...',
    'Verifying plan for accuracy...',
    'Assembling your complete travel plan...',
  ]

  const toggleTransport = (mode) => {
    setForm(f => ({
      ...f,
      transport_modes: f.transport_modes.includes(mode)
        ? f.transport_modes.filter(m => m !== mode)
        : [...f.transport_modes, mode]
    }))
  }

  const handleGenerate = async () => {
    if (!form.destination || !form.starting_location || !form.start_date) {
      setError('Please fill in destination, starting location, and start date.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)

    let step = 0
    const stepInterval = setInterval(() => {
      if (step < loadingSteps.length - 1) {
        setLoadingStep(loadingSteps[step++])
      }
    }, 8000)
    setLoadingStep(loadingSteps[0])

    try {
      const res = await observeApiCall('plan_trip', () =>
        axios.post(`${API_BASE}/api/plan`, form, { timeout: 180000 })
      )
      setResult(res.data)
      setActiveTab('overview')
    } catch {
      setError('Failed to generate plan. Please check your API keys and try again.')
    }

    clearInterval(stepInterval)
    setLoading(false)
    setLoadingStep('')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, var(--teal) 0%, var(--ink) 100%)',
        padding: '80px 60px 60px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(201,168,76,0.05)' }} />
        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'rgba(255,255,255,0.65)', background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 14, marginBottom: 32, fontFamily: 'var(--font-body)'
        }}>
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Map size={32} color="var(--gold)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', fontWeight: 400 }}>
            Plan My <em style={{ color: 'var(--gold-light)' }}>Trip</em>
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, maxWidth: 500, lineHeight: 1.6 }}>
          Tell us where you want to go and we'll build you a complete, verified travel plan with itinerary, hotels, transport, and budget.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
        {/* FORM */}
        {!result && (
          <div style={{
            background: 'white', borderRadius: 'var(--radius)',
            padding: '40px 44px', boxShadow: 'var(--shadow)',
            border: '1px solid rgba(201,168,76,0.12)', marginBottom: 48
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 32, color: 'var(--ink)' }}>
              Trip Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
              <div>
                <label className="input-label">Destination *</label>
                <input type="text" className="input-field" placeholder="e.g. Paris, France" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Starting Location *</label>
                <input type="text" className="input-field" placeholder="e.g. Mumbai, India" value={form.starting_location} onChange={e => setForm({ ...form, starting_location: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Start Date *</label>
                <input type="date" className="input-field" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Number of Days</label>
                <input type="number" className="input-field" min={1} max={30} value={form.num_days} onChange={e => setForm({ ...form, num_days: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="input-label">Number of People</label>
                <input type="number" className="input-field" min={1} max={50} value={form.num_people} onChange={e => setForm({ ...form, num_people: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="input-label">Travel Group</label>
                <select className="input-field" value={form.group_type} onChange={e => setForm({ ...form, group_type: e.target.value })}>
                  <option value="solo">🧳 Solo</option>
                  <option value="couple">💑 Couple</option>
                  <option value="family">👨‍👩‍👧 Family</option>
                  <option value="friends">👫 Friends</option>
                </select>
              </div>
              <div>
                <label className="input-label">Budget Level</label>
                <select className="input-field" value={form.budget_level} onChange={e => setForm({ ...form, budget_level: e.target.value })}>
                  <option value="budget">💰 Budget</option>
                  <option value="moderate">💳 Moderate</option>
                  <option value="luxury">👑 Luxury</option>
                </select>
              </div>
              <div>
                <label className="input-label">Trip Type</label>
                <select className="input-field" value={form.trip_type} onChange={e => setForm({ ...form, trip_type: e.target.value })}>
                  <option value="international">🌍 International</option>
                  <option value="domestic">🇮🇳 Domestic</option>
                </select>
              </div>

              {/* Transport modes - full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Mode of Transport {form.trip_type === 'domestic' ? '(select all that apply)' : '(for international, flight is primary)'}</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                  {['flight', 'train', 'bus', 'car'].map(mode => (
                    <button key={mode} onClick={() => toggleTransport(mode)} style={{
                      padding: '10px 22px', borderRadius: 50, border: '1.5px solid',
                      cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                      transition: 'all 0.2s',
                      background: form.transport_modes.includes(mode) ? 'var(--gold)' : 'transparent',
                      borderColor: form.transport_modes.includes(mode) ? 'var(--gold)' : 'rgba(201,168,76,0.3)',
                      color: form.transport_modes.includes(mode) ? 'var(--ink)' : 'var(--muted)'
                    }}>
                      {mode === 'flight' ? '✈️' : mode === 'train' ? '🚂' : mode === 'bus' ? '🚌' : '🚗'} {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional requirements - full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Additional Requirements</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="E.g., vegetarian food, wheelchair accessible, honeymoon trip, celebrating anniversary, need halal food options..."
                  value={form.additional_requirements}
                  onChange={e => setForm({ ...form, additional_requirements: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e53e3e', marginTop: 16, fontSize: 14 }}>
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{
              marginTop: 36, display: 'flex', alignItems: 'center', gap: 10,
              padding: '18px 48px', fontSize: 17
            }}>
              {loading
                ? <><Loader size={20} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating...</>
                : <><Map size={20} /> Generate Plan</>
              }
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div style={{
            background: 'white', borderRadius: 'var(--radius)',
            padding: '60px 40px', textAlign: 'center', boxShadow: 'var(--shadow)',
            border: '1px solid rgba(201,168,76,0.12)'
          }}>
            <div className="loading-spinner" style={{ marginBottom: 32 }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 16 }}>
              Building Your Perfect Trip
            </h3>
            <p style={{ color: 'var(--gold)', fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
              {loadingStep}
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              Our 5 AI agents are working in sequence — this takes about 30-60 seconds
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32, flexWrap: 'wrap' }}>
              {['Destination Agent', 'Itinerary Agent', 'Transport Agent', 'Budget Agent', 'Verification Agent'].map((agent, i) => (
                <span key={i} style={{
                  padding: '6px 16px', borderRadius: 50, fontSize: 12, fontWeight: 500,
                  background: 'rgba(201,168,76,0.1)', color: 'var(--teal)',
                  border: '1px solid rgba(201,168,76,0.2)'
                }}>{agent}</span>
              ))}
            </div>
          </div>
        )}

        {/* RESULT TABS */}
        {result && !loading && (
          <div className="fade-in-up">
            {/* Success banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              background: 'rgba(72,187,120,0.1)', border: '1px solid rgba(72,187,120,0.3)',
              borderRadius: 'var(--radius-sm)', padding: '14px 20px', marginBottom: 32
            }}>
              <CheckCircle size={20} color="#38a169" />
              <div style={{ flex: '1 1 320px' }}>
                <span style={{ color: '#276749', fontWeight: 600, fontSize: 15 }}>
                  Your trip plan is ready!
                </span>
                <span style={{ color: '#2f855a', fontSize: 13, marginLeft: 8 }}>
                  Verified by our AI Verification Agent
                  {result.verification_flags?.filter(f => f.severity === 'high').length > 0
                    ? ` • ${result.verification_flags.filter(f => f.severity === 'high').length} issues corrected`
                    : ' • No issues found'}
                </span>
              </div>
              <button onClick={() => downloadPlanPdf(result)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'white', border: '1px solid rgba(56,161,105,0.35)',
                borderRadius: 999, padding: '9px 16px', cursor: 'pointer',
                color: '#276749', fontFamily: 'var(--font-body)', fontSize: 13,
                fontWeight: 700, boxShadow: '0 2px 8px rgba(13,17,23,0.06)'
              }}>
                <Download size={15} /> Download PDF
              </button>
              <button onClick={() => setResult(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: 13
              }}>
                ✏️ Edit Plan
              </button>
            </div>

            {/* Tab Bar */}
            <div style={{
              display: 'flex', gap: 0, marginBottom: 32,
              background: 'white', borderRadius: 'var(--radius)',
              padding: 6, boxShadow: 'var(--shadow)', overflowX: 'auto'
            }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: '0 0 auto', padding: '12px 20px', border: 'none',
                  borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                  transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                  background: activeTab === tab.id ? 'var(--gold)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--ink)' : 'var(--muted)',
                  boxShadow: activeTab === tab.id ? '0 2px 12px rgba(201,168,76,0.3)' : 'none'
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="fade-in-up" key={activeTab}>
              {activeTab === 'overview' && <OverviewTab data={result.overview} places={result.destinations} />}
              {activeTab === 'itinerary' && <ItineraryTab data={result.itinerary} />}
              {activeTab === 'transport' && <TransportHotelsTab data={result.transport_hotels} />}
              {activeTab === 'budget' && <BudgetTab data={result.budget} />}
              {activeTab === 'weather' && <WeatherTab data={result.weather} />}
              {activeTab === 'precautions' && <PrecautionsTab data={result.precautions} tripType={result.overview?.quickStats?.tripType} />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
