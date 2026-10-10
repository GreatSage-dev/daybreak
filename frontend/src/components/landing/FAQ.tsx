import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: "What makes Daybreak different from other trading bots?",
    a: "Daybreak doesn't compete with other trading bots — it operates at the meta-layer above them. While other bots trade the price, Daybreak evaluates whether the price itself is trustworthy. It maps the 65.5-hour weekend danger curve, detects wash trading via churn-to-float analysis, and enforces 10 forbidden states that prevent catastrophic trades."
  },
  {
    q: "How does the trust score work?",
    a: "The trust score combines four components — temporal decay (calendar awareness), wash detection (volume/float ratio), depth analysis (spread and book depth), and macro alignment (CME futures correlation) — using a harmonic-geometric synthesis. This means a single failing component can drag the entire score to Grade F, unlike simple averaging which can mask dangers."
  },
  {
    q: "What are the 10 Forbidden States?",
    a: "They are 10 precisely defined market conditions where execution is mathematically guaranteed to lose money. Examples: trading during Saturday dark hours at Grade F trust, crossing a spread wider than 100 basis points, or front-running the Monday opening cross. All 10 are programmatically enforced and proved unreachable in our test suite."
  },
  {
    q: "How does Monday accountability work?",
    a: "After every weekend, Daybreak compares its predicted trust grades against Monday's actual NYSE/NASDAQ opening cross prices. The prediction error is published in the paper log. This makes Daybreak a self-auditing oracle — it doesn't just make claims, it proves them with verifiable Monday morning data."
  },
  {
    q: "What Bitget tools does Daybreak integrate?",
    a: "Daybreak uses the Bitget MCP Server for US stock & ETF data, Bitget Signal skills for macro/sentiment analysis, and the Bitget Agent Hub for paper-trading execution. It also leverages Qwen 3.8-max via Alibaba Cloud for LLM reasoning."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 px-6 max-w-4xl mx-auto" id="faq">
      <h2 className="text-3xl font-bold text-ink text-center mb-12">Frequently Asked Questions</h2>
      
      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <div key={i} className="border border-edge rounded-xl bg-surface-raised overflow-hidden">
            <div 
              className="flex justify-between items-center py-5 px-6 cursor-pointer hover:bg-surface-hover/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <h3 className="font-medium text-ink text-left pr-8">{faq.q}</h3>
              <ChevronDown 
                className={`w-5 h-5 text-ink-muted shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} 
              />
            </div>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-5 text-ink-secondary text-sm leading-relaxed pt-2 border-t border-edge/50">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}
