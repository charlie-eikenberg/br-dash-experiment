import { Account, CAM, Decision } from '@/types';

export const sampleCAMs: CAM[] = [
  { id: 'cam-1', name: 'Sarah Johnson', email: 'sarah.j@clipboardhealth.com' },
  { id: 'cam-2', name: 'Mike Chen', email: 'mike.c@clipboardhealth.com' },
  { id: 'cam-3', name: 'Emily Rodriguez', email: 'emily.r@clipboardhealth.com' },
];

const createDecision = (
  id: string,
  date: string,
  category: Decision['category'],
  title: string,
  description: string,
  rationale: string,
  expectedOutcome?: string,
  actualOutcome?: string
): Decision => ({
  id,
  date,
  category,
  title,
  description,
  rationale,
  expectedOutcome,
  actualOutcome,
  outcomeDate: actualOutcome ? date : undefined,
});

export const sampleAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Sunrise Healthcare Group',
    isParent: true,
    facilities: [
      { id: 'fac-1-1', name: 'Sunrise Medical Center', arBalance: 125000, daysPastDue: 45 },
      { id: 'fac-1-2', name: 'Sunrise Nursing Home', arBalance: 87000, daysPastDue: 62 },
      { id: 'fac-1-3', name: 'Sunrise Rehab Center', arBalance: 43000, daysPastDue: 30 },
    ],
    arBalance: 255000,
    daysPastDue: 45,
    creditLimit: 300000,
    status: 'active',
    riskLevel: 'high',
    camOwner: 'Sarah Johnson',
    staticContext: {
      background: 'Large healthcare system with 3 facilities. Acquired by private equity in 2023. New CFO started Q4 2024. Historically reliable payer but experiencing cash flow issues post-acquisition.',
      paymentPatterns: 'Was paying weekly until Aug 2024. Now sporadic payments averaging $15K/month. Tends to pay when AR exceeds $250K. Last 3 payments were partial.',
      relationshipNotes: 'Primary contact is CFO Janet Williams. She is responsive but under pressure from PE owners. Best contacted Tuesday-Thursday. Previous CFO was more proactive about payment plans.',
      keyContacts: 'Janet Williams (CFO) - janet.w@sunrisehealthcare.com - (555) 123-4567\nTom Martinez (AP Manager) - tom.m@sunrisehealthcare.com - (555) 123-4568',
    },
    decisions: [
      createDecision(
        'dec-1-1',
        '2024-12-09',
        'risk_urgency',
        'Elevated to High Risk',
        'Moving from Medium to High risk due to deteriorating payment pattern and PE pressure.',
        'Three consecutive months of partial payments. AR has grown 40% since September.',
        'Increased payment monitoring and weekly check-ins',
        'CFO acknowledged situation, committed to payment plan discussion'
      ),
      createDecision(
        'dec-1-2',
        '2024-12-02',
        'action_plan',
        'Proposed Payment Plan',
        'Offered structured payment plan: $50K/month for 6 months to clear backlog.',
        'Based on their historical payment capacity and current AR aging.',
        'Plan acceptance and first payment by 12/15',
      ),
      createDecision(
        'dec-1-3',
        '2024-11-18',
        'status',
        'Placed on Watch List',
        'Added to weekly review watch list pending payment plan response.',
        'No response to payment plan proposal after 2 weeks.',
      ),
    ],
    healthScores: [
      { score: 45, date: '2024-12-09', factors: { paymentBehavior: 30, communicationQuality: 60, riskLevel: 35, trendDirection: 55 } },
      { score: 55, date: '2024-12-02', factors: { paymentBehavior: 45, communicationQuality: 65, riskLevel: 45, trendDirection: 65 } },
      { score: 62, date: '2024-11-25', factors: { paymentBehavior: 55, communicationQuality: 70, riskLevel: 55, trendDirection: 68 } },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-09T14:30:00Z',
  },
  {
    id: 'acc-2',
    name: 'Meadowbrook Senior Living',
    isParent: false,
    arBalance: 42000,
    daysPastDue: 15,
    creditLimit: 75000,
    status: 'active',
    riskLevel: 'low',
    camOwner: 'Mike Chen',
    staticContext: {
      background: 'Single-site senior living facility. Family-owned for 30+ years. Stable occupancy around 92%. Strong local reputation.',
      paymentPatterns: 'Consistent bi-weekly payments. Occasionally delays during holiday periods but always catches up. Never exceeded 30 DPD.',
      relationshipNotes: 'Owner Mary Thompson is hands-on with finances. Very relationship-driven - appreciates personal calls. Prefers phone over email.',
      keyContacts: 'Mary Thompson (Owner) - mary@meadowbrooksl.com - (555) 234-5678',
    },
    decisions: [
      createDecision(
        'dec-2-1',
        '2024-12-09',
        'status',
        'Routine Review - No Changes',
        'Account continues to perform well. No action needed.',
        'Payment behavior consistent with historical patterns.',
        'Continued good standing',
        'Payment received as expected'
      ),
    ],
    healthScores: [
      { score: 88, date: '2024-12-09', factors: { paymentBehavior: 90, communicationQuality: 85, riskLevel: 90, trendDirection: 87 } },
    ],
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-12-09T11:00:00Z',
  },
  {
    id: 'acc-3',
    name: 'Metro Hospital Network',
    isParent: true,
    facilities: [
      { id: 'fac-3-1', name: 'Metro General Hospital', arBalance: 340000, daysPastDue: 90 },
      { id: 'fac-3-2', name: 'Metro Urgent Care East', arBalance: 78000, daysPastDue: 75 },
      { id: 'fac-3-3', name: 'Metro Urgent Care West', arBalance: 65000, daysPastDue: 60 },
      { id: 'fac-3-4', name: 'Metro Specialty Clinic', arBalance: 92000, daysPastDue: 85 },
    ],
    arBalance: 575000,
    daysPastDue: 90,
    creditLimit: 500000,
    status: 'collections',
    riskLevel: 'critical',
    camOwner: 'Sarah Johnson',
    staticContext: {
      background: 'Major hospital network serving metro area. Recently lost a major insurance contract. Undergoing financial restructuring. CEO replaced in Oct 2024.',
      paymentPatterns: 'Stopped regular payments in September. One partial payment of $50K in October. No payments since. AR growing rapidly due to continued service usage.',
      relationshipNotes: 'New interim CFO Robert Kim is difficult to reach. Legal has been involved from their side. Communication now primarily through formal channels.',
      keyContacts: 'Robert Kim (Interim CFO) - r.kim@metrohospital.org - (555) 345-6789\nLegal Dept - legal@metrohospital.org',
    },
    decisions: [
      createDecision(
        'dec-3-1',
        '2024-12-09',
        'status',
        'Escalated to Collections',
        'Account moved to formal collections process. Legal review initiated.',
        'No payment in 60+ days despite multiple outreach attempts. AR exceeds credit limit.',
        'Legal demand letter and potential service suspension',
      ),
      createDecision(
        'dec-3-2',
        '2024-12-02',
        'risk_urgency',
        'Elevated to Critical',
        'Maximum risk level assigned. All future shifts require prepayment.',
        'Financial restructuring announcement and payment stoppage indicate severe distress.',
      ),
      createDecision(
        'dec-3-3',
        '2024-11-18',
        'special_arrangement',
        'Prepayment Requirement',
        'All new shift requests now require 50% prepayment.',
        'Risk mitigation while continuing to serve existing shift commitments.',
        'Reduced new shift volume but protected from additional AR growth',
        'Shift volume down 60%, no new AR added'
      ),
      createDecision(
        'dec-3-4',
        '2024-11-04',
        'action_plan',
        'Emergency Payment Meeting Requested',
        'Requested urgent meeting with CFO to discuss payment timeline.',
        'AR exceeded credit limit. Need to understand their financial situation.',
        'Clear payment commitment or service suspension decision',
        'Meeting declined - referred to legal'
      ),
    ],
    healthScores: [
      { score: 15, date: '2024-12-09', factors: { paymentBehavior: 5, communicationQuality: 20, riskLevel: 10, trendDirection: 25 } },
      { score: 22, date: '2024-12-02', factors: { paymentBehavior: 10, communicationQuality: 25, riskLevel: 15, trendDirection: 38 } },
      { score: 35, date: '2024-11-25', factors: { paymentBehavior: 20, communicationQuality: 40, riskLevel: 25, trendDirection: 55 } },
    ],
    createdAt: '2023-06-10T08:00:00Z',
    updatedAt: '2024-12-09T16:45:00Z',
  },
  {
    id: 'acc-4',
    name: 'Valley Care Associates',
    isParent: true,
    facilities: [
      { id: 'fac-4-1', name: 'Valley Medical Plaza', arBalance: 28000, daysPastDue: 22 },
      { id: 'fac-4-2', name: 'Valley Home Health', arBalance: 15000, daysPastDue: 18 },
    ],
    arBalance: 43000,
    daysPastDue: 22,
    creditLimit: 100000,
    status: 'payment_plan',
    riskLevel: 'medium',
    camOwner: 'Emily Rodriguez',
    staticContext: {
      background: 'Regional healthcare provider with 2 facilities. Experienced temporary cash flow issues due to delayed Medicare reimbursements. Otherwise financially stable.',
      paymentPatterns: 'Currently on payment plan: $8K/week. Was previously paying $12K/week before Medicare delays. Plan started Nov 2024.',
      relationshipNotes: 'Controller Lisa Park is proactive communicator. Provides advance notice of any payment issues. Relationship is strong.',
      keyContacts: 'Lisa Park (Controller) - lisa.p@valleycare.com - (555) 456-7890',
    },
    decisions: [
      createDecision(
        'dec-4-1',
        '2024-12-09',
        'status',
        'Payment Plan On Track',
        'Week 4 of payment plan - all payments received on time.',
        'Monitoring progress. Medicare reimbursement expected by end of December.',
        'Plan completion and return to normal payment schedule by Jan 2025',
      ),
      createDecision(
        'dec-4-2',
        '2024-11-11',
        'special_arrangement',
        'Payment Plan Approved',
        'Approved 8-week payment plan at $8K/week to address temporary shortfall.',
        'Strong payment history and clear explanation for temporary issue. Medicare delay is verifiable.',
        'Full AR recovery by Jan 10, 2025',
      ),
    ],
    healthScores: [
      { score: 72, date: '2024-12-09', factors: { paymentBehavior: 75, communicationQuality: 90, riskLevel: 65, trendDirection: 58 } },
      { score: 68, date: '2024-12-02', factors: { paymentBehavior: 70, communicationQuality: 88, riskLevel: 60, trendDirection: 54 } },
    ],
    createdAt: '2024-02-28T11:00:00Z',
    updatedAt: '2024-12-09T10:15:00Z',
  },
  {
    id: 'acc-5',
    name: 'Coastal Rehabilitation Center',
    isParent: false,
    arBalance: 156000,
    daysPastDue: 55,
    creditLimit: 200000,
    status: 'on_hold',
    riskLevel: 'high',
    camOwner: 'Mike Chen',
    staticContext: {
      background: 'Standalone rehab facility. Changed ownership 6 months ago. New owners are a small PE firm with limited healthcare experience.',
      paymentPatterns: 'Erratic since ownership change. Payments range from $0 to $40K monthly with no predictable pattern. Previous owners paid like clockwork.',
      relationshipNotes: 'New ownership is difficult to pin down. Primary contact changes frequently. Currently working with Operations Manager but they have limited authority.',
      keyContacts: 'David Wilson (Ops Manager) - d.wilson@coastalrehab.net - (555) 567-8901\nPE Contact - unclear',
    },
    decisions: [
      createDecision(
        'dec-5-1',
        '2024-12-09',
        'action_plan',
        'Requesting Ownership Meeting',
        'Escalating request for meeting with PE ownership to discuss payment commitment.',
        'Operations manager cannot commit to payment schedule. Need decision-maker involvement.',
        'Meeting with ownership within 2 weeks',
      ),
      createDecision(
        'dec-5-2',
        '2024-12-02',
        'status',
        'Placed on Service Hold',
        'New shift requests on hold pending payment or payment plan agreement.',
        'AR growing without corresponding payments. Need to stop the bleeding.',
        'Payment commitment or formal payment plan',
      ),
      createDecision(
        'dec-5-3',
        '2024-11-25',
        'risk_urgency',
        'Elevated to High Risk',
        'Risk increased due to ownership uncertainty and payment irregularity.',
        'New PE owners unresponsive. No clear payment plan despite multiple requests.',
      ),
    ],
    healthScores: [
      { score: 38, date: '2024-12-09', factors: { paymentBehavior: 25, communicationQuality: 35, riskLevel: 30, trendDirection: 62 } },
      { score: 42, date: '2024-12-02', factors: { paymentBehavior: 30, communicationQuality: 40, riskLevel: 35, trendDirection: 63 } },
    ],
    createdAt: '2023-09-05T14:00:00Z',
    updatedAt: '2024-12-09T15:20:00Z',
  },
  {
    id: 'acc-6',
    name: 'Heritage Nursing Facilities',
    isParent: true,
    facilities: [
      { id: 'fac-6-1', name: 'Heritage North', arBalance: 12000, daysPastDue: 8 },
      { id: 'fac-6-2', name: 'Heritage South', arBalance: 9500, daysPastDue: 5 },
      { id: 'fac-6-3', name: 'Heritage East', arBalance: 11000, daysPastDue: 10 },
    ],
    arBalance: 32500,
    daysPastDue: 10,
    creditLimit: 150000,
    status: 'active',
    riskLevel: 'low',
    camOwner: 'Emily Rodriguez',
    staticContext: {
      background: 'Well-established nursing home chain. Family-owned for 40+ years. Expanding - opened Heritage East in 2024. Financially conservative.',
      paymentPatterns: 'Weekly ACH payments every Friday. Rarely deviates. Will occasionally batch 2 weeks if Friday falls on holiday.',
      relationshipNotes: 'CFO Robert Heritage (yes, the family) is a pleasure to work with. Quarterly check-in calls. They refer other facilities to CBH.',
      keyContacts: 'Robert Heritage (CFO) - robert@heritagenursing.com - (555) 678-9012',
    },
    decisions: [
      createDecision(
        'dec-6-1',
        '2024-12-09',
        'status',
        'Quarterly Review - Excellent Standing',
        'Account continues to exceed expectations. Discussing credit limit increase for expansion.',
        'Perfect payment history. Growing relationship.',
        'Credit limit increase approval',
      ),
    ],
    healthScores: [
      { score: 95, date: '2024-12-09', factors: { paymentBehavior: 98, communicationQuality: 95, riskLevel: 95, trendDirection: 92 } },
    ],
    createdAt: '2022-08-15T09:00:00Z',
    updatedAt: '2024-12-09T09:30:00Z',
  },
];

// Initialize localStorage with sample data if empty
export function initializeSampleData(): void {
  if (typeof window === 'undefined') return;

  const existingAccounts = localStorage.getItem('accountDash_accounts');
  if (!existingAccounts || JSON.parse(existingAccounts).length === 0) {
    localStorage.setItem('accountDash_accounts', JSON.stringify(sampleAccounts));
    localStorage.setItem('accountDash_cams', JSON.stringify(sampleCAMs));
  }
}
