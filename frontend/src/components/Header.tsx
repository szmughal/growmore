'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp, MarketRegion } from '@/context/ThemeContext';
import { 
  Search, 
  SlidersHorizontal,
  ArrowUpRight
} from '@/components/Icons';

interface HeaderProps {
  activeMarket?: MarketRegion;
  onMarketChange?: (market: MarketRegion) => void;
}

const quickSearchItems = [
  { code: 'OGDC', name: 'Oil & Gas Development Co (PSX)', type: 'Equity', href: '/fundamentals', meta: 'PKR 148.50 (+3.12%)' },
  { code: 'MEBL', name: 'Meezan Bank Limited (PSX)', type: 'Equity', href: '/fundamentals', meta: 'PKR 242.00 (+1.30%)' },
  { code: 'ENGRO', name: 'Engro Corporation (PSX)', type: 'Equity', href: '/fundamentals', meta: 'PKR 334.80 (+0.85%)' },
  { code: 'SYS', name: 'Systems Limited (PSX)', type: 'Equity', href: '/technicals', meta: 'PKR 462.10 (-1.10%)' },
  { code: 'LUCK', name: 'Lucky Cement Limited (PSX)', type: 'Equity', href: '/fundamentals', meta: 'PKR 894.50 (+1.38%)' },
  { code: 'ZAKAT', name: 'AAOIFI Shariah Equity Zakat Calculator', type: 'Tool', href: '/tools', meta: '2.5% Calculation' },
  { code: 'CHART', name: 'Grow more Advanced Charting & Auto-Pivots', type: 'Terminal', href: '/mychart', meta: 'KSE 100 / Fibs' },
  { code: 'CGT', name: 'Capital Gains Tax & Portfolio Net Worth', type: 'Wealth', href: '/portfolio', meta: '8 Asset Classes' },
];

export default function Header({ 
  onMarketChange 
}: HeaderProps) {
  const router = useRouter();
  const { region, setRegion } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          timeZone: 'Asia/Karachi'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMarketSelect = (code: MarketRegion) => {
    setRegion(code);
    if (onMarketChange) onMarketChange(code);
  };

  const filteredItems = quickSearchItems.filter(
    (item) =>
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full terminal-header">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6">
          
          {/* Left: PSX Index Switcher & Ticker Badges */}
          <div className="flex items-center space-x-3">
            <div
              role="tablist"
              aria-label="PSX Market Indices"
              className="flex items-center space-x-1 p-1 bg-slate-100 border border-slate-200 rounded-md"
            >
              <button
                role="tab"
                aria-selected={region === 'KSE100'}
                onClick={() => handleMarketSelect('KSE100')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                  region === 'KSE100' 
                    ? 'bg-[#0F172A] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                KSE 100
              </button>
              <button
                role="tab"
                aria-selected={region === 'KMI30'}
                onClick={() => handleMarketSelect('KMI30')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                  region === 'KMI30' 
                    ? 'bg-[#0F172A] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                KMI 30 (Shariah)
              </button>
              <button
                role="tab"
                aria-selected={region === 'KSE30'}
                onClick={() => handleMarketSelect('KSE30')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                  region === 'KSE30' 
                    ? 'bg-[#0F172A] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                KSE 30
              </button>
            </div>

            {/* Market Status & Clock */}
            <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-slate-200 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-[#0F172A] font-semibold">
                {region === 'KSE100' ? 'PSX KSE 100' : region === 'KMI30' ? 'PSX KMI 30' : 'PSX KSE 30'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="mono-num text-slate-700 font-medium">{currentTime || '09:30:00'}</span>
              <span className="text-slate-500 text-[10px] font-semibold">
                PKT
              </span>
            </div>
          </div>

          {/* Center: Quick Search Command Bar */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              aria-label="Open quick search command palette"
              className="w-full h-9 px-3 flex items-center justify-between text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-md text-slate-500 transition-colors"
            >
              <span className="flex items-center space-x-2 truncate">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Search PSX ticker, fund, ratio, or tool (ENGRO, DCF, Zakat)...</span>
              </span>
              <span className="flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600 font-semibold mono-num shrink-0 ml-2">
                <span>⌘K</span>
              </span>
            </button>
          </div>

          {/* Right: Currency, Screener, Import */}
          <div className="flex items-center space-x-2.5">
            {/* Currency Badge */}
            <div className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-[#0F172A] mono-num">
              PKR (Rs)
            </div>

            {/* Quick Screener Link */}
            <Link
              href="/screener"
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:text-[#0F172A] bg-white border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Screener</span>
            </Link>

            {/* Primary CTA: Grow more Import */}
            <Link
              href="/portfolio"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] shadow-xs transition-colors"
            >
              <span>Grow more Import</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Command Palette Modal (⌘K) */}
      {isCommandOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
          onClick={() => setIsCommandOpen(false)}
        >
          <div
            className="terminal-card max-w-lg w-full overflow-hidden shadow-xl border-slate-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-3.5 border-b border-slate-200 bg-white">
              <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a PSX symbol (OGDC, MEBL, SYS) or tool (Zakat, Chart, CGT)..."
                aria-label="Command search input"
                className="w-full h-11 text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              <button
                onClick={() => setIsCommandOpen(false)}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 hover:text-slate-800 mono-num"
              >
                ESC
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 bg-white">
              {filteredItems.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setIsCommandOpen(false);
                    router.push(item.href);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#0F172A] mono-num">{item.code}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600 block mt-0.5">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs mono-num font-semibold text-emerald-700">
                    <span>{item.meta}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
