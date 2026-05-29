export function Loading() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#FAF3E4',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '32px', zIndex: 9999,
    }}>
      {/* Animated film strip */}
      <div style={{ position: 'relative', width: '48px', height: '48px' }}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', animation: 'spin 3s linear infinite' }}>
          <circle cx="24" cy="24" r="20" stroke="rgba(59,42,26,0.1)" strokeWidth="2"/>
          <circle cx="24" cy="24" r="20" stroke="#3B2A1A" strokeWidth="2"
            strokeDasharray="30 96" strokeLinecap="round"
            style={{ animation: 'dash 1.5s ease-in-out infinite' }}/>
          <circle cx="24" cy="24" r="4" fill="#3B2A1A" opacity="0.4"/>
        </svg>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: '1.5rem', color: '#3B2A1A',
          marginBottom: '8px',
        }}>JodJam</p>
        <p style={{
          fontSize: '11px', letterSpacing: '0.3em',
          color: '#A8896A',
          animation: 'pulse 2s ease-in-out infinite',
        }}>กำลังโหลด...</p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dash {
          0% { stroke-dashoffset: 126; }
          50% { stroke-dashoffset: 32; }
          100% { stroke-dashoffset: 126; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
