import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Menu, Activity } from 'lucide-react'
import { api, SystemStatusResponse } from '../lib/api'

export default function Navbar() {
  const [status, setStatus] = useState<SystemStatusResponse | null>(null)

  useEffect(() => {
    api.systemStatus().then(setStatus).catch(() => null)
  }, [])

  return (
    <nav className="bg-surface/85 backdrop-blur-xl h-[72px] border-b border-edge fixed top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <Sun className="text-accent w-6 h-6" />
            <span className="font-bold text-accent text-xl tracking-wide">DAYBREAK</span>
          </Link>
          
          {/* Live System Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-trust-a/10 border border-trust-a/30 text-xs font-mono text-trust-a">
            <span className="w-2 h-2 rounded-full bg-trust-a animate-pulse" />
            <span>LIVE DATA</span>
            <span className="text-ink-muted">•</span>
            <span className="text-ink-secondary">
              BTC ${status?.liveBenchmarks?.btcUsd?.toLocaleString() || '82,959'}
            </span>
            <span className="text-ink-muted">•</span>
            <span className="text-accent">{status?.testnetStatus?.mode?.replace(/_/g, ' ') || 'TESTNET READY'}</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Results', 'FAQ'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-ink-secondary hover:text-accent transition-colors relative group text-sm font-medium"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all group-hover:w-full"></span>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/console" 
            className="hidden sm:flex items-center gap-2 bg-accent text-surface px-5 py-2 rounded-full font-semibold hover:shadow-[0_0_20px_rgba(232,162,58,0.3)] transition-all"
          >
            Launch Console &rarr;
          </Link>
          <button className="md:hidden text-ink">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  )
}
