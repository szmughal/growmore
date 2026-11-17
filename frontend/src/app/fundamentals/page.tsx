'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Layers, CheckCircle2, ArrowUpRight } from '@/components/Icons';

interface FundamentalCompany {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  fairValue: number;
  upside: number;
  gmScore: number;
  qfScore: string;
  checksPassed: number;
  pe: number;
  pb: number;
  divYield: number;
  roe: number;
}

const companies: FundamentalCompany[] = [
  {
    symbol: 'HBL',
    name: 'Habib Bank Limited',
    sector: 'Banking',
    price: 308.22,
    fairValue: 459.93,
    upside: 49.2,
    gmScore: 91,
    qfScore: 'A+',
    checksPassed: 6,
    pe: 6.51,
    pb: 0.90,
    divYield: 7.46,
    roe: 14.42
  },
  {
    symbol: 'OGDC',
    name: 'Oil & Gas Dev Co',
    sector: 'Oil & Gas',
    price: 316.21,
    fairValue: 420.00,
    upside: 32.8,
    gmScore: 88,
    qfScore: 'A+',
    checksPassed: 6,
    pe: 5.18,
    pb: 0.92,
    divYield: 5.85,
    roe: 22.40
  },
  {
    symbol: 'UBL',
    name: 'United Bank Limited',
    sector: 'Banking',
    price: 433.22,
    fairValue: 520.00,
    upside: 20.0,
    gmScore: 94,
    qfScore: 'A+',
    checksPassed: 6,
    pe: 6.38,
    pb: 1.25,
    divYield: 7.39,
    roe: 28.50
  },
  {
    symbol: 'MEBL',
    name: 'Meezan Bank Ltd',
    sector: 'Islamic Banking',
    price: 551.25,
    fairValue: 640.00,
    upside: 16.1,
    gmScore: 95,
    qfScore: 'A+',
    checksPassed: 6,
    pe: 10.42,
    pb: 1.95,
    divYield: 5.53,
    roe: 38.60
  },
  {
    symbol: 'MCB',
    name: 'MCB Bank Limited',
    sector: 'Banking',
    price: 409.85,
    fairValue: 490.00,
    upside: 19.6,
    gmScore: 92,
    qfScore: 'A+',
    checksPassed: 6,
    pe: 8.34,
    pb: 1.10,
    divYield: 6.59,
    roe: 31.20
  },
  {
    symbol: 'MARI',
    name: 'Mari Petroleum Co',
    sector: 'Oil & Gas',
    price: 737.28,
    fairValue: 860.00,
    upside: 16.6,
    gmScore: 90,
    qfScore: 'A',
    checksPassed: 6,
    pe: 9.55,
    pb: 2.10,
    divYield: 3.66,
    roe: 25.40
  },
  {
    symbol: 'FFC',
    name: 'Fauji Fertilizer Co',
    sector: 'Fertilizer',
    price: 566.59,
    fairValue: 680.00,
    upside: 20.0,
    gmScore: 89,
    qfScore: 'A',
    checksPassed: 5,
    pe: 8.86,
    pb: 1.85,
    divYield: 7.24,
    roe: 29.40
  },
  {
    symbol: 'LUCK',
    name: 'Lucky Cement',
    sector: 'Cement',
    price: 444.52,
    fairValue: 560.00,
    upside: 26.0,
    gmScore: 87,
    qfScore: 'A',
    checksPassed: 5,
    pe: 7.34,
    pb: 1.60,
    divYield: 1.12,
    roe: 21.00
  },
  {
    symbol: 'PPL',
    name: 'Pakistan Petroleum Ltd',
    sector: 'Oil & Gas',
    price: 227.23,
    fairValue: 310.00,
    upside: 36.4,
    gmScore: 86,
    qfScore: 'A',
    checksPassed: 5,
    pe: 6.01,
    pb: 0.88,
    divYield: 5.28,
    roe: 20.10
  },
  {
    symbol: 'SYS',
    name: 'Systems Limited',
    sector: 'Technology',
    price: 114.52,
    fairValue: 160.00,
    upside: 39.7,
    gmScore: 82,
    qfScore: 'B+',
    checksPassed: 4,
    pe: 14.26,
    pb: 4.20,
    divYield: 1.75,
    roe: 24.50
  },
  {
    symbol: 'ENGROH',
    name: 'Engro Holdings',
    sector: 'Fertilizer / Holding',
    price: 279.42,
    fairValue: 350.00,
    upside: 25.3,
    gmScore: 84,
    qfScore: 'A',
    checksPassed: 5,
    pe: 7.30,
    pb: 1.30,
    divYield: 8.40,
    roe: 18.20
  },
  {
    symbol: 'EFERT',
    name: 'Engro Fertilizers',
    sector: 'Fertilizer',
    price: 210.33,
    fairValue: 260.00,
    upside: 23.6,
    gmScore: 88,
    qfScore: 'A',
    checksPassed: 5,
    pe: 11.42,
    pb: 2.20,
    divYield: 6.30,
    roe: 32.10
  }
];

export default function FundamentalsPage() {
  const [activeTab, setActiveTab] = useState<'fair-value' | 'gm-rank' | 'checks'>('fair-value');

  const sortedCompanies = [...companies].sort((a, b) => {
    if (activeTab === 'gm-rank') return b.gmScore - a.gmScore;
    if (activeTab === 'checks') {
      if (b.checksPassed !== a.checksPassed) return b.checksPassed - a.checksPassed;
      return b.roe - a.roe;
    }
    return b.upside - a.upside;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          {/* Header */}
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Grow more Fundamentals & Valuation Engine
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated multi-model DCF, GM composite quality rankings, and 6-point financial checks
              </p>
            </div>

            {/* Pillar Badges */}
            <div className="hidden lg:flex items-center space-x-2 text-xs">
              <span className="text-slate-500">5 Valuation Pillars:</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">Growth (18)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">Stability (30)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">Valuation (15)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">Quality (17)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">Cashflow (20)</span>
            </div>
          </div>

          {/* Screener View */}
          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-900">Equities Furthest from Fair Value</span>
                <span className="text-xs text-slate-500">(DCF & Multiples Confluence)</span>
              </div>

              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
                <button
                  onClick={() => setActiveTab('fair-value')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    activeTab === 'fair-value' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fair Value Upside
                </button>
                <button
                  onClick={() => setActiveTab('gm-rank')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    activeTab === 'gm-rank' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  GM Quality Rank
                </button>
                <button
                  onClick={() => setActiveTab('checks')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    activeTab === 'checks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  6-Point Checks
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full financial-table text-left">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Sector</th>
                    <th className="text-right">Price (PKR)</th>
                    <th className="text-right">Fair Value</th>
                    <th className="text-right">Upside Discount</th>
                    <th className="text-center">GM Score</th>
                    <th className="text-center">QF Rank</th>
                    <th className="text-center">Checks</th>
                    <th className="text-right">P/E</th>
                    <th className="text-right">Div Yield</th>
                    <th className="text-right">ROE</th>
                    <th className="text-center">Cockpit</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCompanies.map((c) => (
                    <tr key={c.symbol} className="hover:bg-slate-50/80 transition-colors">
                      <td>
                        <Link href={`/fundamentals/${c.symbol}`} className="block group">
                          <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mono-num">
                            {c.symbol}
                          </span>
                          <span className="text-xs text-slate-500 block group-hover:text-slate-800">
                            {c.name}
                          </span>
                        </Link>
                      </td>
                      <td>
                        <span className="text-xs text-slate-600">{c.sector}</span>
                      </td>
                      <td className="text-right mono-num font-semibold text-slate-900">
                        {c.price.toFixed(2)}
                      </td>
                      <td className="text-right mono-num text-slate-700 font-medium">
                        {c.fairValue.toFixed(2)}
                      </td>
                      <td className="text-right mono-num">
                        <span className="text-emerald-600 font-semibold">
                          +{c.upside.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="mono-num px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                          {c.gmScore}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {c.qfScore}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="text-xs text-slate-700 mono-num font-medium">
                          {c.checksPassed}/6 Passed
                        </span>
                      </td>
                      <td className="text-right mono-num text-slate-700">{c.pe.toFixed(1)}x</td>
                      <td className="text-right mono-num text-emerald-600 font-medium">{c.divYield.toFixed(1)}%</td>
                      <td className="text-right mono-num text-slate-900 font-medium">{c.roe.toFixed(1)}%</td>
                      <td className="text-center">
                        <Link
                          href={`/fundamentals/${c.symbol}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-colors border border-slate-200 hover:border-emerald-200"
                        >
                          <span>Model</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50 flex justify-between">
              <span>Fair value models utilize DCF (10Y cash flow projection), Peter Lynch formula, and sector multiples.</span>
              <span className="mono-num text-slate-600 font-medium">Uncertainty: Low to Moderate</span>
            </div>
          </div>

          {/* 6-Point Past Performance Health Checks Details */}
          <div className="terminal-card p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Methodology</div>
            <div className="text-sm font-semibold text-slate-900 mb-3">6-Point Past Performance Health Check Framework</div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1. Sustained Profitability</span>
                </div>
                <p className="text-slate-600">Positive net income across every consecutive reporting period over the past 5 years.</p>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2. Net Margin Expansion</span>
                </div>
                <p className="text-slate-600">Net profit margins expanding year-over-year against previous audited trailing figures.</p>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3. 5-Year Profit CAGR &gt; 10%</span>
                </div>
                <p className="text-slate-600">Compound annual earnings growth exceeding long-term nominal inflation benchmark.</p>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>4. Growth Acceleration</span>
                </div>
                <p className="text-slate-600">1-Year net profit growth rate exceeds 5-Year historical CAGR.</p>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>5. Sector Outperformance</span>
                </div>
                <p className="text-slate-600">Top-line revenue expansion outperforming median peer sector rate.</p>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>6. ROE $\ge$ 15%</span>
                </div>
                <p className="text-slate-600">High capital efficiency yielding strong returns on shareholder equity.</p>
              </div>
            </div>
          </div>

        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
