import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/users.api'
import { authApi } from '@/api/auth.api'
import { useUiStore } from '@/store/ui.store'
import dayjs from '@/lib/dayjs'

export function ProfilePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: user, isLoading } = useQuery({ queryKey: ['me'], queryFn: usersApi.getMe })
  const { isEditProfileOpen, openEditProfile, closeEditProfile } = useUiStore()

  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const avatarRef = useRef<HTMLInputElement>(null)

  // Crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Draggable crop
  const containerRef = useRef<HTMLDivElement>(null)
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 })
  const [imgScale, setImgScale] = useState(1)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })
  const imgNatural = useRef({ w: 0, h: 0 })
  const initialScale = useRef(1)
  const cropSize = 320 // px — fixed crop circle size

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const updateMutation = useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }); closeEditProfile() },
  })

  const avatarMutation = useMutation({
    mutationFn: usersApi.uploadAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] })
      setUploading(false)
      showToast('เปลี่ยนรูปโปรไฟล์สำเร็จ ✓')
    },
    onError: () => setUploading(false),
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => navigate('/login'),
  })

  const openEdit = () => {
    setUsername(user?.username ?? '')
    setBio(user?.bio ?? '')
    openEditProfile()
  }

  const onFileSelect = (f: File) => {
    setCropFile(f)
    setCropSrc(URL.createObjectURL(f))
    setImgOffset({ x: 0, y: 0 })
    setImgScale(1)
  }

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    imgNatural.current = { w: img.naturalWidth, h: img.naturalHeight }
    // auto scale to fit crop circle
    const minDim = Math.min(img.naturalWidth, img.naturalHeight)
    initialScale.current = cropSize / minDim
    setImgScale(initialScale.current)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: imgOffset.x, oy: imgOffset.y }
    e.preventDefault()
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setImgOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
      y: dragStart.current.oy + (e.clientY - dragStart.current.my),
    })
  }

  const onMouseUp = () => setDragging(false)

  const confirmCrop = () => {
    if (!cropSrc) return
    const img = new Image()
    img.onload = () => {
      const displayW = img.naturalWidth * imgScale
      const displayH = img.naturalHeight * imgScale

      // center of container
      const cx = 256, cy = 256 // container 512x512
      const cropHalf = cropSize / 2

      // top-left of crop circle in display space
      const cropLeft = cx - cropHalf - (cx + imgOffset.x - displayW / 2)
      const cropTop  = cy - cropHalf - (cy + imgOffset.y - displayH / 2)

      // convert to natural image coords
      const srcX = cropLeft / imgScale
      const srcY = cropTop / imgScale
      const srcSize = cropSize / imgScale

      const canvas = document.createElement('canvas')
      canvas.width = 400; canvas.height = 400
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, 400, 400)

      canvas.toBlob(blob => {
        if (!blob) return
        setCropSrc(null)
        setUploading(true)
        avatarMutation.mutate(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.92)
    }
    img.src = cropSrc
  }

  if (isLoading) return (
    <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#A8896A', fontSize: '12px', letterSpacing: '0.3em' }}>LOADING...</p>
    </div>
  )

  const displayW = imgNatural.current.w * imgScale
  const displayH = imgNatural.current.h * imgScale

  return (
    <div style={{ minHeight: '100vh', background: '#FAF3E4' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          background: '#3B2A1A', color: '#FAF3E4', padding: '12px 28px',
          borderRadius: '999px', fontSize: '14px', zIndex: 200,
          fontFamily: '"DM Sans", sans-serif', boxShadow: '0 4px 20px rgba(59,42,26,0.2)',
          animation: 'fadeInDown 0.3s ease',
        }}>{toast}</div>
      )}

      {/* Uploading overlay */}
      {uploading && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(250,243,228,0.85)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 150, gap: '16px',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '2px solid rgba(59,42,26,0.1)', borderTop: '2px solid #3B2A1A',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: '#A8896A', fontSize: '13px', letterSpacing: '0.2em' }}>กำลังอัปโหลด...</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px', paddingBottom: '60px' }}>

        {/* Avatar */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div style={{ width: '160px', height: '160px', borderRadius: '50%', overflow: 'hidden', background: '#A8896A' }}>
            {user?.profile_url ? (
              <img src={user.profile_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: '"Playfair Display", serif', fontSize: '4rem', color: '#FAF3E4' }}>
                  {user?.username?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <button onClick={() => avatarRef.current?.click()} style={{
            position: 'absolute', bottom: '6px', right: '6px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#3B2A1A', border: '2px solid #FAF3E4',
            color: '#FAF3E4', fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>+</button>
          <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelect(f) }} />
        </div>

        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.8rem', color: '#3B2A1A', margin: 0 }}>
          {user?.username}
        </h1>
        {user?.bio && (
          <p style={{ color: '#A8896A', fontSize: '16px', marginTop: '8px', fontStyle: 'italic' }}>"{user.bio}"</p>
        )}

        <button onClick={openEdit} style={{
          marginTop: '16px', background: 'transparent',
          border: '1px solid rgba(59,42,26,0.22)', color: '#3B2A1A',
          borderRadius: '999px', padding: '10px 28px',
          fontSize: '14px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
        }}>แก้ไขโปรไฟล์</button>

        {/* Stats */}
        <div style={{
          marginTop: '48px', width: '100%', maxWidth: '680px',
          border: '1px solid rgba(59,42,26,0.1)', borderRadius: '8px',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        }}>
          {[
            { label: 'เริ่มบันทึกวันแรก', value: user?.first_date ? dayjs(user.first_date).format('DD.MM.YYYY') : '—' },
            { label: 'จำนวนความทรงจำ', value: `${user?.amount_of_memories??0}`, unit: 'วัน' },
            { label: 'จำนวนวันที่เข้าร่วม', value: `${user?.number_of_days_joined??0}`, unit: 'วัน' },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '32px 16px', gap: '12px',
              borderLeft: i > 0 ? '1px solid rgba(59,42,26,0.1)' : 'none',
            }}>
              <p style={{ fontSize: '14px', color: '#A8896A', textAlign: 'center', margin: 0 }}>{s.label}</p>
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '2rem', fontWeight: 300, color: '#3B2A1A', margin: 0 }}>
                {s.value}{s.unit && <span style={{ fontSize: '1rem', color: '#A8896A', marginLeft: '4px' }}>{s.unit}</span>}
              </p>
            </div>
          ))}
        </div>

        <button onClick={() => logoutMutation.mutate()} style={{
          marginTop: '48px', background: '#A8896A', color: '#FAF3E4',
          border: 'none', borderRadius: '999px', padding: '14px 44px',
          fontSize: '15px', letterSpacing: '0.08em', cursor: 'pointer',
          fontFamily: '"DM Sans", sans-serif',
        }}>ออกจากระบบ</button>
      </div>

      {/* Crop Modal — draggable */}
      {cropSrc && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: '#FAF3E4', borderRadius: '12px', padding: '32px',
            maxWidth: '540px', width: '100%', margin: '16px',
          }}>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: '#3B2A1A', margin: '0 0 8px' }}>
              ปรับรูปโปรไฟล์
            </h3>
            <p style={{ fontSize: '13px', color: '#A8896A', margin: '0 0 20px' }}>
              ลากรูปเพื่อเลือกตำแหน่ง · เลื่อน scroll เพื่อซูม
            </p>

            {/* Crop area */}
            <div
              ref={containerRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onWheel={e => setImgScale(s => Math.max(initialScale.current, Math.min(4, s - e.deltaY * 0.0003)))}
              style={{
                width: '100%', aspectRatio: '1', background: '#111',
                borderRadius: '8px', overflow: 'hidden',
                position: 'relative', cursor: dragging ? 'grabbing' : 'grab',
                userSelect: 'none', marginBottom: '20px',
              }}
            >
              {/* Image — draggable */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: `translate(calc(-50% + ${imgOffset.x}px), calc(-50% + ${imgOffset.y}px))`,
                width: `${displayW}px`, height: `${displayH}px`,
                pointerEvents: 'none',
              }}>
                <img
                  src={cropSrc}
                  onLoad={onImgLoad}
                  style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }}
                  draggable={false}
                />
              </div>

              {/* Crop overlay — circle cutout */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <svg width="100%" height="100%" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <mask id="circleMask">
                      <rect width="512" height="512" fill="white" />
                      <circle cx="256" cy="256" r="160" fill="black" />
                    </mask>
                  </defs>
                  <rect width="512" height="512" fill="rgba(0,0,0,0.55)" mask="url(#circleMask)" />
                  <circle cx="256" cy="256" r="160" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
                </svg>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setCropSrc(null)} style={{
                flex: 1, background: 'transparent', border: '1px solid rgba(59,42,26,0.2)',
                borderRadius: '999px', padding: '12px', color: '#3B2A1A',
                fontSize: '14px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
              }}>ยกเลิก</button>
              <button onClick={confirmCrop} style={{
                flex: 1, background: '#3B2A1A', border: 'none',
                borderRadius: '999px', padding: '12px', color: '#FAF3E4',
                fontSize: '14px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
              }}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: '#FAF3E4', borderRadius: '12px', padding: '40px',
            width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          }}>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.8rem', color: '#3B2A1A', margin: '0 0 28px' }}>
              แก้ไขโปรไฟล์
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'USERNAME', value: username, onChange: setUsername, multiline: false },
                { label: 'BIO', value: bio, onChange: setBio, multiline: true },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#A8896A', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                  {f.multiline ? (
                    <textarea value={f.value} onChange={e => f.onChange(e.target.value)} rows={3}
                      style={{ width: '100%', background: 'transparent', border: '1px solid rgba(59,42,26,0.18)', borderRadius: '8px', padding: '10px 14px', color: '#3B2A1A', fontSize: '15px', fontFamily: '"DM Sans", sans-serif', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                  ) : (
                    <input value={f.value} onChange={e => f.onChange(e.target.value)}
                      style={{ width: '100%', background: 'transparent', border: '1px solid rgba(59,42,26,0.18)', borderRadius: '8px', padding: '10px 14px', color: '#3B2A1A', fontSize: '15px', fontFamily: '"DM Sans", sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={closeEditProfile} style={{
                flex: 1, background: 'transparent', border: '1px solid rgba(59,42,26,0.18)',
                borderRadius: '999px', padding: '12px', color: '#3B2A1A', fontSize: '14px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
              }}>ยกเลิก</button>
              <button onClick={() => updateMutation.mutate({ username, bio })} disabled={updateMutation.isPending} style={{
                flex: 1, background: '#3B2A1A', border: 'none', borderRadius: '999px',
                padding: '12px', color: '#FAF3E4', fontSize: '14px', cursor: 'pointer',
                opacity: updateMutation.isPending ? 0.6 : 1, fontFamily: '"DM Sans", sans-serif',
              }}>
                {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  )
}