'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Layers, CheckCircle2 } from '@/components/Icons';

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
    symbol: 'OGDC',
    name: 'Oil & Gas Dev Co',
    sector: 'Oil & Gas',
    price: 148.50,
    fairValue: 215.00,
    upside: 44.8,
    gmScore: 88,
    qfScore: 'A+',
    checksPassed: 6,
    pe: 4.8,
    pb: 0.9,
    divYield: 11.2,
    roe: 22.4
  },
  {
    symbol: 'PPL',
    name: 'Pakistan Petroleum Ltd',
    sector: 'Oil & Gas',
    price: 128.20,
    fairValue: 182.00,
    upside: 41.9,
    gmScore: 84,
    qfScore: 'A',
    checksPassed: 5,
    pe: 4.2,
    pb: 0.8,
    divYield: 10.8,
    roe: 20.1
  },
  {
    symbol: 'MEBL',
    name: 'Meezan Bank Ltd',
    sector: 'Banking',
    price: 242.00,
    fairValue: 310.00,
    upside: 28.1,
    gmScore: 92,
    qfScore: 'A+',
    checksPassed: 6,
    pe: 5.4,
    pb: 1.8,
    divYield: 12.5,
    roe: 38.6
  },
  {
    symbol: 'ENGRO',
    name: 'Engro Corporation',
    sector: 'Fertilizer',
    price: 334.80,
    fairValue: 420.00,
    upside: 25.4,
    gmScore: 81,
    qfScore: 'B+',
    checksPassed: 5,
    pe: 7.6,
    pb: 1.2,
    divYield: 9.4,
    roe: 18.2
  },
  {
    symbol: 'LUCK',
    name: 'Lucky Cement',
    sector: 'Cement',
    price: 894.50,
    fairValue: 1120.00,
    upside: 25.2,
    gmScore: 86,
    qfScore: 'A',
    checksPassed: 5,
    pe: 8.4,
    pb: 1.4,
    divYield: 5.8,
    roe: 21.0
  },
  {
    symbol: 'SYS',
    name: 'Systems Limited',
    sector: 'Technology',
    price: 462.10,
    fairValue: 540.00,
    upside: 16.8,
    gmScore: 78,
    qfScore: 'B+',
    checksPassed: 4,
    pe: 18.2,
    pb: 4.2,
    divYield: 2.4,
    roe: 24.5
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

      <div className="flex-1 pl-60 flex flex-col min-w-0">
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
                  </tr>
                </thead>
                <tbody>
                  {sortedCompanies.map((c) => (
                    <tr key={c.symbol}>
                      <td>
                        <span className="font-semibold text-slate-900">{c.symbol}</span>
                        <span className="text-xs text-slate-500 block">{c.name}</span>
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
      </div>
    </div>
  );
}
