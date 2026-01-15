'use client';

import { useState } from 'react';
import { Account, StaticContext } from '@/types';
import { RiskBadge, StatusBadge, HealthScoreBadge } from './Badge';
import { DecisionTimeline } from './DecisionTimeline';
import { DecisionForm } from './DecisionForm';
import { EditableStaticContext } from './EditableStaticContext';
import {
  X,
  Building2,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';

interface AccountDetailProps {
  account: Account;
  onClose: () => void;
  onUpdate: (account: Account) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Tab = 'overview' | 'timeline' | 'context';

export function AccountDetail({ account, onClose, onUpdate }: AccountDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showDecisionForm, setShowDecisionForm] = useState(false);

  const currentHealth = account.healthScores[0];
  const previousHealth = account.healthScores[1];
  const healthTrend =
    currentHealth && previousHealth
      ? currentHealth.score - previousHealth.score
      : 0;

  const handleNewDecision = (decision: Account['decisions'][0]) => {
    const updatedAccount = {
      ...account,
      decisions: [decision, ...account.decisions],
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updatedAccount);
    setShowDecisionForm(false);
  };

  const handleSaveContext = (newContext: StaticContext) => {
    const updatedAccount = {
      ...account,
      staticContext: newContext,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updatedAccount);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Decision Timeline' },
    { id: 'context', label: 'Static Context' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {account.isParent && (
              <div className="p-2 bg-[var(--secondary)] rounded-lg">
                <Building2 className="w-5 h-5 text-[var(--muted)]" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {account.name}
              </h2>
              {account.facilities && (
                <p className="text-sm text-[var(--muted)]">
                  {account.facilities.length} facilities
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--muted)]" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--secondary)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--muted)] text-xs mb-1">
              <DollarSign className="w-3 h-3" />
              AR Balance
            </div>
            <div className="text-lg font-semibold">
              {formatCurrency(account.arBalance)}
            </div>
          </div>
          <div className="bg-[var(--secondary)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--muted)] text-xs mb-1">
              <Calendar className="w-3 h-3" />
              Days Past Due
            </div>
            <div
              className={`text-lg font-semibold ${
                account.daysPastDue > 60
                  ? 'text-red-600'
                  : account.daysPastDue > 30
                  ? 'text-orange-600'
                  : ''
              }`}
            >
              {account.daysPastDue}
            </div>
          </div>
          <div className="bg-[var(--secondary)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--muted)] text-xs mb-1">
              Risk / Status
            </div>
            <div className="flex items-center gap-2">
              <RiskBadge level={account.riskLevel} />
              <StatusBadge status={account.status} />
            </div>
          </div>
          <div className="bg-[var(--secondary)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--muted)] text-xs mb-1">
              Health Score
            </div>
            <div className="flex items-center gap-2">
              <HealthScoreBadge score={currentHealth?.score ?? 0} />
              {healthTrend !== 0 && (
                <span
                  className={`flex items-center text-sm ${
                    healthTrend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {healthTrend > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(healthTrend)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* CAM Owner */}
            <div className="flex items-center gap-3 p-4 bg-[var(--secondary)] rounded-lg">
              <User className="w-5 h-5 text-[var(--muted)]" />
              <div>
                <div className="text-xs text-[var(--muted)]">CAM Owner</div>
                <div className="font-medium">{account.camOwner}</div>
              </div>
            </div>

            {/* Facilities */}
            {account.facilities && account.facilities.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--muted)] mb-3">
                  Facilities ({account.facilities.length})
                </h3>
                <div className="space-y-2">
                  {account.facilities.map((facility) => (
                    <div
                      key={facility.id}
                      className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg"
                    >
                      <span className="font-medium">{facility.name}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{formatCurrency(facility.arBalance)}</span>
                        <span
                          className={
                            facility.daysPastDue > 60
                              ? 'text-red-600'
                              : facility.daysPastDue > 30
                              ? 'text-orange-600'
                              : ''
                          }
                        >
                          {facility.daysPastDue} DPD
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Decisions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[var(--muted)]">
                  Recent Decisions
                </h3>
                <button
                  onClick={() => setShowDecisionForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[var(--primary)] text-white text-sm rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Decision
                </button>
              </div>
              {account.decisions.slice(0, 3).map((decision) => (
                <div
                  key={decision.id}
                  className="p-3 bg-[var(--secondary)] rounded-lg mb-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{decision.title}</span>
                    <span className="text-xs text-[var(--muted)]">
                      {format(new Date(decision.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{decision.description}</p>
                </div>
              ))}
              {account.decisions.length === 0 && (
                <p className="text-sm text-[var(--muted)]">No decisions recorded</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Decision History</h3>
              <button
                onClick={() => setShowDecisionForm(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[var(--primary)] text-white text-sm rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Decision
              </button>
            </div>
            <DecisionTimeline
              decisions={account.decisions}
              healthScores={account.healthScores}
            />
          </div>
        )}

        {activeTab === 'context' && (
          <EditableStaticContext
            context={account.staticContext}
            onSave={handleSaveContext}
            lastUpdated={account.updatedAt}
          />
        )}
      </div>

      {/* Decision Form Modal */}
      {showDecisionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
            <DecisionForm
              onSubmit={handleNewDecision}
              onCancel={() => setShowDecisionForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
