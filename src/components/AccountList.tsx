'use client';

import { useState, useMemo } from 'react';
import { Account, FilterState, RiskLevel, AccountStatus } from '@/types';
import { RiskBadge, StatusBadge, HealthScoreBadge } from './Badge';
import { Search, ChevronDown, ChevronUp, Building2, TrendingDown, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface AccountListProps {
  accounts: Account[];
  onSelectAccount: (account: Account) => void;
  selectedAccountId?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type SortField = 'name' | 'arBalance' | 'daysPastDue' | 'riskLevel' | 'healthScore';
type SortDirection = 'asc' | 'desc';

const riskOrder: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function AccountList({ accounts, onSelectAccount, selectedAccountId }: AccountListProps) {
  const [filters, setFilters] = useState<FilterState>({
    riskLevel: 'all',
    status: 'all',
    camOwner: 'all',
    searchQuery: '',
  });
  const [sortField, setSortField] = useState<SortField>('riskLevel');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const camOwners = useMemo(() => {
    const owners = new Set(accounts.map((a) => a.camOwner));
    return Array.from(owners).sort();
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      if (filters.riskLevel !== 'all' && account.riskLevel !== filters.riskLevel) return false;
      if (filters.status !== 'all' && account.status !== filters.status) return false;
      if (filters.camOwner !== 'all' && account.camOwner !== filters.camOwner) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (
          !account.name.toLowerCase().includes(query) &&
          !account.camOwner.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [accounts, filters]);

  const sortedAccounts = useMemo(() => {
    return [...filteredAccounts].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'arBalance':
          comparison = a.arBalance - b.arBalance;
          break;
        case 'daysPastDue':
          comparison = a.daysPastDue - b.daysPastDue;
          break;
        case 'riskLevel':
          comparison = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
          break;
        case 'healthScore':
          const aScore = a.healthScores[0]?.score ?? 0;
          const bScore = b.healthScores[0]?.score ?? 0;
          comparison = aScore - bScore;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredAccounts, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline" />
    ) : (
      <ChevronDown className="w-4 h-4 inline" />
    );
  };

  const getHealthTrend = (account: Account) => {
    if (account.healthScores.length < 2) return null;
    const current = account.healthScores[0].score;
    const previous = account.healthScores[1].score;
    const diff = current - previous;
    if (Math.abs(diff) < 3) return null;
    return diff > 0 ? 'up' : 'down';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-4 border-b border-[var(--border)] bg-white">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          {/* Risk Filter */}
          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value as RiskLevel | 'all' })}
            className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as AccountStatus | 'all' })}
            className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="payment_plan">Payment Plan</option>
            <option value="collections">Collections</option>
            <option value="legal">Legal</option>
          </select>

          {/* CAM Filter */}
          <select
            value={filters.camOwner}
            onChange={(e) => setFilters({ ...filters, camOwner: e.target.value })}
            className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All CAMs</option>
            {camOwners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-[var(--secondary)] sticky top-0">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('name')}
              >
                Account <SortIcon field="name" />
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-[var(--muted)] uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('arBalance')}
              >
                AR Balance <SortIcon field="arBalance" />
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-[var(--muted)] uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('daysPastDue')}
              >
                Days Past Due <SortIcon field="daysPastDue" />
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-[var(--muted)] uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('riskLevel')}
              >
                Risk <SortIcon field="riskLevel" />
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-[var(--muted)] uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('healthScore')}
              >
                Health <SortIcon field="healthScore" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                CAM
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {sortedAccounts.map((account) => {
              const healthScore = account.healthScores[0]?.score ?? 0;
              const trend = getHealthTrend(account);
              const isSelected = account.id === selectedAccountId;

              return (
                <tr
                  key={account.id}
                  onClick={() => onSelectAccount(account)}
                  className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                    isSelected ? 'bg-blue-100' : 'bg-white'
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {account.isParent && (
                        <Building2 className="w-4 h-4 text-[var(--muted)]" />
                      )}
                      <div>
                        <div className="font-medium text-[var(--foreground)]">
                          {account.name}
                        </div>
                        {account.facilities && (
                          <div className="text-xs text-[var(--muted)]">
                            {account.facilities.length} facilities
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    {formatCurrency(account.arBalance)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span
                      className={
                        account.daysPastDue > 60
                          ? 'text-red-600 font-medium'
                          : account.daysPastDue > 30
                          ? 'text-orange-600'
                          : ''
                      }
                    >
                      {account.daysPastDue}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <RiskBadge level={account.riskLevel} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <StatusBadge status={account.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <HealthScoreBadge score={healthScore} />
                      {trend === 'up' && (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      )}
                      {trend === 'down' && (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--muted)]">
                    {account.camOwner}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedAccounts.length === 0 && (
          <div className="text-center py-12 text-[var(--muted)]">
            No accounts match your filters
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--secondary)] text-sm text-[var(--muted)]">
        Showing {sortedAccounts.length} of {accounts.length} accounts |{' '}
        Total AR: {formatCurrency(sortedAccounts.reduce((sum, a) => sum + a.arBalance, 0))}
      </div>
    </div>
  );
}
