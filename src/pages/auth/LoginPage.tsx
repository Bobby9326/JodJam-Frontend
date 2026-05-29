import loginBg from '@/assets/images/login/login-bg.jpg'
import { authApi } from '@/api/auth.api'

export function LoginPage() {
  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>

      {/* LEFT 50% */}
      <div style={{ position: 'relative', width: '50%', overflow: 'hidden', background: '#111' }}>
        <img src={loginBg} alt="journal" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.65,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)',
        }} />
        {/* Quote — top 15% */}
        <div style={{ position: 'absolute', top: '12%', left: 0, right: 0, padding: '0 200px', zIndex: 1 }}>
          <p style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '2rem', lineHeight: 1.7,
            color: 'white', fontWeight: 400,
          }}>
            " เพราะชีวิตแก้ไขไม่ได้<br />
            เราจึงอยากให้คุณ... จดจำ "
          </p>
        </div>
      </div>

      {/* RIGHT 50% */}
      <div style={{
        width: '50%', background: '#FAF3E4',
        display: 'flex', flexDirection: 'column',
        padding: '0 72px', position: 'relative',
      }}>
        {/* Center content */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '20px',
        }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.35em', color: '#A8896A' }}>A DAILY MEMORY</p>

          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '5.5rem', fontWeight: 700,
            color: '#3B2A1A', margin: 0, lineHeight: 1,
          }}>JodJam</h1>

          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(59,42,26,0.18)' }} />
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(59,42,26,0.25)' }} />
            <div style={{ flex: 1, height: '1px', background: 'rgba(59,42,26,0.18)' }} />
          </div>

          <p style={{ color: '#A8896A', fontSize: '15px', margin: 0 }}>
            จดจำ – หนึ่งวัน หนึ่งความทรงจำ
          </p>

          <div style={{ width: '100%', height: '1px', background: 'rgba(59,42,26,0.12)' }} />

          {/* เลือนหาย — gradient ทั้งคำตั้งแต่ต้น */}
          <p style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '1.2rem', color: '#3B2A1A',
            margin: 0, textAlign: 'center',
          }}>
            " วันที่ไม่ได้บันทึก คือวันที่{' '}
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(to right, rgba(59,42,26,0.6) 0%, rgba(59,42,26,0.25) 40%, rgba(59,42,26,0.04) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>เลือนหาย</span>
            {' '}"
          </p>

          <button
            onClick={authApi.loginGoogle}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '12px', width: '100%',
              background: '#3B2A1A', color: '#FAF3E4',
              border: 'none', borderRadius: '999px',
              padding: '18px 32px', cursor: 'pointer',
              fontSize: '13px', letterSpacing: '0.18em',
              fontFamily: '"DM Sans", sans-serif', fontWeight: 500,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <GoogleIcon />
            SIGN IN WITH GOOGLE
          </button>
        </div>

        {/* Bottom */}
        <div style={{ paddingBottom: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#A8896A', margin: '0 0 6px' }}>
            ONE ENTRY PER DAY • NO BACKDATING • MEMORY IS FINAL
          </p>
          <p style={{ fontSize: '12px', color: '#A8896A', opacity: 0.55, margin: 0 }}>
            เพราะความทรงจำย้อนกลับไปแก้ไขไม่ได้ บันทึกนี้ก็เช่นกัน
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#FAF3E4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#FAF3E4"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FAF3E4"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#FAF3E4"/>
    </svg>
  )
}
