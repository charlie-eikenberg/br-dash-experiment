'use client';

import { RiskLevel, AccountStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'muted';
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700',
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  muted: 'bg-gray-100 text-gray-500',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles}`}
    >
      {children}
    </span>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const labels: Record<RiskLevel, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  return <Badge variant={level}>{labels[level]}</Badge>;
}

export function StatusBadge({ status }: { status: AccountStatus }) {
  const config: Record<AccountStatus, { label: string; variant: BadgeProps['variant'] }> = {
    active: { label: 'Active', variant: 'success' },
    on_hold: { label: 'On Hold', variant: 'warning' },
    payment_plan: { label: 'Payment Plan', variant: 'medium' },
    legal: { label: 'Legal', variant: 'critical' },
    collections: { label: 'Collections', variant: 'critical' },
    write_off: { label: 'Write-Off', variant: 'muted' },
    closed: { label: 'Closed', variant: 'muted' },
  };

  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function HealthScoreBadge({ score }: { score: number }) {
  let variant: BadgeProps['variant'] = 'low';
  if (score < 40) variant = 'critical';
  else if (score < 60) variant = 'high';
  else if (score < 75) variant = 'medium';

  return (
    <Badge variant={variant} size="md">
      {score}
    </Badge>
  );
}
