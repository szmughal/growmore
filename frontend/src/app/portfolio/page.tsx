'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight, 
  Upload, 
  PlusCircle,
  CheckCircle2
} from '@/components/Icons';

interface AssetHolding {
  id: string;
  name: string;
  symbol: string;
  category: 'Equities' | 'Mutual Funds' | 'Gold / Commodities' | 'Cash / Bank' | 'Real Estate';
  units: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedGain: number;
  gainPercent: number;
}

const initialHoldings: AssetHolding[] = [
  {
    id: '1',
    name: 'Oil & Gas Development Company',
    symbol: 'OGDC',
    category: 'Equities',
    units: 5000,
    avgBuyPrice: 122.50,
    currentPrice: 148.50,
    totalCost: 612500,
    currentValue: 742500,
    unrealizedGain: 130000,
    gainPercent: 21.22
  },
  {
    id: '2',
    name: 'Meezan Bank Limited',
    symbol: 'MEBL',
    category: 'Equities',
    units: 2500,
    avgBuyPrice: 195.00,
    currentPrice: 242.00,
    totalCost: 487500,
    currentValue: 605000,
    unrealizedGain: 117500,
    gainPercent: 24.10
  },
  {
    id: '3',
    name: 'Engro Corporation',
    symbol: 'ENGRO',
    category: 'Equities',
    units: 1200,
    avgBuyPrice: 310.00,
    currentPrice: 334.80,
    totalCost: 372000,
    currentValue: 401760,
    unrealizedGain: 29760,
    gainPercent: 8.00
  },
  {
    id: '4',
    name: 'Al-Meezan Sovereign Fund',
    symbol: 'MSF',
    category: 'Mutual Funds',
    units: 15000,
    avgBuyPrice: 50.00,
    currentPrice: 58.40,
    totalCost: 750000,
    currentValue: 876000,
    unrealizedGain: 126000,
    gainPercent: 16.80
  },
  {
    id: '5',
    name: 'Physical Gold Bar (24K, 1 Tola)',
    symbol: 'XAU-PKR',
    category: 'Gold / Commodities',
    units: 2,
    avgBuyPrice: 240000,
    currentPrice: 284500,
    totalCost: 480000,
    currentValue: 569000,
    unrealizedGain: 89000,
    gainPercent: 18.54
  }
];

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<AssetHolding[]>(initialHoldings);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Add Position Form State
  const [newSymbol, setNewSymbol] = useState<string>('LUCK');
  const [newName, setNewName] = useState<string>('Lucky Cement Limited');
  const [newCategory, setNewCategory] = useState<AssetHolding['category']>('Equities');
  const [newUnits, setNewUnits] = useState<number>(500);
  const [newBuyPrice, setNewBuyPrice] = useState<number>(810.00);
  const [newCurrPrice, setNewCurrPrice] = useState<number>(894.50);

  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = ((totalGain / totalCost) * 100).toFixed(2);

  const filteredHoldings = selectedCategory === 'All'
    ? holdings
    : holdings.filter(h => h.category === selectedCategory);

  const handleAddPosition = () => {
    const cost = newUnits * newBuyPrice;
    const val = newUnits * newCurrPrice;
    const gain = val - cost;
    const pct = cost > 0 ? (gain / cost) * 100 : 0;

    const item: AssetHolding = {
      id: String(Date.now()),
      symbol: newSymbol.toUpperCase() || 'SYS',
      name: newName || 'Systems Limited',
      category: newCategory,
      units: newUnits,
      avgBuyPrice: newBuyPrice,
      currentPrice: newCurrPrice,
      totalCost: cost,
      currentValue: val,
      unrealizedGain: gain,
      gainPercent: pct,
    };

    setHoldings((prev) => [item, ...prev]);
    setIsAddModalOpen(false);
    setStatusBanner(`Added position ${item.symbol} (${item.units.toLocaleString()} units) to portfolio.`);
  };

  const handleProcessImport = () => {
    const importedLot: AssetHolding = {
      id: String(Date.now()),
      symbol: 'FFC',
      name: 'Fauji Fertilizer Company (CDC Imported)',
      category: 'Equities',
      units: 1000,
      avgBuyPrice: 192.00,
      currentPrice: 218.40,
      totalCost: 192000,
      currentValue: 218400,
      unrealizedGain: 26400,
      gainPercent: 13.75,
    };
    setHoldings((prev) => [importedLot, ...prev]);
    setIsImportModalOpen(false);
    setStatusBanner('CDC Broker Statement parsed: Imported FFC (1,000 units @ PKR 192.00).');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          {/* Header */}
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Grow more Portfolio &amp; Multi-Asset Net Worth
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-asset tracking, KSE 100 benchmark comparison, and Capital Gains Tax (CGT) attribution
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-white border border-slate-200 text-xs text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Grow more Statement Import</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>
          </div>

          {statusBanner && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{statusBanner}</span>
              </div>
              <button onClick={() => setStatusBanner(null)} className="text-emerald-700 font-semibold">
                Dismiss
              </button>
            </div>
          )}

          {/* Portfolio Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="terminal-card p-4">
              <span className="text-xs text-slate-500 block mb-1">Total Net Worth</span>
              <div className="text-2xl font-bold text-slate-900 mono-num">
                PKR {totalValue.toLocaleString()}
              </div>
              <div className="flex items-center space-x-1 text-xs text-emerald-600 font-medium mono-num mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+PKR {totalGain.toLocaleString()} (+{totalGainPercent}%)</span>
              </div>
            </div>

            <div className="terminal-card p-4">
              <span className="text-xs text-slate-500 block mb-1">Benchmarked Return</span>
              <div className="text-lg font-semibold text-slate-900 mono-num">
                +{totalGainPercent}% vs KSE 100
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Alpha Generated: <span className="text-emerald-600 mono-num font-semibold">+6.4%</span>
              </div>
            </div>

            <div className="terminal-card p-4">
              <span className="text-xs text-slate-500 block mb-1">Capital Gains Tax (CGT)</span>
              <div className="text-lg font-semibold text-slate-900 mono-num">
                PKR 34,250
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Holding Period: &gt; 1 Year (10% Tier)
              </div>
            </div>

            <div className="terminal-card p-4">
              <span className="text-xs text-slate-500 block mb-1">Total Book Cost</span>
              <div className="text-lg font-semibold text-slate-800 mono-num">
                PKR {totalCost.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Cash Reserve: <span className="text-slate-900 font-medium mono-num">PKR 450,000</span>
              </div>
            </div>

          </div>

          {/* Asset Allocation Breakdown */}
          <div className="terminal-card p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-900">Asset Class Diversification</span>
              <span className="text-xs text-slate-500 mono-num">{holdings.length} Tracked Lots</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs mono-num">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block text-[10px]">Equities</span>
                <span className="text-slate-900 font-semibold text-sm">55.2%</span>
                <span className="text-slate-600 block text-[11px]">PKR 1.74M</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block text-[10px]">Mutual Funds</span>
                <span className="text-slate-900 font-semibold text-sm">27.4%</span>
                <span className="text-slate-600 block text-[11px]">PKR 876K</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block text-[10px]">Gold / Commodities</span>
                <span className="text-slate-900 font-semibold text-sm">17.8%</span>
                <span className="text-slate-600 block text-[11px]">PKR 569K</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block text-[10px]">Real Estate</span>
                <span className="text-slate-400 font-medium text-sm">0.0%</span>
                <span className="text-slate-400 block text-[11px]">Unallocated</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block text-[10px]">Cash / T-Bills</span>
                <span className="text-slate-400 font-medium text-sm">0.0%</span>
                <span className="text-slate-400 block text-[11px]">Unallocated</span>
              </div>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-900">Tracked Positions ({filteredHoldings.length})</span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
                {['All', 'Equities', 'Mutual Funds', 'Gold / Commodities'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded transition-colors font-medium ${
                      selectedCategory === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full financial-table text-left">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Category</th>
                    <th className="text-right">Units</th>
                    <th className="text-right">Avg Buy Price</th>
                    <th className="text-right">Current Price</th>
                    <th className="text-right">Total Cost</th>
                    <th className="text-right">Market Value</th>
                    <th className="text-right">Unrealized P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHoldings.map((h) => {
                    const isPositive = h.unrealizedGain >= 0;
                    return (
                      <tr key={h.id}>
                        <td>
                          <span className="font-semibold text-slate-900">{h.symbol}</span>
                          <span className="text-xs text-slate-500 block">{h.name}</span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {h.category}
                          </span>
                        </td>
                        <td className="text-right mono-num text-slate-800">{h.units.toLocaleString()}</td>
                        <td className="text-right mono-num text-slate-600">PKR {h.avgBuyPrice.toFixed(2)}</td>
                        <td className="text-right mono-num font-semibold text-slate-900">PKR {h.currentPrice.toFixed(2)}</td>
                        <td className="text-right mono-num text-slate-600">PKR {h.totalCost.toLocaleString()}</td>
                        <td className="text-right mono-num font-semibold text-slate-900">PKR {h.currentValue.toLocaleString()}</td>
                        <td className="text-right mono-num">
                          <span className={`inline-flex items-center text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                            {isPositive ? `+PKR ${h.unrealizedGain.toLocaleString()}` : `-PKR ${Math.abs(h.unrealizedGain).toLocaleString()}`}
                            <span className="text-[11px] ml-1">({h.gainPercent.toFixed(1)}%)</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Position Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="terminal-card max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-900 text-sm">Add New Portfolio Position</span>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-xs">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Ticker / Symbol</label>
                      <input
                        type="text"
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value)}
                        className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-900 mono-num"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Asset Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as AssetHolding['category'])}
                        className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                      >
                        <option value="Equities">Equities</option>
                        <option value="Mutual Funds">Mutual Funds</option>
                        <option value="Gold / Commodities">Gold / Commodities</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Asset / Company Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Units</label>
                      <input
                        type="number"
                        value={newUnits}
                        onChange={(e) => setNewUnits(Number(e.target.value))}
                        className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-slate-900 mono-num"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Buy Price</label>
                      <input
                        type="number"
                        value={newBuyPrice}
                        onChange={(e) => setNewBuyPrice(Number(e.target.value))}
                        className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-slate-900 mono-num"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Current Price</label>
                      <input
                        type="number"
                        value={newCurrPrice}
                        onChange={(e) => setNewCurrPrice(Number(e.target.value))}
                        className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-slate-900 mono-num"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button onClick={() => setIsAddModalOpen(false)} className="px-3 py-1.5 rounded text-xs text-slate-600 hover:text-slate-900">
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPosition}
                    className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  >
                    Save Position
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import Modal */}
          {isImportModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="terminal-card max-w-lg w-full p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-900 text-sm">Grow more Statement Parser</span>
                  </div>
                  <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-xs">
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  Upload an official statement from any Pakistani broker (Munir Khanani, AKD, Arif Habib, JS, KTrade, Sherman) or CDC statement. Transactions will be parsed automatically.
                </p>

                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-emerald-500/60 bg-slate-50/50 cursor-pointer transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-800 block font-medium">Drag and drop PDF or CSV broker statements</span>
                  <span className="text-[11px] text-slate-500 block mt-1">Supports CDC statement and trade logs</span>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button onClick={() => setIsImportModalOpen(false)} className="px-3 py-1.5 rounded text-xs text-slate-600 hover:text-slate-900">
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessImport}
                    className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  >
                    Process Statement
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
