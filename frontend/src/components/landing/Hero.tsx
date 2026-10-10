import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function CountUp({ end, prefix = '', suffix = '', decimals = 0 }: { end: number, prefix?: string, suffix?: string, decimals?: number }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number
    const duration = 2000
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(progress * end)
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [end])

  return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>
}

export default function Hero() {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen flex items-center justify-center flex-col pt-[72px] px-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,162,58,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="relative mb-12 animate-float">
        <div className="w-48 h-48 rounded-full bg-[radial-gradient(circle_at_center,var(--color-accent-ember),var(--color-accent-rust))] glow-amber z-10 relative shadow-[0_0_60px_rgba(232,162,58,0.4)]" />
        
        {/* Orbit Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-accent/20 rounded-full animate-[spin_10s_linear_infinite]" style={{ transform: 'translate(-50%, -50%) rotateX(75deg)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-accent-copper/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" style={{ transform: 'translate(-50%, -50%) rotateY(75deg)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-accent-rust/20 rounded-full animate-[spin_20s_linear_infinite]" style={{ transform: 'translate(-50%, -50%) rotateZ(75deg)' }} />
      </div>

      <h1 className="text-4xl md:text-6xl font-bold text-ink text-center mb-4 leading-tight z-20">
        The Price Trust Engine for <br />
        <span className="text-gradient">Tokenized US Equities</span>
      </h1>

      <p className="text-ink-secondary text-lg max-w-xl mx-auto text-center mb-10 z-20">
        Every price has a trust score. Every weekend has a danger curve. Daybreak maps both.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-20 z-20">
        <Link 
          to="/console" 
          className="bg-accent text-surface font-semibold px-8 py-3 rounded-full hover:shadow-[0_0_20px_rgba(232,162,58,0.4)] transition-all text-center"
        >
          Launch Console &rarr;
        </Link>
        <Link 
          to="/console" 
          className="border border-accent text-accent font-semibold rounded-full px-8 py-3 hover:bg-accent/10 transition-all text-center"
        >
          View Paper Log
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl z-20">
        {[
          { label: 'Alpha Generated', value: 2122, prefix: '+$', suffix: '', decimals: 0 },
          { label: 'Wash Drawdown', value: 0.00, prefix: '', suffix: '%', decimals: 2 },
          { label: 'Sharpe Ratio', value: 5.00, prefix: '', suffix: '', decimals: 2 },
          { label: 'Forbidden States', value: 10, prefix: '', suffix: '', decimals: 0 }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
            className="bg-surface-raised border border-edge rounded-xl px-6 py-4 flex flex-col items-center justify-center text-center animate-count-up"
          >
            <div className="font-mono font-bold text-3xl text-accent mb-2">
              <CountUp end={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
            </div>
            <div className="text-ink-secondary text-sm uppercase tracking-wider font-medium">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
