'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MarketTickerTape from '@/components/MarketTickerTape';
import { useApp } from '@/context/ThemeContext';
import { Target } from '@/components/Icons';

interface Setup {
  symbol: string;
  name: string;
  type: 'Strong Bullish' | 'Bullish' | 'Range Breakout' | 'Bearish Pullback';
  triggerLevel: number;
  confirmsAbove: number;
  negatesBelow: number;
  riskReward: string;
  volumePace: string;
  gmScore: number;
  verdict: 'Buy Setup' | 'Watchlist' | 'Wait for Trigger';
}

const setups: Setup[] = [
  {
    symbol: 'OGDC',
    name: 'Oil & Gas Dev Co',
    type: 'Strong Bullish',
    triggerLevel: 147.20,
    confirmsAbove: 149.00,
    negatesBelow: 144.50,
    riskReward: '3.2R',
    volumePace: '1.8x Avg',
    gmScore: 88,
    verdict: 'Buy Setup'
  },
  {
    symbol: 'PPL',
    name: 'Pakistan Petroleum Ltd',
    type: 'Bullish',
    triggerLevel: 126.50,
    confirmsAbove: 129.00,
    negatesBelow: 124.00,
    riskReward: '2.8R',
    volumePace: '1.4x Avg',
    gmScore: 82,
    verdict: 'Buy Setup'
  },
  {
    symbol: 'ENGRO',
    name: 'Engro Corporation',
    type: 'Range Breakout',
    triggerLevel: 332.00,
    confirmsAbove: 336.50,
    negatesBelow: 328.00,
    riskReward: '2.4R',
    volumePace: '1.2x Avg',
    gmScore: 76,
    verdict: 'Watchlist'
  },
  {
    symbol: 'SYS',
    name: 'Systems Limited',
    type: 'Bearish Pullback',
    triggerLevel: 468.00,
    confirmsAbove: 475.00,
    negatesBelow: 458.00,
    riskReward: '1.9R',
    volumePace: '0.8x Avg',
    gmScore: 48,
    verdict: 'Wait for Trigger'
  },
  {
    symbol: 'MEBL',
    name: 'Meezan Bank Ltd',
    type: 'Strong Bullish',
    triggerLevel: 239.00,
    confirmsAbove: 243.50,
    negatesBelow: 236.00,
    riskReward: '3.5R',
    volumePace: '1.6x Avg',
    gmScore: 91,
    verdict: 'Buy Setup'
  }
];

export default function TechnicalsPage() {
  const { stocks, tickCount, lastTickTime } = useApp();
  const [verdictFilter, setVerdictFilter] = useState<string>('All');

  const filteredSetups = verdictFilter === 'All'
    ? setups
    : setups.filter((s) => s.verdict === verdictFilter);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 pl-60 flex flex-col min-w-0">
        <Header />
        <MarketTickerTape />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          {/* Header */}
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Grow more Technicals &amp; Decision Levels
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Institutional trade setups, live tape distance to trigger boundaries, and confirmation verdicts
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs mono-num font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 live-beacon" />
                <span>LIVE TAPE • Tick #{tickCount} ({lastTickTime})</span>
              </span>
            </div>
          </div>

          {/* Core Setups: Levels To Play */}
          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-900">Levels To Play</span>
                <span className="text-xs text-slate-500">({filteredSetups.length} Active Setups)</span>
              </div>

              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
                {['All', 'Buy Setup', 'Watchlist', 'Wait for Trigger'].map((vf) => (
                  <button
                    key={vf}
                    onClick={() => setVerdictFilter(vf)}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      verdictFilter === vf ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {vf}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full financial-table text-left">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Setup Type</th>
                    <th className="text-right">Live Price (PKR)</th>
                    <th className="text-right">Trigger Level</th>
                    <th className="text-right">Confirms Above</th>
                    <th className="text-right">Negates Below</th>
                    <th className="text-right">Risk/Reward</th>
                    <th className="text-right">Volume Pace</th>
                    <th className="text-center">GM Tech Score</th>
                    <th className="text-center">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSetups.map((s) => {
                    const liveSt = stocks.find((st) => st.symbol === s.symbol);
                    const livePrice = liveSt ? liveSt.price : s.triggerLevel;
                    const rowFlash =
                      liveSt?.lastDirection === 'up'
                        ? 'tick-flash-up'
                        : liveSt?.lastDirection === 'down'
                        ? 'tick-flash-down'
                        : '';

                    return (
                      <tr key={`${s.symbol}-${tickCount}`} className={rowFlash}>
                        <td>
                          <span className="font-bold text-slate-900">{s.symbol}</span>
                          <span className="text-xs text-slate-500 block">{s.name}</span>
                        </td>
                        <td>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {s.type}
                          </span>
                        </td>
                        <td className="text-right mono-num font-bold text-slate-900">
                          {livePrice.toFixed(2)}
                        </td>
                        <td className="text-right mono-num font-semibold text-slate-700">
                          {s.triggerLevel.toFixed(2)}
                        </td>
                        <td className="text-right mono-num text-emerald-600 font-semibold">
                          {s.confirmsAbove.toFixed(2)}
                        </td>
                        <td className="text-right mono-num text-rose-600 font-semibold">
                          {s.negatesBelow.toFixed(2)}
                        </td>
                        <td className="text-right mono-num text-slate-700">{s.riskReward}</td>
                        <td className="text-right mono-num text-slate-700">{s.volumePace}</td>
                        <td className="text-center">
                          <span className="mono-num px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                            {s.gmScore}
                          </span>
                        </td>
                        <td className="text-center">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium ${
                              s.verdict === 'Buy Setup'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : s.verdict === 'Watchlist'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {s.verdict}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Momentum & Regimes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="terminal-card p-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Momentum Leaders</div>
              <div className="text-lg font-semibold text-slate-900">Dr. Masood&apos;s Running Horses</div>
              <p className="text-xs text-slate-500 mt-1">
                Stocks breaking out of consolidation channels with weekly trend alignment
              </p>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-medium text-slate-800">OGDC (Exploration)</span>
                  <span className="text-emerald-600 mono-num font-semibold">Stage 2 Markup</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-medium text-slate-800">MEBL (Banking)</span>
                  <span className="text-emerald-600 mono-num font-semibold">Stage 2 Markup</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="font-medium text-slate-800">PRL (Refinery)</span>
                  <span className="text-emerald-600 mono-num font-semibold">Base Breakout</span>
                </div>
              </div>
            </div>

            <div className="terminal-card p-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Support &amp; Resistance</div>
              <div className="text-lg font-semibold text-slate-900">Grow more Autodraw Pivot Clusters</div>
              <p className="text-xs text-slate-500 mt-1">
                Algorithmic pivot confluence levels calculated over 20-day volatility ranges
              </p>
              <div className="mt-4 space-y-2 text-xs mono-num">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">R2 Resistance</span>
                  <span className="text-rose-600 font-semibold">106,120</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">R1 Resistance</span>
                  <span className="text-amber-600 font-semibold">104,850</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Pivot Point (PP)</span>
                  <span className="text-slate-900 font-semibold">103,420</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-600">S1 Support</span>
                  <span className="text-emerald-600 font-semibold">102,150</span>
                </div>
              </div>
            </div>

            <div className="terminal-card p-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Breadth Regime</div>
              <div className="text-lg font-semibold text-slate-900">Market Tape Velocity</div>
              <p className="text-xs text-slate-500 mt-1">
                Share of issues trading above 20-DMA and 50-DMA
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Above 20-DMA</span>
                    <span className="text-emerald-600 mono-num font-semibold">72%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded overflow-hidden">
                    <div className="bg-emerald-600 h-full" style={{ width: '72%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Above 50-DMA</span>
                    <span className="text-emerald-600 mono-num font-semibold">65%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded overflow-hidden">
                    <div className="bg-emerald-600 h-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Above 200-DMA</span>
                    <span className="text-emerald-600 mono-num font-semibold">81%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded overflow-hidden">
                    <div className="bg-emerald-600 h-full" style={{ width: '81%' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
