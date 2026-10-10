import React from 'react'
import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

export default function Problem() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto" id="problem">
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h2 className="italic text-2xl md:text-3xl text-accent-copper mb-2 font-medium">
          "Every AI trading bot on Bitget trades the price. None of them ask: is the price trustworthy?"
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-surface-raised rounded-2xl p-8 border-l-4 border-trust-f shadow-lg flex flex-col"
        >
          <h3 className="text-trust-f font-semibold text-xl mb-6 flex items-center gap-2">
            Naive Baseline Bot
          </h3>
          <ul className="space-y-4 mb-8 flex-grow">
            {[
              "Trades any headline blindly",
              "Saturday dark = any other hour",
              "AMC $103M volume = bullish signal",
              "No post-trade accountability"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-ink-secondary">
                <X className="text-trust-f w-5 h-5 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="bg-surface p-5 rounded-xl border border-edge">
            <div className="text-trust-f font-mono text-2xl font-bold mb-1">Result: -$1,845.80</div>
            <div className="text-ink-muted text-sm font-mono">Sharpe: -0.84</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-surface-raised rounded-2xl p-8 border-l-4 border-trust-a shadow-lg flex flex-col"
        >
          <h3 className="text-trust-a font-semibold text-xl mb-6 flex items-center gap-2">
            DAYBREAK Agent
          </h3>
          <ul className="space-y-4 mb-8 flex-grow">
            {[
              "Maps 65.5h weekend danger curve",
              "Saturday dark = 0.15 noise floor",
              "AMC 15.6x churn = wash trap detected",
              "Monday cross grades itself"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-ink">
                <Check className="text-trust-a w-5 h-5 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="bg-surface p-5 rounded-xl border border-edge card-gradient-border">
            <div className="text-trust-a font-mono text-2xl font-bold mb-1">Result: +$276.42</div>
            <div className="text-ink-muted text-sm font-mono">Sharpe: 5.00</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
