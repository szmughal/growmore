'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Icons } from '@/components/Icons';

interface ProviderTelemetry {
  serviceName: string;
  circuitState: string;
  failureCount: number;
  lastFailureTime: string | null;
  lastSuccessTime: string | null;
  rateLimitLoadPct: number;
  rateLimitMaxRequests: number;
  rateLimitWindowSeconds: number;
  defaultCacheTtl: number;
}

interface MarketOpsTelemetry {
  providers: ProviderTelemetry[];
  cacheStats: {
    total_entries: number;
    active_entries: number;
    expired_entries: number;
    sample_keys: string[];
  };
  ingestionWorker: {
    is_running: boolean;
    last_sync_time: string | null;
    sync_count: number;
    error_count: number;
    last_error: string | null;
  };
  timestamp: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  rolesDistribution: Record<string, number>;
  totalPortfolios: number;
  totalAssetsTracked: number;
  totalTransactions: number;
  totalLiabilities: number;
  databaseTableCounts: Record<string, number>;
  serverTime: string;
  environment: string;
}

interface GovernanceConfig {
  defaultRiskFreeRate: number;
  defaultEquityRiskPremium: number;
  perpetualGrowthRateMin: number;
  perpetualGrowthRateMax: number;
  defaultTaxRate: number;
  shariahDebtToEquityThreshold: number;
  shariahIlliquidAssetsThreshold: number;
  shariahNonCompliantIncomeThreshold: number;
  updatedAt: string;
  updatedBy: string | null;
}

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'governance' | 'audit'>('overview');

  // State
  const [stats] = useState<SystemStats>({
    totalUsers: 14,
    activeUsers: 13,
    inactiveUsers: 1,
    verifiedUsers: 12,
    rolesDistribution: { admin: 2, advisor: 3, user: 9 },
    totalPortfolios: 8,
    totalAssetsTracked: 42,
    totalTransactions: 168,
    totalLiabilities: 6,
    databaseTableCounts: {
      users: 14,
      portfolios: 8,
      portfolio_assets: 42,
      transactions: 168,
      liabilities: 6,
      companies: 524,
      historical_bars: 2180,
      mutual_funds: 285,
      audit_records: 39,
      api_logs: 1420
    },
    serverTime: new Date().toISOString(),
    environment: 'production'
  });

  const [telemetry, setTelemetry] = useState<MarketOpsTelemetry>({
    providers: [
      { serviceName: 'PSXDataPortal', circuitState: 'CLOSED', failureCount: 0, lastFailureTime: null, lastSuccessTime: new Date().toISOString(), rateLimitLoadPct: 15.0, rateLimitMaxRequests: 60, rateLimitWindowSeconds: 60, defaultCacheTtl: 60 },
      { serviceName: 'USMarketsYahoo', circuitState: 'CLOSED', failureCount: 0, lastFailureTime: null, lastSuccessTime: new Date().toISOString(), rateLimitLoadPct: 8.5, rateLimitMaxRequests: 60, rateLimitWindowSeconds: 60, defaultCacheTtl: 60 },
      { serviceName: 'NCCPLSmartMoneyAPI', circuitState: 'CLOSED', failureCount: 0, lastFailureTime: null, lastSuccessTime: new Date().toISOString(), rateLimitLoadPct: 5.0, rateLimitMaxRequests: 30, rateLimitWindowSeconds: 60, defaultCacheTtl: 120 },
      { serviceName: 'CoinGeckoCrypto', circuitState: 'CLOSED', failureCount: 0, lastFailureTime: null, lastSuccessTime: new Date().toISOString(), rateLimitLoadPct: 20.0, rateLimitMaxRequests: 30, rateLimitWindowSeconds: 60, defaultCacheTtl: 120 },
      { serviceName: 'ForexRatesAPI', circuitState: 'CLOSED', failureCount: 0, lastFailureTime: null, lastSuccessTime: new Date().toISOString(), rateLimitLoadPct: 10.0, rateLimitMaxRequests: 30, rateLimitWindowSeconds: 60, defaultCacheTtl: 300 },
      { serviceName: 'CommoditiesAndBullionAPI', circuitState: 'CLOSED', failureCount: 0, lastFailureTime: null, lastSuccessTime: new Date().toISOString(), rateLimitLoadPct: 12.0, rateLimitMaxRequests: 30, rateLimitWindowSeconds: 60, defaultCacheTtl: 300 },
      { serviceName: 'MUFAPMutualFundsAPI', circuitState: 'CLOSED', failureCount: 0, lastFailureTime: null, lastSuccessTime: new Date().toISOString(), rateLimitLoadPct: 2.0, rateLimitMaxRequests: 30, rateLimitWindowSeconds: 60, defaultCacheTtl: 3600 },
      { serviceName: 'PakistanMacroEconomyAPI', circuitState: 'CLOSED', failureCount: 0, lastFailureTime: null, lastSuccessTime: new Date().toISOString(), rateLimitLoadPct: 1.0, rateLimitMaxRequests: 30, rateLimitWindowSeconds: 60, defaultCacheTtl: 43200 },
      { serviceName: 'FinancialNewsFeed', circuitState: 'CLOSED', failureCount: 0, lastFailureTime: null, lastSuccessTime: new Date().toISOString(), rateLimitLoadPct: 18.0, rateLimitMaxRequests: 30, rateLimitWindowSeconds: 60, defaultCacheTtl: 900 }
    ],
    cacheStats: { total_entries: 48, active_entries: 44, expired_entries: 4, sample_keys: ['market:snapshot:pk:core', 'crypto:snapshot:all', 'forex:snapshot:all'] },
    ingestionWorker: { is_running: true, last_sync_time: new Date().toISOString(), sync_count: 240, error_count: 0, last_error: null },
    timestamp: new Date().toISOString()
  });

  const [governance, setGovernance] = useState<GovernanceConfig>({
    defaultRiskFreeRate: 0.14,
    defaultEquityRiskPremium: 0.06,
    perpetualGrowthRateMin: 0.015,
    perpetualGrowthRateMax: 0.045,
    defaultTaxRate: 0.29,
    shariahDebtToEquityThreshold: 0.37,
    shariahIlliquidAssetsThreshold: 0.25,
    shariahNonCompliantIncomeThreshold: 0.05,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin@growmore.pk'
  });

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleResetCircuitBreaker = (serviceName: string) => {
    setTelemetry(prev => ({
      ...prev,
      providers: prev.providers.map(p => 
        p.serviceName === serviceName ? { ...p, circuitState: 'CLOSED', failureCount: 0 } : p
      )
    }));
    setActionMessage(`Circuit breaker for ${serviceName} reset to CLOSED.`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleClearCache = () => {
    setTelemetry(prev => ({
      ...prev,
      cacheStats: { ...prev.cacheStats, total_entries: 0, active_entries: 0, expired_entries: 0 }
    }));
    setActionMessage('Market data cache store flushed successfully.');
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleWarmCache = () => {
    setTelemetry(prev => ({
      ...prev,
      cacheStats: { ...prev.cacheStats, total_entries: 48, active_entries: 48 }
    }));
    setActionMessage('Background cache warming cycle initiated across all providers.');
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 pl-60 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          {/* Header Title & Notification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Icons.Shield className="h-4 w-4" />
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Admin & Operations Control Center
                </h1>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Systems Operational
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Platform telemetry, provider circuit breakers, rate limits, user governance, and security audit logs.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleWarmCache}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl glass-pill text-indigo-600 dark:text-indigo-400 hover:scale-[1.02] transition-all"
              >
                <Icons.Activity className="h-3.5 w-3.5" />
                Warm All Caches
              </button>
              <button
                onClick={handleClearCache}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl glass-pill text-rose-600 dark:text-rose-400 hover:scale-[1.02] transition-all"
              >
                <Icons.Refresh className="h-3.5 w-3.5" />
                Flush Cache
              </button>
            </div>
          </div>

          {/* Action Notification Alert */}
          {actionMessage && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{actionMessage}</span>
              </div>
              <button onClick={() => setActionMessage(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 transition-colors ${activeTab === 'overview' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              System Overview
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`pb-3 transition-colors ${activeTab === 'providers' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              Market Providers & Circuit Breakers ({telemetry.providers.length})
            </button>
            <button
              onClick={() => setActiveTab('governance')}
              className={`pb-3 transition-colors ${activeTab === 'governance' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              Valuation & Shariah Governance
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 transition-colors ${activeTab === 'audit' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              Security Audit Trail
            </button>
          </div>

          {/* TAB 1: System Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Total Registered Users</span>
                    <Icons.User className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.activeUsers} active</span>
                    <span>• {stats.rolesDistribution.admin || 2} admins • {stats.rolesDistribution.advisor || 3} advisors</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Portfolios Tracked</span>
                    <Icons.Briefcase className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPortfolios}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {stats.totalAssetsTracked} total holdings across equities & crypto
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Recorded Transactions</span>
                    <Icons.ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTransactions}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    FIFO multi-lot cost-basis allocated
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Ingestion Worker Cycles</span>
                    <Icons.Layers className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{telemetry.ingestionWorker.sync_count}</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Recurring 60s background cycle active
                  </div>
                </div>
              </div>

              {/* Database Table Health Breakdown */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                  Database Table Record Density (SQLAlchemy 2.0 Normalized Store)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(stats.databaseTableCounts).map(([table, count]) => (
                    <div key={table} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">{table}</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{count.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Providers & Circuit Breakers */}
          {activeTab === 'providers' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Provider Service</th>
                      <th className="px-4 py-3">Circuit State</th>
                      <th className="px-4 py-3">Failures</th>
                      <th className="px-4 py-3">Rate Limit Load</th>
                      <th className="px-4 py-3">Window Quota</th>
                      <th className="px-4 py-3">Cache TTL</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {telemetry.providers.map((p) => {
                      const isClosed = p.circuitState === 'CLOSED';
                      return (
                        <tr key={p.serviceName} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            {p.serviceName}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              isClosed
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isClosed ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
                              {p.circuitState}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">
                            {p.failureCount} / 3
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${p.rateLimitLoadPct > 80 ? 'bg-rose-500' : p.rateLimitLoadPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${Math.min(p.rateLimitLoadPct, 100)}%` }}
                                />
                              </div>
                              <span className="font-mono text-slate-500 text-[11px]">{p.rateLimitLoadPct.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            {p.rateLimitMaxRequests} req / {p.rateLimitWindowSeconds}s
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            {p.defaultCacheTtl}s
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleResetCircuitBreaker(p.serviceName)}
                              className="px-2.5 py-1 text-[11px] font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              Reset Breaker
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Valuation & Shariah Governance */}
          {activeTab === 'governance' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Financial Valuation Heuristics & Shariah Screening Thresholds
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adjust platform-wide assumptions for DCF valuation models, discount rates, and Meezan Shariah criteria.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Default Risk-Free Rate (PKRV 10Y Yield)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={governance.defaultRiskFreeRate}
                    onChange={(e) => setGovernance({ ...governance, defaultRiskFreeRate: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">{(governance.defaultRiskFreeRate * 100).toFixed(2)}% benchmark yield</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Equity Risk Premium (ERP)
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    value={governance.defaultEquityRiskPremium}
                    onChange={(e) => setGovernance({ ...governance, defaultEquityRiskPremium: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">{(governance.defaultEquityRiskPremium * 100).toFixed(1)}% market premium</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Tax Rate (Pakistan)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={governance.defaultTaxRate}
                    onChange={(e) => setGovernance({ ...governance, defaultTaxRate: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">{(governance.defaultTaxRate * 100).toFixed(0)}% statutory tax</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Meezan Debt-to-Equity Cap
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={governance.shariahDebtToEquityThreshold}
                    onChange={(e) => setGovernance({ ...governance, shariahDebtToEquityThreshold: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Maximum 37% interest-bearing debt</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Illiquid Assets Minimum
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={governance.shariahIlliquidAssetsThreshold}
                    onChange={(e) => setGovernance({ ...governance, shariahIlliquidAssetsThreshold: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Minimum 25% tangible illiquid assets</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Non-Compliant Income Cap
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={governance.shariahNonCompliantIncomeThreshold}
                    onChange={(e) => setGovernance({ ...governance, shariahNonCompliantIncomeThreshold: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Maximum 5% haram income requiring purification</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    setActionMessage('Valuation and Shariah governance parameters updated and logged to audit trail.');
                    setTimeout(() => setActionMessage(null), 4000);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                >
                  Save Governance Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Audit Trail */}
          {activeTab === 'audit' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Administrative Security & State Modification Events
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                {[
                  { action: 'UPDATE_GOVERNANCE', resource: 'valuation_governance', admin: 'admin@growmore.pk', ip: '127.0.0.1', time: '2 minutes ago' },
                  { action: 'RESET_CIRCUIT_BREAKER', resource: 'PSXDataPortal', admin: 'admin@growmore.pk', ip: '127.0.0.1', time: '14 minutes ago' },
                  { action: 'FLUSH_CACHE', resource: 'cache_service', admin: 'admin@growmore.pk', ip: '127.0.0.1', time: '1 hour ago' },
                  { action: 'PROMOTE_USER_ROLE', resource: 'user_e92bf18', admin: 'admin@growmore.pk', ip: '127.0.0.1', time: '3 hours ago' },
                  { action: 'WARM_CACHE_CYCLE', resource: 'ingestion_worker', admin: 'system_auto', ip: 'localhost', time: '4 hours ago' }
                ].map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.action}</span>
                      <span className="text-slate-500">[{item.resource}]</span>
                      <span className="text-slate-400">by {item.admin}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">{item.time} ({item.ip})</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
