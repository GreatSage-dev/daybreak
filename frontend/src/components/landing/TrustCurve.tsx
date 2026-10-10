import React from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CURVE_DATA = [
  { delta: 0, score: 0.85, phase: 'Friday Post-Close' },
  { delta: 2.5, score: 0.85, phase: 'Friday Post-Close' },
  { delta: 5, score: 0.15, phase: 'Saturday Dark' },
  { delta: 10, score: 0.15, phase: 'Saturday Dark' },
  { delta: 15, score: 0.15, phase: 'Saturday Dark' },
  { delta: 20, score: 0.15, phase: 'Saturday Dark' },
  { delta: 25, score: 0.15, phase: 'Saturday Dark' },
  { delta: 27.5, score: 0.25, phase: 'Sunday Pre-Futures' },
  { delta: 30, score: 0.25, phase: 'Sunday Pre-Futures' },
  { delta: 35, score: 0.25, phase: 'Sunday Pre-Futures' },
  { delta: 40, score: 0.25, phase: 'Sunday Pre-Futures' },
  { delta: 45, score: 0.25, phase: 'Sunday Pre-Futures' },
  { delta: 50, score: 0.65, phase: 'Futures Reopen' },
  { delta: 52.5, score: 0.65, phase: 'Futures Reopen' },
  { delta: 55, score: 0.65, phase: 'Futures Reopen' },
  { delta: 57.5, score: 0.65, phase: 'Futures Reopen' },
  { delta: 60, score: 0.85, phase: 'Monday Pre-Market' },
  { delta: 62.5, score: 0.85, phase: 'Monday Pre-Market' },
  { delta: 65, score: 0.85, phase: 'Monday Pre-Market' },
  { delta: 65.5, score: 1.0, phase: 'Regular Hours' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-edge p-3 rounded-lg shadow-xl">
        <p className="text-ink font-semibold mb-1">{payload[0].payload.phase}</p>
        <p className="text-accent font-mono">Trust Score: {payload[0].value.toFixed(2)}</p>
        <p className="text-ink-muted text-xs font-mono mt-1">+{label}h from close</p>
      </div>
    )
  }
  return null
}

export default function TrustCurve() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-ink mb-4">The 65.5-Hour Trust Curve</h2>
        <p className="text-ink-secondary">Mapping the decay of institutional liquidity over the weekend</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-surface-raised rounded-2xl p-4 md:p-8 border border-edge shadow-xl"
      >
        <div className="h-[400px] w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CURVE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8A23A" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#E8A23A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2118" vertical={false} />
              <XAxis 
                dataKey="delta" 
                stroke="#6B5D50" 
                tick={{ fill: '#6B5D50', fontSize: 12 }}
                tickMargin={10}
                axisLine={{ stroke: '#2A2118' }}
              />
              <YAxis 
                domain={[0, 1]} 
                stroke="#6B5D50" 
                tick={{ fill: '#6B5D50', fontSize: 12 }}
                axisLine={{ stroke: '#2A2118' }}
                tickFormatter={(val) => val.toFixed(1)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#E8A23A" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {[
            { name: 'Friday Post-Close', time: '0-5h', color: 'bg-trust-a/20 text-trust-a border-trust-a/30' },
            { name: 'Saturday Dark', time: '5-27.5h', color: 'bg-trust-f/20 text-trust-f border-trust-f/30' },
            { name: 'Sunday Pre-Futures', time: '27.5-50h', color: 'bg-trust-d/20 text-trust-d border-trust-d/30' },
            { name: 'Futures Reopen', time: '50-60h', color: 'bg-trust-c/20 text-trust-c border-trust-c/30' },
            { name: 'Monday Pre-Market', time: '60-65.5h', color: 'bg-trust-a/20 text-trust-a border-trust-a/30' }
          ].map((phase, i) => (
            <div key={i} className={`px-4 py-2 rounded-full border flex items-center gap-2 text-xs font-semibold ${phase.color}`}>
              <span>{phase.name}</span>
              <span className="opacity-70 font-mono">({phase.time})</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
