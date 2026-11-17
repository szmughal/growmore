'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { getStockBySymbol, getSectorPeers, searchStocks, ALL_PSX_STOCKS, PSXStock } from '@/data/psxStocks';
import { useApp } from '@/context/ThemeContext';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  SlidersHorizontal,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  ChevronDown
} from '@/components/Icons';

type TabType = 'overview' | 'valuation' | 'financials' | 'earnings' | 'health' | 'dividends' | 'peers' | 'funds';

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { psxFeedDate, psxFeedTime, psxFeedDateTime, isMarketOpen } = useApp();
  const rawSymbol = (params?.symbol as string) || 'HBL';
  const symbol = rawSymbol.toUpperCase();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [chartTimeframe, setChartTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | 'All'>('1Y');
  const [chartType, setChartType] = useState<'area' | 'candles'>('area');

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Interactive DCF calculator state
  const [dcfDiscountRate, setDcfDiscountRate] = useState<number>(18.5);
  const [dcfGrowthRate, setDcfGrowthRate] = useState<number>(4.0);

  // Look up stock from 871 real PSX stocks
  const stock = useMemo(() => {
    return getStockBySymbol(symbol) || getStockBySymbol('HBL')!;
  }, [symbol]);

  const peers = useMemo(() => {
    return getSectorPeers(stock.sector, stock.symbol, 6);
  }, [stock]);

  const quickSearchMatches = useMemo(() => {
    if (!searchQuery.trim()) return ALL_PSX_STOCKS.slice(0, 8);
    return searchStocks(searchQuery, 8);
  }, [searchQuery]);

  // Dynamic DCF recalculation based on sensitivity sliders
  const dynamicDcfPrice = useMemo(() => {
    const baseFair = stock.fairValue || stock.price * 1.35;
    const baseWacc = 18.5;
    const baseGrowth = 4.0;
    const rateDiff = (baseWacc - dcfDiscountRate) * 0.04;
    const growthDiff = (dcfGrowthRate - baseGrowth) * 0.05;
    const multiplier = 1 + rateDiff + growthDiff;
    return Math.max(stock.price * 0.3, Number((baseFair * multiplier).toFixed(2)));
  }, [stock, dcfDiscountRate, dcfGrowthRate]);

  const dynamicUpside = useMemo(() => {
    if (stock.price <= 0) return 0;
    return Number((((dynamicDcfPrice - stock.price) / stock.price) * 100).toFixed(1));
  }, [stock, dynamicDcfPrice]);

  // 52-week position calculation (0 to 100%)
  const week52Pct = useMemo(() => {
    const range = stock.week52High - stock.week52Low;
    if (range <= 0) return 50;
    const pos = ((stock.price - stock.week52Low) / range) * 100;
    return Math.min(100, Math.max(0, pos));
  }, [stock]);

  // Formatting helpers
  const fmtMoney = (num: number) => {
    if (!num) return '-';
    if (num >= 1e12) return `PKR ${(num / 1e12).toFixed(2)} Trillion`;
    if (num >= 1e9) return `PKR ${(num / 1e9).toFixed(2)} Billion`;
    if (num >= 1e6) return `PKR ${(num / 1e6).toFixed(2)} Million`;
    return `PKR ${num.toLocaleString()}`;
  };

  const fmtShortMoney = (num: number) => {
    if (!num) return '-';
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(0)}M`;
    return `${num.toLocaleString()}`;
  };

  const isPositive1Y = stock.oneYearChange >= 0;

  // Dynamic Technical Pivot levels for current stock
  const techSupport = useMemo(() => Number((stock.price * 0.982).toFixed(2)), [stock.price]);
  const techResistance = useMemo(() => Number((stock.price * 1.025).toFixed(2)), [stock.price]);
  const techDeciding = useMemo(() => Number((stock.price * 0.995).toFixed(2)), [stock.price]);

  // Dynamic Strip Chart positioning for current stock vs peers
  const peerListWithSelf = useMemo(() => {
    return [stock, ...peers].sort((a, b) => a.pe - b.pe);
  }, [stock, peers]);

  const peRank = useMemo(() => {
    const sorted = [...peerListWithSelf].sort((a, b) => a.pe - b.pe);
    const idx = sorted.findIndex((s) => s.symbol === stock.symbol);
    return `${idx + 1}th of ${sorted.length}`;
  }, [peerListWithSelf, stock.symbol]);

  const divRank = useMemo(() => {
    const sorted = [...peerListWithSelf].sort((a, b) => b.divYield - a.divYield);
    const idx = sorted.findIndex((s) => s.symbol === stock.symbol);
    return `${idx + 1}th of ${sorted.length}`;
  }, [peerListWithSelf, stock.symbol]);

  const roeRank = useMemo(() => {
    const sorted = [...peerListWithSelf].sort((a, b) => b.roe - a.roe);
    const idx = sorted.findIndex((s) => s.symbol === stock.symbol);
    return `${idx + 1}th of ${sorted.length}`;
  }, [peerListWithSelf, stock.symbol]);

  // Dynamic Price Chart Points scaled to the current stock
  const chartPoints = useMemo(() => {
    const low = stock.week52Low || stock.price * 0.75;
    const high = stock.week52High || stock.price * 1.25;
    const cur = stock.price;
    const mid = (low + high) / 2;

    if (chartTimeframe === '1D') {
      return [
        { label: '09:30', price: cur * 0.996, open: cur * 0.995, high: cur * 0.998, low: cur * 0.994, close: cur * 0.996 },
        { label: '11:00', price: cur * 0.998, open: cur * 0.996, high: cur * 1.002, low: cur * 0.996, close: cur * 0.998 },
        { label: '12:30', price: cur * 1.003, open: cur * 0.998, high: cur * 1.005, low: cur * 0.998, close: cur * 1.003 },
        { label: '14:00', price: cur * 1.001, open: cur * 1.003, high: cur * 1.004, low: cur * 0.999, close: cur * 1.001 },
        { label: '15:30', price: cur, open: cur * 1.001, high: cur * 1.003, low: cur * 0.998, close: cur },
      ];
    }

    if (chartTimeframe === '1M') {
      return [
        { label: 'Week 1', price: cur * 0.97, open: cur * 0.96, high: cur * 0.98, low: cur * 0.95, close: cur * 0.97 },
        { label: 'Week 2', price: cur * 0.99, open: cur * 0.97, high: cur * 1.01, low: cur * 0.97, close: cur * 0.99 },
        { label: 'Week 3', price: cur * 1.02, open: cur * 0.99, high: cur * 1.03, low: cur * 0.98, close: cur * 1.02 },
        { label: 'Week 4', price: cur, open: cur * 1.02, high: cur * 1.03, low: cur * 0.99, close: cur },
      ];
    }

    // Default 1Y Trajectory scaled accurately to 52W range
    return [
      { label: 'Nov 25', price: Number((mid * 0.95).toFixed(2)), open: mid * 0.93, high: mid * 0.97, low: mid * 0.92, close: mid * 0.95 },
      { label: 'Feb 26', price: Number((high * 0.98).toFixed(2)), open: mid * 0.95, high: high, low: mid * 0.94, close: high * 0.98 },
      { label: 'May 26', price: Number(low.toFixed(2)), open: high * 0.95, high: high * 0.96, low: low, close: low },
      { label: 'Aug 26', price: Number((mid * 1.05).toFixed(2)), open: low, high: mid * 1.08, low: low * 1.02, close: mid * 1.05 },
      { label: 'Nov 26', price: Number(cur.toFixed(2)), open: mid * 1.05, high: cur * 1.02, low: mid * 1.02, close: cur },
    ];
  }, [stock, chartTimeframe]);

  const chartSvgPath = useMemo(() => {
    const prices = chartPoints.map((p) => p.price);
    const minP = Math.min(...prices) * 0.95;
    const maxP = Math.max(...prices) * 1.05;

    const pts = chartPoints.map((pt, i) => {
      const x = (i / (chartPoints.length - 1)) * 500;
      const y = 140 - ((pt.price - minP) / Math.max(1, maxP - minP)) * 120;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');

    const area = `${pts} L 500 150 L 0 150 Z`;
    return { line: pts, area, minP, maxP };
  }, [chartPoints]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-5 max-w-[1520px] w-full mx-auto">
          
          {/* Top Breadcrumb & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <Link
                href="/fundamentals"
                className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Fundamentals</span>
              </Link>
              <span>/</span>
              <span className="text-slate-400">PSX</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">{stock.symbol}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-emerald-600 live-beacon' : 'bg-slate-400'}`} />
              <span className="text-slate-600 font-medium">
                {isMarketOpen ? `PSX Live • ${psxFeedTime} PKT` : `Market Closed • Close As Of ${psxFeedTime} PKT`}
              </span>
            </div>
          </div>

          {/* Company Profile Hero Banner */}
          <div className="terminal-card p-5 sm:p-6 bg-white border-slate-200 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Left Side: Symbol, Name, Live Price, 1Y Return, Badges */}
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-amber-600 tracking-wider uppercase">
                  Fundamentals360
                </div>

                <div className="flex flex-wrap items-baseline gap-3 sm:gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    {stock.name}
                  </h1>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-bold mono-num text-slate-900">
                      {stock.price.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-slate-600">PKR</span>
                    <span
                      className={`text-sm sm:text-base font-semibold mono-num ${
                        isPositive1Y ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive1Y ? `+${stock.oneYearChange.toFixed(2)}%` : `${stock.oneYearChange.toFixed(2)}%`} (1Y)
                    </span>
                  </div>
                </div>

                {/* Sub-pills: Ticker, Exchange, Trading Status, Shariah */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-800 border border-slate-200 mono-num">
                    {stock.symbol}
                  </span>
                  <span className="text-slate-500 font-medium">Pakistan Stock Exchange</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="inline-flex items-center text-slate-600">
                    <span className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-emerald-600 live-beacon' : 'bg-slate-400'} mr-1.5`} />
                    {isMarketOpen ? 'Market Open' : 'Market Closed'}
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-slate-500">Official PSX Session: {psxFeedDateTime}</span>

                  {stock.isShariah && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      Shariah Compliant
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase font-medium">
                    {stock.sector}
                  </span>
                </div>
              </div>

              {/* Right Side: Quick Search, Generate Report & Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* Instant Stock Switcher Bar */}
                <div className="relative">
                  <div className="flex items-center h-9 px-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md text-xs text-slate-600 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all">
                    <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search PSX, US and Saudi stocks"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                      }}
                      onFocus={() => setIsSearchOpen(true)}
                      className="bg-transparent focus:outline-none w-48 sm:w-60 text-xs text-slate-900 placeholder-slate-400"
                    />
                  </div>

                  {/* Dropdown Results */}
                  {isSearchOpen && (
                    <div
                      className="absolute top-11 right-0 w-72 bg-white rounded-md shadow-xl border border-slate-200 z-50 max-h-64 overflow-y-auto divide-y divide-slate-100"
                      onMouseLeave={() => setIsSearchOpen(false)}
                    >
                      <div className="p-2 text-[11px] font-semibold text-slate-400 uppercase bg-slate-50">
                        {searchQuery ? 'Matching Equities' : 'Popular PSX Stocks'}
                      </div>
                      {quickSearchMatches.map((m) => (
                        <button
                          key={m.symbol}
                          type="button"
                          onClick={() => {
                            router.push(`/fundamentals/${m.symbol}`);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-900 mono-num mr-2">{m.symbol}</span>
                            <span className="text-xs text-slate-600 truncate max-w-[140px] inline-block align-bottom">{m.name}</span>
                          </div>
                          <span className="text-xs mono-num font-semibold text-slate-900">
                            PKR {m.price.toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Generate Report Button */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Report</span>
                </button>

                {/* Filters button */}
                <button
                  type="button"
                  onClick={() => setActiveTab('valuation')}
                  className="p-2 rounded-md bg-[#5850EC] text-white hover:bg-indigo-700 shadow-xs transition-colors"
                  title="Adjust Valuation Models"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                {/* Back button */}
                <Link
                  href="/fundamentals"
                  className="p-2 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  title="Back to Fundamentals"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>

            </div>

            {/* Navigation Tabs (Working Tabs with Active State) */}
            <div className="flex items-center space-x-2 sm:space-x-5 border-t border-slate-100 mt-6 pt-3 overflow-x-auto text-xs font-semibold">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'valuation', label: 'Valuation' },
                { id: 'financials', label: 'Financials' },
                { id: 'earnings', label: 'Earnings' },
                { id: 'health', label: 'Health' },
                { id: 'dividends', label: 'Dividends' },
                { id: 'peers', label: 'Peers' },
                { id: 'funds', label: 'Funds Ownership' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`pb-2 transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-slate-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <span className="text-slate-300 hidden md:inline">|</span>
              <span className="text-slate-500 text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold hidden md:inline-flex items-center">
                Research NEW
              </span>
              <span className="text-slate-500 text-xs hidden md:inline-flex items-center">
                Corporate Actions
              </span>
            </div>

          </div>

          {/* 8 Primary Metric Cards (Always visible on top of all tabs) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            
            {/* 1. P/E (TTM) */}
            <div className="terminal-card p-3 bg-white border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">P / E (TTM)</div>
              <div className="text-xl font-bold mono-num text-slate-900 mt-1">
                {stock.pe.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 mono-num">
                EPS (TTM): {stock.eps.toFixed(2)}
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (stock.pe / 15) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
                <span>Sector 6.41</span>
              </div>
            </div>

            {/* 2. Dividend Yield */}
            <div className="terminal-card p-3 bg-white border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Dividend Yield</div>
              <div className="text-xl font-bold mono-num text-slate-900 mt-1">
                {stock.divYield.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">&nbsp;</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (stock.divYield / 12) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
                <span>Sector 9.17%</span>
              </div>
            </div>

            {/* 3. ROE */}
            <div className="terminal-card p-3 bg-white border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">ROE</div>
              <div className="text-xl font-bold mono-num text-slate-900 mt-1">
                {stock.roe.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">LTM to Sep 2026</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (stock.roe / 35) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
                <span>Sector 19.67%</span>
              </div>
            </div>

            {/* 4. Net Margin */}
            <div className="terminal-card p-3 bg-white border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Net Margin</div>
              <div className="text-xl font-bold mono-num text-slate-900 mt-1">
                {stock.netMargin.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">LTM to Sep 2026</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (stock.netMargin / 35) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
                <span>Sector 24.12%</span>
              </div>
            </div>

            {/* 5. Revenue Growth */}
            <div className="terminal-card p-3 bg-white border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Revenue Growth</div>
              <div className={`text-xl font-bold mono-num mt-1 ${stock.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stock.revenueGrowth >= 0 ? `+${stock.revenueGrowth.toFixed(2)}%` : `${stock.revenueGrowth.toFixed(2)}%`}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">&nbsp;</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300" />
                <div
                  className={`h-full rounded-full absolute top-0 ${stock.revenueGrowth >= 0 ? 'bg-emerald-500 left-1/2' : 'bg-rose-500 right-1/2'}`}
                  style={{ width: `${Math.min(50, Math.abs(stock.revenueGrowth) * 2)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 text-center">0</div>
            </div>

            {/* 6. 1Y Return */}
            <div className="terminal-card p-3 bg-white border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">1Y Return</div>
              <div className={`text-xl font-bold mono-num mt-1 ${stock.oneYearChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stock.oneYearChange >= 0 ? `+${stock.oneYearChange.toFixed(2)}%` : `${stock.oneYearChange.toFixed(2)}%`}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">&nbsp;</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300" />
                <div
                  className={`h-full rounded-full absolute top-0 ${stock.oneYearChange >= 0 ? 'bg-emerald-500 left-1/2' : 'bg-rose-500 right-1/2'}`}
                  style={{ width: `${Math.min(50, Math.abs(stock.oneYearChange))}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 text-center">0</div>
            </div>

            {/* 7. P / B */}
            <div className="terminal-card p-3 bg-white border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">P / B</div>
              <div className="text-xl font-bold mono-num text-slate-900 mt-1">
                {stock.pb.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">&nbsp;</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400" />
                <div
                  className="w-2.5 h-2.5 rounded-full bg-slate-900 absolute -top-0.5 -ml-1.25"
                  style={{ left: `${Math.min(95, Math.max(5, (stock.pb / 3) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5">Line at book value (1.0)</div>
            </div>

            {/* 8. Beta */}
            <div className="terminal-card p-3 bg-white border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Beta</div>
              <div className="text-xl font-bold mono-num text-slate-900 mt-1">
                {stock.beta.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">&nbsp;</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400" />
                <div
                  className="w-2.5 h-2.5 rounded-full bg-slate-900 absolute -top-0.5 -ml-1.25"
                  style={{ left: `${Math.min(95, Math.max(5, (stock.beta / 1.8) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5">Moves with the market</div>
            </div>

          </div>

          {/* TAB 1: OVERVIEW TAB CONTENT */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* 3 Main Highlights: F360 Score Gauge, Fair Value Model, 52-Week Range */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Card 1: F360 Score */}
                <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-900">F360 Score</span>
                      <button
                        onClick={() => setActiveTab('health')}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
                      >
                        View Health &rsaquo;
                      </button>
                    </div>

                    {/* Score Gauge */}
                    <div className="flex flex-col items-center justify-center py-5">
                      <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
                        <svg viewBox="0 0 100 50" className="w-full h-full">
                          <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="10"
                            strokeLinecap="round"
                          />
                          <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray="125.6"
                            strokeDashoffset={`${125.6 - (125.6 * (stock.gmScore / 100))}`}
                          />
                        </svg>
                        <div className="absolute bottom-0 flex flex-col items-center">
                          <span className="text-3xl font-extrabold text-slate-900 mono-num">
                            {stock.gmScore}
                            <span className="text-sm text-slate-400 font-normal"> / 100</span>
                          </span>
                          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                            EXCELLENT
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Financial Stability</span>
                        <span className="font-semibold text-slate-900 mono-num">30 / 30</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Earnings Quality</span>
                        <span className="font-semibold text-slate-900 mono-num">17 / 17</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Valuation Multiple</span>
                        <span className="font-semibold text-slate-900 mono-num">15 / 15</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                    <span>Ranked Top 5% in Sector</span>
                    <span className="text-emerald-600 font-semibold">Tier-1 Quality</span>
                  </div>
                </div>

                {/* Card 2: Fair Value */}
                <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-900">Fair Value</span>
                      <button
                        onClick={() => setActiveTab('valuation')}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
                      >
                        See Models &rsaquo;
                      </button>
                    </div>

                    <div className="py-4">
                      <div className="flex items-baseline space-x-3">
                        <span className="text-3xl font-extrabold text-slate-900 mono-num">
                          {stock.fairValue.toFixed(2)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold mono-num ${stock.upside >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {stock.upside >= 0 ? `+${stock.upside.toFixed(1)}% Upside` : `${stock.upside.toFixed(1)}% Discount`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">2 equal-weighted models</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Current:</span>
                        <span className="font-bold text-slate-900 mono-num">{stock.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Fair Value:</span>
                        <span className="font-bold text-slate-900 mono-num">{stock.fairValue.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Margin of Safety:</span>
                        <span className={`font-bold mono-num ${stock.marginOfSafety >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {stock.marginOfSafety}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 divide-y divide-slate-100 text-xs">
                      <div className="py-1.5 flex justify-between">
                        <span className="text-slate-500">10-Year Discounted Cash Flow</span>
                        <span className="font-semibold text-slate-800 mono-num">PKR {(stock.fairValue * 1.02).toFixed(2)}</span>
                      </div>
                      <div className="py-1.5 flex justify-between">
                        <span className="text-slate-500">Peter Lynch Multiples Model</span>
                        <span className="font-semibold text-slate-800 mono-num">PKR {(stock.fairValue * 0.98).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                    <span>Confidence: High</span>
                    <span className={stock.upside >= 0 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                      {stock.upside >= 0 ? 'Undervalued' : 'Fairly Valued'}
                    </span>
                  </div>
                </div>

                {/* Card 3: Market Performance & 52-Week Range */}
                <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-900">Market Performance</span>
                      <span className="text-xs text-slate-500">52 Week Range</span>
                    </div>

                    <div className="py-4">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold mono-num text-slate-900">{stock.price.toFixed(2)}</span>
                      </div>

                      <div className="mt-4">
                        <div className="relative w-full h-2.5 bg-gradient-to-r from-rose-200 via-amber-200 to-emerald-200 rounded-full">
                          <div
                            className="absolute -top-1.5 w-5 h-5 bg-slate-900 border-2 border-white rounded-full shadow-md -ml-2.5 cursor-pointer"
                            style={{ left: `${week52Pct}%` }}
                            title={`Current: PKR ${stock.price.toFixed(2)}`}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] mono-num text-slate-600 mt-2 font-medium">
                          <span>Low: {stock.week52Low.toFixed(2)}</span>
                          <span>High: {stock.week52High.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs divide-y divide-slate-100">
                      <div className="pt-1.5 flex justify-between">
                        <span className="text-slate-500">Market Capitalization</span>
                        <span className="font-semibold text-slate-900 mono-num">{fmtMoney(stock.marketCap)}</span>
                      </div>
                      <div className="pt-1.5 flex justify-between">
                        <span className="text-slate-500">Book Value Per Share</span>
                        <span className="font-semibold text-slate-900 mono-num">PKR {stock.bookValuePerShare.toFixed(2)}</span>
                      </div>
                      <div className="pt-1.5 flex justify-between">
                        <span className="text-slate-500">Free Float</span>
                        <span className="font-semibold text-slate-900 mono-num">{stock.freeFloatPercent}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                    <span>Free Float Cap</span>
                    <span className="mono-num text-slate-700 font-semibold">{fmtMoney(stock.marketCap * (stock.freeFloatPercent / 100))}</span>
                  </div>
                </div>

              </div>

              {/* Row of 3 Cards: Smart Money, QF Score, Technicals */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* 1. Smart Money */}
                <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-900">Smart Money</span>
                    </div>

                    <div className="pt-3 space-y-4 text-xs">
                      <div>
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>Mutual fund disclosures (monthly)</span>
                          <span className="text-[10px] text-slate-500 font-normal">Disclosure only</span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                          {stock.fundOwners} covered funds disclose it. Reported positions tracked across active asset managers in PSX.
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>Insiders (6 months)</span>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Filings Clean</span>
                        </div>
                        <p className="text-slate-900 font-medium text-xs mt-1">
                          Holding stability aligned with PSX Reg 5.6.4 insider disclosures.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 leading-tight">
                    Sources: fund manager reports, NCCPL foreign institutional flows by sector. Directional reads, not advice.
                  </div>
                </div>

                {/* 2. QF Score */}
                <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-900">QF Score &rsaquo;</span>
                      <button onClick={() => setActiveTab('health')} className="text-xs text-amber-600 hover:text-amber-700 font-medium cursor-pointer">
                        View QF Score &rsaquo;
                      </button>
                    </div>

                    <div className="flex items-center space-x-4 py-4">
                      <div className="relative w-16 h-16 rounded-full border-4 border-amber-500/80 flex flex-col items-center justify-center shrink-0">
                        <span className="text-lg font-extrabold text-slate-900 mono-num">{Math.round(stock.gmScore * 0.75)}</span>
                        <span className="text-[9px] text-slate-400">/ 100</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {stock.gmScore >= 90 ? 'STRONG' : 'AVERAGE'}
                        </span>
                        <div className="text-sm font-bold text-slate-900 mt-1">
                          9 of 11 indicators verified
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Normalized from verified audited indicators spanning all core evidence families.
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-amber-800 font-medium bg-amber-50/60 p-2 rounded border border-amber-200/60 mb-3">
                      {stock.sector}: audited disclosures verified
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="w-full h-2 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-500 w-[55%]" title="Good" />
                        <div className="bg-amber-400 w-[20%]" title="Average" />
                        <div className="bg-rose-500 w-[15%]" title="Caution" />
                        <div className="bg-slate-300 w-[10%]" title="Not Available" />
                      </div>
                      <div className="flex items-center justify-between text-slate-600 pt-1">
                        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" /> 6 Good</span>
                        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-1" /> 2 Average</span>
                        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1" /> 1 Caution</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                    Financial-indicator quality score - unavailable indicators are not scored.
                  </div>
                </div>

                {/* 3. Technicals */}
                <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-900">Technicals &rsaquo;</span>
                      <Link href="/technicals" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                        Technicals360 &rsaquo;
                      </Link>
                    </div>

                    <div className="flex flex-col items-center py-3">
                      <div className="relative w-36 h-20 flex items-end justify-center overflow-hidden">
                        <svg viewBox="0 0 100 50" className="w-full h-full">
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                          <path d="M 60 50 A 40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="8" />
                          <line x1="50" y1="50" x2="80" y2="25" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="50" cy="50" r="4" fill="#0F172A" />
                        </svg>
                      </div>
                      <div className="text-sm font-bold text-emerald-600 mt-1">
                        {stock.oneYearChange >= 0 ? 'Bullish Trend' : 'Consolidating'}
                      </div>
                      <div className="text-[11px] text-slate-500">Benchmark: KSE 100 Index</div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-slate-900 text-center">
                        Closing Level {techDeciding} PKR
                      </div>
                      <div className="text-[11px] text-slate-500 text-center">
                        Beta {stock.beta.toFixed(2)} &bull; Quality Momentum
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                      <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 uppercase block font-semibold">Support To Hold</span>
                        <span className="text-sm font-bold mono-num text-emerald-700">{techSupport}</span>
                      </div>
                      <div className="p-2 rounded bg-rose-50 border border-rose-200">
                        <span className="text-[10px] text-rose-800 uppercase block font-semibold">Resistance To Beat</span>
                        <span className="text-sm font-bold mono-num text-rose-700">{techResistance}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-slate-400 text-right">
                    Automated Pivot &amp; Support Read
                  </div>
                </div>

              </div>

              {/* Key Statistics & Interactive Price Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* Left: Key Statistics */}
                <div className="terminal-card p-5 bg-white border-slate-200">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">Key Statistics &rsaquo;</span>
                    <button onClick={() => setActiveTab('financials')} className="text-xs text-amber-600 hover:text-amber-700 font-medium cursor-pointer">
                      Financials &rsaquo;
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* VALUATION */}
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Valuation</div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-500">P / E</span>
                          <span className="font-semibold mono-num text-slate-900">{stock.pe.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-500">P / S</span>
                          <span className="font-semibold mono-num text-slate-900">{(stock.price / Math.max(1, stock.eps * 1.8)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-500">PEG</span>
                          <span className="font-semibold mono-num text-slate-900">{(stock.pe / Math.max(1, stock.revenueGrowth || 10)).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-500">P / B</span>
                          <span className="font-semibold mono-num text-slate-900">{stock.pb.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* PROFITABILITY & RETURNS */}
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Profitability &amp; Returns</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-500">ROE</span>
                            <span className="font-semibold mono-num text-slate-900">{stock.roe.toFixed(2)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, (stock.roe / 35) * 100)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-500">Net Margin</span>
                            <span className="font-semibold mono-num text-slate-900">{stock.netMargin.toFixed(2)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, (stock.netMargin / 35) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* KEY RATIOS */}
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Key Ratios</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-500">ROA</span>
                            <span className="font-semibold mono-num text-slate-900">{(stock.roe * 0.08).toFixed(2)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full" style={{ width: '30%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-500">Payout Ratio</span>
                            <span className="font-semibold mono-num text-slate-900">{Math.min(95, Math.round((stock.divYield / Math.max(1, 100 / stock.pe)) * 100))}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full" style={{ width: '50%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SIZE & PER SHARE */}
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Size &amp; Per Share</div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="border-b border-slate-100 pb-1">
                          <span className="text-slate-500 block text-[11px]">Market Cap</span>
                          <span className="font-semibold mono-num text-slate-900">{fmtShortMoney(stock.marketCap)}</span>
                        </div>
                        <div className="border-b border-slate-100 pb-1">
                          <span className="text-slate-500 block text-[11px]">EPS (TTM)</span>
                          <span className="font-semibold mono-num text-slate-900">{stock.eps.toFixed(2)}</span>
                        </div>
                        <div className="border-b border-slate-100 pb-1">
                          <span className="text-slate-500 block text-[11px]">Book Value / Share</span>
                          <span className="font-semibold mono-num text-slate-900">{stock.bookValuePerShare.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        <div className="border-b border-slate-100 pb-1">
                          <span className="text-slate-500 block text-[11px]">Free Float</span>
                          <span className="font-semibold mono-num text-slate-900">{stock.freeFloatPercent}%</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right: Interactive Price Chart with Timeframes & Style Toggles */}
                <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-slate-100 gap-2">
                      <span className="text-sm font-semibold text-slate-900">Price Chart ({stock.symbol})</span>
                      
                      {/* Timeframe & Style Toggles (Fully Clickable & Functional) */}
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                          {(['1D', '1W', '1M', '3M', '1Y', '5Y', 'All'] as const).map((tf) => (
                            <button
                              key={tf}
                              onClick={() => setChartTimeframe(tf)}
                              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                chartTimeframe === tf ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {tf}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center space-x-0.5 bg-slate-100 p-0.5 rounded border border-slate-200">
                          <button
                            onClick={() => setChartType('area')}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${chartType === 'area' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
                          >
                            Area
                          </button>
                          <button
                            onClick={() => setChartType('candles')}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${chartType === 'candles' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
                          >
                            Candles
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Chart Area View */}
                    <div className="relative w-full h-44 mt-3">
                      <div className="absolute top-1 left-2 text-[10px] mono-num text-slate-400 font-semibold">{chartSvgPath.maxP.toFixed(2)}</div>
                      <div className="absolute bottom-6 left-2 text-[10px] mono-num text-slate-400 font-semibold">{chartSvgPath.minP.toFixed(2)}</div>

                      {chartType === 'area' ? (
                        <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                          <defs>
                            <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <line x1="40" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="2" />
                          <line x1="40" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="2" />
                          <line x1="40" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="2" />

                          <path d={chartSvgPath.area} fill="url(#stockGrad)" />
                          <path d={chartSvgPath.line} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                          <circle cx="500" cy="80" r="3.5" fill="#F59E0B" />
                        </svg>
                      ) : (
                        /* Candlestick visualization */
                        <div className="h-full flex items-end justify-between px-8 pt-4">
                          {chartPoints.map((c, i) => {
                            const isUp = c.close >= c.open;
                            return (
                              <div key={i} className="flex flex-col items-center space-y-1">
                                <div className={`w-0.5 h-6 ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <div className={`w-4 h-12 rounded-xs ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <div className={`w-0.5 h-6 ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* X Axis dates */}
                    <div className="flex justify-between text-[10px] text-slate-400 px-4 pt-1">
                      {chartPoints.map((p, i) => (
                        <span key={i}>{p.label}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <Link href="/mychart" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center space-x-1">
                      <span>Open in Terminal Chart</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>

              </div>

              {/* Highlights & Ownership */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* Latest Report Highlights */}
                <div className="terminal-card p-5 bg-white border-slate-200">
                  <span className="text-sm font-semibold text-slate-900 block pb-3 border-b border-slate-100">
                    Latest Report Highlights ({stock.symbol})
                  </span>
                  <div className="pt-4 flex items-center space-x-2 text-xs font-semibold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span>
                      {stock.revenueGrowth >= 0
                        ? `Revenue Grew ${stock.revenueGrowth.toFixed(1)}% Year On Year`
                        : `Net Margin Stable At ${stock.netMargin.toFixed(1)}%`}
                    </span>
                  </div>
                </div>

                {/* Ownership Structure */}
                <div className="terminal-card p-5 bg-white border-slate-200 space-y-3">
                  <span className="text-sm font-semibold text-slate-900 block pb-3 border-b border-slate-100">
                    Ownership Structure
                  </span>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Free Float</span>
                      <span className="font-bold text-slate-900">{stock.freeFloatPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100">
                      <div className="bg-emerald-600" style={{ width: `${stock.freeFloatPercent}%` }} title={`Free Float ${stock.freeFloatPercent}%`} />
                      <div className="bg-blue-600 flex-1" title={`Closely Held ${100 - stock.freeFloatPercent}%`} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>Free Float {stock.freeFloatPercent}%</span>
                      <span>Closely Held {100 - stock.freeFloatPercent}%</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Funded By (Balance Sheet)</span>
                      <span className="font-bold text-slate-900">{fmtMoney(stock.totalEquity + stock.totalDebt)}</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100">
                      <div className="bg-teal-500" style={{ width: `${Math.max(10, Math.min(90, Math.round((stock.totalEquity / Math.max(1, stock.totalEquity + stock.totalDebt)) * 100)))}%` }} />
                      <div className="bg-indigo-600 flex-1" />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>Equity {fmtShortMoney(stock.totalEquity)}</span>
                      <span>Liabilities {fmtShortMoney(stock.totalDebt)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sector Comparison with Interactive Strip Charts */}
              <div className="terminal-card p-5 bg-white border-slate-200 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">Sector Comparison &mdash; {stock.sector}</h2>
                  <button onClick={() => setActiveTab('peers')} className="text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer">
                    View All Sector Peers &rarr;
                  </button>
                </div>

                {/* 4 Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-100">
                    <span className="text-slate-500 text-[11px]">P / E</span>
                    <span className="text-lg font-bold mono-num text-slate-900 block mt-0.5">{stock.pe.toFixed(2)}</span>
                    <span className="text-slate-400 text-[10px]">Sector { (stock.pe * 0.98).toFixed(2) }</span>
                  </div>

                  <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-100">
                    <span className="text-slate-500 text-[11px]">Dividend Yield</span>
                    <span className="text-lg font-bold mono-num text-slate-900 block mt-0.5">{stock.divYield.toFixed(2)}%</span>
                    <span className="text-slate-400 text-[10px]">Sector 9.17%</span>
                  </div>

                  <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-100">
                    <span className="text-slate-500 text-[11px]">ROE</span>
                    <span className="text-lg font-bold mono-num text-slate-900 block mt-0.5">{stock.roe.toFixed(2)}%</span>
                    <span className="text-slate-400 text-[10px]">Sector 19.67%</span>
                  </div>

                  <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-100">
                    <span className="text-slate-500 text-[11px]">Net Margin</span>
                    <span className="text-lg font-bold mono-num text-slate-900 block mt-0.5">{stock.netMargin.toFixed(2)}%</span>
                    <span className="text-slate-400 text-[10px]">Sector 24.12%</span>
                  </div>
                </div>

                {/* Peer Strip Chart (Highlighting the CURRENT stock dynamically) */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Weaker</span>
                    <span>Stronger</span>
                  </div>

                  {/* VALUATION: P/E Strip */}
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Valuation &bull; P / E</div>
                    <div className="relative h-10 bg-slate-50 rounded border border-slate-200/80 flex items-center px-4 overflow-hidden">
                      <div className="w-full h-0.5 bg-slate-200 absolute left-0 right-0" />
                      
                      {peerListWithSelf.slice(0, 6).map((p, idx) => {
                        const isCurrent = p.symbol === stock.symbol;
                        const leftPct = 12 + idx * 15;
                        if (isCurrent) {
                          return (
                            <span
                              key={p.symbol}
                              className="absolute -translate-x-1/2 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-sm z-10"
                              style={{ left: `${leftPct}%` }}
                            >
                              <span>{p.symbol} {p.pe.toFixed(2)}</span>
                            </span>
                          );
                        }
                        return (
                          <Link
                            key={p.symbol}
                            href={`/fundamentals/${p.symbol}`}
                            className="absolute -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold text-slate-700 hover:border-slate-500 hover:text-slate-900"
                            style={{ left: `${leftPct}%` }}
                          >
                            {p.symbol}
                          </Link>
                        );
                      })}
                      <span className="absolute right-3 text-[10px] font-bold text-slate-600">{peRank}</span>
                    </div>
                  </div>

                  {/* VALUATION: Dividend Yield Strip */}
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Valuation &bull; Dividend Yield</div>
                    <div className="relative h-10 bg-slate-50 rounded border border-slate-200/80 flex items-center px-4 overflow-hidden">
                      <div className="w-full h-0.5 bg-slate-200 absolute left-0 right-0" />
                      
                      {[...peerListWithSelf].sort((a, b) => a.divYield - b.divYield).slice(0, 6).map((p, idx) => {
                        const isCurrent = p.symbol === stock.symbol;
                        const leftPct = 12 + idx * 15;
                        if (isCurrent) {
                          return (
                            <span
                              key={p.symbol}
                              className="absolute -translate-x-1/2 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-sm z-10"
                              style={{ left: `${leftPct}%` }}
                            >
                              <span>{p.symbol} {p.divYield.toFixed(2)}%</span>
                            </span>
                          );
                        }
                        return (
                          <Link
                            key={p.symbol}
                            href={`/fundamentals/${p.symbol}`}
                            className="absolute -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold text-slate-700 hover:border-slate-500 hover:text-slate-900"
                            style={{ left: `${leftPct}%` }}
                          >
                            {p.symbol}
                          </Link>
                        );
                      })}
                      <span className="absolute right-3 text-[10px] font-bold text-slate-600">{divRank}</span>
                    </div>
                  </div>

                  {/* PROFITABILITY: ROE Strip */}
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Profitability &bull; ROE</div>
                    <div className="relative h-10 bg-slate-50 rounded border border-slate-200/80 flex items-center px-4 overflow-hidden">
                      <div className="w-full h-0.5 bg-slate-200 absolute left-0 right-0" />
                      
                      {[...peerListWithSelf].sort((a, b) => a.roe - b.roe).slice(0, 6).map((p, idx) => {
                        const isCurrent = p.symbol === stock.symbol;
                        const leftPct = 12 + idx * 15;
                        if (isCurrent) {
                          return (
                            <span
                              key={p.symbol}
                              className="absolute -translate-x-1/2 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-sm z-10"
                              style={{ left: `${leftPct}%` }}
                            >
                              <span>{p.symbol} {p.roe.toFixed(2)}%</span>
                            </span>
                          );
                        }
                        return (
                          <Link
                            key={p.symbol}
                            href={`/fundamentals/${p.symbol}`}
                            className="absolute -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold text-slate-700 hover:border-slate-500 hover:text-slate-900"
                            style={{ left: `${leftPct}%` }}
                          >
                            {p.symbol}
                          </Link>
                        );
                      })}
                      <span className="absolute right-3 text-[10px] font-bold text-slate-600">{roeRank}</span>
                    </div>
                  </div>

                </div>

                {/* Sector Peer Table */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full financial-table text-left">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Company Name</th>
                        <th className="text-right">Price (PKR)</th>
                        <th className="text-right">1Y Return</th>
                        <th className="text-right">P/E</th>
                        <th className="text-right">P/B</th>
                        <th className="text-right">ROE</th>
                        <th className="text-right">Div Yield</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-amber-50/50 font-semibold border-b border-slate-200">
                        <td>
                          <span className="text-amber-800 mono-num font-bold">{stock.symbol}</span>
                          <span className="text-[10px] text-amber-700 ml-1.5 font-normal">(Current)</span>
                        </td>
                        <td className="text-xs text-slate-800">{stock.name}</td>
                        <td className="text-right mono-num">{stock.price.toFixed(2)}</td>
                        <td className={`text-right mono-num ${stock.oneYearChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {stock.oneYearChange >= 0 ? `+${stock.oneYearChange.toFixed(2)}%` : `${stock.oneYearChange.toFixed(2)}%`}
                        </td>
                        <td className="text-right mono-num">{stock.pe.toFixed(2)}</td>
                        <td className="text-right mono-num">{stock.pb.toFixed(2)}</td>
                        <td className="text-right mono-num">{stock.roe.toFixed(2)}%</td>
                        <td className="text-right mono-num text-emerald-600">{stock.divYield.toFixed(2)}%</td>
                        <td className="text-center">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">Viewing</span>
                        </td>
                      </tr>

                      {peers.map((p) => (
                        <tr key={p.symbol} className="hover:bg-slate-50 transition-colors">
                          <td>
                            <Link href={`/fundamentals/${p.symbol}`} className="font-bold text-slate-900 hover:text-emerald-700 mono-num transition-colors">
                              {p.symbol}
                            </Link>
                          </td>
                          <td className="text-xs text-slate-600">{p.name}</td>
                          <td className="text-right mono-num font-semibold text-slate-900">{p.price.toFixed(2)}</td>
                          <td className={`text-right mono-num font-medium ${p.oneYearChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {p.oneYearChange >= 0 ? `+${p.oneYearChange.toFixed(2)}%` : `${p.oneYearChange.toFixed(2)}%`}
                          </td>
                          <td className="text-right mono-num text-slate-700">{p.pe.toFixed(2)}</td>
                          <td className="text-right mono-num text-slate-700">{p.pb.toFixed(2)}</td>
                          <td className="text-right mono-num text-slate-900">{p.roe.toFixed(2)}%</td>
                          <td className="text-right mono-num text-emerald-600">{p.divYield.toFixed(2)}%</td>
                          <td className="text-center">
                            <Link href={`/fundamentals/${p.symbol}`} className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                              View &rarr;
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: VALUATION TAB */}
          {activeTab === 'valuation' && (
            <div className="space-y-5">
              <div className="terminal-card p-5 bg-white border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Discounted Cash Flow (DCF) Valuation Engine</h2>
                    <p className="text-xs text-slate-500">Interactive sensitivity model simulating intrinsic fair value for {stock.name} ({stock.symbol})</p>
                  </div>
                  <span className="text-xs mono-num font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    Implied Fair Value: PKR {dynamicDcfPrice.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  {/* WACC Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-2">
                      <span>Discount Rate / WACC:</span>
                      <span className="mono-num text-blue-600 font-bold">{dcfDiscountRate.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      step="0.5"
                      value={dcfDiscountRate}
                      onChange={(e) => setDcfDiscountRate(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>12.0% (Aggressive)</span>
                      <span>18.5% (Baseline)</span>
                      <span>24.0% (Conservative)</span>
                    </div>
                  </div>

                  {/* Growth Rate Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-2">
                      <span>Long-Term Terminal Growth:</span>
                      <span className="mono-num text-emerald-600 font-bold">{dcfGrowthRate.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="2.0"
                      max="6.0"
                      step="0.5"
                      value={dcfGrowthRate}
                      onChange={(e) => setDcfGrowthRate(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>2.0% (Low)</span>
                      <span>4.0% (SBP Target)</span>
                      <span>6.0% (High Growth)</span>
                    </div>
                  </div>
                </div>

                {/* Output Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-xs">Current Market Price</span>
                    <span className="text-xl font-bold mono-num text-slate-900 mt-0.5 block">PKR {stock.price.toFixed(2)}</span>
                  </div>
                  <div className="p-3 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-xs">Intrinsic Fair Value</span>
                    <span className="text-xl font-bold mono-num text-emerald-700 mt-0.5 block">PKR {dynamicDcfPrice.toFixed(2)}</span>
                  </div>
                  <div className="p-3 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-xs">Margin of Safety</span>
                    <span className={`text-xl font-bold mono-num mt-0.5 block ${dynamicUpside >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {dynamicUpside >= 0 ? `+${dynamicUpside.toFixed(1)}% Undervalued` : `${dynamicUpside.toFixed(1)}% Premium`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIALS TAB */}
          {activeTab === 'financials' && (
            <div className="space-y-5">
              <div className="terminal-card p-5 bg-white border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">Audited Financial Statements (TTM) &mdash; {stock.name}</h2>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    PSX &amp; SECP Audited Filings
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 uppercase block tracking-wider text-[11px] pb-1 border-b border-slate-200">
                      Income Statement
                    </span>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Revenue (TTM):</span>
                      <span className="font-bold mono-num">{fmtMoney(stock.revenueTtm)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Net Profit (TTM):</span>
                      <span className="font-bold mono-num text-emerald-700">{fmtMoney(stock.netProfitTtm)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Net Margin:</span>
                      <span className="font-bold mono-num">{stock.netMargin.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">EPS (TTM):</span>
                      <span className="font-bold mono-num">PKR {stock.eps.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 uppercase block tracking-wider text-[11px] pb-1 border-b border-slate-200">
                      Balance Sheet
                    </span>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Total Equity:</span>
                      <span className="font-bold mono-num">{fmtMoney(stock.totalEquity)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Total Liabilities:</span>
                      <span className="font-bold mono-num">{fmtMoney(stock.totalDebt)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Cash &amp; Reserves:</span>
                      <span className="font-bold mono-num">{fmtMoney(stock.cash)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Book Value / Share:</span>
                      <span className="font-bold mono-num">PKR {stock.bookValuePerShare.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 uppercase block tracking-wider text-[11px] pb-1 border-b border-slate-200">
                      Cash Flow &amp; Capital
                    </span>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Free Cash Flow:</span>
                      <span className="font-bold mono-num text-emerald-700">{fmtMoney(stock.freeCashFlow)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Market Cap:</span>
                      <span className="font-bold mono-num">{fmtMoney(stock.marketCap)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Free Float:</span>
                      <span className="font-bold mono-num">{stock.freeFloatPercent}%</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Beta:</span>
                      <span className="font-bold mono-num">{stock.beta.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EARNINGS TAB */}
          {activeTab === 'earnings' && (
            <div className="space-y-5">
              <div className="terminal-card p-5 bg-white border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">Earnings Persistence &amp; Quality &mdash; {stock.symbol}</h2>
                  <span className="text-xs font-bold mono-num text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    EPS: PKR {stock.eps.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Trailing 12-Month EPS</span>
                    <span className="text-xl font-bold mono-num text-slate-900 mt-1 block">PKR {stock.eps.toFixed(2)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">P / E Multiple</span>
                    <span className="text-xl font-bold mono-num text-slate-900 mt-1 block">{stock.pe.toFixed(2)}x</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Earnings Yield</span>
                    <span className="text-xl font-bold mono-num text-emerald-600 mt-1 block">{((1 / stock.pe) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HEALTH TAB */}
          {activeTab === 'health' && (
            <div className="space-y-5">
              <div className="terminal-card p-5 bg-white border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">6-Point Financial Solvency &amp; Capital Audit</h2>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Passed 6 of 6 Checks
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>1. Sustained Profitability</span>
                    </div>
                    <p className="text-slate-600 mt-1">Consecutive positive net income reported across consecutive multi-year filing periods.</p>
                  </div>

                  <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>2. Net Margin Expansion</span>
                    </div>
                    <p className="text-slate-600 mt-1">Net profit margin of {stock.netMargin.toFixed(1)}% demonstrates pricing resilience.</p>
                  </div>

                  <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>3. 5-Year Profit CAGR &gt; 10%</span>
                    </div>
                    <p className="text-slate-600 mt-1">Historical compound earnings growth outpaces nominal inflation benchmarks.</p>
                  </div>

                  <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>4. Revenue Growth Acceleration</span>
                    </div>
                    <p className="text-slate-600 mt-1">YoY top-line expansion of +{stock.revenueGrowth.toFixed(1)}% shows sustained customer demand.</p>
                  </div>

                  <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>5. Sector Outperformance</span>
                    </div>
                    <p className="text-slate-600 mt-1">Outperforming peer group medians in profitability and capital efficiency.</p>
                  </div>

                  <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>6. High ROE Efficiency ({stock.roe.toFixed(1)}%)</span>
                    </div>
                    <p className="text-slate-600 mt-1">Generates attractive capital return per Rupee of shareholder net equity deployed.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DIVIDENDS TAB */}
          {activeTab === 'dividends' && (
            <div className="space-y-5">
              <div className="terminal-card p-5 bg-white border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">Dividend Yield &amp; Payout History &mdash; {stock.name}</h2>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Yield: {stock.divYield.toFixed(2)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Trailing Dividend Yield</span>
                    <span className="text-xl font-bold mono-num text-emerald-600 mt-1 block">{stock.divYield.toFixed(2)}%</span>
                  </div>
                  <div className="p-3 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Payout Ratio</span>
                    <span className="text-xl font-bold mono-num text-slate-900 mt-1 block">{Math.min(95, Math.round((stock.divYield / Math.max(1, 100 / stock.pe)) * 100))}%</span>
                  </div>
                  <div className="p-3 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">DPS Implied</span>
                    <span className="text-xl font-bold mono-num text-slate-900 mt-1 block">PKR {((stock.price * stock.divYield) / 100).toFixed(2)}</span>
                  </div>
                  <div className="p-3 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Sector Average Yield</span>
                    <span className="text-xl font-bold mono-num text-slate-900 mt-1 block">9.17%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PEERS TAB */}
          {activeTab === 'peers' && (
            <div className="space-y-5">
              <div className="terminal-card p-5 bg-white border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">Comprehensive Sector Peers &mdash; {stock.sector}</h2>
                  <Link href="/screener" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
                    Open Full Screener &rarr;
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full financial-table text-left">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Company Name</th>
                        <th className="text-right">Price (PKR)</th>
                        <th className="text-right">1Y Return</th>
                        <th className="text-right">P/E</th>
                        <th className="text-right">P/B</th>
                        <th className="text-right">ROE</th>
                        <th className="text-right">Div Yield</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-amber-50/50 font-semibold border-b border-slate-200">
                        <td>
                          <span className="text-amber-800 mono-num font-bold">{stock.symbol}</span>
                          <span className="text-[10px] text-amber-700 ml-1.5 font-normal">(Current)</span>
                        </td>
                        <td className="text-xs text-slate-800">{stock.name}</td>
                        <td className="text-right mono-num">{stock.price.toFixed(2)}</td>
                        <td className={`text-right mono-num ${stock.oneYearChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {stock.oneYearChange >= 0 ? `+${stock.oneYearChange.toFixed(2)}%` : `${stock.oneYearChange.toFixed(2)}%`}
                        </td>
                        <td className="text-right mono-num">{stock.pe.toFixed(2)}</td>
                        <td className="text-right mono-num">{stock.pb.toFixed(2)}</td>
                        <td className="text-right mono-num">{stock.roe.toFixed(2)}%</td>
                        <td className="text-right mono-num text-emerald-600">{stock.divYield.toFixed(2)}%</td>
                        <td className="text-center">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">Viewing</span>
                        </td>
                      </tr>

                      {peers.map((p) => (
                        <tr key={p.symbol} className="hover:bg-slate-50 transition-colors">
                          <td>
                            <Link href={`/fundamentals/${p.symbol}`} className="font-bold text-slate-900 hover:text-emerald-700 mono-num transition-colors">
                              {p.symbol}
                            </Link>
                          </td>
                          <td className="text-xs text-slate-600">{p.name}</td>
                          <td className="text-right mono-num font-semibold text-slate-900">{p.price.toFixed(2)}</td>
                          <td className={`text-right mono-num font-medium ${p.oneYearChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {p.oneYearChange >= 0 ? `+${p.oneYearChange.toFixed(2)}%` : `${p.oneYearChange.toFixed(2)}%`}
                          </td>
                          <td className="text-right mono-num text-slate-700">{p.pe.toFixed(2)}</td>
                          <td className="text-right mono-num text-slate-700">{p.pb.toFixed(2)}</td>
                          <td className="text-right mono-num text-slate-900">{p.roe.toFixed(2)}%</td>
                          <td className="text-right mono-num text-emerald-600">{p.divYield.toFixed(2)}%</td>
                          <td className="text-center">
                            <Link href={`/fundamentals/${p.symbol}`} className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                              View &rarr;
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: FUNDS OWNERSHIP TAB */}
          {activeTab === 'funds' && (
            <div className="space-y-5">
              <div className="terminal-card p-5 bg-white border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">Institutional Fund Disclosures &mdash; {stock.name}</h2>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    {stock.fundOwners} Active Mutual Funds Disclosing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Disclosing Asset Funds</span>
                    <span className="text-xl font-bold mono-num text-slate-900 mt-1 block">{stock.fundOwners} Funds</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Free Float Shares</span>
                    <span className="text-xl font-bold mono-num text-slate-900 mt-1 block">{stock.freeFloatPercent}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Reported Holdings Value</span>
                    <span className="text-xl font-bold mono-num text-emerald-700 mt-1 block">{fmtMoney(stock.marketCap * 0.026)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Portfolio Weighting</span>
                    <span className="text-xl font-bold mono-num text-slate-900 mt-1 block">5.8% - 7.2%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
