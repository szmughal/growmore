'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';

const intervals = ['1m', '5m', '15m', '1h', 'D', 'W', 'M'] as const;
type IntervalType = typeof intervals[number];

const intervalConfigMap: Record<IntervalType, {
  open: string;
  high: string;
  low: string;
  close: string;
  vol: string;
  seedOffset: number;
  slope: number;
  dmaPath: string;
}> = {
  '1m': { open: '104,210', high: '104,295', low: '104,190', close: '104,285', vol: '3.2M', seedOffset: 1, slope: 2.2, dmaPath: 'M 30 290 Q 250 260, 500 230 T 980 180' },
  '5m': { open: '104,050', high: '104,310', low: '103,980', close: '104,285', vol: '14.8M', seedOffset: 2, slope: 2.8, dmaPath: 'M 30 305 Q 250 275, 500 235 T 980 165' },
  '15m': { open: '103,820', high: '104,380', low: '103,750', close: '104,285', vol: '42.1M', seedOffset: 3, slope: 3.2, dmaPath: 'M 30 315 Q 250 280, 500 240 T 980 155' },
  '1h': { open: '103,450', high: '104,420', low: '103,310', close: '104,285', vol: '128.5M', seedOffset: 4, slope: 3.6, dmaPath: 'M 30 325 Q 250 285, 500 238 T 980 148' },
  'D': { open: '103,120', high: '104,450', low: '103,050', close: '104,285', vol: '482.4M', seedOffset: 5, slope: 4.0, dmaPath: 'M 30 320 Q 250 290, 500 240 T 980 140' },
  'W': { open: '101,200', high: '104,680', low: '100,850', close: '104,285', vol: '2.18B', seedOffset: 6, slope: 4.5, dmaPath: 'M 30 350 Q 250 310, 500 245 T 980 125' },
  'M': { open: '96,400', high: '105,420', low: '95,800', close: '104,285', vol: '9.42B', seedOffset: 7, slope: 5.0, dmaPath: 'M 30 380 Q 250 330, 500 250 T 980 110' },
};

export default function MyChartPage() {
  const [activeInterval, setActiveInterval] = useState<IntervalType>('D');
  const [selectedOverlay, setSelectedOverlay] = useState<'autodraw' | 'masood' | 'none'>('autodraw');

  const cfg = intervalConfigMap[activeInterval];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-4 max-w-[1520px] w-full mx-auto">
          
          {/* Chart Header Bar */}
          <div className="pb-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div>
                <span className="text-base font-semibold text-slate-900">KSE 100 Index ({activeInterval})</span>
                <span className="text-xs text-slate-500 ml-2">Advanced Charting Terminal</span>
              </div>
              <span className="text-xs mono-num font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                104,285.40 (+1.24%)
              </span>
            </div>

            {/* Timeframes & Overlay Toggles */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 mono-num">
                {intervals.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveInterval(tf)}
                    className={`px-2 py-0.5 rounded font-medium ${
                      activeInterval === tf ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-slate-200" />

              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                <button
                  onClick={() => setSelectedOverlay(selectedOverlay === 'autodraw' ? 'none' : 'autodraw')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    selectedOverlay === 'autodraw' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Grow more Autodraw (Fib &amp; Pivots)
                </button>
                <button
                  onClick={() => setSelectedOverlay(selectedOverlay === 'masood' ? 'none' : 'masood')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    selectedOverlay === 'masood' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dr. Masood Momentum
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Chart Surface */}
          <div className="terminal-card p-4 relative min-h-[580px] flex flex-col justify-between">
            
            {/* Overlay Info Strip */}
            <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-3 mono-num font-medium">
                <span>Interval: {activeInterval}</span>
                <span>O: {cfg.open}</span>
                <span>H: {cfg.high}</span>
                <span>L: {cfg.low}</span>
                <span>C: {cfg.close}</span>
                <span>Vol: {cfg.vol}</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px]">
                <span className="text-slate-500">Active Strategy:</span>
                <span className="text-emerald-700 font-semibold">
                  {selectedOverlay === 'autodraw'
                    ? 'Grow more Auto-Pivots & Fibonacci'
                    : selectedOverlay === 'masood'
                    ? 'Dr. Masood Stage 2 Running Horses'
                    : 'Pure Price Action (No Overlays)'}
                </span>
              </div>
            </div>

            {/* Simulated High-Res Candlestick & Technical Canvas */}
            <div className="relative w-full h-[460px] my-2 select-none overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 1000 460" preserveAspectRatio="none">
                {/* Horizontal Price Grid Lines */}
                {[80, 160, 240, 320, 400].map((y, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1={y}
                    x2="1000"
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                  />
                ))}

                {/* Fibonacci Overlay Lines */}
                {selectedOverlay === 'autodraw' && (
                  <>
                    <line x1="0" y1="120" x2="1000" y2="120" stroke="#e11d48" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="15" y="114" fill="#be123c" fontSize="10" fontFamily="monospace" fontWeight="600">Fib 0.618 Golden Pocket (104,850) — R1 Pivot</text>

                    <line x1="0" y1="220" x2="1000" y2="220" stroke="#059669" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="15" y="214" fill="#047857" fontSize="10" fontFamily="monospace" fontWeight="600">Fib 0.382 Confluence Level (103,420) — S1 Support</text>
                  </>
                )}

                {/* Dr. Masood Momentum Overlay */}
                {selectedOverlay === 'masood' && (
                  <>
                    <path
                      d="M 30 340 Q 250 300, 500 255 T 980 155"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="6 3"
                    />
                    <path
                      d="M 30 365 Q 250 325, 500 280 T 980 185"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                    />
                    <rect x="680" y="95" width="290" height="44" rx="4" fill="#ecfdf5" stroke="#a7f3d0" />
                    <text x="692" y="114" fill="#047857" fontSize="11" fontFamily="monospace" fontWeight="700">
                      STAGE 2 MARKUP ZONE (RUNNING HORSES)
                    </text>
                    <text x="692" y="130" fill="#065f46" fontSize="10" fontFamily="monospace">
                      Price &gt; 20 EMA &gt; 50 SMA • Vol Surge 1.8x
                    </text>
                  </>
                )}

                {/* Candlesticks sequence */}
                {Array.from({ length: 30 }).map((_, i) => {
                  const x = 30 + i * 32;
                  const basePrice = 300 - i * cfg.slope + Math.sin((i + cfg.seedOffset) * 0.85) * 36;
                  const isUp = (i + cfg.seedOffset) % 3 !== 0;
                  const candleHeight = 14 + Math.abs(Math.sin(i + cfg.seedOffset)) * 26;
                  const wickHeight = candleHeight + 18;

                  return (
                    <g key={`${activeInterval}-${i}`}>
                      {/* Wick */}
                      <line
                        x1={x + 7}
                        y1={basePrice - wickHeight / 2}
                        x2={x + 7}
                        y2={basePrice + wickHeight / 2}
                        stroke={isUp ? '#059669' : '#e11d48'}
                        strokeWidth="1.25"
                      />
                      {/* Body */}
                      <rect
                        x={x}
                        y={basePrice - candleHeight / 2}
                        width="14"
                        height={candleHeight}
                        fill={isUp ? '#059669' : '#e11d48'}
                        rx="1"
                      />
                    </g>
                  );
                })}

                {/* 20-DMA Moving Average Line */}
                <path
                  d={cfg.dmaPath}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="1.75"
                />
              </svg>
            </div>

            {/* Bottom Status bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mono-num">
              <span>Timezone: PKT (UTC+5) • Active Timeframe: {activeInterval}</span>
              <span>Grow more Charting Engine v2.4 • Precision Vector Core</span>
            </div>

          </div>

        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
