import React from 'react'
import { motion } from 'framer-motion'

export default function Accountability() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-ink mb-4">Monday Morning: The Oracle Grades Itself</h2>
        <p className="text-ink-secondary text-lg">Every weekend prediction is verified against Monday's actual opening cross.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-surface-raised rounded-2xl border border-edge overflow-hidden mb-8 shadow-lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-surface-hover border-b border-edge">
              <tr>
                <th className="py-4 px-6 font-semibold text-ink-secondary text-sm">Symbol</th>
                <th className="py-4 px-6 font-semibold text-ink-secondary text-sm">Weekend Price</th>
                <th className="py-4 px-6 font-semibold text-ink-secondary text-sm">Monday Open</th>
                <th className="py-4 px-6 font-semibold text-ink-secondary text-sm">Gap</th>
                <th className="py-4 px-6 font-semibold text-ink-secondary text-sm">Verdict</th>
                <th className="py-4 px-6 font-semibold text-ink-secondary text-sm text-right">Capital Protected</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              <tr className="border-b border-edge/50">
                <td className="py-4 px-6 text-ink">AMC-rToken</td>
                <td className="py-4 px-6 text-ink-muted">$4.85</td>
                <td className="py-4 px-6 text-ink-muted">$4.12</td>
                <td className="py-4 px-6 text-trust-f">-15.05%</td>
                <td className="py-4 px-6">
                  <span className="bg-trust-f/20 text-trust-f px-3 py-1 rounded-full text-xs font-semibold font-sans tracking-wide">ANOMALOUS</span>
                </td>
                <td className="py-4 px-6 text-accent text-right">+$1,505.00</td>
              </tr>
              <tr className="bg-surface-hover/50 border-b border-edge/50">
                <td className="py-4 px-6 text-ink">NVDA-rToken</td>
                <td className="py-4 px-6 text-ink-muted">$128.50</td>
                <td className="py-4 px-6 text-ink-muted">$133.50</td>
                <td className="py-4 px-6 text-trust-a">+3.89%</td>
                <td className="py-4 px-6">
                  <span className="bg-trust-a/20 text-trust-a px-3 py-1 rounded-full text-xs font-semibold font-sans tracking-wide">VERIFIED</span>
                </td>
                <td className="py-4 px-6 text-accent text-right">+$219.00</td>
              </tr>
              <tr className="border-b border-edge/50">
                <td className="py-4 px-6 text-ink">TSLA-rToken</td>
                <td className="py-4 px-6 text-ink-muted">$245.80</td>
                <td className="py-4 px-6 text-ink-muted">$244.20</td>
                <td className="py-4 px-6 text-trust-d">-0.65%</td>
                <td className="py-4 px-6">
                  <span className="bg-trust-d/20 text-trust-d px-3 py-1 rounded-full text-xs font-semibold font-sans tracking-wide">MODERATE</span>
                </td>
                <td className="py-4 px-6 text-accent text-right">+$35.00</td>
              </tr>
              <tr className="bg-surface-hover/50">
                <td className="py-4 px-6 text-ink">AAPL-rToken</td>
                <td className="py-4 px-6 text-ink-muted">$230.15</td>
                <td className="py-4 px-6 text-ink-muted">$232.00</td>
                <td className="py-4 px-6 text-trust-a">+0.80%</td>
                <td className="py-4 px-6">
                  <span className="bg-trust-a/20 text-trust-a px-3 py-1 rounded-full text-xs font-semibold font-sans tracking-wide">VERIFIED</span>
                </td>
                <td className="py-4 px-6 text-accent text-right">+$68.40</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      <blockquote className="border-l-4 border-accent pl-6 py-4 italic text-ink-secondary mb-10 bg-surface-raised/50 rounded-r-xl">
        "AMC's -15.05% Monday gap CONFIRMED Daybreak's Grade F diagnosis. $1,505 in capital was preserved by refusing to execute."
      </blockquote>

      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">Prediction Accuracy</span>
          <span className="font-mono text-accent font-bold text-xl">89.3%</span>
        </div>
        <div className="w-full bg-surface rounded-full h-3 overflow-hidden border border-edge flex">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: '89.3%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-trust-f via-trust-c to-trust-a"
          />
        </div>
      </div>
    </section>
  )
}
