'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { ALL_PSX_STOCKS, PSXStock } from '@/data/psxStocks';
import {
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Building2,
  CheckCircle2
} from '@/components/Icons';

type SortField = 'symbol' | 'price' | 'fairValue' | 'upside' | 'pe' | 'pb' | 'divYield' | 'roe' | 'marketCap';
type SortOrder = 'asc' | 'desc';

const PRESET_TABS = [
  { id: 'all', name: 'All Equities', desc: 'Complete 871 listed scrips on Pakistan Stock Exchange' },
  { id: 'kse100', name: 'KSE 100 Benchmark', desc: '100 largest and most liquid benchmark companies' },
  { id: 'kmi30', name: 'KMI 30 Shariah', desc: 'Shariah-compliant equities adhering to SECP / AAOIFI screening' },
  { id: 'quality', name: 'Quality at a Fair Price', desc: 'High ROE (> 14%), P/E below 15x, and positive earnings stability' },
  { id: 'deep_value', name: 'Deep Value (Discount to BV)', desc: 'Trading at or below book value (P/B <= 1.0) with positive equity' },
  { id: 'dividends', name: 'Dividend Aristocrats', desc: 'High yielding equities (Div Yield >= 7.0%)' },
  { id: 'high_upside', name: 'High Valuation Upside', desc: 'Equities trading at > 20% discount to intrinsic DCF fair value' },
];

export default function ScreenerPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  
  // Custom filter states
  const [isCustomOpen, setIsCustomOpen] = useState<boolean>(false);
  const [maxPe, setMaxPe] = useState<number>(35);
  const [minRoe, setMinRoe] = useState<number>(0);
  const [minDivYield, setMinDivYield] = useState<number>(0);
  const [shariahOnly, setShariahOnly] = useState<boolean>(false);
  const [kse100Only, setKse100Only] = useState<boolean>(false);

  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>('upside');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Unique sectors for dropdown
  const allSectors = useMemo(() => {
    const set = new Set<string>();
    ALL_PSX_STOCKS.forEach((s) => {
      if (s.sector) set.add(s.sector);
    });
    return Array.from(set).sort();
  }, []);

  // Filtered & Sorted stock list across ALL 871 PSX stocks
  const filteredStocks = useMemo(() => {
    let list = [...ALL_PSX_STOCKS];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }

    // 2. Sector Filter
    if (selectedSector !== 'ALL') {
      list = list.filter((s) => s.sector.toUpperCase() === selectedSector.toUpperCase());
    }

    // 3. Preset Filter
    if (selectedPreset === 'kse100') {
      list = list.filter((s) => s.inKse100);
    } else if (selectedPreset === 'kmi30') {
      list = list.filter((s) => s.inKmi30 || s.isShariah);
    } else if (selectedPreset === 'quality') {
      list = list.filter((s) => s.roe >= 14 && s.pe > 0 && s.pe <= 15);
    } else if (selectedPreset === 'deep_value') {
      list = list.filter((s) => s.pb > 0 && s.pb <= 1.05);
    } else if (selectedPreset === 'dividends') {
      list = list.filter((s) => s.divYield >= 7.0);
    } else if (selectedPreset === 'high_upside') {
      list = list.filter((s) => s.upside >= 20.0);
    }

    // 4. Custom Filters
    if (isCustomOpen) {
      if (maxPe < 35) list = list.filter((s) => s.pe <= maxPe && s.pe > 0);
      if (minRoe > 0) list = list.filter((s) => s.roe >= minRoe);
      if (minDivYield > 0) list = list.filter((s) => s.divYield >= minDivYield);
      if (shariahOnly) list = list.filter((s) => s.isShariah || s.inKmi30);
      if (kse100Only) list = list.filter((s) => s.inKse100);
    }

    // 5. Sorting
    list.sort((a, b) => {
      let aVal = a[sortField] as number | string;
      let bVal = b[sortField] as number | string;
      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return list;
  }, [
    searchQuery,
    selectedSector,
    selectedPreset,
    isCustomOpen,
    maxPe,
    minRoe,
    minDivYield,
    shariahOnly,
    kse100Only,
    sortField,
    sortOrder,
  ]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSector, selectedPreset, isCustomOpen, maxPe, minRoe, minDivYield, shariahOnly, kse100Only]);

  // Pagination slice
  const totalItems = filteredStocks.length;
  const totalPages = pageSize === 0 ? 1 : Math.ceil(totalItems / pageSize);
  const paginatedStocks = useMemo(() => {
    if (pageSize === 0) return filteredStocks;
    const start = (currentPage - 1) * pageSize;
    return filteredStocks.slice(start, start + pageSize);
  }, [filteredStocks, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const fmtMarketCap = (num: number) => {
    if (!num) return '-';
    if (num >= 1e12) return `PKR ${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `PKR ${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `PKR ${(num / 1e6).toFixed(0)}M`;
    return `PKR ${num.toLocaleString()}`;
  };

  const activePresetObj = PRESET_TABS.find((p) => p.id === selectedPreset) || PRESET_TABS[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-5 max-w-[1520px] w-full mx-auto">
          
          {/* Page Header */}
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider rounded bg-[#0F172A] text-white px-2 py-0.5">
                  PSX Screener
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  871 Listed Equities
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pt-1">
                Pakistan Stock Exchange Multi-Metric Equity Screener
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Screen across all 871 PSX scrips using quantitative multiples, DCF fair value, dividend yield, and balance sheet quality.
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setIsCustomOpen((prev) => !prev)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-md border text-xs font-semibold transition-all ${
                  isCustomOpen
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-xs'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Custom Filters {isCustomOpen ? '(Active)' : ''}</span>
              </button>

              <Link
                href="/fundamentals"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Valuation Cockpit</span>
              </Link>
            </div>
          </div>

          {/* Quick Filter Search & Sector Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <div className="flex items-center h-10 px-3 bg-white border border-slate-200 rounded-md text-xs focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all shadow-xs">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search 871 stocks by ticker, company name, or sector (e.g. HBL, MEBL, Fertilizer, Cement)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-700 mono-num px-1.5 py-0.5 rounded bg-slate-100"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>

            {/* Sector Dropdown */}
            <div>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-xs"
              >
                <option value="ALL">All PSX Sectors ({allSectors.length} Sectors)</option>
                {allSectors.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            {PRESET_TABS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPreset(p.id)}
                className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-all border ${
                  selectedPreset === p.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Collapsible Custom Quantitative Filter Drawer */}
          {isCustomOpen && (
            <div className="terminal-card p-4 bg-white border-slate-300 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Custom Quantitative Parameters
                </span>
                <button
                  onClick={() => {
                    setMaxPe(35);
                    setMinRoe(0);
                    setMinDivYield(0);
                    setShariahOnly(false);
                    setKse100Only(false);
                    setSelectedSector('ALL');
                  }}
                  className="text-xs text-emerald-600 hover:underline font-semibold"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
                {/* Max P/E */}
                <div>
                  <div className="flex justify-between text-slate-700 font-semibold mb-1">
                    <span>Max P/E:</span>
                    <span className="mono-num text-blue-600 font-bold">{maxPe >= 35 ? 'Any' : `${maxPe}x`}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={maxPe}
                    onChange={(e) => setMaxPe(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>5x</span>
                    <span>20x</span>
                    <span>35x (Any)</span>
                  </div>
                </div>

                {/* Min ROE */}
                <div>
                  <div className="flex justify-between text-slate-700 font-semibold mb-1">
                    <span>Min ROE:</span>
                    <span className="mono-num text-emerald-600 font-bold">{minRoe}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="2"
                    value={minRoe}
                    onChange={(e) => setMinRoe(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0%</span>
                    <span>20%</span>
                    <span>40%</span>
                  </div>
                </div>

                {/* Min Dividend Yield */}
                <div>
                  <div className="flex justify-between text-slate-700 font-semibold mb-1">
                    <span>Min Div Yield:</span>
                    <span className="mono-num text-amber-600 font-bold">{minDivYield}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={minDivYield}
                    onChange={(e) => setMinDivYield(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0%</span>
                    <span>7%</span>
                    <span>15%</span>
                  </div>
                </div>

                {/* Shariah Checkbox */}
                <div className="flex items-center space-x-2 pt-4">
                  <input
                    id="shariah-filter"
                    type="checkbox"
                    checked={shariahOnly}
                    onChange={(e) => setShariahOnly(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  <label htmlFor="shariah-filter" className="text-slate-800 font-semibold cursor-pointer">
                    Shariah-Compliant Only
                  </label>
                </div>

                {/* KSE-100 Checkbox */}
                <div className="flex items-center space-x-2 pt-4">
                  <input
                    id="kse100-filter"
                    type="checkbox"
                    checked={kse100Only}
                    onChange={(e) => setKse100Only(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
                  />
                  <label htmlFor="kse100-filter" className="text-slate-800 font-semibold cursor-pointer">
                    KSE-100 Only
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Results Table Card */}
          <div className="terminal-card overflow-hidden bg-white border-slate-200 shadow-xs">
            
            {/* Table Meta Bar */}
            <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-200 gap-3 bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-900">{activePresetObj.name}</span>
                <span className="text-xs text-slate-500">
                  ({filteredStocks.length} of 871 matching equities)
                </span>
              </div>

              {/* Page Size & View Selector */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-medium">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-800 font-semibold focus:outline-none"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={0}>All ({filteredStocks.length})</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full financial-table text-left">
                <thead>
                  <tr>
                    <th className="cursor-pointer hover:text-slate-900" onClick={() => handleSort('symbol')}>
                      Symbol {sortField === 'symbol' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th>Company Name</th>
                    <th>Sector</th>
                    <th className="text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('price')}>
                      Price (PKR) {sortField === 'price' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('fairValue')}>
                      Fair Value {sortField === 'fairValue' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('upside')}>
                      Upside {sortField === 'upside' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('pe')}>
                      P/E {sortField === 'pe' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('pb')}>
                      P/B {sortField === 'pb' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('divYield')}>
                      Div Yield {sortField === 'divYield' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('roe')}>
                      ROE {sortField === 'roe' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('marketCap')}>
                      Market Cap {sortField === 'marketCap' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStocks.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center py-10 text-slate-500">
                        No equities matched your current query. Try clearing the search or relaxing the filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedStocks.map((stock) => (
                      <tr key={stock.symbol} className="hover:bg-slate-50 transition-colors">
                        <td>
                          <Link
                            href={`/fundamentals/${stock.symbol}`}
                            className="font-bold text-slate-900 hover:text-emerald-700 mono-num transition-colors flex items-center space-x-1"
                          >
                            <span>{stock.symbol}</span>
                            {stock.isShariah && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                S
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="text-slate-700 text-xs truncate max-w-[200px]">
                          <Link href={`/fundamentals/${stock.symbol}`} className="hover:underline">
                            {stock.name}
                          </Link>
                        </td>
                        <td>
                          <span className="text-[11px] text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 truncate inline-block max-w-[140px]">
                            {stock.sector}
                          </span>
                        </td>
                        <td className="text-right mono-num font-bold text-slate-900">
                          {stock.price.toFixed(2)}
                        </td>
                        <td className="text-right mono-num text-slate-700 font-medium">
                          {stock.fairValue ? stock.fairValue.toFixed(2) : '-'}
                        </td>
                        <td className="text-right mono-num">
                          <span
                            className={`font-semibold ${
                              stock.upside >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {stock.upside >= 0 ? `+${stock.upside.toFixed(1)}%` : `${stock.upside.toFixed(1)}%`}
                          </span>
                        </td>
                        <td className="text-right mono-num text-slate-700">
                          {stock.pe > 0 ? `${stock.pe.toFixed(1)}x` : '-'}
                        </td>
                        <td className="text-right mono-num text-slate-700">
                          {stock.pb > 0 ? `${stock.pb.toFixed(2)}x` : '-'}
                        </td>
                        <td className="text-right mono-num text-emerald-600 font-semibold">
                          {stock.divYield > 0 ? `${stock.divYield.toFixed(1)}%` : '0.0%'}
                        </td>
                        <td className="text-right mono-num text-slate-900 font-medium">
                          {stock.roe > 0 ? `${stock.roe.toFixed(1)}%` : '0.0%'}
                        </td>
                        <td className="text-right mono-num text-slate-600 text-xs">
                          {fmtMarketCap(stock.marketCap)}
                        </td>
                        <td className="text-center">
                          <Link
                            href={`/fundamentals/${stock.symbol}`}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-colors border border-slate-200 hover:border-emerald-200"
                          >
                            <span>Model</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
              <div>
                <span>
                  Showing {pageSize === 0 ? 1 : (currentPage - 1) * pageSize + 1} to{' '}
                  {pageSize === 0 ? totalItems : Math.min(totalItems, currentPage * pageSize)} of {totalItems} equities
                </span>
                {totalItems < 871 && (
                  <span className="text-slate-400 ml-1.5">(Filtered from 871 total scrips)</span>
                )}
              </div>

              {pageSize > 0 && totalPages > 1 && (
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  >
                    Previous
                  </button>
                  <span className="px-2 font-semibold text-slate-900 mono-num">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

          </div>

        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
