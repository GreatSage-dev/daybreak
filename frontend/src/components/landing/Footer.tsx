import React from 'react'
import { Github, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-edge py-12 px-6 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12 text-ink-muted font-semibold text-sm">
          <span className="hover:text-accent transition-colors cursor-default">Bitget</span>
          <span className="text-edge">&bull;</span>
          <span className="hover:text-accent transition-colors cursor-default">Bitget AI</span>
          <span className="text-edge">&bull;</span>
          <span className="hover:text-accent transition-colors cursor-default">Agent Hub</span>
          <span className="text-edge">&bull;</span>
          <span className="hover:text-accent transition-colors cursor-default">Alibaba Cloud</span>
          <span className="text-edge">&bull;</span>
          <span className="hover:text-accent transition-colors cursor-default">Qwen</span>
        </div>

        <div className="border-t border-edge pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-ink-muted text-sm text-center md:text-left">
            DAYBREAK &middot; Bitget AI &times; Crypto Hackathon S2 &middot; 2026
          </div>
          
          <div className="text-ink-secondary text-sm font-medium">
            Built by Promise Philip
          </div>
          
          <div className="flex items-center gap-4">
            <a href="#" className="text-ink-muted hover:text-accent transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-ink-muted hover:text-accent transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
