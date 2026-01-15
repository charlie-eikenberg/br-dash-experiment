'use client';

import { Account, DashboardStats as Stats } from '@/types';
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  FileText,
  Building2,
} from 'lucide-react';

interface DashboardStatsProps {
  accounts: Account[];
}

function calculateStats(accounts: Account[]): Stats {
  const totalArBalance = accounts.reduce((sum, a) => sum + a.arBalance, 0);
  const criticalAccounts = accounts.filter((a) => a.riskLevel === 'critical').length;
  const highRiskAccounts = accounts.filter((a) => a.riskLevel === 'high').length;
  const mediumRiskAccounts = accounts.filter((a) => a.riskLevel === 'medium').length;
  const lowRiskAccounts = accounts.filter((a) => a.riskLevel === 'low').length;

  const healthScores = accounts
    .map((a) => a.healthScores[0]?.score)
    .filter((s): s is number => s !== undefined);
  const averageHealthScore =
    healthScores.length > 0
      ? Math.round(healthScores.reduce((sum, s) => sum + s, 0) / healthScores.length)
      : 0;

  // Count decisions from the past 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const decisionsThisWeek = accounts.reduce((count, account) => {
    return (
      count +
      account.decisions.filter((d) => new Date(d.date) >= oneWeekAgo).length
    );
  }, 0);

  return {
    totalAccounts: accounts.length,
    totalArBalance,
    criticalAccounts,
    highRiskAccounts,
    mediumRiskAccounts,
    lowRiskAccounts,
    averageHealthScore,
    decisionsThisWeek,
  };
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export function DashboardStats({ accounts }: DashboardStatsProps) {
  const stats = calculateStats(accounts);

  const statCards = [
    {
      label: 'Total Accounts',
      value: stats.totalAccounts.toString(),
      icon: <Building2 className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Total AR Balance',
      value: formatCurrency(stats.totalArBalance),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: 'Critical/High Risk',
      value: `${stats.criticalAccounts + stats.highRiskAccounts}`,
      subValue: `${stats.criticalAccounts} critical, ${stats.highRiskAccounts} high`,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-red-600 bg-red-100',
    },
    {
      label: 'Avg Health Score',
      value: stats.averageHealthScore.toString(),
      icon: <TrendingUp className="w-5 h-5" />,
      color:
        stats.averageHealthScore >= 70
          ? 'text-green-600 bg-green-100'
          : stats.averageHealthScore >= 50
          ? 'text-yellow-600 bg-yellow-100'
          : 'text-red-600 bg-red-100',
    },
    {
      label: 'Decisions This Week',
      value: stats.decisionsThisWeek.toString(),
      icon: <FileText className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white border border-[var(--border)] rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${card.color}`}>{card.icon}</div>
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {card.value}
          </div>
          <div className="text-sm text-[var(--muted)]">{card.label}</div>
          {card.subValue && (
            <div className="text-xs text-[var(--muted)] mt-1">{card.subValue}</div>
          )}
        </div>
      ))}
    </div>
  );
}
