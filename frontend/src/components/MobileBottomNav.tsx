'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/ThemeContext';
import {
  LayoutDashboard,
  Globe,
  Activity,
  Briefcase,
  Menu
} from '@/components/Icons';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { setIsMobileMenuOpen } = useApp();

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg safe-bottom"
    >
      <Link
        href="/"
        className={`flex flex-col items-center py-1 px-3 rounded-md text-[10px] font-semibold transition-colors ${
          isLinkActive('/')
            ? 'text-[#059669]'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>Overview</span>
      </Link>

      <Link
        href="/markets"
        className={`flex flex-col items-center py-1 px-3 rounded-md text-[10px] font-semibold transition-colors ${
          isLinkActive('/markets')
            ? 'text-[#059669]'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Globe className="w-5 h-5 mb-0.5" />
        <span>Markets</span>
      </Link>

      <Link
        href="/technicals"
        className={`flex flex-col items-center py-1 px-3 rounded-md text-[10px] font-semibold transition-colors ${
          isLinkActive('/technicals')
            ? 'text-[#059669]'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Activity className="w-5 h-5 mb-0.5" />
        <span>Technicals</span>
      </Link>

      <Link
        href="/portfolio"
        className={`flex flex-col items-center py-1 px-3 rounded-md text-[10px] font-semibold transition-colors ${
          isLinkActive('/portfolio')
            ? 'text-[#059669]'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Briefcase className="w-5 h-5 mb-0.5" />
        <span>Portfolio</span>
      </Link>

      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(true)}
        className="flex flex-col items-center py-1 px-3 rounded-md text-[10px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span>Menu</span>
      </button>
    </nav>
  );
}
