'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LineChart,
  Activity,
  Layers,
  Briefcase,
  Wallet,
  Compass,
  FileSpreadsheet,
  Globe,
  SlidersHorizontal,
  Calculator,
  Bell,
  MessageSquare,
  ShieldCheck,
  GrowMoreLogo
} from '@/components/Icons';

const mainNavigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard, badge: 'Live' },
  { name: 'Markets', href: '/markets', icon: Globe },
  { name: 'Technicals', href: '/technicals', icon: Activity },
  { name: 'Fundamentals', href: '/fundamentals', icon: Layers },
  { name: 'Advanced Charts', href: '/mychart', icon: LineChart },
  { name: 'Screener', href: '/screener', icon: SlidersHorizontal },
];

const wealthNavigation = [
  { name: 'Portfolio & Net Worth', href: '/portfolio', icon: Briefcase },
  { name: 'Expenses & Budget', href: '/expenses', icon: Wallet },
  { name: 'Tools & Calculators', href: '/tools', icon: Calculator },
];

const intelligenceNavigation = [
  { name: 'Macro & Economy', href: '/macro', icon: Compass },
  { name: 'News & Disclosures', href: '/news', icon: Bell },
  { name: 'Mutual Funds', href: '/funds', icon: FileSpreadsheet },
  { name: 'Community & Transp.', href: '/community', icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      aria-label="Primary Sidebar Navigation"
      className="fixed left-0 top-0 bottom-0 z-50 w-60 bg-white border-r border-slate-200 flex flex-col justify-between select-none"
    >
      {/* Top: Brand Identity Header */}
      <div>
        <div className="flex items-center h-14 px-4 border-b border-slate-200 bg-white">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <GrowMoreLogo size={28} className="shrink-0 transition-transform duration-150 group-hover:scale-105" />
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-[15px] font-bold text-[#0F172A] tracking-tight leading-none">
                  Grow more
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded bg-[#0F172A] text-white leading-none">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 mt-1 leading-none">
                Know Where You Stand
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-3.5 space-y-5 overflow-y-auto max-h-[calc(100vh-128px)]">
          
          {/* Main Terminal */}
          <div>
            <div className="px-2.5 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Market Terminal
            </div>
            <nav aria-label="Market Terminal" className="space-y-0.5">
              {mainNavigation.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-all ${
                      active
                        ? 'bg-[#0F172A] text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100/80 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] mono-num px-1.5 py-0.5 rounded font-semibold ${
                          active
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Wealth & Tracking */}
          <div>
            <div className="px-2.5 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Wealth & Tax
            </div>
            <nav aria-label="Wealth & Tax" className="space-y-0.5">
              {wealthNavigation.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-xs transition-all ${
                      active
                        ? 'bg-[#0F172A] text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100/80 font-medium'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Intelligence & Resources */}
          <div>
            <div className="px-2.5 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Research & Macro
            </div>
            <nav aria-label="Research & Macro" className="space-y-0.5">
              {intelligenceNavigation.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-xs transition-all ${
                      active
                        ? 'bg-[#0F172A] text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100/80 font-medium'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

        </div>
      </div>

      {/* Bottom: Brand Trust & Transparency Pledge */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-800 font-semibold">PSX Live Feed</span>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 mono-num">
            0% Ads
          </span>
        </div>
      </div>

    </aside>
  );
}
