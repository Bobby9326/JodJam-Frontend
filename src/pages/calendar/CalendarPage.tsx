import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCalendar } from '@/hooks/useCalendar'
import type { DayEntry } from '@/types/entry.types'
import dayjs from '@/lib/dayjs'

const MONTHS = [
  { key: 'january',   th: 'มกราคม',    en: 'JAN', num: '01' },
  { key: 'february',  th: 'กุมภาพันธ์', en: 'FEB', num: '02' },
  { key: 'march',     th: 'มีนาคม',     en: 'MAR', num: '03' },
  { key: 'april',     th: 'เมษายน',     en: 'APR', num: '04' },
  { key: 'may',       th: 'พฤษภาคม',   en: 'MAY', num: '05' },
  { key: 'june',      th: 'มิถุนายน',   en: 'JUN', num: '06' },
  { key: 'july',      th: 'กรกฎาคม',   en: 'JUL', num: '07' },
  { key: 'august',    th: 'สิงหาคม',   en: 'AUG', num: '08' },
  { key: 'september', th: 'กันยายน',   en: 'SEP', num: '09' },
  { key: 'october',   th: 'ตุลาคม',    en: 'OCT', num: '10' },
  { key: 'november',  th: 'พฤศจิกายน', en: 'NOV', num: '11' },
  { key: 'december',  th: 'ธันวาคม',   en: 'DEC', num: '12' },
]
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export function CalendarPage() {
  const currentYear = dayjs().year()
  const [year, setYear] = useState(currentYear)
  const { data, isLoading } = useCalendar(year)
  const navigate = useNavigate()
  const today = dayjs().format('YYYY-MM-DD')

  const totalRecorded = data ? Object.values(data).flat().filter((d: DayEntry) => d.has_entry).length : 0
  const totalDays = dayjs(`${year}-12-31`).dayOfYear()
  const recordRate = ((totalRecorded / totalDays) * 100).toFixed(2)
  const rollNum = String(year).slice(-2)
  const isCurrentYear = year === currentYear
  const todayHasEntry = data
    ? Object.values(data).flat().some((d: DayEntry) => d.date === today && d.has_entry)
    : false

  return (
    <div style={{ minHeight: '100vh', background: '#FAF3E4', paddingBottom: '80px' }}>
      {/* Sub-header */}
      <div style={{ padding: '8px 40px 14px', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
        {/* Left */}
        <div>
          <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#A8896A' }}>ARCHIVE · คลังความทรงจำ</p>
          <p style={{ fontSize: '15px', color: '#A8896A', marginTop: '3px' }}>
            {totalRecorded} of {totalDays} days · {recordRate}% recorded
          </p>
        </div>

        {/* Center — absolute */}
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '28px',
        }}>
          <button onClick={() => setYear(y => y - 1)} style={btnStyle}>← {year - 1}</button>
          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '2.8rem', fontWeight: 300, color: '#3B2A1A' }}>
            {year}
          </span>
          <button onClick={() => setYear(y => y + 1)} disabled={year >= currentYear}
            style={{ ...btnStyle, opacity: year >= currentYear ? 0.25 : 1 }}>
            {year + 1} →
          </button>
        </div>

        {/* Right */}
        <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
          <p style={{ fontSize: '12px', letterSpacing: '0.15em', color: '#3B2A1A', fontFamily: '"DM Mono", monospace' }}>
            ROLL '{rollNum}
          </p>
          <p style={{ fontSize: '12px', color: '#A8896A', marginTop: '2px', letterSpacing: '0.1em' }}>
            {isCurrentYear ? 'IN PROGRESS' : 'COMPLETED'}
          </p>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(59,42,26,0.1)', margin: '0 40px' }} />

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
          <p style={{ color: '#A8896A', fontSize: '12px', letterSpacing: '0.3em' }}>LOADING...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', padding: '20px 40px 0' }}>
          {MONTHS.map((month, mIdx) => {
            const entries: DayEntry[] = data ? (data as any)[month.key] ?? [] : []
            const entryMap: Record<string, DayEntry> = {}
            entries.forEach(e => { entryMap[e.date] = e })
            const firstDow = dayjs(`${year}-${month.num}-01`).day()
            const daysInMonth = dayjs(`${year}-${month.num}-01`).daysInMonth()
            const recorded = entries.filter(e => e.has_entry).length

            return (
              <div key={month.key} style={{
                background: '#FAF3E4', border: '1px solid rgba(59,42,26,0.08)',
                borderRadius: '6px', padding: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '17px', fontWeight: 600, color: '#3B2A1A', margin: 0 }}>
                      {month.th}
                    </p>
                    <p style={{ fontSize: '12px', color: '#A8896A', marginTop: '2px' }}>
                      {month.en} · {String(mIdx + 1).padStart(2, '0')}/{year}
                    </p>
                  </div>
                  <p style={{ fontSize: '12px', color: '#A8896A', fontFamily: '"DM Mono", monospace' }}>
                    {recorded}/{daysInMonth}
                  </p>
                </div>

                {/* Weekday headers — ใหญ่ขึ้น */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: '5px' }}>
                  {WEEKDAYS.map(d => (
                    <p key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#A8896A', opacity: 0.7, margin: 0, fontWeight: 500 }}>{d}</p>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
                  {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1
                    const dateStr = `${year}-${month.num}-${String(dayNum).padStart(2, '0')}`
                    const entry = entryMap[dateStr]
                    const isPast = dateStr < today
                    const isToday = dateStr === today
                    const isFuture = dateStr > today
                    // กดได้ทุกวันที่ผ่านมา รวมวันที่ไม่มี entry
                    const isClickable = isPast || isToday
                    return (
                      <DayCell key={dateStr} dayNum={dayNum} dateStr={dateStr}
                        entry={entry} isPast={isPast} isToday={isToday} isFuture={isFuture}
                        onClick={() => isClickable && navigate(`/memory/${dateStr}`)} />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* FAB */}
      <div style={{ position: 'fixed', bottom: '28px', right: '32px' }}>
        <button
          onClick={() => !todayHasEntry && navigate('/memory/create')}
          disabled={todayHasEntry}
          style={{
            background: todayHasEntry ? 'rgba(59,42,26,0.4)' : '#3B2A1A',
            color: '#FAF3E4', border: 'none', borderRadius: '999px',
            padding: '14px 28px', fontSize: '14px',
            letterSpacing: '0.1em', cursor: todayHasEntry ? 'default' : 'pointer',
            boxShadow: '0 4px 24px rgba(59,42,26,0.2)',
            fontFamily: '"DM Sans", sans-serif', transition: 'all 0.2s',
          }}
        >
          {todayHasEntry ? '✓ บันทึกไปแล้ว' : 'บันทึกวันนี้ · Record Today'}
        </button>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '14px', color: '#A8896A', fontFamily: '"DM Sans", sans-serif',
}

interface DayCellProps {
  dayNum: number; dateStr: string; entry: DayEntry | undefined
  isPast: boolean; isToday: boolean; isFuture: boolean; onClick: () => void
}

function DayCell({ dayNum, dateStr, entry, isPast, isToday, isFuture, onClick }: DayCellProps) {
  const base: React.CSSProperties = {
    aspectRatio: '1', display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: '3px', overflow: 'hidden',
    position: 'relative', cursor: isPast || isToday ? 'pointer' : 'default',
  }

  if (isFuture) return (
    <div style={base}>
      <span style={{ fontSize: '11px', color: '#A8896A', opacity: 0.25 }}>{dayNum}</span>
    </div>
  )

  // วันนี้ — ring เด่น ไม่ว่ามีรูปหรือเปล่า
  if (isToday) return (
    <div onClick={onClick} style={{ ...base, outline: '2.5px solid #3B2A1A', outlineOffset: '1px' }}>
      {entry?.has_entry && entry.img_url ? (
        <img src={entry.img_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: '11px', color: '#3B2A1A', fontWeight: 700 }}>{dayNum}</span>
      )}
    </div>
  )

  if (entry?.has_entry && entry.img_url) return (
    <div onClick={onClick} style={base}>
      <img src={entry.img_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )

  // วันผ่านมาไม่มี entry — ช่องเปล่าหม่นๆ กดได้
  if (isPast) return (
    <div onClick={onClick} style={{ ...base, background: 'rgba(59,42,26,0.07)' }}>
      <span style={{ fontSize: '11px', color: 'rgba(59,42,26,0.25)' }}>{dayNum}</span>
    </div>
  )

  return <div style={base}><span style={{ fontSize: '11px', color: '#A8896A', opacity: 0.25 }}>{dayNum}</span></div>
}