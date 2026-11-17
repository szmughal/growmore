'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/ThemeContext';
import { ArrowUpRight, ArrowDownRight, ExternalLink } from '@/components/Icons';

export default function MarketDataTable() {
  const { stocks, tickCount, lastTickTime } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'gainers' | 'losers'>('active');

  const filteredData = [...stocks].sort((a, b) => {
    if (activeTab === 'gainers') return b.changePercent - a.changePercent;
    if (activeTab === 'losers') return a.changePercent - b.changePercent;
    return b.volumeM - a.volumeM;
  });

  return (
    <div className="terminal-card overflow-hidden">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-200 gap-3">
        <div className="flex items-center space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 live-beacon" />
          <span className="text-sm font-semibold text-slate-900">Market Tape &amp; Leaders</span>
          <span className="text-xs text-emerald-700 font-semibold mono-num bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Streaming Tick #{tickCount} ({lastTickTime})
          </span>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === 'active'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Most Active
          </button>
          <button
            onClick={() => setActiveTab('gainers')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === 'gainers'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top Gainers
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === 'losers'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top Losers
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full financial-table text-left">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Sector</th>
              <th className="text-right">Live Price (PKR)</th>
              <th className="text-right">Bid / Ask</th>
              <th className="text-right">Change %</th>
              <th className="text-right">Live Volume</th>
              <th className="text-right">Value (M)</th>
              <th className="text-right">P/E</th>
              <th className="text-right">Market Cap</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((stock) => {
              const isPositive = stock.change >= 0;
              const rowFlash =
                stock.lastDirection === 'up'
                  ? 'tick-flash-up'
                  : stock.lastDirection === 'down'
                  ? 'tick-flash-down'
                  : '';

              return (
                <tr key={`${stock.symbol}-${tickCount}`} className={rowFlash}>
                  <td>
                    <Link href={`/fundamentals/${stock.symbol}`} className="flex items-center space-x-2 group">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          stock.lastDirection === 'up'
                            ? 'bg-emerald-600'
                            : stock.lastDirection === 'down'
                            ? 'bg-rose-600'
                            : 'bg-slate-300'
                        }`}
                      />
                      <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{stock.symbol}</span>
                      <span className="text-slate-500 text-xs truncate max-w-[140px] hidden sm:inline group-hover:text-slate-700">
                        {stock.name}
                      </span>
                    </Link>
                  </td>
                  <td>
                    <span className="text-slate-600 text-xs">{stock.sector}</span>
                  </td>
                  <td className="text-right mono-num font-bold text-slate-900">
                    {stock.price.toFixed(2)}
                  </td>
                  <td className="text-right mono-num text-xs text-slate-500">
                    <span className="text-emerald-700 font-medium">{stock.bid.toFixed(2)}</span>
                    <span className="mx-1 text-slate-300">/</span>
                    <span className="text-rose-700 font-medium">{stock.ask.toFixed(2)}</span>
                  </td>
                  <td className="text-right mono-num">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
                        isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                      )}
                      {isPositive ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`}
                    </span>
                  </td>
                  <td className="text-right mono-num text-slate-800 font-medium">{stock.volumeM.toFixed(2)}M</td>
                  <td className="text-right mono-num text-slate-600">{stock.valueM.toLocaleString()}M</td>
                  <td className="text-right mono-num text-slate-700">{stock.pe.toFixed(1)}x</td>
                  <td className="text-right mono-num text-slate-600">{stock.marketCap}</td>
                  <td className="text-center">
                    <Link
                      href={`/fundamentals/${stock.symbol}`}
                      className="inline-flex items-center text-xs text-slate-500 hover:text-emerald-600 transition-colors"
                      title="Open Fundamentals & DCF"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50">
        <span>Showing 10 of 388 listed equities • Real-time order book ticks every 1.6s</span>
        <Link href="/screener" className="text-emerald-600 font-medium hover:underline">
          View in Grow more Screener →
        </Link>
      </div>
    </div>
  );
}
