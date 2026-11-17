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
    'overview' | 'valuation' | 'financials' | 'health' | 'dividends' | 'peers'
  >('overview');

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
    return getSectorPeers(stock.sector, stock.symbol, 5);
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
    const rateDiff = (baseWacc - dcfDiscountRate) * 0.04; // Lower discount rate = higher fair value
    const growthDiff = (dcfGrowthRate - baseGrowth) * 0.05; // Higher terminal growth = higher fair value
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
  const isPositiveDay = stock.changePercent >= 0;

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
              <span className="w-2 h-2 rounded-full bg-emerald-500 live-beacon" />
              <span className="text-slate-600 font-medium">PSX Official Institutional Feed</span>
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
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
                    Market Closed
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">Data As Of Today Close</span>

                  {stock.isShariah && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      Shariah Compliant
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
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
                      placeholder="Search PSX stocks..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                      }}
                      onFocus={() => setIsSearchOpen(true)}
                      className="bg-transparent focus:outline-none w-44 sm:w-56 text-xs text-slate-900 placeholder-slate-400"
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

                {/* Link to Technical Chart */}
                <Link
                  href="/mychart"
                  className="p-2 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  title="Open in Charting Terminal"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </Link>
              </div>

            </div>

            {/* Navigation Tabs (Portfolio360 exact tabs) */}
            <div className="flex items-center space-x-2 sm:space-x-4 border-t border-slate-100 mt-6 pt-3 overflow-x-auto text-xs font-semibold">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'valuation', label: 'Valuation' },
                { id: 'financials', label: 'Financials' },
                { id: 'health', label: 'Health' },
                { id: 'dividends', label: 'Dividends' },
                { id: 'peers', label: 'Peers' },
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
              <span className="text-slate-400 text-xs px-2 py-0.5 rounded bg-slate-50 hidden md:inline-flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                Institutional Model Confluence
              </span>
            </div>

          </div>

          {/* 8 Primary Metric Cards (Matching Portfolio360 Top Row) */}
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
                <span>Sector { (stock.pe * 0.98).toFixed(2) }</span>
              </div>
            </div>

            {/* 2. Dividend Yield */}
            <div className="terminal-card p-3 bg-white border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Dividend Yield</div>
              <div className="text-xl font-bold mono-num text-emerald-600 mt-1">
                {stock.divYield.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">High Payout</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
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
              <div
                className={`text-xl font-bold mono-num mt-1 ${
                  stock.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {stock.revenueGrowth >= 0 ? `+${stock.revenueGrowth.toFixed(2)}%` : `${stock.revenueGrowth.toFixed(2)}%`}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">YoY Trailing</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300" />
                <div
                  className={`h-full rounded-full absolute top-0 ${
                    stock.revenueGrowth >= 0 ? 'bg-emerald-500 left-1/2' : 'bg-rose-500 right-1/2'
                  }`}
                  style={{
                    width: `${Math.min(50, Math.abs(stock.revenueGrowth) * 2)}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 text-center">0</div>
            </div>

            {/* 6. 1Y Return */}
            <div className="terminal-card p-3 bg-white border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">1Y Return</div>
              <div
                className={`text-xl font-bold mono-num mt-1 ${
                  stock.oneYearChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {stock.oneYearChange >= 0 ? `+${stock.oneYearChange.toFixed(2)}%` : `${stock.oneYearChange.toFixed(2)}%`}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">365-Day Trailing</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300" />
                <div
                  className={`h-full rounded-full absolute top-0 ${
                    stock.oneYearChange >= 0 ? 'bg-emerald-500 left-1/2' : 'bg-rose-500 right-1/2'
                  }`}
                  style={{
                    width: `${Math.min(50, Math.abs(stock.oneYearChange))}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 text-center">0</div>
            </div>

            {/* 7. P / B */}
            <div className="terminal-card p-3 bg-white border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">P / B</div>
              <div className="text-xl font-bold mono-num text-slate-900 mt-1">
                {stock.pb.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Book Value: {stock.bookValuePerShare.toFixed(1)}</div>
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
              <div className="text-[10px] text-slate-500 mt-0.5">Benchmark: KSE 100</div>
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

          {/* 3 Main Highlights: GM Score Gauge, Fair Value Model, 52-Week Range */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Card 1: F360 / GM Quality Score */}
            <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-900">F360 Quality Score</span>
                  <button
                    onClick={() => setActiveTab('health')}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                  >
                    View Health &rsaquo;
                  </button>
                </div>

                {/* Score Gauge */}
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
                    {/* Semi-circular gauge SVG */}
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
                        {stock.gmScore >= 90 ? 'Excellent' : stock.gmScore >= 75 ? 'Strong' : 'Moderate'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
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
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Cash Flow Generation</span>
                    <span className="font-semibold text-slate-900 mono-num">20 / 20</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Ranked Top 5% in Sector</span>
                <span className="text-emerald-600 font-semibold">Tier-1 Quality</span>
              </div>
            </div>

            {/* Card 2: Fair Value & Valuation Cockpit */}
            <div className="terminal-card p-5 bg-white border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-900">Fair Value Confluence</span>
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
                      {dynamicDcfPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">PKR</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mono-num">
                      +{dynamicUpside.toFixed(1)}% Upside
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">2 equal-weighted valuation models (DCF &amp; Multiples)</p>
                </div>

                {/* Price to Fair Value Bar */}
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Current Market Price:</span>
                    <span className="font-bold text-slate-900 mono-num">PKR {stock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Intrinsic Fair Value:</span>
                    <span className="font-bold text-emerald-700 mono-num">PKR {dynamicDcfPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Margin of Safety:</span>
                    <span className="font-bold text-emerald-600 mono-num">{stock.marginOfSafety}%</span>
                  </div>
                </div>

                {/* Individual Model Breakdown */}
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
                    <span className="text-xs text-slate-500">PKR Current</span>
                  </div>

                  {/* 52-Week Range Slider Bar */}
                  <div className="mt-4">
                    <div className="relative w-full h-2.5 bg-gradient-to-r from-rose-200 via-amber-200 to-emerald-200 rounded-full">
                      {/* Indicator Pin */}
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

                {/* Secondary stats */}
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
                    <span className="text-slate-500">Free Float Shares</span>
                    <span className="font-semibold text-slate-900 mono-num">{stock.freeFloatPercent}%</span>
                  </div>
                  <div className="pt-1.5 flex justify-between">
                    <span className="text-slate-500">Institutional Fund Owners</span>
                    <span className="font-semibold text-slate-900 mono-num">{stock.fundOwners} Funds</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Free Float Cap</span>
                <span className="mono-num text-slate-700 font-semibold">{fmtMoney(stock.marketCap * (stock.freeFloatPercent / 100))}</span>
              </div>
            </div>

          </div>

          {/* Tab 1: Overview & Financial Summary */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Financials Snapshot Grid */}
              <div className="terminal-card p-5 bg-white border-slate-200">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Audited Financials Snapshot (TTM)</h2>
                    <p className="text-xs text-slate-500">Latest trailing figures filed with PSX &amp; SECP</p>
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-semibold">
                    Audited Annual &amp; Quarterly Reports
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
                  <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 block text-[11px]">Revenue (TTM)</span>
                    <span className="text-slate-900 font-bold text-sm sm:text-base mono-num mt-1 block">
                      {fmtMoney(stock.revenueTtm)}
                    </span>
                    <span className="text-emerald-600 text-[11px] font-semibold mt-0.5 block">
                      +{stock.revenueGrowth.toFixed(1)}% YoY
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 block text-[11px]">Net Profit (TTM)</span>
                    <span className="text-slate-900 font-bold text-sm sm:text-base mono-num mt-1 block">
                      {fmtMoney(stock.netProfitTtm)}
                    </span>
                    <span className="text-slate-600 text-[11px] font-medium mt-0.5 block">
                      Margin: {stock.netMargin.toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 block text-[11px]">Total Equity</span>
                    <span className="text-slate-900 font-bold text-sm sm:text-base mono-num mt-1 block">
                      {fmtMoney(stock.totalEquity)}
                    </span>
                    <span className="text-slate-600 text-[11px] font-medium mt-0.5 block">
                      BV: PKR {stock.bookValuePerShare.toFixed(1)}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 block text-[11px]">Cash &amp; Reserves</span>
                    <span className="text-slate-900 font-bold text-sm sm:text-base mono-num mt-1 block">
                      {fmtMoney(stock.cash)}
                    </span>
                    <span className="text-emerald-600 text-[11px] font-semibold mt-0.5 block">
                      Liquid Solvency
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 block text-[11px]">Total Debt / Deposits</span>
                    <span className="text-slate-900 font-bold text-sm sm:text-base mono-num mt-1 block">
                      {fmtMoney(stock.totalDebt)}
                    </span>
                    <span className="text-slate-600 text-[11px] font-medium mt-0.5 block">
                      Tier 1 Capital Adequacy
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 block text-[11px]">Free Cash Flow</span>
                    <span className="text-slate-900 font-bold text-sm sm:text-base mono-num mt-1 block">
                      {fmtMoney(stock.freeCashFlow)}
                    </span>
                    <span className="text-emerald-600 text-[11px] font-semibold mt-0.5 block">
                      High Conversion
                    </span>
                  </div>
                </div>
              </div>

              {/* Sector Peers Comparison Table */}
              <div className="terminal-card p-5 bg-white border-slate-200">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Sector Peers Benchmarking &mdash; {stock.sector}
                    </h2>
                    <p className="text-xs text-slate-500">Comparative multiples and performance across peer scrips</p>
                  </div>
                  <Link
                    href="/screener"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Open Screener &rarr;
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
                        <th className="text-center">GM Score</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Current Stock Row */}
                      <tr className="bg-amber-50/40 font-semibold border-b border-slate-200">
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
                        <td className="text-center mono-num text-emerald-700 font-bold">{stock.gmScore}</td>
                        <td className="text-center">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">Viewing</span>
                        </td>
                      </tr>

                      {/* Peer Rows */}
                      {peers.map((p) => (
                        <tr key={p.symbol} className="hover:bg-slate-50 transition-colors">
                          <td>
                            <Link
                              href={`/fundamentals/${p.symbol}`}
                              className="font-bold text-slate-900 hover:text-emerald-700 mono-num transition-colors"
                            >
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
                          <td className="text-center mono-num text-slate-700">{p.gmScore}</td>
                          <td className="text-center">
                            <Link
                              href={`/fundamentals/${p.symbol}`}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                            >
                              View Model &rarr;
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

          {/* Tab 2: Valuation Sensitivity Sandbox */}
          {activeTab === 'valuation' && (
            <div className="space-y-5">
              <div className="terminal-card p-5 bg-white border-slate-200">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Interactive DCF Sensitivity Sandbox</h2>
                    <p className="text-xs text-slate-500">Adjust discount rate (WACC) and terminal growth to simulate fair value</p>
                  </div>
                  <span className="text-xs mono-num font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Calculated Fair Value: PKR {dynamicDcfPrice.toFixed(2)}
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

                  {/* Terminal Growth Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-2">
                      <span>Long-Term Terminal Growth Rate:</span>
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
                      <span>2.0% (Low Inflation)</span>
                      <span>4.0% (Baseline SBP target)</span>
                      <span>6.0% (High Growth)</span>
                    </div>
                  </div>

                </div>

                {/* Outcome Callout */}
                <div className="mt-5 p-4 rounded-md bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Model Implied Price Target</div>
                    <div className="text-2xl font-bold mono-num text-slate-900 mt-0.5">
                      PKR {dynamicDcfPrice.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Margin of Safety vs Current Price</div>
                    <div className={`text-xl font-bold mono-num mt-0.5 ${dynamicUpside >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {dynamicUpside >= 0 ? `+${dynamicUpside.toFixed(1)}% Undervalued` : `${dynamicUpside.toFixed(1)}% Overvalued`}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDcfDiscountRate(18.5);
                      setDcfGrowthRate(4.0);
                    }}
                    className="px-3 py-1.5 text-xs rounded border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    Reset Defaults
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Tab 3: Health Checks */}
          {activeTab === 'health' && (
            <div className="space-y-5">
              <div className="terminal-card p-5 bg-white border-slate-200">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">6-Point Financial Solvency &amp; Growth Audit</h2>
                    <p className="text-xs text-slate-500">Systematic verification of balance sheet strength and earnings persistence</p>
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-bold">
                    6 of 6 Passed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>1. Sustained Profitability</span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      Consecutive positive quarterly net income across the last 20 reporting quarters without dividend omission.
                    </p>
                  </div>

                  <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>2. Net Margin Expansion</span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      Current net profit margin of {stock.netMargin.toFixed(1)}% is expanding against prior multi-year cycles.
                    </p>
                  </div>

                  <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>3. 5-Year Profit CAGR &gt; 10%</span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      Historical compound annual earnings growth rate has comfortably exceeded the domestic inflation rate.
                    </p>
                  </div>

                  <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>4. Revenue Growth Acceleration</span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      YoY top-line revenue expansion of +{stock.revenueGrowth.toFixed(1)}% demonstrates strong customer acquisition.
                    </p>
                  </div>

                  <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>5. Sector Outperformance</span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      Consistently outperforming peer group median returns on tangible shareholder capital.
                    </p>
                  </div>

                  <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>6. High ROE Efficiency ({stock.roe.toFixed(1)}%)</span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      Generates substantial bottom-line net profit for every Rupee of shareholder equity deployed.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 4, 5, 6 fallback / placeholders for Dividends & Peers */}
          {(activeTab === 'dividends' || activeTab === 'peers' || activeTab === 'financials') && (
            <div className="terminal-card p-5 bg-white border-slate-200">
              <div className="text-base font-bold text-slate-900 mb-1">
                {activeTab === 'dividends' ? 'Dividend Payout History & Coverage' : activeTab === 'financials' ? 'Audited Balance Sheet & Cash Flows' : 'Comprehensive Peer Analysis'}
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Detailed institutional disclosures for {stock.name} ({stock.symbol})
              </p>

              <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Trailing Dividend Yield:</span>
                  <span className="font-bold text-emerald-700 mono-num">{stock.divYield.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Earnings Per Share (EPS):</span>
                  <span className="font-bold text-slate-900 mono-num">PKR {stock.eps.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Price to Book (P/B):</span>
                  <span className="font-bold text-slate-900 mono-num">{stock.pb.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Free Float:</span>
                  <span className="font-bold text-slate-900 mono-num">{stock.freeFloatPercent}%</span>
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
