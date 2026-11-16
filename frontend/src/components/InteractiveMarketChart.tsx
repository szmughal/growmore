'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/ThemeContext';

const timeRanges = ['1D', '1W', '1M', '3M', '1Y', '5Y'] as const;
type TimeRangeKey = typeof timeRanges[number];

const rangeSeriesMap: Record<TimeRangeKey, {
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  axisLabels: [string, string, string, string];
  points: { time: string; price: number; vol: number }[];
}> = {
  '1D': {
    basePrice: 103010,
    minPrice: 103000,
    maxPrice: 104600,
    axisLabels: ['09:30 AM (Open)', '11:30 AM', '01:30 PM', 'Live Stream'],
    points: [
      { time: '09:30', price: 103010, vol: 18 },
      { time: '10:00', price: 103420, vol: 32 },
      { time: '10:30', price: 103250, vol: 24 },
      { time: '11:00', price: 103890, vol: 45 },
      { time: '11:30', price: 103750, vol: 29 },
      { time: '12:00', price: 104100, vol: 52 },
      { time: '12:30', price: 103980, vol: 34 },
      { time: '13:00', price: 104350, vol: 61 },
      { time: '13:30', price: 104180, vol: 40 },
      { time: 'Live', price: 104285, vol: 48 },
    ],
  },
  '1W': {
    basePrice: 101200,
    minPrice: 100800,
    maxPrice: 104800,
    axisLabels: ['Mon', 'Tue', 'Thu', 'Live'],
    points: [
      { time: 'Mon AM', price: 101200, vol: 42 },
      { time: 'Mon PM', price: 101650, vol: 38 },
      { time: 'Tue AM', price: 101480, vol: 31 },
      { time: 'Tue PM', price: 102310, vol: 54 },
      { time: 'Wed AM', price: 102890, vol: 49 },
      { time: 'Wed PM', price: 102640, vol: 36 },
      { time: 'Thu AM', price: 103410, vol: 58 },
      { time: 'Thu PM', price: 103820, vol: 44 },
      { time: 'Fri AM', price: 104050, vol: 51 },
      { time: 'Live', price: 104285, vol: 63 },
    ],
  },
  '1M': {
    basePrice: 96400,
    minPrice: 95800,
    maxPrice: 105000,
    axisLabels: ['Week 1', 'Week 2', 'Week 3', 'Live'],
    points: [
      { time: 'Oct 15', price: 96400, vol: 35 },
      { time: 'Oct 19', price: 97250, vol: 41 },
      { time: 'Oct 22', price: 96980, vol: 28 },
      { time: 'Oct 26', price: 98420, vol: 52 },
      { time: 'Oct 30', price: 99610, vol: 60 },
      { time: 'Nov 03', price: 100450, vol: 47 },
      { time: 'Nov 06', price: 101890, vol: 55 },
      { time: 'Nov 10', price: 102400, vol: 49 },
      { time: 'Nov 12', price: 103520, vol: 58 },
      { time: 'Live', price: 104285, vol: 64 },
    ],
  },
  '3M': {
    basePrice: 84200,
    minPrice: 83500,
    maxPrice: 105200,
    axisLabels: ['Aug 2026', 'Sep 2026', 'Oct 2026', 'Live'],
    points: [
      { time: 'Aug 15', price: 84200, vol: 30 },
      { time: 'Aug 25', price: 85900, vol: 36 },
      { time: 'Sep 05', price: 87400, vol: 42 },
      { time: 'Sep 15', price: 89100, vol: 48 },
      { time: 'Sep 25', price: 91800, vol: 53 },
      { time: 'Oct 05', price: 94200, vol: 45 },
      { time: 'Oct 15', price: 96400, vol: 51 },
      { time: 'Oct 25', price: 99100, vol: 59 },
      { time: 'Nov 05', price: 101900, vol: 62 },
      { time: 'Live', price: 104285, vol: 65 },
    ],
  },
  '1Y': {
    basePrice: 64500,
    minPrice: 62000,
    maxPrice: 105500,
    axisLabels: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Live'],
    points: [
      { time: 'Dec 25', price: 64500, vol: 26 },
      { time: 'Jan 26', price: 68200, vol: 34 },
      { time: 'Feb 26', price: 71900, vol: 39 },
      { time: 'Apr 26', price: 75400, vol: 44 },
      { time: 'May 26', price: 79800, vol: 50 },
      { time: 'Jul 26', price: 83600, vol: 46 },
      { time: 'Aug 26', price: 88200, vol: 52 },
      { time: 'Sep 26', price: 93500, vol: 57 },
      { time: 'Oct 26', price: 98900, vol: 61 },
      { time: 'Live', price: 104285, vol: 65 },
    ],
  },
  '5Y': {
    basePrice: 43200,
    minPrice: 40000,
    maxPrice: 106000,
    axisLabels: ['2022', '2023', '2024', 'Live'],
    points: [
      { time: '2022 H1', price: 43200, vol: 20 },
      { time: '2022 H2', price: 41800, vol: 19 },
      { time: '2023 H1', price: 45600, vol: 25 },
      { time: '2023 H2', price: 54200, vol: 38 },
      { time: '2024 H1', price: 67800, vol: 46 },
      { time: '2024 H2', price: 78400, vol: 52 },
      { time: '2025 H1', price: 86900, vol: 55 },
      { time: '2025 H2', price: 94100, vol: 58 },
      { time: '2026 H1', price: 99800, vol: 62 },
      { time: 'Live', price: 104285, vol: 65 },
    ],
  },
};

export default function InteractiveMarketChart() {
  const { region, indices, lastTickTime } = useApp();
  const [activeRange, setActiveRange] = useState<TimeRangeKey>('1D');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const liveIdx = indices[region] || indices.KSE100;
  const series = rangeSeriesMap[activeRange];
  const multiplier = region === 'KMI30' ? 1.557 : region === 'KSE30' ? 0.315 : 1;

  // Use live intraday points for 1D, or inject live current index value at the tip of historical ranges
  const chartPoints =
    activeRange === '1D'
      ? liveIdx.intradayPoints
      : series.points.map((p, i) => ({
          time: i === series.points.length - 1 ? lastTickTime : p.time,
          price: i === series.points.length - 1 ? Math.round(liveIdx.value) : Math.round(p.price * multiplier),
          vol: p.vol,
        }));

  const prices = chartPoints.map((p) => p.price);
  const minPrice = Math.min(...prices) - 40;
  const maxPrice = Math.max(...prices) + 40;
  const basePrice = activeRange === '1D' ? Math.round(liveIdx.prevClose) : Math.round(series.basePrice * multiplier);

  const height = 180;
  const width = 600;

  const coords = chartPoints.map((pt, i) => {
    const x = (i / (chartPoints.length - 1)) * width;
    const y = height - ((pt.price - minPrice) / Math.max(1, maxPrice - minPrice)) * height;
    return { x, y, pt };
  });

  const pathD = coords.reduce((acc, c, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`, '');
  const activePoint = hoverIndex !== null && coords[hoverIndex] ? coords[hoverIndex] : coords[coords.length - 1];
  const pctReturn = (((activePoint.pt.price - basePrice) / basePrice) * 100).toFixed(2);
  const lastCoord = coords[coords.length - 1];

  return (
    <div className="terminal-card p-4">
      {/* Top Bar: Title & Metrics */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 live-beacon" />
            <span className="text-sm font-semibold text-slate-900">
              {region === 'KSE100' ? 'KSE 100' : region === 'KMI30' ? 'KMI 30' : 'KSE 30'} Index Trajectory ({activeRange})
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs mono-num">
            <span className="text-slate-500">At {activePoint.pt.time}:</span>
            <span className="text-slate-900 font-bold">{activePoint.pt.price.toLocaleString()}</span>
            <span className="text-emerald-600 font-semibold">
              +{pctReturn}%
            </span>
          </div>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => {
                setActiveRange(range);
                setHoverIndex(null);
              }}
              className={`px-2 py-0.5 text-xs font-medium rounded transition-colors mono-num ${
                activeRange === range
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Surface */}
      <div className="relative w-full h-48 select-none">
        <svg 
          className="w-full h-full overflow-visible" 
          viewBox={`0 0 ${width} ${height + 40}`} 
          preserveAspectRatio="none"
        >
          {/* Subtle Grid Lines */}
          <line x1="0" y1="45" x2={width} y2="45" stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1="0" y1="90" x2={width} y2="90" stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1="0" y1="135" x2={width} y2="135" stroke="#e2e8f0" strokeDasharray="3 3" />

          {/* Volume Bars */}
          {coords.map((c, i) => (
            <rect
              key={`vol-${i}`}
              x={c.x - 8}
              y={height + 10 + (30 - (c.pt.vol / 65) * 30)}
              width="16"
              height={(c.pt.vol / 65) * 30}
              fill={i === coords.length - 1 ? '#10b981' : '#cbd5e1'}
            />
          ))}

          {/* Area Fill */}
          <path
            d={`${pathD} L ${width} ${height} L 0 ${height} Z`}
            fill="rgba(5, 150, 105, 0.06)"
          />

          {/* Precision Price Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#059669"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Live Rightmost Tip Beacon */}
          {lastCoord && (
            <g>
              <circle cx={lastCoord.x} cy={lastCoord.y} r="6" fill="rgba(5, 150, 105, 0.2)" />
              <circle cx={lastCoord.x} cy={lastCoord.y} r="3.5" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}

          {/* Interactive Cursor */}
          {coords.map((c, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <rect x={c.x - 15} y="0" width="30" height={height + 40} fill="transparent" />
              {hoverIndex === i && (
                <>
                  <line
                    x1={c.x}
                    y1="0"
                    x2={c.x}
                    y2={height}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle cx={c.x} cy={c.y} r="4" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                </>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Axis Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-100 mono-num">
        <span>{series.axisLabels[0]}</span>
        <span>{series.axisLabels[1]}</span>
        <span>{series.axisLabels[2]}</span>
        <span className="text-emerald-700 font-semibold">Live ({lastTickTime})</span>
      </div>
    </div>
  );
}
