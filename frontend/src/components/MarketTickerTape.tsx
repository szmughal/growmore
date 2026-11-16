'use client';

import React from 'react';
import { useApp } from '@/context/ThemeContext';
import { ArrowUpRight, ArrowDownRight } from '@/components/Icons';

export default function MarketTickerTape() {
  const { stocks, indices, tickCount, isStreaming, toggleStreaming } = useApp();

  const indexItems = [
    {
      symbol: 'KSE 100',
      price: indices.KSE100.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: `${indices.KSE100.changePercent >= 0 ? '+' : ''}${indices.KSE100.changePercent.toFixed(2)}%`,
      isPositive: indices.KSE100.changePercent >= 0,
      dir: indices.KSE100.lastDirection,
    },
    {
      symbol: 'KMI 30',
      price: indices.KMI30.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: `${indices.KMI30.changePercent >= 0 ? '+' : ''}${indices.KMI30.changePercent.toFixed(2)}%`,
      isPositive: indices.KMI30.changePercent >= 0,
      dir: indices.KMI30.lastDirection,
    },
    {
      symbol: 'KSE 30',
      price: indices.KSE30.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: `${indices.KSE30.changePercent >= 0 ? '+' : ''}${indices.KSE30.changePercent.toFixed(2)}%`,
      isPositive: indices.KSE30.changePercent >= 0,
      dir: indices.KSE30.lastDirection,
    },
  ];

  const stockItems = stocks.map((st) => ({
    symbol: st.symbol,
    price: st.price.toFixed(2),
    change: `${st.changePercent >= 0 ? '+' : ''}${st.changePercent.toFixed(2)}%`,
    isPositive: st.changePercent >= 0,
    dir: st.lastDirection,
  }));

  const allItems = [...indexItems, ...stockItems];
  // Duplicate array for seamless infinite marquee scrolling
  const marqueeList = [...allItems, ...allItems];

  return (
    <div className="w-full bg-white border-b border-slate-200 overflow-hidden select-none flex items-center h-9">
      {/* Left Pinned Live Stream Status Control */}
      <div className="flex items-center space-x-2 px-3 h-full bg-slate-50 border-r border-slate-200 z-10 shrink-0">
        <span className={`w-2 h-2 rounded-full bg-emerald-600 shrink-0 ${isStreaming ? 'live-beacon' : 'opacity-40'}`} />
        <span className="text-slate-800 font-bold text-[11px] uppercase tracking-wider">
          PSX Live Tape
        </span>
        <span className="text-[10px] mono-num px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
          Tick #{tickCount}
        </span>
        <button
          type="button"
          onClick={toggleStreaming}
          title={isStreaming ? 'Pause live stream' : 'Resume live stream'}
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
        >
          {isStreaming ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Continuous Scrolling Marquee with Live Flash Badges */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className={isStreaming ? 'animate-marquee flex items-center space-x-6 px-4' : 'flex items-center space-x-6 px-4 overflow-x-auto'}>
          {marqueeList.map((item, idx) => {
            const flashClass =
              item.dir === 'up'
                ? 'tick-flash-up'
                : item.dir === 'down'
                ? 'tick-flash-down'
                : '';

            return (
              <div
                key={`${item.symbol}-${idx}-${tickCount}`}
                className={`flex items-center space-x-2 px-2 py-0.5 rounded shrink-0 transition-colors ${flashClass}`}
              >
                <span className="font-bold text-slate-900 text-xs">
                  {item.symbol}
                </span>
                <span className="mono-num text-slate-800 font-semibold text-xs">
                  {item.price}
                </span>
                <span
                  className={`flex items-center text-[11px] mono-num font-semibold px-1 py-0.2 rounded ${
                    item.isPositive
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-rose-700 bg-rose-50'
                  }`}
                >
                  {item.isPositive ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  )}
                  {item.change}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
