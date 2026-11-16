'use client';

import React from 'react';
import { useApp } from '@/context/ThemeContext';
import { Gauge } from '@/components/Icons';

export default function FearGreedGauge() {
  const { sentimentScore, lastTickTime } = useApp();
  const score = sentimentScore;
  const label = score >= 70 ? 'Strong Greed' : score >= 55 ? 'Greed' : 'Neutral';

  const factors = [
    { name: 'Market Momentum (125-DMA)', value: 'Strong Bullish', score: 78 },
    { name: 'Stock Price Breadth', value: 'Moderate Bullish', score: 64 },
    { name: 'Market Volatility (PSXV)', value: 'Low Volatility', score: 72 },
    { name: 'Safe Haven Demand', value: 'Risk On', score: 58 },
  ];

  return (
    <div className="terminal-card p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">Sentiment &amp; Risk Index</span>
          </div>
          <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 mono-num font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 live-beacon" />
            <span>{lastTickTime}</span>
          </span>
        </div>

        {/* Gauge Center Dial */}
        <div className="flex items-center justify-center my-3">
          <div className="relative flex flex-col items-center">
            <svg className="w-40 h-22 overflow-visible" viewBox="0 0 160 90">
              <path
                d="M 15 80 A 65 65 0 0 1 145 80"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 15 80 A 65 65 0 0 1 145 80"
                fill="none"
                stroke="#059669"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="204"
                strokeDashoffset={204 - (204 * score) / 100}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>

            <div className="text-center -mt-8">
              <span className="text-2xl font-bold text-slate-900 mono-num block">{score}</span>
              <span className="text-xs font-semibold text-emerald-600">{label}</span>
            </div>
          </div>
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-[10px] text-slate-500 px-3 -mt-1 mono-num">
          <span>0 Extreme Fear</span>
          <span>50</span>
          <span>100 Greed</span>
        </div>

        {/* Factor breakdown */}
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          {factors.map((f) => (
            <div key={f.name} className="flex items-center justify-between text-xs">
              <span className="text-slate-600">{f.name}</span>
              <span className="text-slate-900 mono-num text-[11px] font-medium">
                {f.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Previous Close</span>
        <span className="text-slate-700 mono-num font-medium">65 (Greed)</span>
      </div>
    </div>
  );
}
