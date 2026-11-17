'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp, LiveStock } from '@/context/ThemeContext';
import { ALL_PSX_STOCKS } from '@/data/psxStocks';
import { ArrowUpRight, ArrowDownRight, ExternalLink, Search } from '@/components/Icons';

export default function MarketDataTable() {
  const { stocks, tickCount, lastTickTime, isMarketOpen } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'gainers' | 'losers' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Merge live ticked stocks with all 871 authentic PSX scrips
  const allMergedEquities = useMemo(() => {
    const liveMap = new Map(stocks.map((s) => [s.symbol.toUpperCase(), s]));
    return ALL_PSX_STOCKS.map((s) => {
      const live = liveMap.get(s.symbol.toUpperCase());
      if (live) return live;

      const mcapStr =
        s.marketCap >= 1e12
          ? `${(s.marketCap / 1e12).toFixed(1)}T`
          : s.marketCap >= 1e9
          ? `${(s.marketCap / 1e9).toFixed(1)}B`
          : s.marketCap >= 1e6
          ? `${(s.marketCap / 1e6).toFixed(0)}M`
          : '-';

      const stockObj: LiveStock = {
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        price: s.price,
        prevClose: Number((s.price - s.change).toFixed(2)),
        change: s.change,
        changePercent: s.changePercent,
        volumeM: Number((s.volume / 1000000).toFixed(2)),
        valueM: Math.round((s.volume * s.price) / 1000000),
        pe: s.pe,
        pb: s.pb,
        marketCap: mcapStr,
        fairValue: s.fairValue,
        gmScore: s.gmScore,
        qfScore: s.gmScore >= 90 ? 'A+' : s.gmScore >= 80 ? 'A' : 'B',
        checksPassed: s.gmScore >= 90 ? 6 : s.gmScore >= 80 ? 5 : 4,
        divYield: s.divYield,
        roe: s.roe,
        bid: Number((s.price - 0.05).toFixed(2)),
        ask: Number((s.price + 0.05).toFixed(2)),
        lastDirection: 'none',
        lastTradeShares: 1000,
      };
      return stockObj;
    });
  }, [stocks]);

  // Filter and sort equities
  const filteredData = useMemo(() => {
    let list = [...allMergedEquities];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }

    if (activeTab === 'gainers') {
      list = list.sort((a, b) => b.changePercent - a.changePercent);
    } else if (activeTab === 'losers') {
      list = list.sort((a, b) => a.changePercent - b.changePercent);
    } else if (activeTab === 'active') {
      list = list.sort((a, b) => b.volumeM - a.volumeM);
    } else {
      // 'all' tab: sort by highest volume and market activity
      list = list.sort((a, b) => b.valueM - a.valueM);
    }

    return list;
  }, [allMergedEquities, activeTab, searchQuery]);

  // Reset to page 1 on filter/search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, pageSize]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const pagedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="terminal-card overflow-hidden bg-white border-slate-200 shadow-xs">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-200 gap-3">
        <div className="flex items-center space-x-2.5">
          <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-emerald-600 live-beacon' : 'bg-slate-400'}`} />
          <span className="text-sm font-semibold text-slate-900">Market Tape &amp; Leaders</span>
          <span className={`text-xs font-semibold mono-num px-2 py-0.5 rounded border ${isMarketOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {isMarketOpen ? `Streaming Tick #${tickCount} (${lastTickTime})` : 'Market Closed • Final Close'}
          </span>
        </div>

        {/* Search & Tab Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Filter Search */}
          <div className="relative">
            <div className="flex items-center h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-900 transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Search tape..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent focus:outline-none text-xs text-slate-900 placeholder-slate-400 w-24 sm:w-36"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[10px] text-slate-400 hover:text-slate-700 font-bold ml-1">
                  &times;
                </button>
              )}
            </div>
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
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All 871 Scrips
            </button>
          </div>
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
            {pagedList.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-xs text-slate-500">
                  No scrips found matching &ldquo;{searchQuery}&rdquo;.
                </td>
              </tr>
            ) : (
              pagedList.map((stock) => {
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
                        <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mono-num">
                          {stock.symbol}
                        </span>
                        <span className="text-slate-500 text-xs truncate max-w-[140px] hidden sm:inline group-hover:text-slate-700">
                          {stock.name}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <span className="text-slate-600 text-xs truncate max-w-[140px] inline-block">{stock.sector}</span>
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
                    <td className="text-right mono-num text-slate-700">{stock.pe > 0 ? `${stock.pe.toFixed(1)}x` : '-'}</td>
                    <td className="text-right mono-num text-slate-600">{stock.marketCap}</td>
                    <td className="text-center">
                      <Link
                        href={`/fundamentals/${stock.symbol}`}
                        className="inline-flex items-center text-xs text-slate-500 hover:text-emerald-600 transition-colors"
                        title="Open Fundamentals Cockpit"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar with Pagination & Screener Link */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50 gap-2">
        <div className="flex items-center space-x-3">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(totalItems, currentPage * pageSize)} of {totalItems} listed equities
          </span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold text-[11px]"
          >
            <option value={15}>15 per page</option>
            <option value={30}>30 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center space-x-2">
          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium"
              >
                &larr; Prev
              </button>
              <span className="px-1.5 font-bold mono-num text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium"
              >
                Next &rarr;
              </button>
            </div>
          )}

          <Link
            href="/screener"
            className="text-emerald-700 font-bold hover:underline ml-2"
          >
            View in Grow more Screener (871 Scrips) &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
