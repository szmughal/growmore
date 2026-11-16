'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Calendar, Download } from '@/components/Icons';

interface Announcement {
  id: string;
  symbol: string;
  companyName: string;
  title: string;
  dateText: string;
  timeText: string;
  category: string;
  pdfUrl: string;
}

const sampleAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    symbol: 'OGDC',
    companyName: 'Oil & Gas Development Company Limited',
    title: 'Financial Results for the 1st Quarter Ended September 30, 2026 and Interim Cash Dividend',
    dateText: '14-Nov-2026',
    timeText: '14:35',
    category: 'Financial Results',
    pdfUrl: 'https://dps.psx.com.pk/download/document/241901.pdf',
  },
  {
    id: 'ann-2',
    symbol: 'SYS',
    companyName: 'Systems Limited',
    title: 'Board of Directors Meeting to Consider Third Quarter Financial Statements',
    dateText: '14-Nov-2026',
    timeText: '12:15',
    category: 'Board Meeting',
    pdfUrl: 'https://dps.psx.com.pk/download/document/241885.pdf',
  },
  {
    id: 'ann-3',
    symbol: 'ENGRO',
    companyName: 'Engro Corporation Limited',
    title: 'Material Information: Notice of Extraordinary General Meeting (EOGM) and Restructuring Scheme',
    dateText: '13-Nov-2026',
    timeText: '16:45',
    category: 'Material Information',
    pdfUrl: 'https://dps.psx.com.pk/download/document/241860.pdf',
  },
];

export default function AnnouncementsPage() {
  const [filter, setFilter] = useState<string>('All');

  const filtered = filter === 'All'
    ? sampleAnnouncements
    : sampleAnnouncements.filter(a => a.category === filter);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 pl-60 flex flex-col min-w-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                PSX Official Company Announcements
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Official regulatory disclosures, financial reports, board meetings, and AGM/EOGM circulars
              </p>
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
              {['All', 'Financial Results', 'Board Meeting', 'Material Information'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    filter === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-900">Disclosures Stream</span>
              </div>
              <span className="text-xs text-slate-500 mono-num">Direct DPS Feed</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-semibold text-slate-900 mono-num">{item.symbol}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600">{item.companyName}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-medium">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-sm text-slate-900 font-semibold">{item.title}</div>
                    <div className="text-xs text-slate-500 mono-num">
                      Filed: {item.dateText} at {item.timeText} PKT
                    </div>
                  </div>

                  <a
                    href={item.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-white border border-slate-200 text-xs text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors shrink-0 font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download PDF</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
