'use client';

import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Landmark } from '@/components/Icons';

export default function MacroPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Macroeconomic Intelligence & Sovereign Indicators
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                State Bank of Pakistan (SBP) policy rates, FX reserves, CPI inflation, and external account dynamics
              </p>
            </div>

            <span className="text-xs mono-num px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-medium">
              SBP Monetary Policy Committee: Nov 2026
            </span>
          </div>

          {/* Macro Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="terminal-card p-4">
              <span className="text-xs text-slate-500 block mb-1">SBP Policy Rate</span>
              <div className="text-2xl font-bold text-slate-900 mono-num">15.00%</div>
              <span className="text-xs text-emerald-600 font-medium mono-num mt-1 block">-250 bps cut in latest cycle</span>
            </div>

            <div className="terminal-card p-4">
              <span className="text-xs text-slate-500 block mb-1">CPI Inflation (YoY)</span>
              <div className="text-2xl font-bold text-emerald-600 mono-num">6.9%</div>
              <span className="text-xs text-slate-500 mt-1 block">Down from 28.3% peak</span>
            </div>

            <div className="terminal-card p-4">
              <span className="text-xs text-slate-500 block mb-1">Total FX Reserves</span>
              <div className="text-2xl font-bold text-slate-900 mono-num">$16.1B USD</div>
              <span className="text-xs text-slate-500 mono-num mt-1 block">SBP: $11.2B | Banks: $4.9B</span>
            </div>

            <div className="terminal-card p-4">
              <span className="text-xs text-slate-500 block mb-1">Current Account</span>
              <div className="text-2xl font-bold text-emerald-600 mono-num">+$119M Surplus</div>
              <span className="text-xs text-slate-500 mt-1 block">Positive month over month</span>
            </div>
          </div>

          {/* Historical Macro Trends Table */}
          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-900">Monthly Macro Indicators Trajectory</span>
              </div>
              <span className="text-xs text-slate-500 mono-num">Fiscal Year 2024-2025</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full financial-table text-left">
                <thead>
                  <tr>
                    <th>Reporting Month</th>
                    <th className="text-right">Policy Rate</th>
                    <th className="text-right">CPI Inflation</th>
                    <th className="text-right">USD / PKR</th>
                    <th className="text-right">SBP FX Reserves</th>
                    <th className="text-right">Remittances</th>
                    <th className="text-right">Trade Deficit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold text-slate-900">October 2026</td>
                    <td className="text-right mono-num text-slate-800">15.00%</td>
                    <td className="text-right mono-num text-emerald-600 font-medium">6.9%</td>
                    <td className="text-right mono-num text-slate-700">278.45</td>
                    <td className="text-right mono-num text-emerald-600 font-medium">$11.25B</td>
                    <td className="text-right mono-num text-slate-800 font-medium">$3.05B</td>
                    <td className="text-right mono-num text-rose-600 font-medium">-$1.82B</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-900">September 2026</td>
                    <td className="text-right mono-num text-slate-800">17.50%</td>
                    <td className="text-right mono-num text-emerald-600 font-medium">9.6%</td>
                    <td className="text-right mono-num text-slate-700">278.10</td>
                    <td className="text-right mono-num text-emerald-600 font-medium">$10.70B</td>
                    <td className="text-right mono-num text-slate-800 font-medium">$2.85B</td>
                    <td className="text-right mono-num text-rose-600 font-medium">-$1.95B</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-900">August 2026</td>
                    <td className="text-right mono-num text-slate-800">19.50%</td>
                    <td className="text-right mono-num text-emerald-600 font-medium">11.8%</td>
                    <td className="text-right mono-num text-slate-700">278.60</td>
                    <td className="text-right mono-num text-emerald-600 font-medium">$9.40B</td>
                    <td className="text-right mono-num text-slate-800 font-medium">$2.94B</td>
                    <td className="text-right mono-num text-rose-600 font-medium">-$2.10B</td>
                  </tr>
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
