import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Shield, Clock, AlertTriangle, BarChart3, Globe, Lock } from 'lucide-react'

export default function HowItWorks() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.4 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  return (
    <section className="py-24 px-6 max-w-4xl mx-auto" id="how-it-works">
      <h2 className="text-3xl font-bold text-center text-ink mb-16">How Daybreak Works</h2>
      
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col items-center"
      >
        {/* Node 1 */}
        <motion.div variants={item} className="w-full">
          <div className="card-gradient-border rounded-2xl p-6 bg-surface-raised relative flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 text-accent">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Market Event</h3>
            <p className="text-ink-secondary">Breaking news headline hits during weekend dark hours.</p>
          </div>
        </motion.div>

        {/* Connector */}
        <motion.div variants={item} className="w-px h-16 bg-edge" />

        {/* Node 2 */}
        <motion.div variants={item} className="w-full">
          <div className="border border-edge hover:border-edge-glow transition-all rounded-2xl p-8 bg-surface-raised relative shadow-lg">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 text-accent">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Trust Engine</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-surface p-4 rounded-xl border border-edge flex items-center gap-3">
                <Clock className="w-5 h-5 text-accent-copper shrink-0" />
                <span className="text-sm text-ink-secondary font-medium">Temporal Curve — 65.5h decay mapping</span>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-edge flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-accent-copper shrink-0" />
                <span className="text-sm text-ink-secondary font-medium">Wash Detection — Churn/Float ratio</span>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-edge flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-accent-copper shrink-0" />
                <span className="text-sm text-ink-secondary font-medium">Depth Analysis — Spread & book depth</span>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-edge flex items-center gap-3">
                <Globe className="w-5 h-5 text-accent-copper shrink-0" />
                <span className="text-sm text-ink-secondary font-medium">Macro Alignment — CME & VIX correlation</span>
              </div>
            </div>
            
            <div className="text-center font-mono text-accent bg-surface-hover py-3 rounded-lg border border-edge">
              T = √(H · G)
            </div>
          </div>
        </motion.div>

        {/* Connector */}
        <motion.div variants={item} className="w-px h-16 bg-edge" />

        {/* Node 3 */}
        <motion.div variants={item} className="w-full">
          <div className="border border-edge rounded-2xl p-8 bg-surface-raised flex flex-col items-center text-center shadow-lg">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 text-accent">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Policy Gate</h3>
            <p className="text-ink-secondary mb-8">
              10 Forbidden States &middot; Quadratic Sizing: Size = Base &times; Score²
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-trust-a/20 text-trust-a border border-trust-a/30 rounded-full px-5 py-2 text-sm font-bold tracking-wide">
                EXECUTE
              </span>
              <span className="bg-trust-d/20 text-trust-d border border-trust-d/30 rounded-full px-5 py-2 text-sm font-bold tracking-wide">
                PASSIVE PEG
              </span>
              <span className="bg-trust-f/20 text-trust-f border border-trust-f/30 rounded-full px-5 py-2 text-sm font-bold tracking-wide">
                REFUSE
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
