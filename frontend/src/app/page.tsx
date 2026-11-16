'use client';

import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MarketTickerTape from '@/components/MarketTickerTape';
import MarketOverviewCards from '@/components/MarketOverviewCards';
import InteractiveMarketChart from '@/components/InteractiveMarketChart';
import FearGreedGauge from '@/components/FearGreedGauge';
import MarketDataTable from '@/components/MarketDataTable';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Calendar, Building2, ArrowRight, ShieldCheck, Layers, Activity } from '@/components/Icons';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
        <Header />
        <MarketTickerTape />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          {/* Brand Identity & Institutional Terminal Bar */}
          <div className="terminal-card p-4 sm:p-5 bg-white border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#0F172A] text-white">
                  Grow more Terminal
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Know Where You Stand, Financially
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight pt-0.5">
                Pakistan Stock Exchange (KSE 100) Live Intelligence
              </h1>
              <p className="text-xs text-slate-600">
                Institutional valuation models, automated technical decision levels, smart money NCCPL flows, and multi-asset wealth tracking.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href="/fundamentals"
                className="px-3 py-2 rounded-md text-xs font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200/80 border border-slate-200 flex items-center space-x-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>GM Valuation Engine</span>
              </Link>
              <Link
                href="/technicals"
                className="px-3 py-2 rounded-md text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Levels To Play</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <MarketOverviewCards />

          {/* Chart & Sentiment Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InteractiveMarketChart />
            </div>
            <div className="lg:col-span-1">
              <FearGreedGauge />
            </div>
          </div>

          {/* Market Data Table */}
          <MarketDataTable />

          {/* Bottom Grid: Corporate Calendar & Sector Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Corporate Disclosures & Calendar */}
            <div className="terminal-card p-4">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#1E3A8A]" />
                  <span className="text-sm font-bold text-[#0F172A]">Corporate Calendar &amp; Filings</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Upcoming PSX Events</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200/80">
                  <div>
                    <div className="font-semibold text-[#0F172A]">ENGRO — Board Meeting</div>
                    <div className="text-[11px] text-slate-600">Consideration of Q3 Financial Results &amp; Interim Cash Dividend</div>
                  </div>
                  <span className="mono-num text-[11px] font-semibold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                    Nov 18
                  </span>
                </div>

                <div className="flex items-start justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200/80">
                  <div>
                    <div className="font-semibold text-[#0F172A]">MEBL — Dividend Book Closure</div>
                    <div className="text-[11px] text-slate-600">Entitlement for PKR 7.00/share Interim Cash Dividend</div>
                  </div>
                  <span className="mono-num text-[11px] font-medium text-slate-700 px-2 py-0.5 rounded bg-white border border-slate-200">
                    Nov 21
                  </span>
                </div>

                <div className="flex items-start justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200/80">
                  <div>
                    <div className="font-semibold text-[#0F172A]">HUBC — Analyst Briefing</div>
                    <div className="text-[11px] text-slate-600">Corporate Briefing on Tariff Structure &amp; Capital Allocation</div>
                  </div>
                  <span className="mono-num text-[11px] font-medium text-slate-700 px-2 py-0.5 rounded bg-white border border-slate-200">
                    Nov 24
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link href="/announcements" className="text-[#1E3A8A] hover:underline font-semibold">
                  View all 14 official PSX disclosures →
                </Link>
              </div>
            </div>

            {/* Sector Performance Distribution */}
            <div className="terminal-card p-4">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-[#059669]" />
                  <span className="text-sm font-bold text-[#0F172A]">Sector Relative Performance</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">1D Weighted Return</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-800 font-semibold">Oil &amp; Gas Exploration</span>
                    <span className="text-emerald-600 mono-num font-bold">+2.84%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                    <div className="bg-[#059669] h-full" style={{ width: '74%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-800 font-semibold">Commercial Banks</span>
                    <span className="text-emerald-600 mono-num font-bold">+1.42%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                    <div className="bg-[#059669] h-full" style={{ width: '58%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-800 font-semibold">Fertilizer &amp; Agritech</span>
                    <span className="text-emerald-600 mono-num font-bold">+0.88%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                    <div className="bg-[#059669] h-full" style={{ width: '48%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-800 font-semibold">Technology &amp; Communication</span>
                    <span className="text-rose-600 mono-num font-bold">-0.92%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                    <div className="bg-[#DC2626] h-full" style={{ width: '35%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">Leading Sector Outperformer</span>
                <span className="text-emerald-700 mono-num font-bold">Refinery (+4.10%)</span>
              </div>
            </div>

          </div>

        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
