import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMemoryDetail } from '@/hooks/useEntries'
import { queryClient } from '@/lib/query-client'
import { entriesApi } from '@/api/entries.api'
import type { DayEntry } from '@/types/entry.types'
import dayjs from '@/lib/dayjs'

const MOOD_TH: Record<string,string> = {
  happy:'มีความสุข', sad:'เศร้า', tired:'เหนื่อย',
  stressed:'เครียด', excited:'ตื่นเต้น', angry:'โกรธ',
  bored:'เบื่อ', lonely:'เหงา',
}
const THAI_DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์']
const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']

export function MemoryDetailPage() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const [activeDate, setActiveDate] = useState(date ?? '')
  const { data, isLoading } = useMemoryDetail(activeDate)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate('/') }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  // Prefetch ทุกวันใน before/after ไม่ว่ามี entry หรือเปล่า
  useEffect(() => {
    if (!data) return
    ;[...data.before, ...data.after].forEach(e => {
      queryClient.prefetchQuery({
        queryKey: ['memory', e.date],
        queryFn: () => entriesApi.getMemoryDetail(e.date),
        staleTime: 1000 * 60 * 10,
      })
    })
  }, [data])

  const dt = dayjs(activeDate)
  const frameNum = dt.isValid() ? dt.dayOfYear() : 0
  const rollNum = String(dt.year()).slice(-2)
  const d = data?.data
  const heroImg = d?.img_url ?? null

  type Slide = DayEntry & { isCurrent?: boolean }
  const slides: Slide[] = data ? [
    ...data.before,
    { date: activeDate, has_entry: !!d, img_url: d?.img_url ?? null, isCurrent: true },
    ...data.after,
  ] : []

  const currentIdx = slides.findIndex(s => s.date === activeDate)

  const goTo = (targetDate: string) => setActiveDate(targetDate)

  if (isLoading) return (
    <div style={{ height: '100dvh', background: '#0D0B08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.3)', fontSize: '1.5rem', marginBottom: '12px' }}>JodJam</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '0.3em' }}>LOADING...</p>
      </div>
    </div>
  )

  return (
    <div style={{ height: '100dvh', background: '#0D0B08', position: 'relative', overflow: 'hidden' }}>

      {/* Hero */}
      {heroImg && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={heroImg} style={{ height: '100%', maxWidth: '100%', objectFit: 'contain', opacity: 0.8 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,11,8,0.97) 0%, rgba(13,11,8,0.25) 50%, rgba(13,11,8,0.45) 100%)' }} />
        </div>
      )}

      {/* Top bar — ไม่มี navbar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', letterSpacing: '0.15em', fontFamily: '"DM Mono", monospace' }}>
          Roll '{rollNum} · FRAME {String(frameNum).padStart(3,'0')}
        </p>
        <button onClick={() => navigate('/')} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.7)', fontSize: '13px', letterSpacing: '0.12em',
          padding: '10px 22px', borderRadius: '999px', cursor: 'pointer',
          fontFamily: '"DM Sans", sans-serif', transition: 'all 0.2s',
        }}>
          × Close · ESC
        </button>
      </div>

      {/* Nav arrows */}
      {currentIdx > 0 && (
        <button onClick={() => goTo(slides[currentIdx - 1].date)} style={arrowStyle('left')}>‹</button>
      )}
      {currentIdx < slides.length - 1 && (
        <button onClick={() => goTo(slides[currentIdx + 1].date)} style={arrowStyle('right')}>›</button>
      )}

      {/* Bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '0 32px 36px' }}>

        {/* Slideshow */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', alignItems: 'flex-end' }}>
          {slides.map((slide) => {
            const isActive = slide.date === activeDate
            return (
              <button key={slide.date} onClick={() => goTo(slide.date)} style={{
                flexShrink: 0,
                width: isActive ? '80px' : '52px',
                height: isActive ? '60px' : '40px',
                borderRadius: '4px', overflow: 'hidden',
                border: isActive ? '2px solid rgba(255,255,255,0.85)' : '2px solid transparent',
                cursor: 'pointer', padding: 0,
                opacity: isActive ? 1 : 0.4,
                transition: 'all 0.25s ease',
                background: 'rgba(255,255,255,0.08)',
              }}>
                {slide.img_url ? (
                  <img src={slide.img_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: '"DM Mono", monospace' }}>
                      {dayjs(slide.date).date()}
                    </span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Info — ใหญ่ขึ้น */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', marginBottom: '8px' }}>
              {THAI_DAYS[dt.day()]}{'  '}{dt.format('DD.MM.YYYY')}
            </p>
            <h1 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '4.5rem', fontWeight: 700,
              color: 'white', margin: '0 0 16px', lineHeight: 1.1,
            }}>
              {dt.date()} {THAI_MONTHS[dt.month()]}
            </h1>
            {d?.note && (
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '16px', maxWidth: '540px', lineHeight: 1.7, fontStyle: 'italic' }}>
                " {d.note} "
              </p>
            )}
          </div>

          {d && (
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '24px' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', letterSpacing: '0.05em', marginBottom: '10px' }}>
                {MOOD_TH[d.mood] ?? d.mood}
              </p>
              <p style={{ fontFamily: '"DM Mono", monospace', color: 'white', fontSize: '2.4rem', fontWeight: 300 }}>
                {d.rating} / 5 ดาว
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function arrowStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', [side]: '24px', top: '50%', transform: 'translateY(-50%)',
    zIndex: 10, background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%',
    width: '48px', height: '48px', color: 'rgba(255,255,255,0.6)',
    fontSize: '1.5rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  }
}
