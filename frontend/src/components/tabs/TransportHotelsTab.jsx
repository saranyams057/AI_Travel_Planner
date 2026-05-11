import { useState } from 'react'
import { ExternalLink, Plane, Train, Bus, Car, Hotel, MapPin, Wifi, Coffee, ParkingCircle, Waves } from 'lucide-react'

const amenityIcon = { 'WiFi': <Wifi size={12} />, 'Breakfast': <Coffee size={12} />, 'Pool': <Waves size={12} />, 'Parking': <ParkingCircle size={12} /> }

function BookBtn({ url, label, color = 'var(--gold)' }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: color, color: color === 'var(--gold)' ? 'var(--ink)' : 'white',
      padding: '10px 20px', borderRadius: 50, fontSize: 13, fontWeight: 700,
      textDecoration: 'none', fontFamily: 'var(--font-body)',
      transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)' }}
    >
      <ExternalLink size={13} /> {label}
    </a>
  )
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>{title}</h3>
    </div>
  )
}

export default function TransportHotelsTab({ data }) {
  if (!data) return <p style={{ color: 'var(--muted)' }}>No transport data available.</p>

  const { flights = [], trains = [], buses = [], hotels = [], localTransport } = data

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* FLIGHTS */}
      {flights.length > 0 && (
        <section>
          <SectionTitle icon={<Plane size={20} />} title="Flights" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {flights.map((f, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 'var(--radius)', padding: '22px 28px',
                boxShadow: '0 2px 12px rgba(13,17,23,0.06)', border: '1px solid rgba(201,168,76,0.12)',
                display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(26,95,122,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plane size={18} color="var(--teal)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{f.airline}</p>
                    <p style={{ color: 'var(--muted)', fontSize: 12 }}>{f.stops}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'center', flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 20, color: 'var(--ink)' }}>{f.departure}</p>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', borderTop: '2px dashed rgba(201,168,76,0.3)', position: 'relative' }}>
                      <Plane size={14} color="var(--gold)" style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)' }} />
                      <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4 }}>{f.duration}</p>
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 20, color: 'var(--ink)' }}>{f.arrival}</p>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 120 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--teal)' }}>{f.price}</p>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 10 }}>per person</p>
                  <BookBtn url={f.bookingLink || 'https://www.makemytrip.com/flights/'} label="Book Ticket" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TRAINS */}
      {trains.length > 0 && (
        <section>
          <SectionTitle icon={<Train size={20} />} title="Trains" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {trains.map((t, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 'var(--radius)', padding: '22px 28px',
                boxShadow: '0 2px 12px rgba(13,17,23,0.06)', border: '1px solid rgba(201,168,76,0.12)',
                display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap'
              }}>
                <div style={{ minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Train size={16} color="var(--teal)" />
                    <p style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{t.trainName}</p>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: 12 }}>Train #{t.trainNumber}</p>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
                    <p style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>{t.departure}</p>
                    <div style={{ flex: 1, height: 2, background: 'linear-gradient(to right, rgba(201,168,76,0.3), rgba(26,95,122,0.3))' }} />
                    <p style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>{t.arrival}</p>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: 12 }}>Duration: {t.duration}</p>
                </div>
                <div style={{ textAlign: 'right', minWidth: 160 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', marginBottom: 12 }}>
                    {(t.classes || []).map((cls, ci) => (
                      <span key={ci} className="tag" style={{ fontSize: 11 }}>{cls}</span>
                    ))}
                  </div>
                  <BookBtn url={t.bookingLink || 'https://www.makemytrip.com/railways/'} label="Book Ticket" color="var(--teal)" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BUSES */}
      {buses.length > 0 && (
        <section>
          <SectionTitle icon={<Bus size={20} />} title="Buses" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {buses.map((b, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 'var(--radius)', padding: 22,
                boxShadow: '0 2px 12px rgba(13,17,23,0.06)', border: '1px solid rgba(201,168,76,0.12)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Bus size={16} color="var(--teal)" />
                  <p style={{ fontWeight: 700, color: 'var(--ink)' }}>{b.operator}</p>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13, color: 'var(--muted)' }}>
                  <span>🚌 {b.busType}</span>
                  <span>⏱ {b.duration}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--teal)', fontWeight: 700, marginBottom: 12 }}>{b.price}</p>
                <BookBtn url={b.bookingLink || 'https://www.makemytrip.com/bus-tickets/'} label="Book Ticket" color="var(--teal)" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HOTELS */}
      {hotels.length > 0 && (
        <section>
          <SectionTitle icon={<Hotel size={20} />} title="Recommended Hotels" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {hotels.map((hotel, i) => (
              <HotelCard key={i} hotel={hotel} />
            ))}
          </div>
        </section>
      )}

      {/* LOCAL TRANSPORT */}
      {localTransport && (
        <section>
          <SectionTitle icon={<Car size={20} />} title="Local Transport" />
          <div style={{
            background: 'white', borderRadius: 'var(--radius)', padding: 28,
            boxShadow: '0 2px 12px rgba(13,17,23,0.06)', border: '1px solid rgba(201,168,76,0.12)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {(localTransport.recommended || []).map((m, i) => (
                <span key={i} className="tag" style={{ fontSize: 13 }}>🚍 {m}</span>
              ))}
            </div>
            {localTransport.estimatedDailyCost && (
              <p style={{ color: 'var(--teal)', fontWeight: 600, marginBottom: 16 }}>
                Estimated daily cost: <span style={{ color: 'var(--ink)' }}>{localTransport.estimatedDailyCost}</span>
              </p>
            )}
            {(localTransport.tips || []).map((tip, i) => (
              <p key={i} style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 8, display: 'flex', gap: 8 }}>
                <span>💡</span> {tip}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function HotelCard({ hotel }) {
  const [imgErr, setImgErr] = useState(false)
  const fallback = `https://source.unsplash.com/600x400/?hotel,${encodeURIComponent(hotel.hotelName || 'luxury hotel')}`

  return (
    <div className="card" style={{ borderRadius: 'var(--radius)' }}>
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img
          src={imgErr ? fallback : (hotel.image || fallback)}
          alt={hotel.hotelName}
          onError={() => setImgErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.target.style.transform = 'none'}
        />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{
            background: hotel.type === 'Luxury' ? 'var(--gold)' : hotel.type === 'Budget' ? '#68d391' : 'var(--teal)',
            color: hotel.type === 'Luxury' ? 'var(--ink)' : 'white',
            fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 50
          }}>{hotel.type}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
          <span style={{ background: 'rgba(13,17,23,0.7)', color: 'var(--gold)', fontSize: 13, padding: '4px 10px', borderRadius: 6, fontWeight: 700 }}>
            {'⭐'.repeat(Math.min(hotel.starRating || 3, 5))}
          </span>
        </div>
      </div>

      <div style={{ padding: '18px 20px' }}>
        <a href={hotel.googleLink} target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)', fontWeight: 600 }}>{hotel.hotelName}</h4>
          <ExternalLink size={13} color="var(--teal-light)" />
        </a>

        {hotel.location && (
          <p style={{ color: 'var(--teal)', fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <MapPin size={12} /> {hotel.location}
          </p>
        )}

        {hotel.description && (
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{hotel.description}</p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {(hotel.amenities || []).map((a, i) => (
            <span key={i} className="tag" style={{ fontSize: 11 }}>
              {amenityIcon[a] || '✓'} {a}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--teal)' }}>{hotel.pricePerNight}</p>
            <p style={{ color: 'var(--muted)', fontSize: 11 }}>per night</p>
          </div>
          <BookBtn url={hotel.bookingLink || 'https://www.makemytrip.com/hotels/'} label="Book Hotel" />
        </div>
      </div>
    </div>
  )
}
