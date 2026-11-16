'use client';

import React, { useState } from 'react';
import { Icons } from './Icons';

interface AnnouncementItem {
  id: string;
  symbol: string;
  title: string;
  announcedAt: string;
  pdfUrl?: string;
  dateText?: string;
  timeText?: string;
}

interface NewsItemDisplay {
  id: string;
  headline: string;
  publisher: string;
  articleUrl: string;
  publishedAt: string;
  market: string;
  summary: string;
}

interface AnnouncementsAndNewsFeedProps {
  announcements?: AnnouncementItem[];
  news?: NewsItemDisplay[];
}

export function AnnouncementsAndNewsFeed({
  announcements,
  news,
}: AnnouncementsAndNewsFeedProps) {
  const [activeTab, setActiveTab] = useState<'announcements' | 'news'>('announcements');

  const defaultAnnouncements: AnnouncementItem[] = [
    {
      id: 'ann-1',
      symbol: 'OGDC',
      title: 'Notice of Board Meeting to consider Financial Results for the Period ended Sept 30, 2026',
      announcedAt: '2026-11-13T16:45:00Z',
      dateText: '14-Nov',
      timeText: '16:45',
      pdfUrl: 'https://dps.psx.com.pk/download/document/241901.pdf',
    },
    {
      id: 'ann-2',
      symbol: 'LUCK',
      title: 'Declaration of Interim Cash Dividend of PKR 15.00 per share (150%)',
      announcedAt: '2026-11-13T15:30:00Z',
      dateText: '13-Nov',
      timeText: '15:30',
      pdfUrl: 'https://dps.psx.com.pk/download/document/241712.pdf',
    },
    {
      id: 'ann-3',
      symbol: 'SYS',
      title: 'Material Information: Expansion of Middle East Cloud Engineering Center',
      announcedAt: '2026-11-13T14:15:00Z',
      dateText: '13-Nov',
      timeText: '14:15',
      pdfUrl: 'https://dps.psx.com.pk/download/document/241885.pdf',
    },
    {
      id: 'ann-4',
      symbol: 'ENGRO',
      title: 'Corporate Restructuring & Scheme of Arrangement Filing with SECP',
      announcedAt: '2026-11-12T11:20:00Z',
      dateText: '12-Nov',
      timeText: '11:20',
      pdfUrl: 'https://dps.psx.com.pk/download/document/241760.pdf',
    },
  ];

  const defaultNews: NewsItemDisplay[] = [
    {
      id: 'news-1',
      headline: 'KSE-100 rallies past 93,500 points as inflation softens to 7.2% YoY',
      publisher: 'Business Recorder',
      articleUrl: 'https://www.brecorder.com/markets',
      publishedAt: '2 hours ago',
      market: 'PK',
      summary: 'Equities opened on a strong footing with sustained institutional accumulation in energy and banking counters.',
    },
    {
      id: 'news-2',
      headline: 'SBP MPC confirms cumulative 700 bps monetary policy easing cycle',
      publisher: 'Dawn News',
      articleUrl: 'https://www.dawn.com/business',
      publishedAt: '4 hours ago',
      market: 'PK',
      summary: 'Central bank Governor highlighted robust current account surplus and improving foreign exchange buffers.',
    },
    {
      id: 'news-3',
      headline: 'Overseas remittances cross $3.05 billion in October, setting new monthly record',
      publisher: 'Profit Pakistan',
      articleUrl: 'https://profit.pakistantoday.com.pk',
      publishedAt: '6 hours ago',
      market: 'PK',
      summary: 'Inflows from GCC and UK diaspora bolstered the State Bank foreign reserves to $11.2 billion.',
    },
  ];

  const announcementList = announcements || defaultAnnouncements;
  const newsList = news || defaultNews;

  return (
    <div className="relative flex flex-col rounded-2xl glass-card overflow-hidden">
      {/* Top Header & Tab Pill Switcher */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Real-Time Wire
          </h3>
        </div>

        {/* Tab Pills */}
        <div className="flex rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 dark:border-white/10 dark:bg-slate-900/60 shadow-inner">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              activeTab === 'announcements'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Disclosures
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              activeTab === 'news'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Syndicated
          </button>
        </div>
      </div>

      {/* Content Feed */}
      <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[380px] overflow-y-auto">
        {activeTab === 'announcements' ? (
          announcementList.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-emerald-500/[0.03] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {item.symbol}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.dateText} • {item.timeText} PKT
                  </span>
                </div>
                {item.pdfUrl && (
                  <a
                    href={item.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    <Icons.FileText size={12} />
                    DPS PDF
                  </a>
                )}
              </div>
              <h4 className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-800 dark:text-slate-200 line-clamp-2">
                {item.title}
              </h4>
            </div>
          ))
        ) : (
          newsList.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-emerald-500/[0.03] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {item.publisher}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {item.publishedAt}
                </span>
              </div>
              <h4 className="mt-1.5 text-xs font-bold leading-relaxed text-slate-900 dark:text-white line-clamp-2">
                {item.headline}
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
              <div className="mt-2 flex items-center justify-end">
                <a
                  href={item.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  Read Story
                  <Icons.ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
