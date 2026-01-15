'use client';

import { Decision, HealthScore } from '@/types';
import { Badge } from './Badge';
import { format } from 'date-fns';
import {
  AlertTriangle,
  FileText,
  Shield,
  Handshake,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface DecisionTimelineProps {
  decisions: Decision[];
  healthScores: HealthScore[];
}

const categoryConfig: Record<
  Decision['category'],
  { label: string; icon: React.ReactNode; color: string }
> = {
  status: {
    label: 'Status Change',
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-blue-500',
  },
  action_plan: {
    label: 'Action Plan',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-purple-500',
  },
  risk_urgency: {
    label: 'Risk/Urgency',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'bg-orange-500',
  },
  special_arrangement: {
    label: 'Special Arrangement',
    icon: <Handshake className="w-4 h-4" />,
    color: 'bg-teal-500',
  },
};

function getHealthScoreForDate(healthScores: HealthScore[], date: string): HealthScore | undefined {
  // Find the closest health score on or before the decision date
  const sortedScores = [...healthScores].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sortedScores.find((score) => score.date <= date);
}

function getHealthTrend(
  healthScores: HealthScore[],
  currentDate: string
): 'up' | 'down' | 'stable' | null {
  const currentScore = getHealthScoreForDate(healthScores, currentDate);
  if (!currentScore) return null;

  const olderScores = healthScores.filter((s) => s.date < currentDate);
  if (olderScores.length === 0) return null;

  const previousScore = olderScores.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  const diff = currentScore.score - previousScore.score;
  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}

export function DecisionTimeline({ decisions, healthScores }: DecisionTimelineProps) {
  const sortedDecisions = [...decisions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedDecisions.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)]">
        No decisions recorded yet
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--border)]" />

      <div className="space-y-6">
        {sortedDecisions.map((decision, index) => {
          const config = categoryConfig[decision.category];
          const healthScore = getHealthScoreForDate(healthScores, decision.date);
          const trend = getHealthTrend(healthScores, decision.date);

          return (
            <div key={decision.id} className="relative pl-14">
              {/* Timeline dot */}
              <div
                className={`absolute left-4 w-5 h-5 rounded-full ${config.color} flex items-center justify-center text-white`}
              >
                {config.icon}
              </div>

              {/* Decision card */}
              <div className="bg-white border border-[var(--border)] rounded-lg p-4 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="muted">{config.label}</Badge>
                      <span className="text-xs text-[var(--muted)]">
                        {format(new Date(decision.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <h4 className="font-semibold text-[var(--foreground)]">
                      {decision.title}
                    </h4>
                  </div>

                  {/* Health score at time of decision */}
                  {healthScore && (
                    <div className="flex items-center gap-1 text-sm">
                      <span
                        className={`font-medium ${
                          healthScore.score >= 75
                            ? 'text-green-600'
                            : healthScore.score >= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {healthScore.score}
                      </span>
                      {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-[var(--foreground)] mb-3">
                  {decision.description}
                </p>

                {/* Rationale */}
                <div className="bg-[var(--secondary)] rounded p-3 mb-3">
                  <div className="text-xs font-medium text-[var(--muted)] mb-1">
                    Rationale
                  </div>
                  <p className="text-sm text-[var(--foreground)]">{decision.rationale}</p>
                </div>

                {/* Expected/Actual Outcomes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {decision.expectedOutcome && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[var(--muted)] mt-0.5" />
                      <div>
                        <div className="text-xs font-medium text-[var(--muted)]">
                          Expected Outcome
                        </div>
                        <p className="text-sm">{decision.expectedOutcome}</p>
                      </div>
                    </div>
                  )}

                  {decision.actualOutcome && (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <div className="text-xs font-medium text-[var(--muted)]">
                          Actual Outcome
                        </div>
                        <p className="text-sm">{decision.actualOutcome}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
