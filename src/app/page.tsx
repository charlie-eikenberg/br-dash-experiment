'use client';

import { useState, useEffect, useMemo } from 'react';
import { Account, ReviewStatus } from '@/types';
import { getAccounts, saveAccount, saveAccounts } from '@/lib/storage';
import { initializeSampleData } from '@/data/sampleData';
import { AccountList, AccountDetail, DashboardStats, ManagerDashboard } from '@/components';
import { LayoutDashboard, List, Users, Download, Upload, Clock, AlertTriangle } from 'lucide-react';
import { exportAllData, importData } from '@/lib/storage';
import { startOfWeek, endOfWeek, isWithinInterval, isTuesday, isAfter } from 'date-fns';

type View = 'dashboard' | 'accounts' | 'manager';

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [showWeeklyPrompt, setShowWeeklyPrompt] = useState(true);

  useEffect(() => {
    // Initialize sample data if needed
    initializeSampleData();
    // Load accounts
    const loadedAccounts = getAccounts();
    setAccounts(loadedAccounts);
    setIsLoading(false);
  }, []);

  // Calculate accounts needing decisions this week
  const accountsNeedingDecisions = useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

    return accounts.filter((account) => {
      const hasDecisionThisWeek = account.decisions.some((d) => {
        const decisionDate = new Date(d.date);
        return isWithinInterval(decisionDate, { start: thisWeekStart, end: thisWeekEnd });
      });
      return !hasDecisionThisWeek;
    });
  }, [accounts]);

  // Check if it's Tuesday or later and show urgency
  const isUrgent = useMemo(() => {
    const now = new Date();
    const tuesday = new Date();
    tuesday.setDate(tuesday.getDate() - ((tuesday.getDay() + 6) % 7) + 1); // Get this week's Tuesday
    tuesday.setHours(17, 0, 0, 0); // 5 PM Tuesday (EOD)
    return isTuesday(now) || isAfter(now, tuesday);
  }, []);

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    // If on manager view, switch to accounts view to show detail
    if (view === 'manager') {
      setView('accounts');
    }
  };

  const handleCloseDetail = () => {
    setSelectedAccount(null);
  };

  const handleUpdateAccount = (updatedAccount: Account) => {
    saveAccount(updatedAccount);
    setAccounts((prev) =>
      prev.map((a) => (a.id === updatedAccount.id ? updatedAccount : a))
    );
    setSelectedAccount(updatedAccount);
  };

  const handleReviewDecision = (
    accountId: string,
    decisionId: string,
    status: ReviewStatus,
    notes?: string
  ) => {
    setAccounts((prev) => {
      const updated = prev.map((account) => {
        if (account.id !== accountId) return account;

        const updatedDecisions = account.decisions.map((decision) => {
          if (decision.id !== decisionId) return decision;
          return {
            ...decision,
            reviewStatus: status,
            reviewedBy: 'Team Lead', // In a real app, this would be the logged-in user
            reviewedAt: new Date().toISOString(),
            reviewNotes: notes,
          };
        });

        return {
          ...account,
          decisions: updatedDecisions,
          updatedAt: new Date().toISOString(),
        };
      });

      // Save all accounts
      saveAccounts(updated);
      return updated;
    });
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `account-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      if (importData(text)) {
        const loadedAccounts = getAccounts();
        setAccounts(loadedAccounts);
        setSelectedAccount(null);
        alert('Data imported successfully!');
      } else {
        alert('Failed to import data. Please check the file format.');
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Weekly Review Prompt Banner */}
      {showWeeklyPrompt && accountsNeedingDecisions.length > 0 && (
        <div
          className={`px-6 py-3 flex items-center justify-between ${
            isUrgent
              ? 'bg-red-50 border-b border-red-200'
              : 'bg-amber-50 border-b border-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {isUrgent ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600" />
            )}
            <span
              className={`font-medium ${isUrgent ? 'text-red-800' : 'text-amber-800'}`}
            >
              {accountsNeedingDecisions.length} account
              {accountsNeedingDecisions.length !== 1 ? 's' : ''} need decisions this week
              {isUrgent && ' - EOD Tuesday deadline!'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setView('accounts');
                if (accountsNeedingDecisions.length > 0) {
                  setSelectedAccount(accountsNeedingDecisions[0]);
                }
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isUrgent
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              Review Now
            </button>
            <button
              onClick={() => setShowWeeklyPrompt(false)}
              className={`text-sm ${
                isUrgent
                  ? 'text-red-600 hover:text-red-800'
                  : 'text-amber-600 hover:text-amber-800'
              }`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              Account Dashboard
            </h1>
            <span className="text-sm text-[var(--muted)]">Clipboard Health</span>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-[var(--secondary)] rounded-lg p-1">
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'dashboard'
                    ? 'bg-white text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setView('accounts')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'accounts'
                    ? 'bg-white text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <List className="w-4 h-4" />
                Accounts
              </button>
              <button
                onClick={() => setView('manager')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'manager'
                    ? 'bg-white text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Users className="w-4 h-4" />
                Manager View
              </button>
            </div>

            {/* Data Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg transition-colors"
                title="Export data"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleImport}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg transition-colors"
                title="Import data"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {view === 'dashboard' && (
          <div className="flex-1 p-6 overflow-auto">
            <DashboardStats accounts={accounts} />

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">All Accounts</h2>
              <div className="bg-white border border-[var(--border)] rounded-lg shadow-sm overflow-hidden">
                <div className="h-[calc(100vh-320px)]">
                  <AccountList
                    accounts={accounts}
                    onSelectAccount={handleSelectAccount}
                    selectedAccountId={selectedAccount?.id}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'accounts' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Account List */}
            <div
              className={`bg-white border-r border-[var(--border)] overflow-hidden transition-all ${
                selectedAccount ? 'w-1/2' : 'w-full'
              }`}
            >
              <AccountList
                accounts={accounts}
                onSelectAccount={handleSelectAccount}
                selectedAccountId={selectedAccount?.id}
              />
            </div>

            {/* Account Detail Panel */}
            {selectedAccount && (
              <div className="w-1/2 overflow-hidden">
                <AccountDetail
                  account={selectedAccount}
                  onClose={handleCloseDetail}
                  onUpdate={handleUpdateAccount}
                />
              </div>
            )}
          </div>
        )}

        {view === 'manager' && (
          <div className="flex-1 overflow-hidden bg-[var(--secondary)]">
            <ManagerDashboard
              accounts={accounts}
              onSelectAccount={handleSelectAccount}
              onReviewDecision={handleReviewDecision}
            />
          </div>
        )}
      </main>
    </div>
  );
}
