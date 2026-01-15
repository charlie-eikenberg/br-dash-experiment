'use client';

import { useState, useMemo } from 'react';
import { Account, Decision, ReviewStatus } from '@/types';
import { Badge, RiskBadge, StatusBadge } from './Badge';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Filter,
  Calendar,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';

interface ManagerDashboardProps {
  accounts: Account[];
  onSelectAccount: (account: Account) => void;
  onReviewDecision: (accountId: string, decisionId: string, status: ReviewStatus, notes?: string) => void;
}

type TimeRange = 'this_week' | 'last_week' | 'last_2_weeks' | 'last_month';

function getWeekRange(range: TimeRange): { start: Date; end: Date } {
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

  switch (range) {
    case 'this_week':
      return { start: thisWeekStart, end: thisWeekEnd };
    case 'last_week':
      return {
        start: subWeeks(thisWeekStart, 1),
        end: subWeeks(thisWeekEnd, 1),
      };
    case 'last_2_weeks':
      return {
        start: subWeeks(thisWeekStart, 1),
        end: thisWeekEnd,
      };
    case 'last_month':
      return {
        start: subWeeks(thisWeekStart, 4),
        end: thisWeekEnd,
      };
  }
}

interface DecisionWithAccount extends Decision {
  accountId: string;
  accountName: string;
  camOwner: string;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
}

export function ManagerDashboard({
  accounts,
  onSelectAccount,
  onReviewDecision,
}: ManagerDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('this_week');
  const [selectedCAM, setSelectedCAM] = useState<string>('all');
  const [expandedDecision, setExpandedDecision] = useState<string | null>(null);
  const [reviewingDecision, setReviewingDecision] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const camOwners = useMemo(() => {
    const owners = new Set(accounts.map((a) => a.camOwner));
    return Array.from(owners).sort();
  }, [accounts]);

  const { start: rangeStart, end: rangeEnd } = getWeekRange(timeRange);

  // Get all decisions within the time range
  const decisionsInRange = useMemo(() => {
    const decisions: DecisionWithAccount[] = [];

    accounts.forEach((account) => {
      if (selectedCAM !== 'all' && account.camOwner !== selectedCAM) return;

      account.decisions.forEach((decision) => {
        const decisionDate = new Date(decision.date);
        if (isWithinInterval(decisionDate, { start: rangeStart, end: rangeEnd })) {
          decisions.push({
            ...decision,
            accountId: account.id,
            accountName: account.name,
            camOwner: account.camOwner,
          });
        }
      });
    });

    return decisions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [accounts, selectedCAM, rangeStart, rangeEnd]);

  // Critical accounts in range
  const criticalAccounts = useMemo(() => {
    return accounts
      .filter((a) => {
        if (selectedCAM !== 'all' && a.camOwner !== selectedCAM) return false;
        return a.riskLevel === 'critical' || a.riskLevel === 'high';
      })
      .sort((a, b) => {
        const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      });
  }, [accounts, selectedCAM]);

  // Summary stats
  const stats = useMemo(() => {
    const total = decisionsInRange.length;
    const passed = decisionsInRange.filter((d) => d.reviewStatus === 'pass').length;
    const failed = decisionsInRange.filter((d) => d.reviewStatus === 'fail').length;
    const pending = decisionsInRange.filter(
      (d) => !d.reviewStatus || d.reviewStatus === 'pending'
    ).length;

    // Group by CAM
    const byCAM: Record<string, { total: number; passed: number; failed: number; pending: number }> = {};
    decisionsInRange.forEach((d) => {
      if (!byCAM[d.camOwner]) {
        byCAM[d.camOwner] = { total: 0, passed: 0, failed: 0, pending: 0 };
      }
      byCAM[d.camOwner].total++;
      if (d.reviewStatus === 'pass') byCAM[d.camOwner].passed++;
      else if (d.reviewStatus === 'fail') byCAM[d.camOwner].failed++;
      else byCAM[d.camOwner].pending++;
    });

    return { total, passed, failed, pending, byCAM };
  }, [decisionsInRange]);

  // Accounts needing decisions this week
  const accountsNeedingDecisions = useMemo(() => {
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    return accounts.filter((account) => {
      if (selectedCAM !== 'all' && account.camOwner !== selectedCAM) return false;

      const hasDecisionThisWeek = account.decisions.some((d) => {
        const decisionDate = new Date(d.date);
        return isWithinInterval(decisionDate, { start: thisWeekStart, end: thisWeekEnd });
      });

      return !hasDecisionThisWeek;
    });
  }, [accounts, selectedCAM]);

  const handleReview = (
    accountId: string,
    decisionId: string,
    status: ReviewStatus
  ) => {
    onReviewDecision(accountId, decisionId, status, reviewNotes);
    setReviewingDecision(null);
    setReviewNotes('');
  };

  const timeRangeLabel: Record<TimeRange, string> = {
    this_week: 'This Week',
    last_week: 'Last Week',
    last_2_weeks: 'Last 2 Weeks',
    last_month: 'Last Month',
  };

  return (
    <div className="p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Manager Dashboard</h2>
          <p className="text-sm text-[var(--muted)]">
            {format(rangeStart, 'MMM d')} - {format(rangeEnd, 'MMM d, yyyy')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--muted)]" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              {Object.entries(timeRangeLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--muted)]" />
            <select
              value={selectedCAM}
              onChange={(e) => setSelectedCAM(e.target.value)}
              className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="all">All CAMs</option>
              {camOwners.map((cam) => (
                <option key={cam} value={cam}>
                  {cam}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--border)] rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[var(--muted)] text-sm mb-2">
            <TrendingUp className="w-4 h-4" />
            Total Decisions
          </div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 text-sm mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Passed
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.passed}</div>
          <div className="text-xs text-[var(--muted)]">
            {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}% of total
          </div>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-600 text-sm mb-2">
            <XCircle className="w-4 h-4" />
            Failed
          </div>
          <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-xs text-[var(--muted)]">
            {stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}% of total
          </div>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 text-sm mb-2">
            <Clock className="w-4 h-4" />
            Pending Review
          </div>
          <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-xs text-[var(--muted)]">
            {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% of total
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CAM Performance */}
        <div className="bg-white border border-[var(--border)] rounded-lg shadow-sm">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              CAM Performance
            </h3>
          </div>
          <div className="p-4">
            {Object.entries(stats.byCAM).length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No decisions in selected range</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.byCAM).map(([cam, data]) => (
                  <div
                    key={cam}
                    className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedCAM(cam)}
                  >
                    <div>
                      <div className="font-medium">{cam}</div>
                      <div className="text-xs text-[var(--muted)]">
                        {data.total} decisions
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{data.passed}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>{data.failed}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>{data.pending}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Critical Accounts */}
        <div className="bg-white border border-[var(--border)] rounded-lg shadow-sm">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Critical & High Risk Accounts ({criticalAccounts.length})
            </h3>
          </div>
          <div className="p-4 max-h-[300px] overflow-auto">
            {criticalAccounts.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No critical/high risk accounts</p>
            ) : (
              <div className="space-y-2">
                {criticalAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => onSelectAccount(account)}
                  >
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-xs text-[var(--muted)]">{account.camOwner}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <RiskBadge level={account.riskLevel} />
                      <span className="text-sm font-medium">
                        {formatCurrency(account.arBalance)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accounts Needing Decisions */}
      {accountsNeedingDecisions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" />
            Accounts Needing Decisions This Week ({accountsNeedingDecisions.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {accountsNeedingDecisions.slice(0, 9).map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-2 bg-white rounded border border-amber-200 cursor-pointer hover:bg-amber-50"
                onClick={() => onSelectAccount(account)}
              >
                <div className="truncate">
                  <div className="font-medium text-sm truncate">{account.name}</div>
                  <div className="text-xs text-[var(--muted)]">{account.camOwner}</div>
                </div>
                <RiskBadge level={account.riskLevel} />
              </div>
            ))}
            {accountsNeedingDecisions.length > 9 && (
              <div className="p-2 text-sm text-amber-700">
                +{accountsNeedingDecisions.length - 9} more accounts
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Decisions */}
      <div className="bg-white border border-[var(--border)] rounded-lg shadow-sm">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="font-semibold">All Decisions ({decisionsInRange.length})</h3>
        </div>
        <div className="divide-y divide-[var(--border)] max-h-[500px] overflow-auto">
          {decisionsInRange.length === 0 ? (
            <div className="p-4 text-center text-[var(--muted)]">
              No decisions in selected range
            </div>
          ) : (
            decisionsInRange.map((decision) => {
              const isExpanded = expandedDecision === decision.id;
              const isReviewing = reviewingDecision === decision.id;

              return (
                <div key={decision.id} className="p-4">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedDecision(isExpanded ? null : decision.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{decision.title}</span>
                        {decision.reviewStatus === 'pass' && (
                          <Badge variant="success">Passed</Badge>
                        )}
                        {decision.reviewStatus === 'fail' && (
                          <Badge variant="critical">Failed</Badge>
                        )}
                        {(!decision.reviewStatus || decision.reviewStatus === 'pending') && (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                        <span>{decision.accountName}</span>
                        <span>{decision.camOwner}</span>
                        <span>{format(new Date(decision.date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[var(--muted)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pl-4 border-l-2 border-[var(--border)]">
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-medium text-[var(--muted)]">Description</div>
                          <p className="text-sm">{decision.description}</p>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[var(--muted)]">Rationale</div>
                          <p className="text-sm">{decision.rationale}</p>
                        </div>
                        {decision.expectedOutcome && (
                          <div>
                            <div className="text-xs font-medium text-[var(--muted)]">
                              Expected Outcome
                            </div>
                            <p className="text-sm">{decision.expectedOutcome}</p>
                          </div>
                        )}
                        {decision.reviewedBy && (
                          <div className="text-xs text-[var(--muted)]">
                            Reviewed by {decision.reviewedBy} on{' '}
                            {format(new Date(decision.reviewedAt!), 'MMM d, yyyy')}
                            {decision.reviewNotes && (
                              <p className="mt-1 text-sm text-[var(--foreground)]">
                                Notes: {decision.reviewNotes}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Review Actions */}
                        {!isReviewing ? (
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReviewingDecision(decision.id);
                              }}
                              className="px-3 py-1.5 text-sm bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)]"
                            >
                              Review Decision
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const account = accounts.find((a) => a.id === decision.accountId);
                                if (account) onSelectAccount(account);
                              }}
                              className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
                            >
                              View Account
                            </button>
                          </div>
                        ) : (
                          <div
                            className="bg-[var(--secondary)] rounded-lg p-4 space-y-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div>
                              <label className="text-xs font-medium text-[var(--muted)]">
                                Review Notes (optional)
                              </label>
                              <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add notes about this decision..."
                                className="w-full mt-1 px-3 py-2 border border-[var(--border)] rounded-lg text-sm resize-none"
                                rows={2}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleReview(decision.accountId, decision.id, 'pass')
                                }
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Pass
                              </button>
                              <button
                                onClick={() =>
                                  handleReview(decision.accountId, decision.id, 'fail')
                                }
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                              >
                                <XCircle className="w-4 h-4" />
                                Fail
                              </button>
                              <button
                                onClick={() => {
                                  setReviewingDecision(null);
                                  setReviewNotes('');
                                }}
                                className="px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
