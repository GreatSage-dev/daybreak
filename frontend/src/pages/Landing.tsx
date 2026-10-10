import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/landing/Hero'
import Problem from '../components/landing/Problem'
import HowItWorks from '../components/landing/HowItWorks'
import TrustCurve from '../components/landing/TrustCurve'
import ForbiddenStates from '../components/landing/ForbiddenStates'
import BattleArena from '../components/landing/BattleArena'
import Accountability from '../components/landing/Accountability'
import FAQ from '../components/landing/FAQ'
import Footer from '../components/landing/Footer'

export default function Landing() {
  return (
    <div className="bg-surface text-ink min-h-screen font-sans selection:bg-accent/20">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <TrustCurve />
        <ForbiddenStates />
        <BattleArena />
        <Accountability />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
