import { TradeEvent, MacroIndicator } from '../types/index.js';

export interface SentimentAnalysisResult {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  conviction: number; // 0.0 to 1.0
  isMemeHype: boolean;
  hasOfficialFiling: boolean;
  summary: string;
}

export interface NewsBriefingItem {
  id: string;
  timestamp: number;
  symbol: string;
  headline: string;
  category: 'REGULATORY' | 'EARNINGS' | 'MEME_RETAIL' | 'MACRO';
  impactSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class BitgetSignalAdapter {
  /**
   * Macro-analyst skill: Queries macro risk regime and CME Globex index futures status.
   */
  public async getMacroAnalysis(cmeOverride?: boolean): Promise<MacroIndicator> {
    const now = new Date();
    // Default mock reference if not overridden
    const isSundayEveningOrMonday =
      (now.getUTCDay() === 0 && now.getUTCHours() >= 22) || // Sunday 6pm EDT is 22:00 UTC
      now.getUTCDay() === 1;

    const cmeGlobexOpen = cmeOverride ?? isSundayEveningOrMonday;

    return {
      cmeGlobexOpen,
      esFuturesPrice: cmeGlobexOpen ? 5824.50 : 5810.00,
      nqFuturesPrice: cmeGlobexOpen ? 20560.25 : 20490.00,
      btcUsdCorrelation: 0.42,
      vixWeekendImplied: 16.8,
    };
  }

  /**
   * Sentiment-analyst skill: Evaluates trade events, breaking news headlines, and SEC filings.
   */
  public async analyzeSentiment(event: TradeEvent): Promise<SentimentAnalysisResult> {
    const text = event.headline.toLowerCase();

    // Check for official SEC filings or institutional keywords
    const hasOfficialFiling =
      event.hasOfficialFiling ??
      (text.includes('8-k') ||
        text.includes('sec filing') ||
        text.includes('official regulatory approval') ||
        text.includes('formal merger agreement'));

    // Check for meme hype / speculative chatter
    const isMemeHype =
      text.includes('moon') ||
      text.includes('short squeeze') ||
      text.includes('diamond hands') ||
      text.includes('telegram pump') ||
      text.includes('unverified rumour') ||
      (!hasOfficialFiling && text.includes('massive rally'));

    const conviction = Math.max(0.1, Math.min(1.0, event.rawUrgency * (hasOfficialFiling ? 1.0 : 0.5)));

    let summary = `Headline analyzed: "${event.headline}". `;
    if (hasOfficialFiling) {
      summary += 'Verified institutional disclosure / regulatory filing detected.';
    } else if (isMemeHype) {
      summary += 'WARNING: Highly speculative retail meme chatter detected without SEC 8-K filing.';
    } else {
      summary += 'Unverified market chatter.';
    }

    return {
      sentiment: event.sentiment,
      conviction,
      isMemeHype,
      hasOfficialFiling,
      summary,
    };
  }

  /**
   * News-briefing skill: Synthesizes active weekend headlines.
   */
  public async getNewsBriefing(symbolFilter?: string): Promise<NewsBriefingItem[]> {
    const now = Date.now();
    const mockFeed: NewsBriefingItem[] = [
      {
        id: 'news-1',
        timestamp: now - 3600 * 1000,
        symbol: 'AMC-rToken',
        headline: 'AMC weekend token volume spikes 10x on social media squeeze speculation',
        category: 'MEME_RETAIL',
        impactSeverity: 'HIGH',
      },
      {
        id: 'news-2',
        timestamp: now - 7200 * 1000,
        symbol: 'NVDA-rToken',
        headline: 'NVIDIA AI chip shipments pass compliance audit ahead of Asian market open',
        category: 'EARNINGS',
        impactSeverity: 'MEDIUM',
      },
      {
        id: 'news-3',
        timestamp: now - 1800 * 1000,
        symbol: 'TSLA-rToken',
        headline: 'Tesla autonomous robotaxi regulatory permit submitted in Nevada',
        category: 'REGULATORY',
        impactSeverity: 'MEDIUM',
      },
    ];

    if (symbolFilter) {
      return mockFeed.filter((item) => item.symbol.toLowerCase() === symbolFilter.toLowerCase());
    }
    return mockFeed;
  }
}
