'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { ShieldCheck, TrendingUp } from '@/components/Icons';

export default function ToolsPage() {
  const [stockValue, setStockValue] = useState<number>(1000000);
  const [isTrading, setIsTrading] = useState<boolean>(false);
  const [customLiquidPercent, setCustomLiquidPercent] = useState<number>(30);

  const [monthlyExpense, setMonthlyExpense] = useState<number>(150000);
  const fireNumber = monthlyExpense * 12 * 25;

  const zakatBase = isTrading ? stockValue : stockValue * (customLiquidPercent / 100);
  const zakatPayable = zakatBase * 0.025;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Institutional Financial Calculators & Wealth Tools
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Shariah-compliant Zakat calculation, FIRE independence targets, and DCF valuation models
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Shariah Equity Zakat Calculator */}
            <div className="terminal-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-900">Equity Zakat Calculator</span>
                </div>
                <span className="text-xs text-emerald-700 font-medium px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                  AAOIFI Shariah Standard
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Total Market Value of Shareholdings (PKR)</label>
                  <input
                    type="number"
                    value={stockValue}
                    onChange={(e) => setStockValue(Number(e.target.value))}
                    className="w-full h-8 px-3 bg-slate-50 border border-slate-200 rounded text-slate-900 mono-num focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Investment Horizon & Intent</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsTrading(false)}
                      className={`p-2 rounded text-left transition-colors border ${
                        !isTrading
                          ? 'border-emerald-600 bg-emerald-50/50 text-slate-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="font-semibold block text-xs">Long-Term (Dividends)</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Zakat on zakatable assets (cash + inventory ~30%)</span>
                    </button>
                    <button
                      onClick={() => setIsTrading(true)}
                      className={`p-2 rounded text-left transition-colors border ${
                        isTrading
                          ? 'border-emerald-600 bg-emerald-50/50 text-slate-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="font-semibold block text-xs">Short-Term Trading (Capital Gain)</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Zakat on 100% of market value</span>
                    </button>
                  </div>
                </div>

                {!isTrading && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Zakatable Liquid Assets Ratio</span>
                      <span className="mono-num font-semibold text-slate-900">{customLiquidPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="50"
                      value={customLiquidPercent}
                      onChange={(e) => setCustomLiquidPercent(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                )}
              </div>

              {/* Zakat Result Box */}
              <div className="p-3.5 rounded bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-600 block">Total Zakat Due (2.5%)</span>
                  <span className="text-xl font-bold text-emerald-700 mono-num">
                    PKR {Math.round(zakatPayable).toLocaleString()}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500 mono-num">
                  <span>Zakatable Base:</span>
                  <span className="block font-semibold text-slate-900">PKR {Math.round(zakatBase).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 2. FIRE Calculator (Financial Independence, Retire Early) */}
            <div className="terminal-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-900">FIRE Retirement Independence Target</span>
                </div>
                <span className="text-xs text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">
                  4% Safe Withdrawal Rule
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Current Monthly Living Expenses (PKR)</label>
                  <input
                    type="number"
                    value={monthlyExpense}
                    onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                    className="w-full h-8 px-3 bg-slate-50 border border-slate-200 rounded text-slate-900 mono-num focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div className="p-3 rounded bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Annual Expenditure:</span>
                    <span className="mono-num font-semibold text-slate-900">PKR {(monthlyExpense * 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Target Withdrawal Rate:</span>
                    <span className="mono-num font-semibold text-emerald-600">4.0% per annum</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Multiplication Factor:</span>
                    <span className="mono-num font-semibold text-slate-900">25x Annual Expenses</span>
                  </div>
                </div>
              </div>

              {/* FIRE Target Result */}
              <div className="p-3.5 rounded bg-slate-100/80 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-600 block">Required Capital Portfolio</span>
                  <span className="text-xl font-bold text-slate-900 mono-num">
                    PKR {(fireNumber / 1000000).toFixed(1)} Million
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500 mono-num">
                  <span>Perpetual Passive Cashflow:</span>
                  <span className="block text-emerald-600 font-semibold">PKR {monthlyExpense.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

          </div>

        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
