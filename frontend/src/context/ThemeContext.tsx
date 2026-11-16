'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';
export type MarketRegion = 'KSE100' | 'KMI30' | 'KSE30';
export type CurrencyCode = 'PKR';

export interface LiveStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  prevClose: number;
  change: number;
  changePercent: number;
  volumeM: number;
  valueM: number;
  pe: number;
  pb: number;
  marketCap: string;
  fairValue: number;
  gmScore: number;
  qfScore: string;
  checksPassed: number;
  divYield: number;
  roe: number;
  bid: number;
  ask: number;
  lastDirection: 'up' | 'down' | 'none';
  lastTradeShares: number;
}

export interface LiveIndexData {
  id: MarketRegion;
  title: string;
  badge: string;
  value: number;
  prevClose: number;
  change: number;
  changePercent: number;
  volumeM: number;
  valueB: number;
  high52w: string;
  activeCount: string;
  advances: number;
  declines: number;
  unchanged: number;
  lastDirection: 'up' | 'down' | 'none';
  intradayPoints: { time: string; price: number; vol: number }[];
}

export interface ExecutedTrade {
  id: string;
  time: string;
  symbol: string;
  price: number;
  shares: number;
  side: 'BUY' | 'SELL';
}

const INITIAL_STOCKS: LiveStock[] = [
  { symbol: 'OGDC', name: 'Oil & Gas Dev Co', sector: 'Oil & Gas', price: 148.50, prevClose: 144.00, change: 4.50, changePercent: 3.12, volumeM: 24.20, valueM: 3593, pe: 4.8, pb: 0.9, marketCap: '638.7B', fairValue: 215.00, gmScore: 88, qfScore: 'A+', checksPassed: 6, divYield: 11.2, roe: 22.4, bid: 148.45, ask: 148.55, lastDirection: 'up', lastTradeShares: 2500 },
  { symbol: 'PPL', name: 'Pakistan Petroleum Ltd', sector: 'Oil & Gas', price: 128.20, prevClose: 124.40, change: 3.80, changePercent: 3.05, volumeM: 19.80, valueM: 2538, pe: 4.2, pb: 0.8, marketCap: '348.8B', fairValue: 182.00, gmScore: 84, qfScore: 'A', checksPassed: 5, divYield: 10.8, roe: 20.1, bid: 128.15, ask: 128.25, lastDirection: 'up', lastTradeShares: 1800 },
  { symbol: 'PRL', name: 'Pakistan Refinery Ltd', sector: 'Refinery', price: 34.60, prevClose: 32.75, change: 1.85, changePercent: 5.65, volumeM: 18.40, valueM: 636, pe: 5.1, pb: 0.7, marketCap: '21.8B', fairValue: 48.00, gmScore: 76, qfScore: 'B+', checksPassed: 4, divYield: 4.2, roe: 16.5, bid: 34.55, ask: 34.65, lastDirection: 'up', lastTradeShares: 5000 },
  { symbol: 'WTL', name: 'WorldCall Telecom', sector: 'Technology', price: 1.45, prevClose: 1.37, change: 0.08, changePercent: 5.84, volumeM: 16.20, valueM: 23, pe: 12.4, pb: 1.1, marketCap: '4.8B', fairValue: 1.90, gmScore: 62, qfScore: 'B', checksPassed: 3, divYield: 0.0, roe: 9.4, bid: 1.44, ask: 1.46, lastDirection: 'up', lastTradeShares: 25000 },
  { symbol: 'ENGRO', name: 'Engro Corporation', sector: 'Fertilizer', price: 334.80, prevClose: 332.00, change: 2.80, changePercent: 0.85, volumeM: 12.60, valueM: 4218, pe: 7.6, pb: 1.2, marketCap: '176.2B', fairValue: 420.00, gmScore: 81, qfScore: 'B+', checksPassed: 5, divYield: 9.4, roe: 18.2, bid: 334.70, ask: 334.90, lastDirection: 'up', lastTradeShares: 1200 },
  { symbol: 'FFC', name: 'Fauji Fertilizer Co', sector: 'Fertilizer', price: 218.40, prevClose: 216.50, change: 1.90, changePercent: 0.88, volumeM: 10.50, valueM: 2293, pe: 6.9, pb: 1.6, marketCap: '277.8B', fairValue: 268.00, gmScore: 85, qfScore: 'A', checksPassed: 5, divYield: 11.8, roe: 29.4, bid: 218.30, ask: 218.50, lastDirection: 'up', lastTradeShares: 1500 },
  { symbol: 'SYS', name: 'Systems Limited', sector: 'Technology', price: 462.10, prevClose: 467.25, change: -5.15, changePercent: -1.10, volumeM: 8.40, valueM: 3881, pe: 18.2, pb: 4.2, marketCap: '134.1B', fairValue: 540.00, gmScore: 78, qfScore: 'B+', checksPassed: 4, divYield: 2.4, roe: 24.5, bid: 461.90, ask: 462.30, lastDirection: 'down', lastTradeShares: 600 },
  { symbol: 'HUBC', name: 'Hub Power Company', sector: 'Power Gen', price: 132.70, prevClose: 133.15, change: -0.45, changePercent: -0.34, volumeM: 7.90, valueM: 1048, pe: 3.8, pb: 0.9, marketCap: '172.1B', fairValue: 185.00, gmScore: 83, qfScore: 'A', checksPassed: 5, divYield: 14.2, roe: 26.8, bid: 132.60, ask: 132.80, lastDirection: 'down', lastTradeShares: 3000 },
  { symbol: 'LUCK', name: 'Lucky Cement', sector: 'Cement', price: 894.50, prevClose: 882.30, change: 12.20, changePercent: 1.38, volumeM: 5.20, valueM: 4651, pe: 8.4, pb: 1.4, marketCap: '280.3B', fairValue: 1120.00, gmScore: 86, qfScore: 'A', checksPassed: 5, divYield: 5.8, roe: 21.0, bid: 894.10, ask: 894.90, lastDirection: 'up', lastTradeShares: 400 },
  { symbol: 'MEBL', name: 'Meezan Bank Ltd', sector: 'Banking', price: 242.00, prevClose: 238.90, change: 3.10, changePercent: 1.30, volumeM: 4.80, valueM: 1161, pe: 5.4, pb: 1.8, marketCap: '433.2B', fairValue: 310.00, gmScore: 92, qfScore: 'A+', checksPassed: 6, divYield: 12.5, roe: 38.6, bid: 241.90, ask: 242.10, lastDirection: 'up', lastTradeShares: 2200 },
];

const INITIAL_INDICES: Record<MarketRegion, LiveIndexData> = {
  KSE100: {
    id: 'KSE100',
    title: 'KSE 100 Index',
    badge: 'PSX Benchmark',
    value: 104285.40,
    prevClose: 103010.80,
    change: 1274.60,
    changePercent: 1.24,
    volumeM: 482.40,
    valueB: 28.60,
    high52w: '105,420',
    activeCount: '388 Active',
    advances: 214,
    declines: 128,
    unchanged: 46,
    lastDirection: 'up',
    intradayPoints: [
      { time: '09:30', price: 103010, vol: 18 },
      { time: '10:00', price: 103420, vol: 32 },
      { time: '10:30', price: 103250, vol: 24 },
      { time: '11:00', price: 103890, vol: 45 },
      { time: '11:30', price: 103750, vol: 29 },
      { time: '12:00', price: 104100, vol: 52 },
      { time: '12:30', price: 103980, vol: 34 },
      { time: '13:00', price: 104350, vol: 61 },
      { time: '13:30', price: 104180, vol: 40 },
      { time: 'Live', price: 104285, vol: 48 },
    ],
  },
  KMI30: {
    id: 'KMI30',
    title: 'KMI 30 Shariah Index',
    badge: 'PSX Islamic Benchmark',
    value: 162410.80,
    prevClose: 160042.40,
    change: 2368.40,
    changePercent: 1.48,
    volumeM: 218.60,
    valueB: 16.40,
    high52w: '164,100',
    activeCount: '30 Constituents',
    advances: 22,
    declines: 6,
    unchanged: 2,
    lastDirection: 'up',
    intradayPoints: [
      { time: '09:30', price: 160042, vol: 14 },
      { time: '10:00', price: 160580, vol: 26 },
      { time: '10:30', price: 160410, vol: 20 },
      { time: '11:00', price: 161120, vol: 38 },
      { time: '11:30', price: 160980, vol: 24 },
      { time: '12:00', price: 161650, vol: 42 },
      { time: '12:30', price: 161540, vol: 31 },
      { time: '13:00', price: 162190, vol: 50 },
      { time: '13:30', price: 162020, vol: 35 },
      { time: 'Live', price: 162411, vol: 44 },
    ],
  },
  KSE30: {
    id: 'KSE30',
    title: 'KSE 30 Free-Float Index',
    badge: 'PSX Free-Float Blue-Chip',
    value: 32845.20,
    prevClose: 32481.10,
    change: 364.10,
    changePercent: 1.12,
    volumeM: 194.20,
    valueB: 19.20,
    high52w: '33,210',
    activeCount: '30 Blue-Chips',
    advances: 19,
    declines: 9,
    unchanged: 2,
    lastDirection: 'up',
    intradayPoints: [
      { time: '09:30', price: 32481, vol: 12 },
      { time: '10:00', price: 32590, vol: 22 },
      { time: '10:30', price: 32540, vol: 18 },
      { time: '11:00', price: 32680, vol: 34 },
      { time: '11:30', price: 32650, vol: 21 },
      { time: '12:00', price: 32740, vol: 39 },
      { time: '12:30', price: 32710, vol: 28 },
      { time: '13:00', price: 32820, vol: 45 },
      { time: '13:30', price: 32790, vol: 31 },
      { time: 'Live', price: 32845, vol: 41 },
    ],
  },
};

const INITIAL_TRADES: ExecutedTrade[] = [
  { id: 't-1', time: '14:02:18', symbol: 'OGDC', price: 148.50, shares: 2500, side: 'BUY' },
  { id: 't-2', time: '14:02:15', symbol: 'MEBL', price: 242.00, shares: 1400, side: 'BUY' },
  { id: 't-3', time: '14:02:11', symbol: 'SYS', price: 462.10, shares: 600, side: 'SELL' },
  { id: 't-4', time: '14:02:08', symbol: 'LUCK', price: 894.50, shares: 400, side: 'BUY' },
  { id: 't-5', time: '14:02:04', symbol: 'PPL', price: 128.20, shares: 3200, side: 'BUY' },
];

interface AppContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  region: MarketRegion;
  setRegion: (r: MarketRegion) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  isStreaming: boolean;
  toggleStreaming: () => void;
  tickCount: number;
  lastTickTime: string;
  stocks: LiveStock[];
  indices: Record<MarketRegion, LiveIndexData>;
  liveTrades: ExecutedTrade[];
  sentimentScore: number;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [region, setRegion] = useState<MarketRegion>('KSE100');
  const [currency, setCurrency] = useState<CurrencyCode>('PKR');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [tickCount, setTickCount] = useState<number>(1);
  const [lastTickTime, setLastTickTime] = useState<string>('09:30:02');
  const [stocks, setStocks] = useState<LiveStock[]>(INITIAL_STOCKS);
  const [indices, setIndices] = useState<Record<MarketRegion, LiveIndexData>>(INITIAL_INDICES);
  const [liveTrades, setLiveTrades] = useState<ExecutedTrade[]>(INITIAL_TRADES);
  const [sentimentScore, setSentimentScore] = useState<number>(68);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('gm_theme', 'light');
  }, []);

  // Real-Time PSX Order-Book & Index Tick Engine (fires every 1.6 seconds)
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Karachi',
      });
      const shortTime = timeStr.slice(0, 8);

      setTickCount((prev) => prev + 1);
      setLastTickTime(shortTime);

      // Pick 3–4 stocks to tick on this heartbeat
      setStocks((prevStocks) => {
        const nextStocks: LiveStock[] = prevStocks.map((st, idx) => {
          // Deterministic + pseudo-random selection so multiple stocks tick visibly every cycle
          const shouldTick = (Date.now() + idx * 17) % 3 !== 0;
          if (!shouldTick) {
            return { ...st, lastDirection: 'none' as const };
          }

          const stepPct = ((Math.random() - 0.44) * 0.0045); // Slight bullish bias matching regular session
          const rawDelta = st.price * stepPct;
          const delta = Math.abs(rawDelta) < 0.02 ? (rawDelta >= 0 ? 0.05 : -0.05) : Number(rawDelta.toFixed(2));
          const newPrice = Math.max(1.0, Number((st.price + delta).toFixed(2)));
          const newChange = Number((newPrice - st.prevClose).toFixed(2));
          const newChangePct = Number(((newChange / st.prevClose) * 100).toFixed(2));
          const lotShares = (Math.floor(Math.random() * 18) + 2) * 200;
          const newVolM = Number((st.volumeM + lotShares / 1000000).toFixed(2));
          const newValM = Math.round(st.valueM + (lotShares * newPrice) / 1000000);
          const dir: 'up' | 'down' = delta >= 0 ? 'up' : 'down';

          return {
            ...st,
            price: newPrice,
            change: newChange,
            changePercent: newChangePct,
            volumeM: newVolM,
            valueM: newValM,
            bid: Number((newPrice - 0.05).toFixed(2)),
            ask: Number((newPrice + 0.05).toFixed(2)),
            lastDirection: dir,
            lastTradeShares: lotShares,
          };
        });

        // Push the most active ticked stock into the live executed trade tape
        const tickedList = nextStocks.filter((s) => s.lastDirection !== 'none');
        if (tickedList.length > 0) {
          const picked = tickedList[Math.floor(Math.random() * tickedList.length)];
          const newTrade: ExecutedTrade = {
            id: `tr-${Date.now()}-${Math.random()}`,
            time: shortTime,
            symbol: picked.symbol,
            price: picked.price,
            shares: picked.lastTradeShares,
            side: picked.lastDirection === 'up' ? 'BUY' : 'SELL',
          };
          setLiveTrades((old) => [newTrade, ...old.slice(0, 7)]);
        }

        return nextStocks;
      });

      // Tick all 3 PSX Indices (KSE100, KMI30, KSE30) and append to live chart trajectory
      setIndices((prevIndices) => {
        const next: Record<MarketRegion, LiveIndexData> = { ...prevIndices };
        (['KSE100', 'KMI30', 'KSE30'] as MarketRegion[]).forEach((key) => {
          const cur = prevIndices[key];
          const baseStep = key === 'KMI30' ? 28 : key === 'KSE100' ? 18 : 6;
          const ptDelta = Number(((Math.random() - 0.43) * baseStep).toFixed(2));
          const newVal = Number((cur.value + ptDelta).toFixed(2));
          const newChange = Number((newVal - cur.prevClose).toFixed(2));
          const newPct = Number(((newChange / cur.prevClose) * 100).toFixed(2));
          const newVolM = Number((cur.volumeM + Math.random() * 0.45).toFixed(2));
          const newValB = Number((cur.valueB + Math.random() * 0.03).toFixed(2));
          const dir: 'up' | 'down' = ptDelta >= 0 ? 'up' : 'down';

          const pts = [...cur.intradayPoints];
          pts[pts.length - 1] = {
            time: shortTime,
            price: Math.round(newVal),
            vol: Math.min(64, Math.max(22, pts[pts.length - 1].vol + (ptDelta >= 0 ? 2 : -1))),
          };

          next[key] = {
            ...cur,
            value: newVal,
            change: newChange,
            changePercent: newPct,
            volumeM: newVolM,
            valueB: newValB,
            lastDirection: dir,
            intradayPoints: pts,
          };
        });
        return next;
      });

      setSentimentScore((prev) => {
        const step = Math.random() > 0.5 ? 1 : -1;
        return Math.min(76, Math.max(62, prev + (Math.random() > 0.65 ? step : 0)));
      });
    }, 1600);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('gm_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleStreaming = () => {
    setIsStreaming((prev) => !prev);
  };

  const handleSetRegion = (r: MarketRegion) => {
    setRegion(r);
    localStorage.setItem('gm_region', r);
  };

  const handleSetCurrency = (c: CurrencyCode) => {
    setCurrency(c);
    localStorage.setItem('gm_currency', c);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        region,
        setRegion: handleSetRegion,
        currency,
        setCurrency: handleSetCurrency,
        isStreaming,
        toggleStreaming,
        tickCount,
        lastTickTime,
        stocks,
        indices,
        liveTrades,
        sentimentScore,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
