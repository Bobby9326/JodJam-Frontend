import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useCreateMemory } from '@/hooks/useEntries'
import type { Mood } from '@/types/entry.types'
import dayjs from '@/lib/dayjs'

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const COMPRESS_MAX_DIMENSION = 1920   // px – long edge after compression
const COMPRESS_QUALITY = 0.85         // JPEG quality after compression
const COMPRESS_TARGET_BYTES = 4.5 * 1024 * 1024  // aim for ≤ 4.5 MB (backend limit 5 MB)

// ─── Image compression helper ─────────────────────────────────────────────────
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { naturalWidth: w, naturalHeight: h } = img
      if (w > COMPRESS_MAX_DIMENSION || h > COMPRESS_MAX_DIMENSION) {
        if (w >= h) { h = Math.round((h / w) * COMPRESS_MAX_DIMENSION); w = COMPRESS_MAX_DIMENSION }
        else         { w = Math.round((w / h) * COMPRESS_MAX_DIMENSION); h = COMPRESS_MAX_DIMENSION }
      }

      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)

      // Try progressively lower quality until under target size
      let quality = COMPRESS_QUALITY
      const tryBlob = (q: number) => {
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error('Canvas toBlob failed')); return }
          if (blob.size > COMPRESS_TARGET_BYTES && q > 0.5) {
            tryBlob(q - 0.1)
          } else {
            resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }))
          }
        }, 'image/jpeg', q)
      }
      tryBlob(quality)
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')) }
    img.src = objectUrl
  })
}

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
import s13 from '@/assets/images/samples/sample-13.jpg'
import s14 from '@/assets/images/samples/sample-14.jpg'


const SAMPLES = [s01,s02,s03,s04,s05,s06,s07,s08,s09,s10,s11,s12,s13,s14]
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
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null)  // track for cleanup
  const [selectedSample, setSelectedSample] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [mood, setMood] = useState<Mood | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [sampleOffset, setSampleOffset] = useState(0)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // ── Cleanup object URL on unmount or when preview changes ──────────────────
  useEffect(() => {
    return () => { if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl) }
  }, [previewObjectUrl])

  // ── Prefetch all sample images when component mounts ───────────────────────
  useEffect(() => {
    SAMPLES.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'prefetch'; link.as = 'image'; link.href = src
      document.head.appendChild(link)
    })
  }, [])

  // ── Helper: set preview with cleanup of previous object URL ────────────────
  const setPreviewWithCleanup = (url: string | null, isObjectUrl = false) => {
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
    setPreview(url)
    setPreviewObjectUrl(isObjectUrl ? url : null)
  }

  const onDrop = useCallback(async (accepted: File[], rejected: any[]) => {
    setFileError(null)

    // Handle dropzone rejections (wrong type etc.)
    if (rejected.length > 0) {
      setFileError('ไฟล์ไม่ถูกต้อง — รองรับเฉพาะ JPG, PNG, WebP')
      return
    }

    const f = accepted[0]; if (!f) return

    // Validate size before compression
    if (f.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`ไฟล์ใหญ่เกินไป — ขนาดสูงสุด ${MAX_FILE_SIZE_MB} MB (ไฟล์นี้ ${(f.size / 1024 / 1024).toFixed(1)} MB)`)
      return
    }

    // Show preview immediately, then compress in background
    const tempUrl = URL.createObjectURL(f)
    setPreviewWithCleanup(tempUrl, true)
    setSelectedSample(null)
    setIsCompressing(true)

    try {
      const compressed = await compressImage(f)
      setFile(compressed)
    } catch {
      setFileError('ไม่สามารถประมวลผลรูปได้ กรุณาลองใหม่')
      setPreviewWithCleanup(null)
    } finally {
      setIsCompressing(false)
    }
  }, [previewObjectUrl])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_BYTES,
  })

  const selectSample = (src: string, idx: number) => {
    setFileError(null)
    setSelectedSample(idx)
    setPreviewWithCleanup(src, false)
    setIsCompressing(true)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      canvas.toBlob(async blob => {
        if (!blob) { setIsCompressing(false); return }
        try {
          const raw = new File([blob], `sample-${idx+1}.jpg`, { type: 'image/jpeg' })
          const compressed = await compressImage(raw)
          setFile(compressed)
        } catch {
          setFileError('ไม่สามารถประมวลผลรูปได้ กรุณาลองใหม่')
        } finally {
          setIsCompressing(false)
        }
      }, 'image/jpeg', 1.0)
    }
    img.src = src
  }

  const canSlideLeft = sampleOffset > 0
  const canSlideRight = sampleOffset + VISIBLE < SAMPLES.length
  const visibleSamples = SAMPLES.slice(sampleOffset, sampleOffset + VISIBLE)

  const handleSubmit = () => {
    if (!file || !note.trim() || !mood || !rating) return
    setUploadError(null)
    mutate(
      { file, note, mood, rating },
      {
        onSuccess: () => navigate('/'),
        onError: (err: any) => {
          const msg = err?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
          setUploadError(msg)
        },
      }
    )
  }

  const isReady = file && note.trim() && mood && rating > 0 && !isCompressing

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
            border: `2px dashed ${isDragActive ? '#3B2A1A' : fileError ? '#C0392B' : 'rgba(59,42,26,0.22)'}`,
            borderRadius: '8px', aspectRatio: '16/9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden',
            background: isDragActive ? 'rgba(59,42,26,0.03)' : 'transparent',
            transition: 'all 0.2s',
            position: 'relative',
          }}>
            <input {...getInputProps()} />
            {preview ? (
              <>
                <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {isCompressing && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(250,243,228,0.75)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px',
                  }}>
                    <p style={{ fontSize: '13px', color: '#3B2A1A', letterSpacing: '0.1em' }}>COMPRESSING...</p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <p style={{ color: '#3B2A1A', fontSize: '15px', marginBottom: '8px' }}>ลากรูปมาวาง หรือคลิกเพื่อเลือก</p>
                <p style={{ color: '#A8896A', fontSize: '11px', letterSpacing: '0.15em' }}>DRAG & DROP – OR CLICK TO BROWSE</p>
                <p style={{ color: '#A8896A', fontSize: '11px', letterSpacing: '0.15em', marginTop: '4px' }}>JPG · PNG · WebP · UP TO {MAX_FILE_SIZE_MB}MB</p>
              </div>
            )}
          </div>
          {fileError && (
            <p style={{ fontSize: '12px', color: '#C0392B', marginTop: '8px', letterSpacing: '0.05em' }}>⚠ {fileError}</p>
          )}

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
            {uploadError && (
              <p style={{ fontSize: '12px', color: '#C0392B', marginBottom: '10px', letterSpacing: '0.05em' }}>⚠ {uploadError}</p>
            )}
            <button onClick={handleSubmit} disabled={!isReady || isPending} style={{
              width: '100%', background: '#3B2A1A', color: '#FAF3E4',
              border: 'none', borderRadius: '999px', padding: '16px',
              fontSize: '15px', letterSpacing: '0.12em',
              cursor: isReady ? 'pointer' : 'not-allowed', opacity: isReady ? 1 : 0.35,
              fontFamily: '"DM Sans", sans-serif', transition: 'opacity 0.2s',
            }}>
              {isPending ? 'กำลังบันทึก...' : isCompressing ? 'กำลังประมวลผลรูป...' : 'บันทึก · Save Memory'}
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