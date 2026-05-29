import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { statsApi } from '@/api/stats.api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import dayjs from '@/lib/dayjs'

const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const MONTHS_KEYS  = ['january','february','march','april','may','june','july','august','september','october','november','december']

const MOOD_TH: Record<string,string> = {
  happy:'มีความสุข', sad:'เศร้า', tired:'เหนื่อย',
  stressed:'เครียด', excited:'ตื่นเต้น', angry:'โกรธ',
  bored:'เบื่อ', lonely:'เหงา',
}

const WEEKDAY_TH: Record<string,string> = {
  monday:'จันทร์', tuesday:'อังคาร', wednesday:'พุธ',
  thursday:'พฤหัสบดี', friday:'ศุกร์', saturday:'เสาร์', sunday:'อาทิตย์',
  Monday:'จันทร์', Tuesday:'อังคาร', Wednesday:'พุธ',
  Thursday:'พฤหัสบดี', Friday:'ศุกร์', Saturday:'เสาร์', Sunday:'อาทิตย์',
}

export function StatsPage() {
  const currentYear = dayjs().year()
  const [year, setYear] = useState(currentYear)

  const overview   = useQuery({ queryKey: ['stats-overview',year],    queryFn: () => statsApi.getOverview(year) })
  const mood       = useQuery({ queryKey: ['stats-mood',year],        queryFn: () => statsApi.getMood(year) })
  const yearly     = useQuery({ queryKey: ['stats-yearly',year],      queryFn: () => statsApi.getYearlyAverage(year) })
  const yearlyMood = useQuery({ queryKey: ['stats-yearly-mood',year], queryFn: () => statsApi.getYearlyMood(year) })

  const chartData = MONTHS_KEYS.map((k,i) => ({
    month: MONTHS_SHORT[i],
    rating: yearly.data ? ((yearly.data as any)[k] || null) : null,
  }))

  const moodDist = yearlyMood.data
    ? Object.entries(yearlyMood.data).map(([k,v]: [string,any]) => ({
        key: k, th: MOOD_TH[k]??k, count: v.count, pct: v.percentage,
      })).sort((a,b) => b.count - a.count)
    : []

  const mostWeekdayTH = mood.data?.most_weekday
    ? (WEEKDAY_TH[mood.data.most_weekday] ?? mood.data.most_weekday)
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#FAF3E4', paddingBottom: '60px' }}>

      {/* Header */}
      <div style={{ padding: '16px 40px 20px', borderBottom: '1px solid rgba(59,42,26,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#A8896A' }}>STATISTICS · สถิติความทรงจำ · {year}</p>
            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.8rem', fontWeight: 700, color: '#3B2A1A', margin: '6px 0 0' }}>
              บัญชีความทรงจำ
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '6px' }}>
            <button onClick={() => setYear(y => y-1)} style={yearBtn}>← {year-1}</button>
            <button onClick={() => setYear(y => y+1)} disabled={year>=currentYear}
              style={{ ...yearBtn, opacity: year>=currentYear ? 0.25 : 1 }}>
              {year+1} →
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 4 stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid rgba(59,42,26,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
          {[
            { label: 'สถิติต่อเนื่อง · Current streak', value: `${overview.data?.current_streak??0}`, unit: 'DAYS', sub: 'วันติดต่อกัน' },
            { label: 'สถิติยาวที่สุด · Longest streak', value: `${overview.data?.longest_streak??0}`, unit: 'DAYS', sub: 'วันติดต่อกัน' },
            { label: 'คะแนนเฉลี่ย · Avg rating',       value: `${(overview.data?.average_rating??0).toFixed(1)}`, unit: '/ 5', sub: 'ดาว' },
            { label: 'อัตราการบันทึก · Record rate',    value: `${overview.data?.record_rating??0}`, unit: '%', sub: `${overview.data?.record_day??0} of 365 days` },
          ].map((c,i) => (
            <div key={i} style={{ padding: '28px 24px', borderLeft: i>0 ? '1px solid rgba(59,42,26,0.08)' : 'none', background: '#FAF3E4' }}>
              <p style={{ fontSize: '13px', color: '#A8896A', lineHeight: 1.6, marginBottom: '14px' }}>{c.label}</p>
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '2.4rem', fontWeight: 300, color: '#3B2A1A', margin: '0 0 4px' }}>
                {c.value} <span style={{ fontSize: '1.1rem', opacity: 0.5 }}>{c.unit}</span>
              </p>
              <p style={{ fontSize: '13px', color: '#A8896A' }}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'stretch' }}>

          {/* Line chart */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '13px', letterSpacing: '0.12em', color: '#A8896A', marginBottom: '20px' }}>
              คะแนนเฉลี่ยรายเดือน · Monthly average rating
            </p>
            <div style={{ flex: 1, minHeight: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#A8896A' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0,5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 12, fill: '#A8896A' }} axisLine={false} tickLine={false} />
                  {[1,2,3,4,5].map(v => <ReferenceLine key={v} y={v} stroke="rgba(59,42,26,0.05)" />)}
                  <Tooltip contentStyle={{ background: '#FAF3E4', border: '1px solid rgba(59,42,26,0.12)', borderRadius: '6px', fontSize: '13px' }} />
                  <Line type="monotone" dataKey="rating" stroke="#3B2A1A" strokeWidth={1.5}
                    dot={{ r: 4, fill: '#3B2A1A', strokeWidth: 0 }} activeDot={{ r: 5 }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Most frequent mood */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '13px', letterSpacing: '0.12em', color: '#A8896A', marginBottom: '20px' }}>
              อารมณ์ที่บ่อยที่สุด · Most frequent
            </p>
            <div style={{ flex: 1, background: '#F0E6D0', borderRadius: '8px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {mood.data ? (
                <>
                  <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3.5rem', color: '#3B2A1A', margin: '0 0 16px' }}>
                    {MOOD_TH[mood.data.mood]??mood.data.mood}
                  </h2>
                  <p style={{ color: '#A8896A', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
                    ทั้งหมด {mood.data.count} วัน คิดเป็น {mood.data.percentage}% ของทั้งปี
                  </p>
                  {mostWeekdayTH && (
                    <p style={{ color: '#A8896A', fontSize: '15px', lineHeight: 1.7, margin: '4px 0 0' }}>
                      โดยส่วนใหญ่เป็นวัน{mostWeekdayTH} เป็นจำนวน {mood.data.amount} วัน
                    </p>
                  )}
                </>
              ) : (
                <p style={{ color: '#A8896A', fontSize: '15px' }}>ยังไม่มีข้อมูล</p>
              )}
            </div>
          </div>
        </div>

        {/* Mood distribution */}
        <div>
          <p style={{ fontSize: '13px', letterSpacing: '0.12em', color: '#A8896A', marginBottom: '20px' }}>
            การกระจายตัวของอารมณ์ · Mood distribution
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {moodDist.map(m => (
              <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '170px', textAlign: 'right' }}>
                  <span style={{ fontSize: '15px', color: '#3B2A1A' }}>{m.th}</span>
                  <span style={{ fontSize: '12px', color: '#A8896A', marginLeft: '6px' }}>· {m.key.toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, height: '24px', background: 'rgba(59,42,26,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', background: '#3B2A1A', borderRadius: '4px',
                    width: `${m.pct}%`, transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ width: '88px', textAlign: 'right' }}>
                  <span style={{ fontSize: '15px', color: '#3B2A1A', fontFamily: '"DM Mono", monospace' }}>{m.count}</span>
                  <span style={{ fontSize: '12px', color: '#A8896A', marginLeft: '4px' }}>({m.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const yearBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '14px', color: '#A8896A', fontFamily: '"DM Sans", sans-serif',
}
