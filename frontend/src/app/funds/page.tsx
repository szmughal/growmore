'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { FileSpreadsheet, ArrowUpRight, ArrowDownRight } from '@/components/Icons';

interface MutualFund {
  symbol: string;
  name: string;
  amcName: string;
  category: string;
  nav: number;
  change: number;
  changePercent: number;
  return1Y: number;
  dividendYield: number;
  aum: string;
}

const sampleFunds: MutualFund[] = [
  { symbol: 'MIIF', name: 'Meezan Islamic Income Fund', amcName: 'Al Meezan Investments', category: 'Income Fund', nav: 54.82, change: 0.04, changePercent: 0.07, return1Y: 21.4, dividendYield: 18.2, aum: 'PKR 84.5B' },
  { symbol: 'MCBF', name: 'MCB Cash Management Optimizer', amcName: 'MCB-Arif Habib Savings', category: 'Money Market', nav: 104.12, change: 0.08, changePercent: 0.08, return1Y: 22.1, dividendYield: 19.5, aum: 'PKR 62.1B' },
  { symbol: 'UBL-SGF', name: 'UBL Shariah Growth Fund', amcName: 'UBL Fund Managers', category: 'Islamic Equity', nav: 92.45, change: 1.15, changePercent: 1.26, return1Y: 48.6, dividendYield: 8.4, aum: 'PKR 24.8B' },
  { symbol: 'JS-LSF', name: 'JS Large Cap Stock Fund', amcName: 'JS Investments', category: 'Equity Fund', nav: 138.20, change: 1.80, changePercent: 1.32, return1Y: 52.4, dividendYield: 7.2, aum: 'PKR 18.5B' },
  { symbol: 'NBP-GEF', name: 'NBP Islamic Energy Fund', amcName: 'NBP Funds', category: 'Sector Specific', nav: 14.85, change: 0.35, changePercent: 2.41, return1Y: 64.2, dividendYield: 9.1, aum: 'PKR 12.4B' },
];

export default function FundsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredFunds = selectedCategory === 'All'
    ? sampleFunds
    : sampleFunds.filter(f => f.category.includes(selectedCategory));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Mutual Funds & MUFAP Intelligence
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily NAV updates, 1-Year annualized yields, category benchmarks, and asset manager rankings
              </p>
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
              {['All', 'Income', 'Money Market', 'Equity'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    selectedCategory === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Funds Table */}
          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-900">Mutual Fund Rankings</span>
              </div>
              <span className="text-xs text-slate-500 mono-num">Source: MUFAP Daily</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full financial-table text-left">
                <thead>
                  <tr>
                    <th>Symbol & Fund Name</th>
                    <th>Asset Management Co (AMC)</th>
                    <th>Category</th>
                    <th className="text-right">Latest NAV (PKR)</th>
                    <th className="text-right">1D Change</th>
                    <th className="text-right">1-Year Return</th>
                    <th className="text-right">Dividend Yield</th>
                    <th className="text-right">Total AUM</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFunds.map((fund) => {
                    const isPositive = fund.change >= 0;
                    return (
                      <tr key={fund.symbol}>
                        <td>
                          <span className="font-semibold text-slate-900">{fund.symbol}</span>
                          <span className="text-xs text-slate-500 block">{fund.name}</span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-700 font-medium">{fund.amcName}</span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {fund.category}
                          </span>
                        </td>
                        <td className="text-right mono-num font-semibold text-slate-900">
                          {fund.nav.toFixed(2)}
                        </td>
                        <td className="text-right mono-num">
                          <span className={`inline-flex items-center text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                            {isPositive ? `+${fund.changePercent.toFixed(2)}%` : `${fund.changePercent.toFixed(2)}%`}
                          </span>
                        </td>
                        <td className="text-right mono-num text-emerald-600 font-semibold">
                          +{fund.return1Y.toFixed(1)}%
                        </td>
                        <td className="text-right mono-num text-slate-800 font-medium">
                          {fund.dividendYield.toFixed(1)}%
                        </td>
                        <td className="text-right mono-num text-slate-600">
                          {fund.aum}
                        </td>
                      </tr>
                    );
                  })}
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
