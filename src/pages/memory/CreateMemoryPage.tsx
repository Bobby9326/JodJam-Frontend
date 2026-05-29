import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useCreateMemory } from '@/hooks/useEntries'
import type { Mood } from '@/types/entry.types'
import dayjs from '@/lib/dayjs'

import s01 from '@/assets/images/samples/sample-01.jpg'
import s02 from '@/assets/images/samples/sample-02.jpg'
import s03 from '@/assets/images/samples/sample-03.jpg'
import s04 from '@/assets/images/samples/sample-04.jpg'
import s05 from '@/assets/images/samples/sample-05.jpg'
import s06 from '@/assets/images/samples/sample-06.jpg'
import s07 from '@/assets/images/samples/sample-07.jpg'
import s08 from '@/assets/images/samples/sample-08.jpg'
import s09 from '@/assets/images/samples/sample-09.jpg'
import s10 from '@/assets/images/samples/sample-10.jpg'
import s11 from '@/assets/images/samples/sample-11.jpg'
import s12 from '@/assets/images/samples/sample-12.jpg'

const SAMPLES = [s01,s02,s03,s04,s05,s06,s07,s08,s09,s10,s11,s12]
const VISIBLE = 6

const MOODS: { value: Mood; th: string; en: string }[] = [
  { value: 'happy',    th: 'มีความสุข', en: 'HAPPY' },
  { value: 'sad',      th: 'เศร้า',     en: 'SAD' },
  { value: 'tired',    th: 'เหนื่อย',   en: 'TIRED' },
  { value: 'stressed', th: 'เครียด',    en: 'STRESSED' },
  { value: 'excited',  th: 'ตื่นเต้น',  en: 'EXCITED' },
  { value: 'angry',    th: 'โกรธ',      en: 'ANGRY' },
  { value: 'bored',    th: 'เบื่อ',     en: 'BORED' },
  { value: 'lonely',   th: 'เหงา',      en: 'LONELY' },
]

const THAI_DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์']
const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']

export function CreateMemoryPage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateMemory()
  const today = dayjs()
  const dayOfYear = today.dayOfYear()
  const totalDays = today.isLeapYear() ? 366 : 365

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedSample, setSelectedSample] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [mood, setMood] = useState<Mood | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [sampleOffset, setSampleOffset] = useState(0)

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]; if (!f) return
    setFile(f); setPreview(URL.createObjectURL(f)); setSelectedSample(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }, maxFiles: 1,
  })

  const selectSample = (src: string, idx: number) => {
    setSelectedSample(idx); setPreview(src)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        if (blob) setFile(new File([blob], `sample-${idx+1}.jpg`, { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.9)
    }
    img.src = src
  }

  const canSlideLeft = sampleOffset > 0
  const canSlideRight = sampleOffset + VISIBLE < SAMPLES.length
  const visibleSamples = SAMPLES.slice(sampleOffset, sampleOffset + VISIBLE)

  const handleSubmit = () => {
    if (!file || !note.trim() || !mood || !rating) return
    mutate({ file, note, mood, rating }, { onSuccess: () => navigate('/') })
  }

  const isReady = file && note.trim() && mood && rating > 0

  return (
    <div style={{ minHeight: '100vh', background: '#FAF3E4', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ padding: '16px 40px 20px', borderBottom: '1px solid rgba(59,42,26,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#A8896A' }}>บันทึกวันนี้ · NEW ENTRY</p>
            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3.2rem', fontWeight: 700, color: '#3B2A1A', margin: '4px 0 0' }}>
              {today.date()} {THAI_MONTHS[today.month()]}
            </h1>
            <p style={{ fontSize: '15px', color: '#A8896A', marginTop: '4px' }}>
              {THAI_DAYS[today.day()]}{'  '}{today.format('DD.MM.YYYY')}
            </p>
          </div>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '2.5rem', fontWeight: 300, marginTop: '8px' }}>
            <span style={{ color: '#3B2A1A' }}>{dayOfYear}</span>
            <span style={{ color: 'rgba(59,42,26,0.2)' }}> / {totalDays}</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', padding: '28px 40px 0' }}>

        {/* LEFT */}
        <div>
          <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#A8896A', marginBottom: '12px' }}>
            01 · ภาพถ่าย / Photograph
          </p>

          <div {...getRootProps()} style={{
            border: `2px dashed ${isDragActive ? '#3B2A1A' : 'rgba(59,42,26,0.22)'}`,
            borderRadius: '8px', aspectRatio: '16/9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden',
            background: isDragActive ? 'rgba(59,42,26,0.03)' : 'transparent',
            transition: 'all 0.2s',
          }}>
            <input {...getInputProps()} />
            {preview ? (
              <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <p style={{ color: '#3B2A1A', fontSize: '15px', marginBottom: '8px' }}>ลากรูปมาวาง หรือคลิกเพื่อเลือก</p>
                <p style={{ color: '#A8896A', fontSize: '11px', letterSpacing: '0.15em' }}>DRAG & DROP – OR CLICK TO BROWSE</p>
                <p style={{ color: '#A8896A', fontSize: '11px', letterSpacing: '0.15em', marginTop: '4px' }}>JPG · PNG · UP TO 12MB</p>
              </div>
            )}
          </div>

          {/* Sample strip */}
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#A8896A', marginBottom: '8px' }}>OR PICK A SAMPLE</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setSampleOffset(o => Math.max(0, o - 1))} disabled={!canSlideLeft}
                style={{ ...arrowBtn, opacity: canSlideLeft ? 1 : 0.2 }}>‹</button>
              <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                {visibleSamples.map((src, i) => {
                  const realIdx = sampleOffset + i
                  return (
                    <button key={realIdx} onClick={() => selectSample(src, realIdx)} style={{
                      flex: 1, aspectRatio: '1', borderRadius: '6px', overflow: 'hidden',
                      border: selectedSample === realIdx ? '2.5px solid #3B2A1A' : '2px solid transparent',
                      cursor: 'pointer', padding: 0, transition: 'border-color 0.15s',
                    }}>
                      <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  )
                })}
              </div>
              <button onClick={() => setSampleOffset(o => Math.min(SAMPLES.length - VISIBLE, o + 1))} disabled={!canSlideRight}
                style={{ ...arrowBtn, opacity: canSlideRight ? 1 : 0.2 }}>›</button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Note */}
          <div>
            <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#A8896A', marginBottom: '10px' }}>02 · คำบรรยาย / Note</p>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="วันนี้เป็นยังไง" rows={4}
              style={{
                width: '100%', background: 'transparent',
                border: '1px solid rgba(59,42,26,0.18)', borderRadius: '10px',
                padding: '12px 14px', color: '#3B2A1A', fontSize: '15px',
                fontFamily: '"DM Sans", sans-serif', resize: 'none', outline: 'none', boxSizing: 'border-box',
              }} />
          </div>

          {/* Mood — สูงขึ้น */}
          <div>
            <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#A8896A', marginBottom: '10px' }}>03 · อารมณ์ / Mood — pick one</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
              {MOODS.map(m => (
                <button key={m.value} onClick={() => setMood(m.value)} style={{
                  border: `1px solid ${mood === m.value ? '#3B2A1A' : 'rgba(59,42,26,0.18)'}`,
                  background: mood === m.value ? '#3B2A1A' : 'transparent',
                  borderRadius: '10px', padding: '16px 8px',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                }}>
                  <p style={{ fontSize: '14px', color: mood === m.value ? '#FAF3E4' : '#3B2A1A', fontWeight: 500, fontFamily: '"DM Sans", sans-serif', margin: 0 }}>{m.th}</p>
                  <p style={{ fontSize: '11px', color: mood === m.value ? 'rgba(250,243,228,0.55)' : '#A8896A', marginTop: '3px', letterSpacing: '0.05em' }}>{m.en}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Rating — ดาว outline ไม่มี box */}
          <div>
            <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#A8896A', marginBottom: '10px' }}>04 · คะแนนวันนี้ / Rating</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[1,2,3,4,5].map(star => (
                <button key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none', border: 'none', padding: '4px',
                    fontSize: '2.2rem', cursor: 'pointer',
                    color: star <= (hoverRating || rating) ? '#C4882A' : 'rgba(59,42,26,0.15)',
                    transition: 'all 0.15s',
                    transform: hoverRating === star ? 'scale(1.15)' : 'scale(1)',
                    lineHeight: 1,
                    WebkitTextStroke: star <= (hoverRating || rating) ? '0' : '1px rgba(59,42,26,0.3)',
                  }}
                >★</button>
              ))}
            </div>
          </div>

          {/* Submit — ชิดล่าง */}
          <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
            <button onClick={handleSubmit} disabled={!isReady || isPending} style={{
              width: '100%', background: '#3B2A1A', color: '#FAF3E4',
              border: 'none', borderRadius: '999px', padding: '16px',
              fontSize: '15px', letterSpacing: '0.12em',
              cursor: isReady ? 'pointer' : 'not-allowed', opacity: isReady ? 1 : 0.35,
              fontFamily: '"DM Sans", sans-serif', transition: 'opacity 0.2s',
            }}>
              {isPending ? 'กำลังบันทึก...' : 'บันทึก · Save Memory'}
            </button>
            <p style={{ fontSize: '12px', color: '#A8896A', marginTop: '10px', opacity: 0.65 }}>
              ⚠ once saved, this memory cannot be edited or deleted.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const arrowBtn: React.CSSProperties = {
  background: 'none', border: '1px solid rgba(59,42,26,0.2)',
  borderRadius: '50%', width: '32px', height: '32px',
  fontSize: '18px', cursor: 'pointer', color: '#3B2A1A',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, transition: 'opacity 0.2s',
}
