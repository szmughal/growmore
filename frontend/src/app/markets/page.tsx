'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MarketTickerTape from '@/components/MarketTickerTape';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useApp } from '@/context/ThemeContext';
import { ArrowUpRight, ArrowDownRight } from '@/components/Icons';

const marketCategories = ['PSX Equities', 'Mutual Funds', 'Commodities & Gold', 'Forex & KIBOR'] as const;
type CategoryType = typeof marketCategories[number];

export default function MarketsHubPage() {
  const { indices, stocks, tickCount, lastTickTime } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('PSX Equities');
  const [selectedIndex, setSelectedIndex] = useState<'All' | 'KSE 100' | 'KMI 30' | 'KSE 30'>('All');

  const liveIndexCards = [
    {
      id: 'KSE 100',
      badge: indices.KSE100.badge,
      name: indices.KSE100.title,
      value: indices.KSE100.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: `${indices.KSE100.changePercent >= 0 ? '+' : ''}${indices.KSE100.changePercent.toFixed(2)}%`,
      isUp: indices.KSE100.changePercent >= 0,
      dir: indices.KSE100.lastDirection,
      meta1: `Volume: ${indices.KSE100.volumeM.toFixed(2)}M`,
      meta2: `Val: PKR ${indices.KSE100.valueB.toFixed(2)}B`,
    },
    {
      id: 'KMI 30',
      badge: indices.KMI30.badge,
      name: 'KMI 30 Shariah',
      value: indices.KMI30.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: `${indices.KMI30.changePercent >= 0 ? '+' : ''}${indices.KMI30.changePercent.toFixed(2)}%`,
      isUp: indices.KMI30.changePercent >= 0,
      dir: indices.KMI30.lastDirection,
      meta1: `Volume: ${indices.KMI30.volumeM.toFixed(2)}M`,
      meta2: 'P/E: 5.8x',
    },
    {
      id: 'KSE 30',
      badge: indices.KSE30.badge,
      name: 'KSE 30 Index',
      value: indices.KSE30.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: `${indices.KSE30.changePercent >= 0 ? '+' : ''}${indices.KSE30.changePercent.toFixed(2)}%`,
      isUp: indices.KSE30.changePercent >= 0,
      dir: indices.KSE30.lastDirection,
      meta1: `Traded: PKR ${indices.KSE30.valueB.toFixed(2)}B`,
      meta2: 'Div Yield: 9.4%',
    },
  ];

  const visibleCards = selectedIndex === 'All'
    ? liveIndexCards
    : liveIndexCards.filter((c) => c.id === selectedIndex);

  const equityRows = stocks.map((st, idx) => ({
    code: st.symbol,
    name: st.name,
    index: idx % 3 === 0 ? 'KSE 100' : idx % 3 === 1 ? 'KMI 30' : 'KSE 30',
    sector: st.sector,
    price: `PKR ${st.price.toFixed(2)}`,
    change: `${st.changePercent >= 0 ? '+' : ''}${st.changePercent.toFixed(2)}%`,
    isUp: st.changePercent >= 0,
    dir: st.lastDirection,
    metricLabel: 'Live Vol',
    metricValue: `${st.volumeM.toFixed(2)}M`,
  }));

  const categoryDataMap: Record<CategoryType, typeof equityRows> = {
    'PSX Equities': equityRows,
    'Mutual Funds': [
      { code: 'MIIF', name: 'Meezan Islamic Income Fund', index: 'KMI 30', sector: 'Shariah Income', price: 'PKR 54.82', change: '+0.07%', isUp: true, dir: 'up', metricLabel: '1Y Return', metricValue: '+21.4%' },
      { code: 'MCBF', name: 'MCB Cash Optimizer', index: 'KSE 100', sector: 'Money Market', price: 'PKR 104.12', change: '+0.08%', isUp: true, dir: 'up', metricLabel: '1Y Return', metricValue: '+22.1%' },
      { code: 'UBL-SGF', name: 'UBL Shariah Growth Fund', index: 'KMI 30', sector: 'Islamic Equity', price: 'PKR 92.45', change: '+1.26%', isUp: true, dir: 'up', metricLabel: '1Y Return', metricValue: '+48.6%' },
      { code: 'JS-LSF', name: 'JS Large Cap Stock Fund', index: 'KSE 30', sector: 'Equity Fund', price: 'PKR 138.20', change: '+1.32%', isUp: true, dir: 'up', metricLabel: '1Y Return', metricValue: '+52.4%' },
    ],
    'Commodities & Gold': [
      { code: 'XAU-TOLA', name: 'Gold 24K Bullion (1 Tola)', index: 'All', sector: 'Precious Metals', price: 'PKR 284,500', change: '+0.34%', isUp: true, dir: 'up', metricLabel: '10g Rate', metricValue: 'PKR 243,912' },
      { code: 'XAG-TOLA', name: 'Silver 24K Bullion (1 Tola)', index: 'All', sector: 'Precious Metals', price: 'PKR 3,240', change: '+0.62%', isUp: true, dir: 'up', metricLabel: 'Spot Parity', metricValue: '$31.40/oz' },
      { code: 'BRENT', name: 'Brent Crude Oil Futures', index: 'All', sector: 'Energy Import', price: '$72.80', change: '-0.95%', isUp: false, dir: 'down', metricLabel: 'Arab Light', metricValue: '$74.10/bbl' },
      { code: 'COAL-RB', name: 'Richards Bay Coal (Cement Input)', index: 'All', sector: 'Industrial', price: '$108.50', change: '-0.45%', isUp: false, dir: 'down', metricLabel: 'Landed', metricValue: 'PKR 38,200/t' },
    ],
    'Forex & KIBOR': [
      { code: 'USD/PKR', name: 'US Dollar Interbank Spot', index: 'All', sector: 'SBP Interbank', price: 'PKR 278.45', change: '-0.05%', isUp: true, dir: 'up', metricLabel: 'Open Market', metricValue: 'PKR 279.60' },
      { code: 'KIBOR-6M', name: '6-Month Karachi Interbank Rate', index: 'All', sector: 'Money Market', price: '13.84%', change: '-0.18%', isUp: true, dir: 'up', metricLabel: 'Policy Rate', metricValue: '15.00%' },
      { code: 'KIBOR-3M', name: '3-Month Karachi Interbank Rate', index: 'All', sector: 'Money Market', price: '14.12%', change: '-0.15%', isUp: true, dir: 'up', metricLabel: 'Spread', metricValue: '-88 bps' },
      { code: 'TBILL-1Y', name: '12-Month Pakistan T-Bill Cut-off', index: 'All', sector: 'Sovereign Debt', price: '13.10%', change: '-0.40%', isUp: true, dir: 'up', metricLabel: 'Bid Cover', metricValue: '2.8x' },
    ],
  };

  const rawRows = categoryDataMap[selectedCategory];
  const visibleRows = selectedIndex === 'All' || selectedCategory !== 'PSX Equities'
    ? rawRows
    : rawRows.filter((r) => r.index === selectedIndex);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
        <Header />
        <MarketTickerTape />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Pakistan Stock Exchange (PSX) Markets Intelligence
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-index coverage across KSE 100, KMI 30 Shariah, KSE 30, Mutual Funds, and Domestic Commodities
              </p>
            </div>

            {/* Index Switcher */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
              {(['All', 'KSE 100', 'KMI 30', 'KSE 30'] as const).map((idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    selectedIndex === idx ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {idx}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 text-xs">
            <div className="flex items-center space-x-2">
              {marketCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 mono-num">
              Active Stream: <strong className="text-slate-800">{selectedCategory}</strong> ({selectedIndex}) • Tick #{tickCount} ({lastTickTime})
            </span>
          </div>

          {/* PSX Indices Snapshot */}
          <div className={`grid grid-cols-1 ${visibleCards.length === 1 ? 'md:grid-cols-1 max-w-md' : 'md:grid-cols-3'} gap-4`}>
            {visibleCards.map((card) => (
              <div
                key={`${card.id}-${tickCount}`}
                className={`terminal-card p-4 ${
                  card.dir === 'up' ? 'tick-flash-up' : card.dir === 'down' ? 'tick-flash-down' : ''
                }`}
              >
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{card.badge}</span>
                  <span className="inline-flex items-center space-x-1 mono-num text-emerald-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 live-beacon" />
                    <span>LIVE ({lastTickTime})</span>
                  </span>
                </div>
                <div className="text-xl font-semibold text-slate-900 mono-num">{card.name}</div>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl font-bold text-slate-900 mono-num">{card.value}</span>
                  <span className="text-xs text-emerald-600 mono-num flex items-center font-semibold">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    {card.change}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between mono-num">
                  <span>{card.meta1}</span>
                  <span>{card.meta2}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Category Data Table */}
          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 live-beacon" />
                <span className="text-sm font-semibold text-slate-900">
                  {selectedCategory} — Live Market Feed ({selectedIndex})
                </span>
              </div>
              <span className="text-xs text-slate-500 mono-num">{visibleRows.length} Instruments • Tick #{tickCount}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full financial-table text-left">
                <thead>
                  <tr>
                    <th>Code / Symbol</th>
                    <th>Instrument Name</th>
                    <th>Classification</th>
                    <th className="text-right">Latest Rate / Price</th>
                    <th className="text-right">1D Change</th>
                    <th className="text-right">Key Benchmark Metric</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr
                      key={`${row.code}-${tickCount}`}
                      className={row.dir === 'up' ? 'tick-flash-up' : row.dir === 'down' ? 'tick-flash-down' : ''}
                    >
                      <td className="font-bold text-slate-900 mono-num">{row.code}</td>
                      <td className="text-slate-800 font-medium">{row.name}</td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {row.sector}
                        </span>
                      </td>
                      <td className="text-right mono-num font-bold text-slate-900">{row.price}</td>
                      <td className="text-right mono-num">
                        <span className={`inline-flex items-center text-xs font-semibold ${row.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {row.isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                          {row.change}
                        </span>
                      </td>
                      <td className="text-right mono-num text-xs text-slate-600">
                        <span className="text-slate-400 mr-1">{row.metricLabel}:</span>
                        <span className="font-semibold text-slate-800">{row.metricValue}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Domestic Commodities, Bullion & Interbank Matrix */}
          <div className="terminal-card p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-900">Domestic Bullion, Energy &amp; Interbank Rates</span>
              <span className="text-xs text-slate-500">Pakistan Reference Rates</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block text-[11px]">Gold 24K (Per Tola)</span>
                <span className="text-slate-900 font-semibold text-base mono-num">PKR 284,500</span>
                <span className="text-emerald-600 mono-num block text-[11px] font-semibold mt-0.5">+0.34%</span>
              </div>
              <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block text-[11px]">Brent Crude Oil</span>
                <span className="text-slate-900 font-semibold text-base mono-num">$72.80</span>
                <span className="text-rose-600 mono-num block text-[11px] font-semibold mt-0.5">-0.95%</span>
              </div>
              <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block text-[11px]">USD / PKR Interbank</span>
                <span className="text-slate-900 font-semibold text-base mono-num">278.45</span>
                <span className="text-emerald-600 mono-num block text-[11px] font-semibold mt-0.5">-0.05% (PKR Stable)</span>
              </div>
              <div className="p-3 rounded bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block text-[11px]">6-Month KIBOR</span>
                <span className="text-slate-900 font-semibold text-base mono-num">13.84%</span>
                <span className="text-emerald-600 mono-num block text-[11px] font-medium mt-0.5">-18 bps WoW</span>
              </div>
            </div>
          </div>

        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
