'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Wallet, PlusCircle, CheckCircle2 } from '@/components/Icons';

interface ExpenseItem {
  id: string;
  title: string;
  category: 'Housing' | 'Utilities' | 'Investments' | 'Healthcare' | 'Education' | 'Discretionary';
  amount: number;
  date: string;
  isRecurring: boolean;
  paymentMethod: 'Bank Transfer' | 'Card' | 'Cash';
}

const sampleExpenses: ExpenseItem[] = [
  { id: '1', title: 'Monthly Equities SIP', category: 'Investments', amount: 50000, date: '2026-11-10', isRecurring: true, paymentMethod: 'Bank Transfer' },
  { id: '2', title: 'House Rental / Mortgage', category: 'Housing', amount: 85000, date: '2026-11-05', isRecurring: true, paymentMethod: 'Bank Transfer' },
  { id: '3', title: 'Electricity (K-Electric / LESCO)', category: 'Utilities', amount: 32400, date: '2026-11-08', isRecurring: true, paymentMethod: 'Bank Transfer' },
  { id: '4', title: 'Groceries & Provisions', category: 'Discretionary', amount: 28500, date: '2026-11-12', isRecurring: false, paymentMethod: 'Card' },
  { id: '5', title: 'Family Healthcare & Insurance', category: 'Healthcare', amount: 14000, date: '2026-11-02', isRecurring: true, paymentMethod: 'Bank Transfer' },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(sampleExpenses);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('Internet & Fiber (PTCL Flash)');
  const [category, setCategory] = useState<ExpenseItem['category']>('Utilities');
  const [amount, setAmount] = useState<number>(6500);
  const [paymentMethod, setPaymentMethod] = useState<ExpenseItem['paymentMethod']>('Bank Transfer');
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const totalOutflow = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSaveExpense = () => {
    const newItem: ExpenseItem = {
      id: String(Date.now()),
      title: title || 'New Expense Item',
      category,
      amount: Number(amount) || 0,
      date: '2026-11-15',
      isRecurring,
      paymentMethod,
    };
    setExpenses((prev) => [newItem, ...prev]);
    setIsModalOpen(false);
    setStatusMsg(`Recorded expense "${newItem.title}" (PKR ${newItem.amount.toLocaleString()}) into ledger.`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 lg:pl-60 pl-0 flex flex-col min-w-0 w-full pb-16 lg:pb-0">
        <Header />

        <main className="p-4 sm:p-6 space-y-6 max-w-[1520px] w-full mx-auto">
          
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Expenses &amp; Personal Cashflow Ledger
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Category budgets, recurring obligations, debt amortization, and monthly burn rate
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Transaction</span>
            </button>
          </div>

          {statusMsg && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{statusMsg}</span>
              </div>
              <button onClick={() => setStatusMsg(null)} className="text-emerald-700 font-semibold">
                Dismiss
              </button>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="terminal-card p-4">
              <span className="text-xs text-slate-500 block mb-1">Monthly Cash Outflow</span>
              <div className="text-2xl font-bold text-slate-900 mono-num">
                PKR {totalOutflow.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">November 2026 MTD</span>
            </div>

            <div className="terminal-card p-4">
              <span className="text-xs text-slate-500 block mb-1">Savings Rate</span>
              <div className="text-lg font-semibold text-emerald-600 mono-num">
                38.5% of Income
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Target: 40%</span>
            </div>

            <div className="terminal-card p-4">
              <span className="text-xs text-slate-500 block mb-1">Fixed Obligations</span>
              <div className="text-lg font-semibold text-slate-900 mono-num">
                PKR 181,400
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Rent, utilities, insurance</span>
            </div>

            <div className="terminal-card p-4">
              <span className="text-xs text-slate-500 block mb-1">Investments Outflow</span>
              <div className="text-lg font-semibold text-emerald-600 mono-num">
                PKR 50,000
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Automated monthly SIP</span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-900">Transaction History</span>
              </div>
              <span className="text-xs text-slate-500 mono-num">{expenses.length} Recorded Items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full financial-table text-left">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Method</th>
                    <th>Type</th>
                    <th className="text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="mono-num text-xs text-slate-500">{e.date}</td>
                      <td className="font-semibold text-slate-900">{e.title}</td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {e.category}
                        </span>
                      </td>
                      <td className="text-xs text-slate-600">{e.paymentMethod}</td>
                      <td>
                        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${e.isRecurring ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                          {e.isRecurring ? 'Recurring' : 'One-off'}
                        </span>
                      </td>
                      <td className="text-right mono-num font-semibold text-slate-900">
                        PKR {e.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Record Transaction Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="terminal-card max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-900 text-sm">Record New Cashflow Transaction</span>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-xs">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Description / Payee</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ExpenseItem['category'])}
                        className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                      >
                        <option value="Utilities">Utilities</option>
                        <option value="Housing">Housing</option>
                        <option value="Investments">Investments</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Discretionary">Discretionary</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Amount (PKR)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-900 mono-num"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center pt-1">
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as ExpenseItem['paymentMethod'])}
                        className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2 pt-5">
                      <input
                        id="rec-check"
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded"
                      />
                      <label htmlFor="rec-check" className="text-slate-800 font-medium cursor-pointer">
                        Recurring Monthly
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 rounded text-xs text-slate-600 hover:text-slate-900">
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveExpense}
                    className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  >
                    Save Transaction
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
