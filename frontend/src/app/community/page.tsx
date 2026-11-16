'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { DollarSign, CheckCircle2 } from '@/components/Icons';

const operatingCosts = [
  { service: 'PSX Realtime Market Data Feeds', provider: 'Pakistan Stock Exchange Direct', monthlyCost: 450, annualCost: 5400, purpose: 'Tick-level live order book & trade tape' },
  { service: 'Cloud Servers & Edge Compute', provider: 'Vercel & AWS Enterprise', monthlyCost: 320, annualCost: 3840, purpose: 'Next.js rendering, API caching, global CDN' },
  { service: 'MUFAP Mutual Funds & SBP Macro Feeds', provider: 'MUFAP / State Bank of Pakistan API', monthlyCost: 280, annualCost: 3360, purpose: 'Daily mutual fund NAVs, KIBOR, CPI, FX reserves' },
  { service: 'PostgreSQL Database & Storage', provider: 'Supabase / Neon DB', monthlyCost: 150, annualCost: 1800, purpose: 'User portfolios, encrypted ledger data' },
];

interface RoadmapItem {
  id: string;
  text: string;
  status: 'Planned' | 'Under Review' | 'In Progress';
  date: string;
}

const initialRoadmap: RoadmapItem[] = [
  { id: 'r1', text: 'Direct CDC eServices auto-sync for dividend warrants and bonus shares', status: 'In Progress', date: 'Nov 14, 2026' },
  { id: 'r2', text: 'Automated Zakat purification ratio breakdown per KMI-30 constituent', status: 'Planned', date: 'Nov 12, 2026' },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'transparency' | 'feedback' | 'changelog'>('transparency');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>(initialRoadmap);
  const [submitBanner, setSubmitBanner] = useState<string | null>(null);

  const totalMonthlyCost = operatingCosts.reduce((s, c) => s + c.monthlyCost, 0);
  const totalAnnualCost = operatingCosts.reduce((s, c) => s + c.annualCost, 0);

  const handleSubmitRoadmap = () => {
    const content = feedbackText.trim() || 'Add sector-wise foreign corporate inflow alerts on PSX';
    const newItem: RoadmapItem = {
      id: String(Date.now()),
      text: content,
      status: 'Under Review',
      date: 'Just now',
    };
    setRoadmapItems((prev) => [newItem, ...prev]);
    setFeedbackText('');
    setSubmitBanner(`Feature request submitted to public roadmap: "${content}"`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Grow more Community &amp; Operating Transparency
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Radical cost transparency, itemized infrastructure invoices, zero-ads policy, and public changelog
              </p>
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab('transparency')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'transparency' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cost Transparency
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'feedback' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Feature Requests
              </button>
              <button
                onClick={() => setActiveTab('changelog')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'changelog' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Changelog v2.4
              </button>
            </div>
          </div>

          {/* Radical Transparency Section */}
          {activeTab === 'transparency' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="terminal-card p-4">
                  <span className="text-xs text-slate-500 block mb-1">Monthly Infrastructure Burn</span>
                  <div className="text-2xl font-bold text-slate-900 mono-num">
                    ${totalMonthlyCost.toLocaleString()} USD
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">~PKR 335,000/mo server &amp; data fees</span>
                </div>

                <div className="terminal-card p-4">
                  <span className="text-xs text-slate-500 block mb-1">Annual Platform Costs</span>
                  <div className="text-2xl font-bold text-slate-900 mono-num">
                    ${totalAnnualCost.toLocaleString()} USD
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">Radical open-ledger accounting</span>
                </div>

                <div className="terminal-card p-4">
                  <span className="text-xs text-slate-500 block mb-1">Monetization Integrity</span>
                  <div className="text-lg font-semibold text-emerald-600">
                    0% Ads • 0% Data Selling
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">Community &amp; Patron supported</span>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="terminal-card overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-900">Itemized Data &amp; Infrastructure Invoices</span>
                  </div>
                  <span className="text-xs text-slate-500 mono-num">Audited 2026 Run Rate</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full financial-table text-left">
                    <thead>
                      <tr>
                        <th>Infrastructure / Feed</th>
                        <th>Vendor / Provider</th>
                        <th>Service Role</th>
                        <th className="text-right">Monthly (USD)</th>
                        <th className="text-right">Annualized (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operatingCosts.map((c) => (
                        <tr key={c.service}>
                          <td className="font-semibold text-slate-900">{c.service}</td>
                          <td className="text-slate-600 text-xs">{c.provider}</td>
                          <td className="text-slate-500 text-xs">{c.purpose}</td>
                          <td className="text-right mono-num font-semibold text-slate-900">${c.monthlyCost}</td>
                          <td className="text-right mono-num text-slate-700">${c.annualCost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Feedback & Feature Requests */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              {submitBanner && (
                <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{submitBanner}</span>
                  </div>
                  <button onClick={() => setSubmitBanner(null)} className="text-emerald-700 font-semibold">
                    Dismiss
                  </button>
                </div>
              )}

              <div className="terminal-card p-6 space-y-4">
                <span className="text-sm font-semibold text-slate-900 block">Grow more Community Suggestion Box</span>
                <p className="text-xs text-slate-600">
                  Help guide the development roadmap of Grow more. Submit technical indicator requests, PSX broker integration targets, or tax calculation ideas.
                </p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Describe your feature request or bug in detail..."
                  rows={4}
                  className="w-full p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
                <button
                  onClick={handleSubmitRoadmap}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                >
                  Submit to Public Roadmap
                </button>
              </div>

              <div className="terminal-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-semibold text-slate-900">Public Roadmap Queue ({roadmapItems.length})</span>
                  <span className="text-xs text-slate-500">Community Voted</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {roadmapItems.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-800">{item.text}</span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                          {item.status}
                        </span>
                        <span className="text-slate-400 mono-num text-[11px]">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Changelog */}
          {activeTab === 'changelog' && (
            <div className="terminal-card p-4 space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900 text-sm">v2.4.0 — Unslop White Editorial Terminal Release</span>
                  <span className="text-emerald-700 font-medium px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] mono-num">
                    Latest
                  </span>
                </div>
                <p className="text-slate-600 mt-1">
                  Full transition to high-clarity white editorial surfaces, 4px layout rhythm, institutional financial typography with tabular-nums, Grow more Auto-Pivots, and multi-asset wealth ledger.
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-900 text-sm">v2.3.0 — Grow more Multi-Asset Tracker</span>
                <p className="text-slate-600 mt-1">
                  Added support for 8 distinct asset classes including physical gold tola holdings, mutual funds, and Capital Gains Tax (CGT) holding period attribution.
                </p>
              </div>
            </div>
          )}

        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
