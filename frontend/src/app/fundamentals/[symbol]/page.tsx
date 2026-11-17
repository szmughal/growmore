'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { getStockBySymbol, getSectorPeers, searchStocks, ALL_PSX_STOCKS } from '@/data/psxStocks';
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

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawSymbol = (params?.symbol as string) || 'HBL';
  const symbol = rawSymbol.toUpperCase();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'valuation' | 'financials' | 'earnings' | 'health' | 'dividends' | 'peers' | 'funds'
  >('overview');

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
    return Math.max(stock.price * 0.5, Number((baseFair * multiplier).toFixed(2)));
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
    if (num >= 1e12) return `PKR ${(num / 1e12).toFixed(2)} Trillion`;
    if (num >= 1e9) return `PKR ${(num / 1e9).toFixed(2)} Billion`;
    if (num >= 1e6) return `PKR ${(num / 1e6).toFixed(2)} Million`;
    return `PKR ${num.toLocaleString()}`;
  };

  const isPositive1Y = stock.oneYearChange >= 0;

  // 1Y simulated historical SVG curve points matching Image 3 (Nov 25 -> Nov 26)
  const historicalPricePoints = [
    { label: 'Nov 25', price: 275 },
    { label: 'Dec 25', price: 310 },
    { label: 'Jan 26', price: 335 },
    { label: 'Feb 26', price: 365 }, // High
    { label: 'Mar 26', price: 320 },
    { label: 'Apr 26', price: 270 },
    { label: 'May 26', price: 235.55 }, // Low
    { label: 'Jun 26', price: 280 },
    { label: 'Jul 26', price: 305 },
    { label: 'Aug 26', price: 285 },
    { label: 'Sep 26', price: 340 },
    { label: 'Oct 26', price: 295 },
    { label: 'Nov 26', price: stock.price } // Current 308.22
  ];

  const minHist = 220;
  const maxHist = 380;
  const chartSvgPath = useMemo(() => {
    const pts = historicalPricePoints.map((pt, i) => {
      const x = (i / (historicalPricePoints.length - 1)) * 500;
      const y = 140 - ((pt.price - minHist) / (maxHist - minHist)) * 120;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
    const area = `${pts} L 500 150 L 0 150 Z`;
    return { line: pts, area };
  }, [stock.price]);

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
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-slate-600 font-medium">Market Closed &bull; Data As Of Close</span>
            </div>
          </div>

          {/* Company Profile Hero Banner (Image 1) */}
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
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
                    Market closed
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-slate-500">Data As Of 16 Nov 2026 Close</span>

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

            {/* Navigation Tabs (Portfolio360 exact tabs) */}
            <div className="flex items-center space-x-2 sm:space-x-5 border-t border-slate-100 mt-6 pt-3 overflow-x-auto text-xs font-medium">
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
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-2 transition-all whitespace-nowrap border-b-2 ${
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

          {/* 8 Primary Metric Cards (Matching Portfolio360 Top Row - Image 1) */}
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
                  style={{ width: `${Math.min(100, (stock.roe / 30) * 100)}%` }}
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
              <div className="text-xl font-bold mono-num mt-1 text-emerald-600">
                +{stock.revenueGrowth.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">&nbsp;</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300" />
                <div
                  className="h-full rounded-full absolute top-0 bg-emerald-500 left-1/2"
                  style={{ width: `${Math.min(50, Math.abs(stock.revenueGrowth) * 2)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 text-center">0</div>
            </div>

            {/* 6. 1Y Return */}
            <div className="terminal-card p-3 bg-white border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">1Y Return</div>
              <div className="text-xl font-bold mono-num mt-1 text-rose-600">
                {stock.oneYearChange.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">&nbsp;</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300" />
                <div
                  className="h-full rounded-full absolute top-0 bg-rose-500 right-1/2"
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
                  style={{ left: `${Math.min(95, Math.max(5, (stock.pb / 2) * 100))}%` }}
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

          {/* 3 Main Highlights: F360 Score Gauge, Fair Value Model, 52-Week Range (Image 1) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Card 1: F360 Score */}
            <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-900">F360 Score</span>
                  <button
                    onClick={() => setActiveTab('health')}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
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
                        Excellent
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
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                  >
                    See Models &rsaquo;
                  </button>
                </div>

                <div className="py-4">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-extrabold text-slate-900 mono-num">
                      {stock.fairValue.toFixed(2)}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mono-num">
                      +{stock.upside.toFixed(1)}% Upside
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
                    <span className="font-bold text-emerald-700 mono-num">{stock.fairValue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Margin of Safety:</span>
                    <span className="font-bold text-emerald-600 mono-num">{stock.marginOfSafety}%</span>
                  </div>
                </div>

                <div className="mt-3 divide-y divide-slate-100 text-xs">
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500">10-Year Discounted Cash Flow</span>
                    <span className="font-semibold text-slate-800 mono-num">PKR 472.10</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500">Peter Lynch Multiples Model</span>
                    <span className="font-semibold text-slate-800 mono-num">PKR 447.75</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Confidence: High</span>
                <span className="text-emerald-600 font-semibold">Undervalued</span>
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

          {/* Row of 3 Cards: Smart Money, QF Score, Technicals (Image 2) */}
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
                      35 covered funds disclose it. 134 funds with reported positions; 54 comparable funds. 0 newly disclosed, 0 no longer disclosed; 16 newly covered holders; 1 prior holders without comparable current data. Partial holdings lists do not establish purchases or sales.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>Insiders (6 months)</span>
                      <span className="text-xs font-bold text-rose-600">Selling</span>
                    </div>
                    <p className="text-slate-900 font-medium text-xs mt-0.5">
                      PKR 0 bought &bull; PKR 13.48M sold across 2 filings
                    </p>
                    <p className="text-slate-700 font-semibold text-[11px] mt-1">
                      Every available smart-money lens leans selling.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 leading-tight">
                Sources: fund manager reports (monthly holdings), PSX Reg 5.6.4 insider disclosures, NCCPL daily foreign flows by sector. Directional reads, not advice.
              </div>
            </div>

            {/* 2. QF Score */}
            <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-900">QF Score &rsaquo;</span>
                  <button className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                    View QF Score &rsaquo;
                  </button>
                </div>

                <div className="flex items-center space-x-4 py-4">
                  {/* Circular 44 Donut Badge */}
                  <div className="relative w-16 h-16 rounded-full border-4 border-amber-500/80 flex flex-col items-center justify-center shrink-0">
                    <span className="text-lg font-extrabold text-slate-900 mono-num">44</span>
                    <span className="text-[9px] text-slate-400">/ 100</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      AVERAGE
                    </span>
                    <div className="text-sm font-bold text-slate-900 mt-1">
                      9 of 11 indicators available
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Score is normalized from 9 verified indicators spanning all 4 core evidence families.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-amber-800 font-medium bg-amber-50/60 p-2 rounded border border-amber-200/60 mb-3">
                  Bank: read with care
                </div>

                {/* 4-color distribution bar */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="w-full h-2 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 w-[36%]" title="4 Good" />
                    <div className="bg-amber-400 w-[0%]" title="0 Average" />
                    <div className="bg-rose-500 w-[45%]" title="5 Bad" />
                    <div className="bg-slate-300 w-[19%]" title="2 Not Available" />
                  </div>
                  <div className="flex items-center justify-between text-slate-600 pt-1">
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" /> 4 Good</span>
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-1" /> 0 Average</span>
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1" /> 5 Bad</span>
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-300 mr-1" /> 2 Not Available</span>
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
                  {/* Speedometer pointing to Strong Bullish */}
                  <div className="relative w-36 h-20 flex items-end justify-center overflow-hidden">
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <path d="M 60 50 A 40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="8" />
                      {/* Needle pointed strongly to the right (bullish) */}
                      <line x1="50" y1="50" x2="80" y2="25" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="4" fill="#0F172A" />
                    </svg>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 mt-1">Strong Bullish</div>
                  <div className="text-[11px] text-slate-500">Unconfirmed &bull; Trending Market</div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-slate-900 text-center">
                    Strong Bullish, Deciding 306.56 At The Close
                  </div>
                  <div className="text-[11px] text-slate-500 text-center">
                    1 With &bull; 0 Against &bull; 4 Quiet &bull; 2 Not Scored &bull; T360 Score 75
                  </div>
                  <div className="text-[11px] text-slate-600 text-center">
                    Flipped Strong Bullish 05 Nov At 302.76 &bull; +1.8% Since &bull; Day 7
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 uppercase block font-semibold">Support To Hold</span>
                    <span className="text-sm font-bold mono-num text-emerald-700">302.72</span>
                  </div>
                  <div className="p-2 rounded bg-rose-50 border border-rose-200">
                    <span className="text-[10px] text-rose-800 uppercase block font-semibold">Resistance To Beat</span>
                    <span className="text-sm font-bold mono-num text-rose-700">312.98</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 text-right">
                Automated Pivot &amp; Momentum Read
              </div>
            </div>

          </div>

          {/* Key Statistics & Interactive 1Y Price Chart (Image 3) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Left: Key Statistics */}
            <div className="terminal-card p-5 bg-white border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-900">Key Statistics &rsaquo;</span>
                <button onClick={() => setActiveTab('financials')} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
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
                      <span className="font-semibold mono-num text-slate-900">6.51</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">P / S</span>
                      <span className="font-semibold mono-num text-slate-900">1.22</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">PEG</span>
                      <span className="font-semibold mono-num text-slate-900">0.42</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">P / B</span>
                      <span className="font-semibold mono-num text-slate-900">0.9</span>
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
                        <span className="font-semibold mono-num text-slate-900">14.42%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: '48%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-500">Net Margin</span>
                        <span className="font-semibold mono-num text-slate-900">18.81%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: '54%' }} />
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
                        <span className="font-semibold mono-num text-slate-900">0.86%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: '25%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-500">Payout Ratio</span>
                        <span className="font-semibold mono-num text-slate-900">48.57%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: '49%' }} />
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
                      <span className="font-semibold mono-num text-slate-900">452.11B</span>
                    </div>
                    <div className="border-b border-slate-100 pb-1">
                      <span className="text-slate-500 block text-[11px]">EPS (TTM)</span>
                      <span className="font-semibold mono-num text-slate-900">47.35</span>
                    </div>
                    <div className="border-b border-slate-100 pb-1">
                      <span className="text-slate-500 block text-[11px]">Book Value / Share</span>
                      <span className="font-semibold mono-num text-slate-900">341.37</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="border-b border-slate-100 pb-1">
                      <span className="text-slate-500 block text-[11px]">Shares Out.</span>
                      <span className="font-semibold mono-num text-slate-900">1.47B</span>
                    </div>
                    <div className="border-b border-slate-100 pb-1">
                      <span className="text-slate-500 block text-[11px]">Free Float</span>
                      <span className="font-semibold mono-num text-slate-900">40%</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Interactive 1Y Price Chart */}
            <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-slate-100 gap-2">
                  <span className="text-sm font-semibold text-slate-900">Price</span>
                  
                  {/* Timeframe & Style Toggles */}
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded">
                      {(['1D', '1W', '1M', '3M', '1Y', '5Y', 'All'] as const).map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setChartTimeframe(tf)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            chartTimeframe === tf ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center space-x-0.5 bg-slate-100 p-0.5 rounded">
                      <button
                        onClick={() => setChartType('area')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${chartType === 'area' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
                      >
                        Area
                      </button>
                      <button
                        onClick={() => setChartType('candles')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${chartType === 'candles' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
                      >
                        Candles
                      </button>
                    </div>
                  </div>
                </div>

                {/* SVG Area Chart View */}
                <div className="relative w-full h-44 mt-3">
                  <div className="absolute top-1 left-2 text-[10px] mono-num text-slate-400">350.00</div>
                  <div className="absolute top-14 left-2 text-[10px] mono-num text-slate-400">300.00</div>
                  <div className="absolute bottom-6 left-2 text-[10px] mono-num text-slate-400">250.00</div>

                  <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="hblGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="40" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="2" />
                    <line x1="40" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="2" />
                    <line x1="40" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="2" />

                    {/* Area fill */}
                    <path d={chartSvgPath.area} fill="url(#hblGradient)" />
                    {/* Line */}
                    <path d={chartSvgPath.line} fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                    {/* Current point */}
                    <circle cx="500" cy="80" r="3" fill="#F59E0B" />
                  </svg>
                </div>

                {/* X Axis dates matching Image 3 */}
                <div className="flex justify-between text-[10px] text-slate-400 px-6 pt-1">
                  <span>Nov 25</span>
                  <span>Feb 26</span>
                  <span>May 26</span>
                  <span>Aug 26</span>
                  <span>Nov 26</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Link href="/mychart" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center space-x-1">
                  <span>Open advanced chart</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Highlights, Ownership, Growth & Fund Holdings (Image 4) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Top Left: Latest Report Highlights */}
            <div className="terminal-card p-5 bg-white border-slate-200">
              <span className="text-sm font-semibold text-slate-900 block pb-3 border-b border-slate-100">
                Latest Report Highlights
              </span>
              <div className="pt-4 flex items-center space-x-2 text-xs font-semibold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                <span>Revenue Grew 5.5% Year On Year</span>
              </div>
            </div>

            {/* Top Right: Ownership */}
            <div className="terminal-card p-5 bg-white border-slate-200 space-y-3">
              <span className="text-sm font-semibold text-slate-900 block pb-3 border-b border-slate-100">
                Ownership
              </span>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Free Float</span>
                  <span className="font-bold text-slate-900">40%</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100">
                  <div className="bg-emerald-600 w-[40%]" title="Free Float 40%" />
                  <div className="bg-blue-600 w-[60%]" title="Closely Held 60%" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Free Float 40%</span>
                  <span>Closely Held 60%</span>
                </div>
              </div>

              <div className="pt-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Funded By</span>
                  <span className="font-bold text-slate-900">Assets 7.71T</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100">
                  <div className="bg-teal-500 w-[7%]" title="Equity 488.61B" />
                  <div className="bg-indigo-600 w-[93%]" title="Liabilities 7.22T" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Equity 488.61B</span>
                  <span>Liabilities 7.22T</span>
                </div>
              </div>
            </div>

            {/* Bottom Left: Growth & Profitability */}
            <div className="terminal-card p-5 bg-white border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-900">Growth &amp; Profitability &rsaquo;</span>
                <span className="text-xs text-amber-600 font-medium">Performance &rsaquo;</span>
              </div>

              <div className="pt-3">
                <div className="flex items-center space-x-4 text-xs mb-2">
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 mr-1.5" /> Revenue</span>
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-1.5" /> Net Margin</span>
                </div>

                {/* Mini bar & line chart */}
                <div className="h-32 flex items-end justify-around pt-4 border-b border-slate-100 relative">
                  {/* Grid indicator */}
                  <div className="absolute right-0 top-2 text-[10px] text-slate-400">22%</div>
                  <div className="absolute right-0 bottom-4 text-[10px] text-slate-400">17%</div>
                  <div className="absolute left-0 top-2 text-[10px] text-slate-400">380B</div>
                  <div className="absolute left-0 bottom-4 text-[10px] text-slate-400">285B</div>

                  <div className="w-12 bg-amber-400 rounded-t h-20" title="Q1 Revenue" />
                  <div className="w-12 bg-amber-400 rounded-t h-16" title="Q2 Revenue" />
                  <div className="w-12 bg-amber-400 rounded-t h-24" title="Q3 Revenue" />
                  <div className="w-12 bg-amber-400 rounded-t h-28" title="Q4 Revenue" />
                </div>
              </div>
            </div>

            {/* Bottom Right: Fund Ownership */}
            <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-900">Fund Ownership &rsaquo;</span>
                  <button onClick={() => setActiveTab('funds')} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                    All 35 &rsaquo;
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Funds Disclosing This Stock</span>
                    <span className="text-xl font-bold mono-num text-slate-900 mt-0.5 block">35</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Known Reported Value</span>
                    <span className="text-xl font-bold mono-num text-slate-900 mt-0.5 block">PKR 11.53B</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Funds Own</span>
                    <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                      ~2.6% of company, valued at report month
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Avg Weight</span>
                    <span className="text-xl font-bold mono-num text-slate-900 mt-0.5 block">6.02%</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                As of Sep 2026 &bull; Counts cover reported holdings only &bull; +15 vs Aug 2026
              </div>
            </div>

          </div>

          {/* Sector Comparison with Strip Charts (Image 5) */}
          <div className="terminal-card p-5 bg-white border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Sector Comparison</h2>
              <span className="text-xs text-slate-500">{stock.sector} (Commercial Banks)</span>
            </div>

            {/* 4 Top Sector Cards (Image 5) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-100">
                <span className="text-slate-500 text-[11px]">P / E</span>
                <span className="text-lg font-bold mono-num text-slate-900 block mt-0.5">{stock.pe.toFixed(2)}</span>
                <span className="text-slate-400 text-[10px]">Sector 6.41 &bull; 18 profitable</span>
              </div>

              <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-100">
                <span className="text-slate-500 text-[11px]">Dividend Yield</span>
                <span className="text-lg font-bold mono-num text-slate-900 block mt-0.5">{stock.divYield.toFixed(2)}%</span>
                <span className="text-slate-400 text-[10px]">Sector 9.17% &bull; 15 payers</span>
              </div>

              <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-100">
                <span className="text-slate-500 text-[11px]">ROE</span>
                <span className="text-lg font-bold mono-num text-slate-900 block mt-0.5">{stock.roe.toFixed(2)}%</span>
                <span className="text-slate-400 text-[10px]">Sector 19.67% &bull; 17 companies</span>
              </div>

              <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-100">
                <span className="text-slate-500 text-[11px]">Net Margin</span>
                <span className="text-lg font-bold mono-num text-slate-900 block mt-0.5">{stock.netMargin.toFixed(2)}%</span>
                <span className="text-slate-400 text-[10px]">Sector 24.12% &bull; 18 companies</span>
              </div>
            </div>

            {/* Interactive Visual Peer Strip Chart (Image 5) */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Weaker</span>
                <span>Stronger</span>
              </div>

              {/* VALUATION: P/E Strip */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Valuation &bull; P / E</div>
                <div className="relative h-10 bg-slate-50 rounded border border-slate-200/80 flex items-center px-4">
                  <div className="w-full h-0.5 bg-slate-200 absolute" />
                  
                  {/* Peer badges positioned along the strip */}
                  <span className="absolute left-[15%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">SCBPL</span>
                  <span className="absolute left-[28%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">BAHL</span>
                  <span className="absolute left-[45%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">MCB</span>
                  
                  {/* HBL highlighted in amber */}
                  <span className="absolute left-[68%] -translate-x-1/2 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-sm z-10">
                    <span>HBL 6.51</span>
                  </span>

                  <span className="absolute left-[80%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">ABL</span>
                  <span className="absolute left-[90%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">UBL</span>
                  <span className="absolute right-3 text-[10px] font-bold text-slate-600">4th of 7</span>
                </div>
              </div>

              {/* VALUATION: Dividend Yield Strip */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Valuation &bull; Dividend Yield</div>
                <div className="relative h-10 bg-slate-50 rounded border border-slate-200/80 flex items-center px-4">
                  <div className="w-full h-0.5 bg-slate-200 absolute" />
                  
                  <span className="absolute left-[15%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">BAFL</span>
                  <span className="absolute left-[25%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">MEBL</span>
                  
                  {/* HBL highlighted in amber */}
                  <span className="absolute left-[38%] -translate-x-1/2 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-sm z-10">
                    <span>HBL 7.46%</span>
                  </span>

                  <span className="absolute left-[55%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">MCB</span>
                  <span className="absolute left-[70%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">ABL</span>
                  <span className="absolute left-[88%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">UBL</span>
                  <span className="absolute right-3 text-[10px] font-bold text-slate-600">4th of 7</span>
                </div>
              </div>

              {/* PROFITABILITY: ROE Strip */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Profitability &bull; ROE</div>
                <div className="relative h-10 bg-slate-50 rounded border border-slate-200/80 flex items-center px-4">
                  <div className="w-full h-0.5 bg-slate-200 absolute" />
                  
                  {/* HBL highlighted in amber */}
                  <span className="absolute left-[24%] -translate-x-1/2 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-sm z-10">
                    <span>HBL 14.42%</span>
                  </span>

                  <span className="absolute left-[45%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">SCBPL</span>
                  <span className="absolute left-[62%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">ABL</span>
                  <span className="absolute left-[78%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">MCB</span>
                  <span className="absolute left-[90%] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-[9px] font-bold">MEBL</span>
                  <span className="absolute right-3 text-[10px] font-bold text-slate-600">5th of 7</span>
                </div>
              </div>

            </div>

            {/* Peer Table */}
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
                      <span className="text-amber-800 mono-num">{stock.symbol}</span>
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

        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
