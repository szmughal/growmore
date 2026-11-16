'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Filter } from '@/components/Icons';

const presets = [
  { id: '1', name: 'Quality at a Fair Price', count: 5, desc: 'High ROE, positive 5Y profit CAGR, P/E below sector median' },
  { id: '2', name: 'Deep Value (Discount to BV)', count: 4, desc: 'P/B < 1.0, positive operating cash flow, low debt' },
  { id: '3', name: 'Dividend Income Aristocrats', count: 5, desc: 'Dividend yield > 8%, dividend coverage ratio > 1.5x' },
  { id: '4', name: 'Dr. Masood Running Horses', count: 4, desc: 'Stage 2 markup, breaking 52-week highs with heavy volume' },
  { id: '5', name: 'Trend Reversal by ICS', count: 3, desc: 'Oversold RSI < 35 with bullish candle confirmation and MACD cross' },
  { id: '6', name: 'Islamic Shariah Large Caps', count: 6, desc: 'KMI-30 eligible, non-interest leverage compliant' },
];

interface ScreenerStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  fairValue: number;
  discount: number;
  pe: number;
  pb: number;
  divYield: number;
  roe: number;
  shariah: boolean;
  presets: string[];
}

const allScreenerStocks: ScreenerStock[] = [
  { symbol: 'OGDC', name: 'Oil & Gas Dev Co', sector: 'Oil & Gas', price: 148.50, fairValue: 215.00, discount: 44.8, pe: 4.8, pb: 0.9, divYield: 11.2, roe: 22.4, shariah: true, presets: ['1', '2', '3', '4', '6'] },
  { symbol: 'PPL', name: 'Pakistan Petroleum', sector: 'Oil & Gas', price: 128.20, fairValue: 182.00, discount: 41.9, pe: 4.2, pb: 0.8, divYield: 10.8, roe: 20.1, shariah: true, presets: ['1', '2', '3', '4', '6'] },
  { symbol: 'MEBL', name: 'Meezan Bank Ltd', sector: 'Islamic Banking', price: 242.00, fairValue: 310.00, discount: 28.1, pe: 5.4, pb: 1.8, divYield: 12.5, roe: 38.6, shariah: true, presets: ['1', '3', '4', '6'] },
  { symbol: 'ENGRO', name: 'Engro Corporation', sector: 'Fertilizer', price: 334.80, fairValue: 420.00, discount: 25.4, pe: 7.6, pb: 1.2, divYield: 9.4, roe: 18.2, shariah: true, presets: ['1', '3', '6'] },
  { symbol: 'LUCK', name: 'Lucky Cement Ltd', sector: 'Cement', price: 894.50, fairValue: 1120.00, discount: 25.2, pe: 8.4, pb: 1.4, divYield: 5.8, roe: 21.0, shariah: true, presets: ['1', '6'] },
  { symbol: 'HUBC', name: 'Hub Power Company', sector: 'Power Gen', price: 132.70, fairValue: 185.00, discount: 39.4, pe: 3.8, pb: 0.9, divYield: 14.2, roe: 26.8, shariah: true, presets: ['2', '3', '5', '6'] },
  { symbol: 'PRL', name: 'Pakistan Refinery', sector: 'Refinery', price: 34.60, fairValue: 48.00, discount: 38.7, pe: 5.1, pb: 0.7, divYield: 4.2, roe: 16.5, shariah: false, presets: ['2', '4'] },
  { symbol: 'SYS', name: 'Systems Limited', sector: 'Technology', price: 462.10, fairValue: 540.00, discount: 16.8, pe: 18.2, pb: 4.2, divYield: 2.4, roe: 24.5, shariah: true, presets: ['5'] },
  { symbol: 'DGKC', name: 'D.G. Khan Cement', sector: 'Cement', price: 82.40, fairValue: 114.00, discount: 38.3, pe: 9.2, pb: 0.6, divYield: 0.0, roe: 12.4, shariah: true, presets: ['5'] },
];

export default function ScreenerPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>('1');
  const [isCustomOpen, setIsCustomOpen] = useState<boolean>(false);
  const [maxPe, setMaxPe] = useState<number>(20);
  const [minRoe, setMinRoe] = useState<number>(10);
  const [shariahOnly, setShariahOnly] = useState<boolean>(false);

  const activePresetObj = presets.find((p) => p.id === selectedPreset) || presets[0];

  const filteredStocks = allScreenerStocks.filter((s) => {
    const matchesPreset = s.presets.includes(selectedPreset);
    if (!matchesPreset) return false;
    if (isCustomOpen) {
      if (s.pe > maxPe) return false;
      if (s.roe < minRoe) return false;
      if (shariahOnly && !s.shariah) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 pl-60 flex flex-col min-w-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Grow more Multi-Asset Screener
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Curated quantitative presets, technical filters, and custom valuation scans
              </p>
            </div>

            <button
              onClick={() => setIsCustomOpen((prev) => !prev)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                isCustomOpen
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Custom Filter Query</span>
            </button>
          </div>

          {/* Interactive Custom Filter Drawer */}
          {isCustomOpen && (
            <div className="terminal-card p-4 bg-white border-emerald-300 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Custom Quantitative Filter Parameters
                </span>
                <button
                  onClick={() => {
                    setMaxPe(20);
                    setMinRoe(10);
                    setShariahOnly(false);
                  }}
                  className="text-xs text-emerald-700 hover:underline font-medium"
                >
                  Reset Filters
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">
                    Maximum P/E Ratio: <strong className="mono-num text-slate-900">{maxPe}x</strong>
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="25"
                    value={maxPe}
                    onChange={(e) => setMaxPe(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium block mb-1">
                    Minimum ROE (%): <strong className="mono-num text-slate-900">{minRoe}%</strong>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={minRoe}
                    onChange={(e) => setMinRoe(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <input
                    id="shariah-toggle"
                    type="checkbox"
                    checked={shariahOnly}
                    onChange={(e) => setShariahOnly(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <label htmlFor="shariah-toggle" className="text-slate-800 font-semibold cursor-pointer">
                    KMI-30 Shariah Compliant Only
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Curated Presets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPreset(p.id)}
                className={`terminal-card p-4 cursor-pointer transition-all ${
                  selectedPreset === p.id
                    ? 'border-emerald-600 ring-1 ring-emerald-600/20 bg-emerald-50/20'
                    : 'hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900 text-sm">{p.name}</span>
                  <span className="text-[11px] mono-num font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.count} Stocks
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Screener Results Preview */}
          <div className="terminal-card p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div>
                <span className="text-sm font-semibold text-slate-900">
                  Preset Scan Results — {activePresetObj.name}
                </span>
                <span className="text-xs text-slate-500 ml-2">({filteredStocks.length} matching equities)</span>
              </div>
              <span className="text-xs text-slate-500 mono-num">Sorted by Upside to Fair Value</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full financial-table text-left">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Company Name</th>
                    <th>Sector</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Fair Value</th>
                    <th className="text-right">Discount</th>
                    <th className="text-right">P/E</th>
                    <th className="text-right">P/B</th>
                    <th className="text-right">Div Yield</th>
                    <th className="text-right">ROE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => (
                    <tr key={stock.symbol}>
                      <td className="font-semibold text-slate-900">{stock.symbol}</td>
                      <td className="text-slate-700 text-xs">{stock.name}</td>
                      <td className="text-slate-600 text-xs">{stock.sector}</td>
                      <td className="text-right mono-num font-semibold text-slate-900">{stock.price.toFixed(2)}</td>
                      <td className="text-right mono-num text-slate-700">{stock.fairValue.toFixed(2)}</td>
                      <td className="text-right mono-num text-emerald-600 font-semibold">+{stock.discount.toFixed(1)}%</td>
                      <td className="text-right mono-num text-slate-700">{stock.pe.toFixed(1)}x</td>
                      <td className="text-right mono-num text-slate-700">{stock.pb.toFixed(1)}x</td>
                      <td className="text-right mono-num text-emerald-600 font-medium">{stock.divYield.toFixed(1)}%</td>
                      <td className="text-right mono-num text-slate-900 font-medium">{stock.roe.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
