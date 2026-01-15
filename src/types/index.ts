// Core data types for Account Dashboard

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export type AccountStatus =
  | 'active'
  | 'on_hold'
  | 'payment_plan'
  | 'legal'
  | 'collections'
  | 'write_off'
  | 'closed';

export type DecisionCategory =
  | 'status'
  | 'action_plan'
  | 'risk_urgency'
  | 'special_arrangement';

export type ReviewStatus = 'pending' | 'pass' | 'fail';

export interface StaticContext {
  background: string;
  paymentPatterns: string;
  relationshipNotes: string;
  keyContacts: string;
}

export interface Decision {
  id: string;
  date: string; // ISO date string
  category: DecisionCategory;
  title: string;
  description: string;
  rationale: string;
  expectedOutcome?: string;
  actualOutcome?: string;
  outcomeDate?: string;
  createdBy?: string;
  // Team Lead review
  reviewStatus?: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface HealthScore {
  score: number; // 0-100
  date: string;
  factors: {
    paymentBehavior: number;
    communicationQuality: number;
    riskLevel: number;
    trendDirection: number;
  };
}

export interface Facility {
  id: string;
  name: string;
  arBalance: number;
  daysPastDue: number;
}

export interface Account {
  id: string;
  name: string;
  parentId?: string; // For facility-level accounts
  isParent: boolean;
  facilities?: Facility[];

  // Financial data
  arBalance: number;
  daysPastDue: number;
  creditLimit?: number;

  // Status and risk
  status: AccountStatus;
  riskLevel: RiskLevel;

  // Ownership
  camOwner: string;

  // Context and history
  staticContext: StaticContext;
  decisions: Decision[];
  healthScores: HealthScore[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Dashboard filter state
export interface FilterState {
  riskLevel: RiskLevel | 'all';
  status: AccountStatus | 'all';
  camOwner: string | 'all';
  searchQuery: string;
}

// Weekly review entry
export interface WeeklyReview {
  id: string;
  accountId: string;
  weekOf: string; // ISO date string (Monday of the week)
  decisions: Decision[];
  notes: string;
  nextSteps: string;
  createdAt: string;
}

// Dashboard summary stats
export interface DashboardStats {
  totalAccounts: number;
  totalArBalance: number;
  criticalAccounts: number;
  highRiskAccounts: number;
  mediumRiskAccounts: number;
  lowRiskAccounts: number;
  averageHealthScore: number;
  decisionsThisWeek: number;
}

// CAM (Collections Account Manager)
export interface CAM {
  id: string;
  name: string;
  email?: string;
}
