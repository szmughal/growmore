'use client';

import React from 'react';
import { useApp } from '@/context/ThemeContext';
import { ArrowUpRight, ArrowDownRight } from '@/components/Icons';

export default function MarketOverviewCards() {
  const { region, indices, stocks, liveTrades, tickCount, lastTickTime } = useApp();
  const data = indices[region] || indices.KSE100;

  const isPositive = data.change >= 0;
  const flashClass =
    data.lastDirection === 'up'
      ? 'tick-flash-up'
      : data.lastDirection === 'down'
      ? 'tick-flash-down'
      : '';

  const totalIssues = data.advances + data.declines + data.unchanged;
  const bullPct = Math.round((data.advances / totalIssues) * 100);
  const bearPct = Math.round((data.declines / totalIssues) * 100);
  const flatPct = 100 - bullPct - bearPct;
  const advDecRatio = (data.advances / Math.max(1, data.declines)).toFixed(2);

  // Build live sparkline from intradayPoints
  const pts = data.intradayPoints;
  const minP = Math.min(...pts.map((p) => p.price)) - 20;
  const maxP = Math.max(...pts.map((p) => p.price)) + 20;
  const sparkD = pts
    .map((pt, i) => {
      const x = (i / (pts.length - 1)) * 100;
      const y = 26 - ((pt.price - minP) / Math.max(1, maxP - minP)) * 22;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  // Top 4 point contributors computed dynamically from live stock changes
  const topContributors = [...stocks]
    .slice(0, 4)
    .map((st) => {
      const impact = Math.round(st.change * 38);
      return {
        symbol: st.symbol,
        price: st.price.toFixed(2),
        pts: `${impact >= 0 ? '+' : ''}${impact} pts`,
        pos: impact >= 0,
        dir: st.lastDirection,
      };
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      
      {/* 1. Primary PSX Index Live Streaming Card */}
      <div key={`idx-${region}-${tickCount}`} className={`terminal-card p-4 flex flex-col justify-between ${flashClass}`}>
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">{data.title}</span>
            <span className="inline-flex items-center space-x-1 text-[10px] mono-num font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 live-beacon" />
              <span>LIVE • {lastTickTime}</span>
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 mono-num">
              {data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`text-xs font-semibold flex items-center mono-num ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {isPositive ? '+' : ''}
              {data.change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 mono-num">
            vs {data.prevClose.toLocaleString(undefined, { minimumFractionDigits: 2 })} prev close
          </div>
        </div>

        {/* Precision Live Micro Sparkline */}
        <div className="my-3 h-9 w-full">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
            <path
              d={sparkD}
              fill="none"
              stroke="#059669"
              strokeWidth="2"
            />
            <circle cx="100" cy="6" r="2.5" fill="#059669" />
          </svg>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 mono-num">
          <div>
            <span className="text-slate-400 block text-[10px]">Live Volume</span>
            <span className="text-slate-900 font-semibold">{data.volumeM.toFixed(2)}M</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Traded Value</span>
            <span className="text-slate-900 font-semibold">PKR {data.valueB.toFixed(2)}B</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">52W High</span>
            <span className="text-slate-900 font-semibold">{data.high52w}</span>
          </div>
        </div>
      </div>

      {/* 2. Market Breadth */}
      <div className="terminal-card p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Market Breadth</span>
            <span className="text-[10px] text-slate-500 mono-num">{data.activeCount}</span>
          </div>
          <div className="flex items-center space-x-3 mt-2">
            <div>
              <span className="text-lg font-bold text-emerald-600 mono-num">{data.advances}</span>
              <span className="text-[11px] text-slate-500 block">Advances</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-lg font-bold text-rose-600 mono-num">{data.declines}</span>
              <span className="text-[11px] text-slate-500 block">Declines</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-lg font-bold text-slate-700 mono-num">{data.unchanged}</span>
              <span className="text-[11px] text-slate-500 block">Unchanged</span>
            </div>
          </div>
        </div>

        {/* Ratio Bar */}
        <div className="my-3">
          <div className="h-2 w-full rounded bg-slate-100 flex overflow-hidden">
            <div style={{ width: `${bullPct}%` }} className="bg-emerald-600 h-full transition-all duration-300" />
            <div style={{ width: `${bearPct}%` }} className="bg-rose-500 h-full transition-all duration-300" />
            <div style={{ width: `${flatPct}%` }} className="bg-slate-300 h-full transition-all duration-300" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 mono-num">
            <span>{bullPct}% Bullish</span>
            <span>{bearPct}% Bearish</span>
            <span>{flatPct}% Flat</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="text-slate-500 text-[11px]">Adv/Dec Ratio</span>
          <span className="text-slate-900 mono-num font-semibold">{advDecRatio}x</span>
        </div>
      </div>

      {/* 3. Live Index Point Contributors */}
      <div className="terminal-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold text-slate-700">Live Point Movers</span>
          <span className="text-[10px] text-slate-500">{data.title}</span>
        </div>

        <div className="space-y-1.5 my-1 text-xs">
          {topContributors.map((c) => (
            <div
              key={`${c.symbol}-${tickCount}`}
              className={`flex items-center justify-between px-1.5 py-0.5 rounded ${
                c.dir === 'up' ? 'tick-flash-up' : c.dir === 'down' ? 'tick-flash-down' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-slate-900 font-semibold">{c.symbol}</span>
                <span className="text-slate-500 mono-num text-[11px]">PKR {c.price}</span>
              </div>
              <span className={`mono-num font-semibold ${c.pos ? 'text-emerald-600' : 'text-rose-600'}`}>
                {c.pts}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="text-slate-500 text-[11px]">Net Leader Impact</span>
          <span className="text-emerald-600 mono-num font-semibold">+370 pts</span>
        </div>
      </div>

      {/* 4. Real-Time Executed Order-Book Trade Stream */}
      <div className="terminal-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 live-beacon" />
            <span className="font-semibold text-slate-700">Live Executed Trades</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mono-num">Tick #{tickCount}</span>
        </div>

        <div className="space-y-1.5 my-1 text-xs mono-num">
          {liveTrades.slice(0, 4).map((tr, i) => (
            <div
              key={tr.id}
              className={`flex items-center justify-between px-1.5 py-0.5 rounded ${
                i === 0 ? (tr.side === 'BUY' ? 'tick-flash-up' : 'tick-flash-down') : ''
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-400">{tr.time}</span>
                <span className="font-bold text-slate-900">{tr.symbol}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-700">{tr.shares.toLocaleString()} sh</span>
                <span
                  className={`font-semibold px-1 py-0.2 rounded text-[10px] ${
                    tr.side === 'BUY'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  @{tr.price.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="text-slate-500 text-[11px]">Foreign Net (NCCPL)</span>
          <span className="text-emerald-600 mono-num font-semibold">+$2.12M USD</span>
        </div>
      </div>

    </div>
  );
}
