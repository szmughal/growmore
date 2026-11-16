'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Filter } from '@/components/Icons';

const presets = [
  { id: '1', name: 'Quality at a Fair Price', count: 5, desc: 'High ROE, positive 5Y profit CAGR, P/E below sector median' },
  { id: '2', name: 'Deep Value (Discount to BV)', count: 4, desc: 'P/B < 1.0, positive operating cash flow, low debt' },
  { id: '3', name: 'Dividend Income Aristocrats', count: 5, desc: 'Dividend yield > 8%, dividend coverage ratio > 1.5x' },
  { id: '4', name: 'Our Experts Running Horses', count: 4, desc: 'Stage 2 markup, breaking 52-week highs with heavy volume' },
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
  { symbol: 'HBL', name: 'Habib Bank Limited', sector: 'Commercial Banks', price: 308.22, fairValue: 459.93, discount: 33.0, pe: 6.51, pb: 0.90, divYield: 7.46, roe: 14.42, shariah: false, presets: ['1', '2', '3'] },
  { symbol: 'OGDC', name: 'Oil & Gas Dev Co', sector: 'Oil & Gas', price: 316.21, fairValue: 420.00, discount: 24.7, pe: 5.18, pb: 0.92, divYield: 5.85, roe: 22.40, shariah: true, presets: ['1', '2', '3', '4', '6'] },
  { symbol: 'UBL', name: 'United Bank Limited', sector: 'Commercial Banks', price: 433.22, fairValue: 520.00, discount: 16.7, pe: 6.38, pb: 1.25, divYield: 7.39, roe: 28.50, shariah: false, presets: ['1', '3', '4'] },
  { symbol: 'MEBL', name: 'Meezan Bank Ltd', sector: 'Islamic Banking', price: 551.25, fairValue: 640.00, discount: 13.9, pe: 10.42, pb: 1.95, divYield: 5.53, roe: 38.60, shariah: true, presets: ['1', '3', '4', '6'] },
  { symbol: 'MARI', name: 'Mari Petroleum Co', sector: 'Oil & Gas', price: 737.28, fairValue: 860.00, discount: 14.3, pe: 9.55, pb: 2.10, divYield: 3.66, roe: 25.40, shariah: true, presets: ['1', '4', '6'] },
  { symbol: 'FFC', name: 'Fauji Fertilizer Co', sector: 'Fertilizer', price: 566.59, fairValue: 680.00, discount: 16.7, pe: 8.86, pb: 1.85, divYield: 7.24, roe: 29.40, shariah: true, presets: ['1', '3', '4', '6'] },
  { symbol: 'LUCK', name: 'Lucky Cement Ltd', sector: 'Cement', price: 444.52, fairValue: 560.00, discount: 20.6, pe: 7.34, pb: 1.60, divYield: 1.12, roe: 21.00, shariah: true, presets: ['1', '6'] },
  { symbol: 'PPL', name: 'Pakistan Petroleum', sector: 'Oil & Gas', price: 227.23, fairValue: 310.00, discount: 26.7, pe: 6.01, pb: 0.88, divYield: 5.28, roe: 20.10, shariah: true, presets: ['1', '2', '4', '6'] },
  { symbol: 'MCB', name: 'MCB Bank Limited', sector: 'Commercial Banks', price: 409.85, fairValue: 490.00, discount: 16.4, pe: 8.34, pb: 1.10, divYield: 6.59, roe: 31.20, shariah: false, presets: ['1', '3'] },
  { symbol: 'SYS', name: 'Systems Limited', sector: 'Technology', price: 114.52, fairValue: 160.00, discount: 28.4, pe: 14.26, pb: 4.20, divYield: 1.75, roe: 24.50, shariah: true, presets: ['5'] },
  { symbol: 'ENGROH', name: 'Engro Holdings', sector: 'Fertilizer / Holding', price: 279.42, fairValue: 350.00, discount: 20.2, pe: 7.30, pb: 1.30, divYield: 8.40, roe: 18.20, shariah: true, presets: ['1', '3', '6'] },
  { symbol: 'EFERT', name: 'Engro Fertilizers', sector: 'Fertilizer', price: 210.33, fairValue: 260.00, discount: 19.1, pe: 11.42, pb: 2.20, divYield: 6.30, roe: 32.10, shariah: true, presets: ['1', '3', '6'] },
  { symbol: 'HUBC', name: 'Hub Power Company', sector: 'Power Gen', price: 207.02, fairValue: 260.00, discount: 20.4, pe: 5.29, pb: 0.95, divYield: 9.66, roe: 26.80, shariah: true, presets: ['2', '3', '6'] },
  { symbol: 'PSO', name: 'Pakistan State Oil', sector: 'Oil & Gas Marketing', price: 368.01, fairValue: 490.00, discount: 24.9, pe: 3.89, pb: 0.70, divYield: 2.72, roe: 18.00, shariah: true, presets: ['2', '5', '6'] },
  { symbol: 'DGKC', name: 'D.G. Khan Cement', sector: 'Cement', price: 202.01, fairValue: 270.00, discount: 25.2, pe: 7.21, pb: 0.85, divYield: 0.50, roe: 14.20, shariah: true, presets: ['2', '5'] },
  { symbol: 'PRL', name: 'Pakistan Refinery', sector: 'Refinery', price: 38.45, fairValue: 54.00, discount: 28.8, pe: 5.10, pb: 0.75, divYield: 4.20, roe: 16.50, shariah: false, presets: ['2', '4'] },
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

      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
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
        <MobileBottomNav />
      </div>
    </div>
  );
}
