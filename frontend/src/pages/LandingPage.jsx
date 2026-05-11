import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Compass, Map, Star, Globe, Wind, Mountain, Waves } from 'lucide-react'

const heroImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80',
]

const features = [
  { icon: <Compass size={28} />, title: 'Smart Discovery', desc: 'AI finds perfect destinations matching your exact preferences and constraints.' },
  { icon: <Map size={28} />, title: 'Detailed Itinerary', desc: 'Day-by-day plans with weather-aware scheduling and local insider tips.' },
  { icon: <Star size={28} />, title: 'Verified Plans', desc: 'Every plan is validated by our Verification Agent for realism and accuracy.' },
]

const destinations = [
  { name: 'Santorini', country: 'Greece', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80', tag: 'Romantic' },
  { name: 'Kyoto', country: 'Japan', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80', tag: 'Cultural' },
  { name: 'Maldives', country: 'Indian Ocean', img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80', tag: 'Luxury' },
  { name: 'Patagonia', country: 'Argentina', img: 'https://images.unsplash.com/photo-1531761535209-180857e963b9?w=600&q=80', tag: 'Adventure' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [heroIdx, setHeroIdx] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true)
      setTimeout(() => {
        setHeroIdx(i => (i + 1) % heroImages.length)
        setTransitioning(false)
      }, 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: 'var(--cream)' }}>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '20px 60px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(13,17,23,0.4)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Globe size={22} color="var(--gold)" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white', fontWeight: 600, letterSpacing: 1 }}>
            WanderMind
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-outline" style={{ padding: '8px 22px', fontSize: 14 }} onClick={() => navigate('/explore')}>Explore</button>
          <button className="btn-primary" style={{ padding: '8px 22px', fontSize: 14 }} onClick={() => navigate('/plan')}>Plan Trip</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${heroImages[heroIdx]})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          transition: 'opacity 0.6s ease',
          opacity: transitioning ? 0 : 1,
          transform: 'scale(1.04)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(13,17,23,0.7) 0%, rgba(13,17,23,0.3) 50%, rgba(26,95,122,0.5) 100%)'
        }} />

        {/* Floating dots */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 4 + i * 2, height: 4 + i * 2,
            borderRadius: '50%',
            background: 'rgba(201,168,76,0.4)',
            top: `${15 + i * 13}%`,
            left: `${8 + i * 15}%`,
            animation: `fadeInUp ${1 + i * 0.3}s ease forwards`,
          }} />
        ))}

        <div style={{
          position: 'relative', zIndex: 10,
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 20px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: 50, padding: '6px 18px', marginBottom: 28,
            backdropFilter: 'blur(8px)'
          }}>
            <Wind size={14} color="var(--gold-light)" />
            <span style={{ color: 'var(--gold-light)', fontSize: 13, fontWeight: 500, letterSpacing: 1 }}>
              AI-POWERED TRAVEL INTELLIGENCE
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 6.5rem)',
            color: 'white', fontWeight: 300, lineHeight: 1.1, marginBottom: 24,
            maxWidth: 900
          }}>
            Your Journey <br />
            <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Begins Here</em>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.75)', fontSize: 18, maxWidth: 560,
            lineHeight: 1.7, marginBottom: 52, fontWeight: 300
          }}>
            Let AI craft your perfect travel experience — from discovering hidden gems to building a complete, verified itinerary in minutes.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="btn-primary"
              style={{ padding: '18px 44px', fontSize: 17, display: 'flex', alignItems: 'center', gap: 10 }}
              onClick={() => navigate('/explore')}
            >
              <Compass size={20} />
              Explore Places
            </button>
            <button
              onClick={() => navigate('/plan')}
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                color: 'white', border: '2px solid rgba(255,255,255,0.3)',
                padding: '18px 44px', borderRadius: 50, fontSize: 17,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'var(--font-body)', fontWeight: 600,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'none' }}
            >
              <Map size={20} />
              Plan My Trip
            </button>
          </div>

          {/* Hero dots indicator */}
          <div style={{ position: 'absolute', bottom: 36, display: 'flex', gap: 8 }}>
            {heroImages.map((_, i) => (
              <div key={i} style={{
                width: i === heroIdx ? 24 : 8, height: 8,
                borderRadius: 4, background: i === heroIdx ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease', cursor: 'pointer'
              }} onClick={() => setHeroIdx(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '100px 60px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>HOW IT WORKS</p>
            <h2 className="section-title">Travel planning, <em>reimagined</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                padding: 40, borderRadius: 'var(--radius)',
                background: 'var(--cream)', border: '1px solid rgba(201,168,76,0.15)',
                textAlign: 'center', transition: 'all 0.3s ease'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(26,95,122,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px', color: 'var(--teal)'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12, fontWeight: 600 }}>{f.title}</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 15 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED DESTINATIONS */}
      <section style={{ padding: '100px 60px', background: 'var(--ink)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>INSPIRATION</p>
            <h2 className="section-title" style={{ color: 'white' }}>Popular <em style={{ color: 'var(--gold-light)' }}>Destinations</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {destinations.map((d, i) => (
              <div key={i} style={{
                position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden',
                cursor: 'pointer', height: 320,
                transition: 'transform 0.3s ease',
              }}
                onClick={() => navigate(`/plan?destination=${d.name}`)}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <img src={d.img} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(13,17,23,0.85) 0%, transparent 60%)',
                }} />
                <div style={{ position: 'absolute', bottom: 24, left: 20 }}>
                  <span style={{
                    background: 'var(--gold)', color: 'var(--ink)', fontSize: 11,
                    fontWeight: 700, padding: '3px 10px', borderRadius: 50,
                    letterSpacing: 0.5, display: 'block', marginBottom: 8, width: 'fit-content'
                  }}>{d.tag}</span>
                  <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600 }}>{d.name}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>{d.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: '100px 60px', textAlign: 'center',
        background: 'linear-gradient(135deg, var(--teal) 0%, var(--ink) 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(201,168,76,0.08)', pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <Mountain size={40} color="var(--gold)" style={{ marginBottom: 24 }} />
          <h2 className="section-title" style={{ color: 'white', marginBottom: 20, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Ready to <em style={{ color: 'var(--gold-light)' }}>explore?</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, marginBottom: 44, lineHeight: 1.7 }}>
            Your perfect trip is just a few clicks away. Let our AI agents handle the planning while you focus on the excitement.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ padding: '18px 44px', fontSize: 17 }} onClick={() => navigate('/explore')}>
              Start Exploring
            </button>
            <button className="btn-outline" style={{ padding: '18px 44px', fontSize: 17, color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} onClick={() => navigate('/plan')}>
              Plan a Trip
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--ink)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 60px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <Globe size={18} color="var(--gold)" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'white', fontWeight: 600 }}>WanderMind</span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>AI-powered travel planning © 2025 • Powered by LangGraph + Groq</p>
      </footer>
    </div>
  )
}
