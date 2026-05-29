import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import dayjs from '@/lib/dayjs'

export function Navbar() {
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const today = dayjs().format('DD.MM.YYYY')

  return (
    <nav style={{
      position: 'relative',
      display: 'flex', alignItems: 'center',
      padding: '20px 40px', background: '#FAF3E4',
      borderBottom: '1px solid rgba(59,42,26,0.06)',
    }}>
      <Link to="/" style={{
        fontFamily: '"Playfair Display", serif',
        fontSize: '1.4rem', fontWeight: 600,
        color: '#3B2A1A', textDecoration: 'none',
      }}>
        JodJam
      </Link>

      {/* Center — absolute so it's truly centered */}
      <div style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '40px',
      }}>
        {[
          { to: '/', label: 'YEAR' },
          { to: '/stats', label: 'STATS' },
        ].map(({ to, label }) => (
          <NavLink key={to} to={to} end style={({ isActive }) => ({
            fontSize: '12px', letterSpacing: '0.2em',
            color: isActive ? '#3B2A1A' : '#A8896A',
            textDecoration: 'none',
            borderBottom: isActive ? '1px solid #3B2A1A' : '1px solid transparent',
            paddingBottom: '2px', transition: 'all 0.2s',
          })}>
            {label}
          </NavLink>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
        <span style={{ fontSize: '13px', color: '#A8896A', fontFamily: '"DM Mono", monospace', letterSpacing: '0.05em' }}>
          {today}
        </span>
        <button onClick={() => navigate('/profile')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {user?.profile_url ? (
            <img src={user.profile_url} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#3B2A1A', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#FAF3E4', fontSize: '14px', fontFamily: '"Playfair Display", serif' }}>
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}
        </button>
      </div>
    </nav>
  )
}