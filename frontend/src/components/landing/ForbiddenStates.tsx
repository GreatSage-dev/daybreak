import React from 'react'
import { motion } from 'framer-motion'
import { ShieldOff, CheckCircle } from 'lucide-react'

const STATES = [
  { title: "Zero Trust Sizing", desc: "Grade F (<0.30) = zero allocation. No exceptions." },
  { title: "Excessive Churn Buy", desc: "Volume/float >5x without SEC 8-K = wash trap." },
  { title: "Dark Market Order", desc: "Market orders banned during Saturday dark at Grade D." },
  { title: "Negative Depth Execution", desc: "Order >50% of top-5 book depth = guaranteed impact." },
  { title: "Wide Spread Cross", desc: "Spread >100 bps crossing prohibited." },
  { title: "Oracle Desync Arbitrage", desc: "Price >8% from close without filing = manipulation." },
  { title: "Pre-Futures Speculation", desc: "No speculation Sunday pre-futures without macro." },
  { title: "Unhedged Weekend Overnight", desc: ">$25K unhedged in Saturday dark hours." },
  { title: "Post-Close Momentum Chase", desc: "Late Friday momentum chase without 8-K." },
  { title: "Monday Open Front-Run", desc: "Market orders within 15 min of opening cross." }
]

export default function ForbiddenStates() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-ink mb-4">10 States Your Bot Can Never Enter</h2>
        <p className="text-ink-secondary text-lg">Programmatically enforced. Mathematically proved. Zero violations possible.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {STATES.map((state, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-surface-raised rounded-xl p-5 border border-edge border-t-2 border-t-trust-f hover:border-edge-glow transition-all duration-300 hover:-translate-y-1 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <ShieldOff className="text-trust-f w-5 h-5 shrink-0" />
              <h3 className="font-semibold text-ink text-sm">{state.title}</h3>
            </div>
            <p className="text-ink-secondary text-sm leading-relaxed">{state.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="w-full bg-surface-raised rounded-xl p-4 border border-trust-a/30 flex flex-col sm:flex-row items-center justify-center gap-4 shadow-sm"
      >
        <CheckCircle className="text-trust-a w-6 h-6" />
        <span className="font-semibold text-ink">All 10 states proved unreachable</span>
        <span className="hidden sm:inline text-edge">&bull;</span>
        <span className="font-mono text-accent">19/19 tests &middot; 726ms</span>
      </motion.div>
    </section>
  )
}
