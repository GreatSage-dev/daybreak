# DAYBREAK — Landing Page Design Specification

> **Design Reference:** Dark-themed DeFi landing page (see uploaded reference image).
> This document specifies how to adapt that visual language for DAYBREAK's identity and Bitget Hackathon S2 submission.

---

## 1. Global Design Tokens

### Color Palette

| Token                  | Hex       | Usage                                         |
| :--------------------- | :-------- | :-------------------------------------------- |
| `--bg-primary`         | `#0A0604` | Page background — near-black with warm tint   |
| `--bg-secondary`       | `#120E0A` | Card backgrounds, elevated surfaces           |
| `--bg-tertiary`        | `#1A1410` | Hover states, active surfaces                 |
| `--bg-glass`           | `rgba(18,14,10,0.65)` | Glassmorphism overlays, modals     |
| `--accent-amber`       | `#E8A23A` | Primary accent — CTAs, active states, grades   |
| `--accent-copper`      | `#C77B30` | Secondary accent — borders, subtle highlights  |
| `--accent-rust`        | `#9A5524` | Tertiary accent — gradients, glows             |
| `--accent-ember`       | `#FF6B2C` | Danger / Grade F / refuse states               |
| `--trust-green`        | `#34D399` | Grade A trust, positive PnL, capital preserved |
| `--trust-blue`         | `#60A5FA` | Grade B trust, futures reopen indicator        |
| `--trust-yellow`       | `#FBBF24` | Grade C trust, caution states                  |
| `--trust-orange`       | `#F97316` | Grade D trust, passive peg states              |
| `--trust-red`          | `#EF4444` | Grade F trust, forbidden states, naive losses  |
| `--text-primary`       | `#F5F0EB` | Headlines, primary copy                        |
| `--text-secondary`     | `#A39585` | Body text, descriptions, metadata              |
| `--text-muted`         | `#6B5D50` | Captions, timestamps, labels                   |
| `--border-default`     | `#2A2118` | Card borders, dividers                         |
| `--border-glow`        | `rgba(232,162,58,0.25)` | Glow borders on hover              |

### Gradients

| Name               | Value                                                     | Usage                   |
| :----------------- | :-------------------------------------------------------- | :---------------------- |
| `--glow-radial`    | `radial-gradient(ellipse at 50% 0%, rgba(232,162,58,0.12) 0%, transparent 70%)` | Page top ambient glow   |
| `--card-border`    | `linear-gradient(135deg, #C77B30 0%, #9A5524 50%, #2A2118 100%)` | Featured card borders   |
| `--hero-glow`      | `radial-gradient(circle at center, rgba(255,107,44,0.3) 0%, rgba(232,162,58,0.08) 40%, transparent 70%)` | Behind hero sphere      |
| `--trust-gradient`  | `linear-gradient(90deg, #EF4444 0%, #F97316 25%, #FBBF24 50%, #60A5FA 75%, #34D399 100%)` | Trust score spectrum bar |

### Typography

| Element           | Font             | Weight | Size         | Line Height | Letter Spacing |
| :---------------- | :--------------- | :----- | :----------- | :---------- | :------------- |
| Hero headline     | Inter / Geist    | 700    | 56px / 3.5rem | 1.1         | -0.02em        |
| Section headline  | Inter / Geist    | 600    | 36px / 2.25rem | 1.2        | -0.01em        |
| Card title        | Inter / Geist    | 600    | 20px / 1.25rem | 1.3        | 0              |
| Body text         | Inter / Geist    | 400    | 16px / 1rem  | 1.6         | 0              |
| Stat counter      | JetBrains Mono   | 700    | 42px / 2.625rem | 1.0       | -0.02em        |
| Code / data       | JetBrains Mono   | 400    | 14px / 0.875rem | 1.5       | 0              |
| Caption / label   | Inter / Geist    | 500    | 12px / 0.75rem | 1.4        | 0.05em         |

### Spacing & Layout

- **Max content width:** 1200px (centered with auto margins)
- **Section vertical padding:** 96px top / 96px bottom (mobile: 64px)
- **Card grid:** 12-column grid, 24px gap
- **Card border-radius:** 16px
- **Card padding:** 32px (mobile: 24px)
- **Component border-radius:** 12px (buttons), 8px (inputs, tags)

### Motion & Transitions

- **Default transition:** `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- **Card hover lift:** `transform: translateY(-4px); box-shadow: 0 16px 48px rgba(232,162,58,0.12)`
- **Number counters:** Count-up animation on scroll-into-view (800ms ease-out)
- **Section reveal:** Fade-up 24px (stagger children by 100ms) using Intersection Observer
- **Trust curve chart:** Smooth SVG path animation on first paint (1200ms ease-in-out)

---

## 2. Section-by-Section Layout

### 2.1 — Navigation Bar (Sticky)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ☀ DAYBREAK                    Features · How It Works · Results · FAQ  │
│  [logo mark]                                         [Try Demo →] btn  │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Background:** `--bg-primary` at 85% opacity + `backdrop-filter: blur(12px)`
- **Logo:** Custom sun-ray mark in `--accent-amber` + "DAYBREAK" wordmark, font-weight 700, 20px
- **Nav links:** `--text-secondary`, hover → `--accent-amber` with underline slide-in from left
- **CTA button:** Solid `--accent-amber` bg, `--bg-primary` text, rounded-full (pill), hover glow ring
- **Height:** 72px, z-index 50
- **Mobile:** Hamburger menu → full-screen drawer overlay

---

### 2.2 — Hero Section

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         ╭───────────────────╮                           │
│                         │   3D TRUST SPHERE  │ ← animated glowing orb  │
│                         │   (topographic     │    with temporal phase   │
│                         │    wave surface)   │    lines / contour rings │
│                         ╰───────────────────╯                           │
│                                                                         │
│              The Price Trust Engine for Tokenized                       │
│                          US Equities                                    │
│                                                                         │
│           "Every price has a trust score. Every weekend                 │
│            has a danger curve. Daybreak maps both."                     │
│                                                                         │
│            [Launch Trust Radar →]   [View Paper Log]                    │
│                                                                         │
│     ┌──────────┬──────────┬──────────┬──────────┐                      │
│     │ +$2,122  │  0.00%   │  5.00    │   10     │                      │
│     │ Alpha    │ Wash DD  │ Sharpe   │ Forbidden│                      │
│     │ Generated│ Drawdown │ Ratio    │ States   │                      │
│     └──────────┴──────────┴──────────┴──────────┘                      │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

**Visual Notes:**
- The hero sphere is a 3D-rendered orb (like the reference) but with topographic contour lines representing trust score bands. The sphere's warm glow color shifts based on the CURRENT real-time market phase:
  - Regular Hours → bright `--trust-green` glow
  - Friday Post-Close → `--accent-amber` glow
  - Saturday Dark → `--trust-red` dim glow (pulsing)
  - Sunday Futures Reopen → `--trust-blue` glow
  - Monday Pre-Market → `--accent-amber` brightening
- Behind the sphere: `--hero-glow` radial gradient
- **Stat counters row:** 4 pill cards in a horizontal row, glassmorphism bg, JetBrains Mono numbers with count-up animation. Each card has a tiny colored dot indicator (green/red/amber).
- **CTA buttons:** Primary (amber solid pill) + Secondary (ghost outline pill)
- **Vertical height:** 100vh on desktop, minimum-height auto on mobile

---

### 2.3 — "The Problem" Section (Scroll Reveal)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│     "Every AI trading bot on Bitget trades the price.                  │
│      None of them ask: is the price trustworthy?"                      │
│                                                                         │
│  ┌─────────────────────────────────┬────────────────────────────────┐   │
│  │         NAIVE BOT               │         DAYBREAK               │   │
│  │  ✗ Trades any headline          │  ✓ Maps 65.5h danger curve    │   │
│  │  ✗ Saturday dark = any hour     │  ✓ Saturday dark = noise floor │   │
│  │  ✗ AMC $103M vol = bullish      │  ✓ AMC 15.6x churn = trap    │   │
│  │  ✗ No accountability            │  ✓ Monday cross grades itself │   │
│  │                                 │                                │   │
│  │  Result: -$1,845 loss           │  Result: +$276 gain           │   │
│  │  Sharpe: -0.84                  │  Sharpe: 5.00                 │   │
│  └─────────────────────────────────┴────────────────────────────────┘   │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Left card:** Dark bg with `--trust-red` left border stripe, crossmark icons in red
- **Right card:** Dark bg with `--trust-green` left border stripe, checkmark icons in green
- **Bottom row:** PnL results with animated number styling — naive in red, Daybreak in green
- **Quote at top:** Italic serif accent text, `--accent-amber` color, large 28px

---

### 2.4 — "How Daybreak Works" (Ecosystem Diagram)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    How Daybreak Works                                   │
│                                                                         │
│            ┌─────────────┐                                             │
│            │ Market Event │ → Breaking news / weekend headline         │
│            └──────┬──────┘                                             │
│                   │                                                     │
│         ┌─────────▼──────────┐                                         │
│         │   TRUST ENGINE     │                                         │
│         │  ┌───┐ ┌───┐      │                                         │
│         │  │ T │ │ W │      │  T = Temporal Curve (65.5h)             │
│         │  └───┘ └───┘      │  W = Wash Detection (Churn/Float)       │
│         │  ┌───┐ ┌───┐      │  D = Depth Analysis (Spread/Book)       │
│         │  │ D │ │ M │      │  M = Macro Alignment (CME/VIX)          │
│         │  └───┘ └───┘      │                                         │
│         └─────────┬──────────┘                                         │
│                   │                                                     │
│         ┌─────────▼──────────┐                                         │
│         │   POLICY GATE      │ → 10 Forbidden States                   │
│         │   Size = Base×T²   │ → Quadratic Attenuation                 │
│         └─────────┬──────────┘                                         │
│                   │                                                     │
│      ┌────────────┼────────────┐                                       │
│      ▼            ▼            ▼                                       │
│  [EXECUTE]   [PASSIVE PEG]  [REFUSE]                                   │
│  Grade A/B    Grade D        Grade F                                   │
│  (scaled)    (limit only)  (receipt)                                    │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Render as:** Animated flowchart using CSS/SVG, NOT a static image. Nodes are rounded-rect cards with the amber gradient borders from the reference. Connecting lines animate sequentially on scroll (300ms stagger per step).
- **Each component card** (T, W, D, M) has an icon + tooltip with the formula.
- **Three outcome cards** at the bottom are color-coded: green (EXECUTE), amber (PASSIVE PEG), red (REFUSE).
- **Mobile:** Stacks vertically with arrows between.

---

### 2.5 — "The Trust Curve" (Interactive Chart Section)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│    The 65.5-Hour Trust Curve                                           │
│                                                                         │
│    ┌────────────────────────────────────────────────────────────────┐   │
│    │ 1.0 ─ ████ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ████  │   │
│    │ 0.85─ ███▓▓▓░░                                   ░░▓▓▓███   │   │
│    │ 0.65─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ███████▓▓▓      │   │
│    │ 0.25─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ───────▓▓▓▓▓▓▓▓▓▓▓               │   │
│    │ 0.15─ ─ ─ ─ ─ ████████████░░░░░░                            │   │
│    │ 0.0 ─┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼──  │   │
│    │      0h   6h  12h  18h  24h  30h  36h  42h  48h  54h  60h   │   │
│    │      Fri  │ Sat Dark      │ Sun Pre │ Futures │ Mon Pre │    │   │
│    │      PM   │ (noise floor) │ Futures │ Reopen  │ Market  │    │   │
│    └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│    [▸ NVDA-rToken] [TSLA-rToken] [AAPL-rToken] [AMC-rToken] [MSTR]    │
│                                                                         │
│    Current Phase: ████ REGULAR HOURS (Score: 1.00)                     │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Chart:** SVG area chart with gradient fill. Color transitions through trust-gradient spectrum.
- **Phase bands:** Labeled vertical regions with distinct background tints matching the phase colors.
- **Token tabs:** Pill-shaped toggles below the chart to switch which rToken's curve is displayed. Active pill has amber bg, inactive are ghost.
- **Current phase indicator:** Animated badge showing the live phase from the backend `/api/tokens` response.
- **Tooltip on hover:** Shows exact trust score, phase name, and CME status at each point.
- **Data source:** `GET /api/trust-curve/:symbol`

---

### 2.6 — "The 10 Forbidden States" (Feature Cards Grid)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│              10 States Your Bot Can Never Enter                        │
│                                                                         │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │
│  │ 🚫 Zero Trust      │  │ 🚫 Excessive Churn │  │ 🚫 Dark Market    │ │
│  │    Sizing           │  │    Buy             │  │    Order          │ │
│  │                     │  │                     │  │                   │ │
│  │ Grade F (<0.30)     │  │ Churn >5x with     │  │ Market orders on │ │
│  │ = zero allocation   │  │ no SEC 8-K filing  │  │ Sat dark at D    │ │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘ │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │
│  │ 🚫 Negative Depth  │  │ 🚫 Wide Spread     │  │ 🚫 Oracle Desync │ │
│  │    Execution        │  │    Cross           │  │    Arbitrage      │ │
│  │                     │  │                     │  │                   │ │
│  │ Order > 50% of     │  │ Spread >100 bps    │  │ Price >8% from   │ │
│  │ top-5 book depth   │  │ crossing banned    │  │ close, no filing │ │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘ │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │
│  │ 🚫 Pre-Futures     │  │ 🚫 Unhedged        │  │ 🚫 Post-Close    │ │
│  │    Speculation      │  │    Overnight       │  │    Momentum      │ │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘ │
│  ┌────────────────────┐                                                 │
│  │ 🚫 Monday Open     │     All 10 states programmatically             │
│  │    Front-Run       │     unreachable. Proved in 726ms.              │
│  └────────────────────┘                                                 │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Layout:** 3-column grid (mobile: 1-column stack)
- **Card design:** `--bg-secondary` background, 1px `--border-default` border, `--accent-ember` top border stripe (2px), 16px border-radius
- **Hover:** Card glows with `--accent-ember` border-glow, lifts 4px
- **Icon:** Red 🚫 emoji or custom SVG prohibition icon at top-left of each card
- **Bottom callout:** JetBrains Mono "Proved in 726ms." with green checkmark, test count badge

---

### 2.7 — "Battle Arena" (Live Simulation Section) ★ JUDGE SURPRISE

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│          ⚔ Live Battle: Daybreak vs Naive Bot                          │
│                                                                         │
│  ┌────────────────────────┐    VS    ┌────────────────────────┐        │
│  │   DAYBREAK AGENT       │          │   NAIVE BASELINE BOT   │        │
│  │                        │          │                         │        │
│  │   PnL: +$276.42 ✓     │          │   PnL: -$1,845.80 ✗   │        │
│  │   Sharpe: 5.00         │          │   Sharpe: -0.84        │        │
│  │   Wash DD: 0.00%       │          │   Max DD: 9.23%        │        │
│  │   Trades: 3/4 exec     │          │   Trades: 4/4 exec     │        │
│  │                        │          │                         │        │
│  │  ┌─ AMC: REFUSED ─┐   │          │  ┌─ AMC: BOUGHT ──┐    │        │
│  │  │ Grade F (0.125) │   │          │  │ No gate. Loss  │    │        │
│  │  │ $1,505 saved    │   │          │  │ -$1,845.80     │    │        │
│  │  └─────────────────┘   │          │  └────────────────┘    │        │
│  └────────────────────────┘          └────────────────────────┘        │
│                                                                         │
│         ┌─────────────────────────────────────────────┐                │
│         │  Event Feed (scrolling ticker)               │                │
│         │  ▶ "AMC short squeeze rumours..."    REFUSED │                │
│         │  ▶ "NVIDIA SEC 8-K confirmed..."   EXECUTED  │                │
│         │  ▶ "Tesla unverified battery..."  PASSIVE PEG│                │
│         │  ▶ "Apple EU approval..."          EXECUTED  │                │
│         └─────────────────────────────────────────────┘                │
│                                                                         │
│         [ ▶ Run Simulation ]     [ Inject Custom Event ]               │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Split-screen layout:** Two equal cards side by side with "VS" badge centered between them (amber circle with lightning bolt icon)
- **Left card (Daybreak):** `--trust-green` top border, green accent numbers
- **Right card (Naive):** `--trust-red` top border, red accent numbers
- **AMC callout sub-card:** Nested card inside each side showing the AMC wash trap scenario specifically — this is the "wow" moment. Left side shows REFUSED with $1,505 capital preserved. Right side shows the bleeding loss.
- **Event feed:** Dark ticker strip below both cards. Each event row has a colored status badge (REFUSED = red, EXECUTED = green, PASSIVE PEG = amber).
- **Buttons:** "Run Simulation" (amber solid) triggers `POST /api/simulate`. "Inject Custom Event" opens a modal to create custom shock events.
- **Data source:** `POST /api/simulate`

---

### 2.8 — "Monday Accountability" (Audit Section)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│     Monday Morning: The Oracle Grades Itself                           │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Symbol    │ Weekend Price │ Monday Open │ Gap      │ Verdict    │   │
│  │ AMC-rTkn   │ $4.85        │ $4.12       │ -15.05%  │ ANOMALOUS  │   │
│  │ NVDA-rTkn  │ $128.50      │ $133.50     │ +3.89%   │ VERIFIED   │   │
│  │ TSLA-rTkn  │ $245.80      │ $244.20     │ -0.65%   │ MODERATE   │   │
│  │ AAPL-rTkn  │ $230.15      │ $232.00     │ +0.80%   │ VERIFIED   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  "AMC's -15.05% Monday gap CONFIRMED Daybreak's Grade F diagnosis.    │
│   $1,505 in capital was preserved by refusing to execute."             │
│                                                                         │
│  Prediction Accuracy: ███████████████████░░░  89.3%                    │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Table:** Dark striped table with `--bg-secondary` / `--bg-tertiary` alternating rows
- **Verdict column:** Colored badges — `ANOMALOUS` red bg, `VERIFIED` green bg, `MODERATE` amber bg
- **Gap column:** Red for negative, green for positive, monospace font
- **Callout quote:** Highlighted block with left amber border, italic text
- **Accuracy bar:** Horizontal progress bar using `--trust-gradient`
- **Data source:** `GET /api/paper-log` + Monday reconciliation from PAPER_LOG.md

---

### 2.9 — "Key Principles" (Icon Row)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                       Core Principles                                   │
│                                                                         │
│     ┌──────────┐       ┌──────────┐       ┌──────────┐                 │
│     │    ⏰    │       │    🔬    │       │    📜    │                 │
│     │ Temporal │       │  Micro-  │       │  Full    │                 │
│     │ Awareness│       │ structure│       │ Audit    │                 │
│     │          │       │ Analysis │       │ Trail    │                 │
│     └──────────┘       └──────────┘       └──────────┘                 │
│                                                                         │
│  "Time is a risk     "Volume lies.     "Every decision —               │
│   dimension, not      Depth doesn't."    including refusals            │
│   a constant."                           — is logged."                 │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Layout:** 3 equal columns with centered icon + title + subtitle + quote
- **Icons:** Custom SVG illustrations inside rounded squares with `--bg-secondary` bg and subtle amber inner glow, matching the reference style
- **Hover:** Icon card scales to 1.05x with amber border glow

---

### 2.10 — "Technical Architecture" (Security Section)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│              Architecture & Security                                    │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Bitget MCP   │  │ Bitget       │  │ Agent Hub    │  │ Qwen 3.8    │ │
│  │ US Stock API │  │ Signal       │  │ Paper Trade  │  │ LLM (via    │ │
│  │              │  │ Research     │  │ Pipeline     │  │  Alibaba)   │ │
│  │ agent.bitget │  │ Skills       │  │              │  │             │ │
│  │ .com/mcp     │  │              │  │ --read-only  │  │ hackathon.  │ │
│  │              │  │              │  │ --paper-trad │  │ bitgetops   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐                                    │
│  │ Trust Engine │  │ Policy Gate  │                                    │
│  │ Harmonic-Geo │  │ 10 Forbidden │                                    │
│  │ Synthesis    │  │ States       │                                    │
│  │ T=√(H·G)    │  │ Size=Base×T² │                                    │
│  └──────────────┘  └──────────────┘                                    │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ✓ 19 / 19 tests passing   │  726ms total   │  TypeScript Strict│   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Cards:** 4 across the top row (Bitget-provided tools), 2 below (Daybreak proprietary). Each card uses the gradient-border style from the reference.
- **Bottom banner:** Green-tinted full-width bar with test passing stats
- **Formula display:** KaTeX-rendered math formulas inside monospace blocks

---

### 2.11 — FAQ Accordion

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                  Frequently Asked Questions                             │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ ► What makes Daybreak different from other trading bots?        │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ ► How does the trust score work?                                │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ ► What are the 10 Forbidden States?                             │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ ► How does Monday accountability work?                          │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ ► What Bitget tools does Daybreak use?                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Style:** Full-width rows with `--border-default` separators
- **Expand icon:** Right-aligned chevron that rotates 180° on open
- **Open state:** Answer text fades in (200ms), row background shifts to `--bg-tertiary`
- **Border:** Subtle `--border-default` with first/last rounded corners matching reference

---

### 2.12 — "Built With" / "Powered By" Footer (Sponsor Logos)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         Built With                                      │
│                                                                         │
│   [Bitget Logo]  [Bitget AI]  [Agent Hub]  [Alibaba Cloud]  [Qwen]    │
│                                                                         │
│   ─────────────────────────────────────────────────────────────         │
│                                                                         │
│   DAYBREAK · Bitget AI × Crypto Hackathon S2 · 2026                    │
│   Built by Promise Philip · @GreatSage_0x                               │
│   [GitHub] [X Post] [Paper Log]                                         │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Logos:** Grayscale by default, hover → full color with subtle scale-up
- **Layout:** Horizontal logo row, evenly spaced, centered
- **Footer links:** `--text-muted` color, hover → `--accent-amber`
- **Footer bg:** Slightly darker than page background with top divider line

---

## 3. Responsive Breakpoints

| Breakpoint     | Width        | Layout Changes                                          |
| :------------- | :----------- | :------------------------------------------------------ |
| Desktop XL     | ≥1440px      | Max content 1200px, generous spacing                    |
| Desktop        | ≥1024px      | Full multi-column layouts as designed                   |
| Tablet         | 768–1023px   | Feature cards → 2 columns, battle arena stacks          |
| Mobile         | ≤767px       | Single column, nav → drawer, stat counters → 2×2 grid  |

---

## 4. Component Inventory

| Component              | Instances | Notes                                           |
| :--------------------- | :-------- | :---------------------------------------------- |
| `NavBar`               | 1         | Sticky, glassmorphism                           |
| `HeroSphere`           | 1         | Three.js / CSS 3D orb with phase-based glow     |
| `StatCounter`          | 4         | Count-up animation, monospace                   |
| `ComparisonCard`       | 2         | Naive vs Daybreak problem section               |
| `FlowchartDiagram`     | 1         | Animated SVG pipeline                           |
| `TrustCurveChart`      | 1         | Interactive SVG chart with tooltips             |
| `ForbiddenStateCard`   | 10        | Grid cards with prohibition icons               |
| `BattleArena`          | 1         | Split-screen live simulation                    |
| `EventTicker`          | 1         | Scrolling event feed with status badges         |
| `AuditTable`           | 1         | Monday reconciliation table                     |
| `AccuracyBar`          | 1         | Horizontal progress with gradient               |
| `PrincipleIcon`        | 3         | Icon + title + quote column                     |
| `ArchitectureCard`     | 6         | Gradient-border tech cards                      |
| `TestBanner`           | 1         | Green test passing bar                          |
| `FAQAccordion`         | 5         | Expandable question rows                        |
| `SponsorLogos`         | 5         | Grayscale → color hover                         |
| `Footer`               | 1         | Credits, links, branding                        |

---

## 5. Data Endpoints Consumed

| Endpoint                       | Section              | Purpose                                    |
| :----------------------------- | :------------------- | :----------------------------------------- |
| `GET /api/health`              | NavBar badge         | Green/red status indicator                 |
| `GET /api/tokens`              | Hero stats, Curve    | Current phase, trust evaluations           |
| `GET /api/trust-curve/:symbol` | Trust Curve chart    | Time-series curve coordinates              |
| `POST /api/simulate`           | Battle Arena         | Run comparative simulation on demand       |
| `GET /api/paper-log`           | Audit Table, Ticker  | Deliberation logs, refusal receipts        |

---

## 6. Implementation Notes

- **Framework:** React 18 + Vite + TailwindCSS v4
- **Charts:** Recharts or D3.js for the trust curve SVG
- **3D Hero:** Three.js (lightweight scene) or pure CSS sphere with animated gradients
- **Animations:** Framer Motion for section reveals and number counters
- **Fonts:** Inter (primary), JetBrains Mono (data/code), loaded via Google Fonts
- **Icons:** Lucide React (consistent stroke style)
- **Deployment:** Vercel (frontend) + backend on same deploy or separate
