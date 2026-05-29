import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export function NotFoundPage() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <div style={{
      minHeight: '100dvh', background: '#FAF3E4',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '0',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.6s ease',
    }}>
      {/* Film frame decoration */}
      <div style={{
        border: '1px solid rgba(59,42,26,0.15)',
        borderRadius: '4px',
        padding: '60px 80px',
        textAlign: 'center',
        position: 'relative',
        maxWidth: '480px',
      }}>
        {/* Corner dots like film */}
        {['top-left','top-right','bottom-left','bottom-right'].map(pos => (
          <div key={pos} style={{
            position: 'absolute',
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: 'rgba(59,42,26,0.2)',
            ...(pos.includes('top') ? { top: '12px' } : { bottom: '12px' }),
            ...(pos.includes('left') ? { left: '12px' } : { right: '12px' }),
          }} />
        ))}

        <p style={{ fontSize: '11px', letterSpacing: '0.3em', color: '#A8896A', marginBottom: '16px' }}>
          FRAME NOT FOUND
        </p>

        <p style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '6rem', fontWeight: 300,
          color: '#3B2A1A', lineHeight: 1,
          margin: '0 0 24px',
        }}>404</p>

        <div style={{ width: '40px', height: '1px', background: 'rgba(59,42,26,0.2)', margin: '0 auto 24px' }} />

        <p style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: '1.1rem', color: '#3B2A1A',
          marginBottom: '8px',
        }}>
          หน้านี้ไม่มีอยู่ในความทรงจำ
        </p>

        <p style={{ fontSize: '13px', color: '#A8896A', marginBottom: '40px', lineHeight: 1.6 }}>
          วันที่คุณกำลังมองหา<br />อาจเลือนหายไปแล้ว
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            background: '#3B2A1A', color: '#FAF3E4',
            border: 'none', borderRadius: '999px',
            padding: '12px 32px', fontSize: '13px',
            letterSpacing: '0.1em', cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  )
}
