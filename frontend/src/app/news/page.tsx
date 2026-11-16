'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const newsItems = [
  {
    id: '1',
    title: 'State Bank of Pakistan lowers policy rate by 250 bps to 15.00% amid continuous CPI decline',
    category: 'Macro',
    source: 'SBP Official / Business Recorder',
    time: '2 hours ago',
    summary: 'The Monetary Policy Committee noted that inflation has declined faster than anticipated and reached 6.9% in October, creating room for policy easing while preserving external stability.'
  },
  {
    id: '2',
    title: 'OGDC and PPL announce major gas discovery in Sukkur Block with commercial flow rates',
    category: 'PSX Disclosures',
    source: 'PSX Company Disclosures',
    time: '4 hours ago',
    summary: 'Exploration well drilled to a target depth of 3,850 meters showed hydrocarbon presence with test production delivering 28.5 MMSCFD gas and 450 barrels of condensate per day.'
  },
  {
    id: '3',
    title: 'Remittances reach $3.05 billion in October 2026, marking an 8-month consecutive expansion',
    category: 'Macro',
    source: 'State Bank of Pakistan',
    time: '6 hours ago',
    summary: 'Overseas Pakistani workers sent $3.05 billion during October via Roshan Digital Accounts and formal banking channels, bolstering SBP foreign exchange reserves.'
  },
  {
    id: '4',
    title: 'Meezan Bank reports record Q3 profit after tax of PKR 28.4 billion with interim dividend',
    category: 'Earnings',
    source: 'Company Financial Reports',
    time: '12 hours ago',
    summary: 'Total assets of the Islamic lender surpassed PKR 3.8 trillion while return on average equity stood at 38.6%, reinforcing its position as Pakistans premier Islamic financial institution.'
  }
];

export default function NewsPage() {
  const [filter, setFilter] = useState<string>('All');

  const filteredNews = filter === 'All' ? newsItems : newsItems.filter(n => n.category === filter);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 pl-60 flex flex-col min-w-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Market News &amp; Corporate Disclosures
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredNews.length} of {newsItems.length} articles • Active Filter: <strong className="text-slate-800">{filter}</strong>
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
              {['All', 'Macro', 'PSX Disclosures', 'Earnings'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    filter === cat ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredNews.map((news) => (
              <div key={news.id} className="terminal-card p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                      {news.category}
                    </span>
                    <span className="text-slate-600 font-medium">{news.source}</span>
                  </div>
                  <span className="text-slate-400 mono-num text-[11px]">{news.time}</span>
                </div>

                <h2 className="text-base font-semibold text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer">
                  {news.title}
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {news.summary}
                </p>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}
