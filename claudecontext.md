# Account Dashboard - Project Context

## Project Overview

Building an "Account Dashboard" tool for Clipboard Health's (CBH) billing representatives (Collections Account Managers / CAMs) that tracks account decisions, plans, and corresponding execution over time. The goal is to replace the current fragmented Google Sheets system with a unified, visually appealing, and historically-aware tracking tool.

---

## Business Context

### About Clipboard Health (CBH)

CBH is a healthcare staffing marketplace that connects:
- **HCFs (Healthcare Facilities)**: Nursing homes, assisted living, skilled nursing facilities - the customers who pay CBH
- **HCPs (Healthcare Professionals)**: Nurses and other healthcare workers who get paid by CBH

**Business Model:**
- CBH charges HCFs ~$100 for a shift
- CBH pays HCPs ~$80 for the same shift
- **Take rate**: ~20% margin
- **Payment terms**: Net 30-45 days (facilities pay invoices 30-45 days after issuance)
- **DSO (Days Sales Outstanding)**: Currently ~50 days (how long it takes to collect)

**Why Cash Matters (from "Cash Rules Everything Around Me" doc):**
- CBH uses an Asset Backed Line (ABL) with JP Morgan, borrowing against Accounts Receivable
- **Ineligible A/R**: Receivables over 90 days old can't be borrowed against - this limits CBH's ability to grow
- High DSO + bad debt = cash flow problems
- Every $1 of bad debt at 20% take rate = 5% hit to net revenue (leverage effect)

### The Billing Team Structure

**Collections Account Managers (CAMs):**
- Own portfolios of accounts end-to-end
- Single point of contact for all billing/billing-adjacent issues
- Manage 58%+ of CBH's non-legal-owned A/R
- Report to Pod Leaders who coach and review their work

**Team Structure:**
- CAMs → Pod Leaders (player-coaches) → CAM Team Lead
- Weekly Business Reviews (WBRs) for account discussions
- Case calibrations for learning and alignment

**Key CAM Responsibilities:**
1. Collections - ensuring payments happen
2. Relationship management with HCF contacts
3. Decision-making on account status
4. Dispute resolution
5. Documentation and visibility

### Account Decision Types

**Status Decisions:**
- **Enrolled**: Active, can book shifts
- **Pending**: Block future shift bookings (warning stage)
- **Suspended**: Cancel existing booked shifts (severe action)
- **Archived**: Inactive account

**Other Decision Categories:**
- **Special Handling**: Custom payment schedules, monthly check runs
- **Payment Plans/Agreements**: Negotiated repayment terms
- **Leniency**: One-time exceptions (must be documented with rationale and end date)
- **Legal Escalation**: Send to legal team for collections

**Risk/Urgency Levels:**
- **Critical**: Top 10 accounts, daily monitoring, headed to legal
- **High**: On track for legal, contacts unresponsive, planning to churn
- **Medium**: Paying but slow, high balance, hard to reach
- **Low**: Fairly good shape, responsive contacts, minor delinquency

---

## Current System & Pain Points

### Current Tracking Tools (Google Sheets)

1. **BR Dashboard (per CAM)**
   - Each CAM has their own dashboard
   - One row per facility
   - Tracks: account details, payment details, account health, action decisions
   - ~200+ accounts per CAM

2. **Weekly Workstream Report**
   - "Yellow flag" - early warning for accounts needing attention
   - Criteria: never paid but overdue, status ≠ recommended, $150k+ total balance, 2+ overdue invoices
   - Weekly tab created, BRs fill in decisions by Tuesday, TLs grade pass/fail

3. **Mini Corp Pod ($50k+ overdue)**
   - "Gate #2" for accounts beyond Weekly Workstream
   - Accounts with $50k-$100k overdue A/R
   - Weekly meetings with TLs

4. **Parent Account Pod ($100k+ overdue)**
   - "Red flag" - highest risk accounts
   - Weekly Tuesday meetings
   - Urgency labels: Critical, High, Medium, Low

### Pain Points (Why Build This Tool)

1. **No Historical Visibility**
   - Decisions tracked weekly get erased or buried in tabs
   - Hard to see decisions and performance over time
   - Either overwrites previous week or creates bulky multi-tab sheets

2. **Can't Measure Decision Effectiveness**
   - No way to quantify how past decisions performed
   - Can't learn from what worked vs. what didn't
   - No outcome tracking tied to specific decisions

3. **Visually Unappealing**
   - All text in tables
   - Hard to read and parse information quickly
   - Affects ability to process information

4. **Context Repetition**
   - Same context copied week after week
   - "This account went through ownership change in Feb 2025" repeated every week
   - Clouds the real changes from previous week

5. **Highly Manual & Duplicative**
   - Same account tracked in multiple places
   - One account might appear in: CAM's dashboard, Weekly Workstream, Mini Corp Pod
   - CAM updates same info in 3+ places

6. **Facility vs. Parent Mismatch**
   - Tracking at facility level even when decisions apply to parent
   - One parent might have 10 facilities tracked separately
   - No roll-up view

---

## Current Data Structures (from CSV analysis)

### BR Dashboard Fields

**Account Details:**
- Facility name, Parent account
- Account Status (Enrolled/Archived/etc.)
- Net Terms (15/30/45 days)
- Timezone, Autopay status
- Payment cycle (Weekly/Bi-Weekly/Monthly)
- Last payment method (check/ACH/credit_card)

**Payment Details:**
- Past Due Balance ($)
- # of Past Due Invoices
- Total Outstanding Balance ($)
- # Outstanding Invoices
- Broken P2P (Promise to Pay) Count/Balance
- Open Credits
- Next Invoice Due Date

**Account Health:**
- # of pend/suspend cycles (last 6 months)
- Total Count of Past Due in 7 Days
- % of Past Due/Total AR
- Total Ineligible ($)
- Near Ineligible ($)
- Facility Payment Score (0-100)
- Payment Category (Very Bad/Bad/Ok/Good Payer)

**Account Decision:**
- Automated pend/suspend recommendation
- Action Decision for the Week
- Action Plan (STAR format - Situation, Task, Action, Resolution)
- TL comments/questions

### Weekly Workstream Fields

- SFID (Salesforce ID)
- HCF Name, Parent Account
- Payer Status
- Current Status vs. Recommended Status
- Pending notice banner enabled?
- Main reason and question
- BR/CAM Answer, Decision, Action Plan
- Manager Decision, Grading (Pass/Fail), Notes

### Mini Corp / Parent Account Pod Fields

- Account criticality over time (Critical/High/Medium/Low by week)
- # of Accounts Moved Out tracking
- Percentage breakdowns by criticality level

---

## Requirements (from User Q&A)

### Technical Decisions

| Decision | Choice |
|----------|--------|
| Platform | Web app (React/Next.js) |
| Device focus | Desktop only (v1) |
| Data integration | Manual entry only (v1) |
| Authentication | None - single shared view (v1) |

### Account Organization

- **Flexible hierarchy**: Toggle between parent-level and facility-level views
- Roll up facility decisions to parent automatically
- Support drill-down from parent to facilities

### Decision Categories to Track

1. **Account Status**: Enrolled, Pending, Suspended, Archived
2. **Action Plans**: Specific actions planned (call, email, send notice, escalate)
3. **Risk/Urgency Level**: Critical, High, Medium, Low
4. **Special Arrangements**: Payment plans, special handling, leniency grants

### Static Context (Persists Without Weekly Repetition)

- **Account Background**: Ownership changes, corporate structure, historical issues
- **Payment Patterns**: Typical behavior, autopay status, payment method preferences
- **Relationship Notes**: Key contacts, communication preferences, history

### Decision History Requirements

- **Primary**: Timeline view with metrics at each decision point
- **Secondary**: Decision chain (Enrolled → Pend Notice → Pending → Re-enrolled)
- **Tertiary**: Before/after comparison

### Outcome Measurement

- **Primary**: Account health score (composite metric over time)
- **Secondary**: Payment behavior changes after specific decisions

### Weekly Workflow

- **Review & Update model**: Start week reviewing flagged accounts, update decisions/plans, mark outcomes from last week

### Filtering Requirements (v1)

- By risk/urgency level
- By CAM/owner

---

## Proposed V1 Features

### 1. Account Management

- Create/edit parent accounts and child facilities
- Static context fields that persist:
  - Account background (free text)
  - Payment patterns (structured + notes)
  - Key contacts and relationship notes
- Flexible hierarchy view toggle
- Basic account metadata (Net terms, payment method, autopay)

### 2. Weekly Decision Tracking

- Record decisions with structured fields:
  - Status decision (Enrolled/Pending/Suspended/etc.)
  - Action plan (what will you do this week)
  - Urgency level (Critical/High/Medium/Low)
  - Special arrangements (payment plan, leniency, etc.)
- Weekly snapshots capturing key metrics at time of decision:
  - Past due balance
  - # of past due invoices
  - Payment score
  - Ineligible amount
- Auto-timestamp all entries
- Week-over-week diff highlighting (what changed since last week)

### 3. Decision Timeline & History

- Visual timeline per account showing all decisions
- Metrics overlay at each decision point
- Decision chain visualization (status progression)
- Click any point to see full context at that moment
- Before/after comparison view

### 4. Outcome Tracking

- Mark decision outcomes:
  - Payment received
  - Customer complied with plan
  - Escalated to next level
  - No change / ineffective
- Account health score trend (calculated or manual)
- Payment behavior indicators post-decision

### 5. Dashboard & Filtering

- Portfolio overview showing all accounts
- Key metrics summary (total past due, # accounts by urgency, etc.)
- Filter by:
  - Urgency level
  - CAM owner
- Highlight accounts needing attention this week
- Sort by various criteria

### 6. Reporting / Visibility

- Account-level summary page with full decision history
- Week-over-week changes highlighted
- Export capability for sharing

---

## Key Terminology / Glossary

| Term | Definition |
|------|------------|
| **CAM** | Collections Account Manager - billing rep who owns account portfolios |
| **HCF** | Healthcare Facility - the customer (nursing homes, etc.) |
| **HCP** | Healthcare Professional - the worker (nurses, etc.) |
| **DSO** | Days Sales Outstanding - average days to collect payment |
| **A/R** | Accounts Receivable - money owed to CBH |
| **Ineligible A/R** | Receivables >90 days old, can't borrow against |
| **Take Rate** | CBH's margin (charge rate - pay rate) / charge rate |
| **Net 30/45** | Payment due 30/45 days after invoice |
| **P2P** | Promise to Pay - customer commitment to pay by date |
| **Pend/Pending** | Block future shift bookings |
| **Suspend/Suspension** | Cancel existing booked shifts |
| **Pod Leader** | CAM's coach/manager |
| **WBR** | Weekly Business Review |
| **EPS Decision Tree** | Enrolled/Pending/Suspended decision guidance |
| **ABL** | Asset Backed Line - credit facility with JP Morgan |
| **GSV** | Gross Service Value - total amount billed |

---

## File References

**Input Documents (in `/inputs/`):**
- `Understanding Billing @ CBH.pdf` - Billing team overview
- `The Collections Account Manager Charter.pdf` - CAM role definition, expectations, mindset
- `Cash Rules Everything Around Me.pdf` - Cash flow importance, business model explanation
- `AR-SOP_ The Collections Workstreams-150126-193637.pdf` - SOP for workstream processes
- `BR dashboard - template.csv` - BR dashboard structure (large file)
- `Collections Weekly Workstream Report (2025) - Week of 12.08.25.csv` - Weekly workstream example
- `Mini Corp Account Progress 2024 - Master Account Summary - Outputs.csv` - Mini corp tracking

---

## Implementation Status

### Completed Features (V1)

#### 1. Project Setup
- **Framework**: Next.js 16.1.2 with TypeScript
- **Styling**: Tailwind CSS v4 with custom CSS variables
- **Icons**: Lucide React
- **Date utilities**: date-fns
- **Data persistence**: localStorage with export/import functionality

#### 2. Three Main Views

**Dashboard View** (Bottom-up / CAM View)
- Summary stats cards: Total accounts, AR balance, critical/high risk count, avg health score, decisions this week
- Full account list with sorting and filtering
- Click any account to view details

**Accounts View** (Bottom-up / CAM View)
- Split-pane layout: Account list on left, detail panel on right
- Sortable columns: Name, AR Balance, Days Past Due, Risk Level, Health Score
- Filters: Risk level, Status, CAM owner, Search
- Visual indicators for risk levels and health trends

**Manager View** (Top-down / TL View)
- Weekly summary: Total decisions, Passed, Failed, Pending Review
- CAM Performance breakdown - click a CAM to filter to their decisions
- Critical & High Risk Accounts list
- Accounts Needing Decisions This Week (highlighted warning)
- All Decisions list with expandable details
- Time range filter: This Week, Last Week, Last 2 Weeks, Last Month
- Inline decision review (Pass/Fail with notes)

#### 3. Account Detail Features

**Overview Tab**
- Quick stats: AR Balance, Days Past Due, Risk/Status badges, Health Score with trend
- CAM Owner display
- Facilities list (for parent accounts)
- Recent decisions preview
- "Add Decision" button

**Decision Timeline Tab**
- Visual timeline with colored category icons
- Health score displayed at each decision point
- Trend indicators (up/down arrows)
- Full decision details: Description, Rationale, Expected/Actual Outcomes
- Review status badges (Passed/Failed/Pending)

**Static Context Tab (Editable)**
- Background - company history, ownership, key changes
- Payment Patterns - typical behavior, payment preferences
- Relationship Notes - contacts, communication style
- Key Contacts - names, emails, phones
- Click edit icon on any field to modify
- Changes persist automatically

#### 4. Decision Entry Form
- Date picker
- Category selection with descriptions:
  - Status Change
  - Action Plan
  - Risk/Urgency
  - Special Arrangement
- Required fields: Title, Description, Rationale
- Optional: Expected Outcome
- Validation with error messages

#### 5. Team Lead Review System
- Decisions have review status: pending | pass | fail
- Review fields: reviewedBy, reviewedAt, reviewNotes
- In Manager View, expand any decision → "Review Decision" button
- Pass/Fail buttons with optional notes
- Review info displayed on decision cards

#### 6. Weekly Review Prompts
- Banner at top of page when accounts need decisions this week
- Amber color early in week, red on Tuesday+ (EOD deadline)
- Shows count of accounts needing attention
- "Review Now" button jumps to first account
- Dismissible per session

#### 7. Data Management
- Export button: Downloads JSON backup with timestamp
- Import button: Upload JSON to restore data
- Sample data auto-initialized on first load (6 realistic accounts)

---

## File Structure

```
account-dash/
├── src/
│   ├── app/
│   │   ├── globals.css          # Tailwind + CSS variables
│   │   ├── layout.tsx           # Root layout with metadata
│   │   └── page.tsx             # Main page with view switching
│   ├── components/
│   │   ├── index.ts             # Component exports
│   │   ├── Badge.tsx            # RiskBadge, StatusBadge, HealthScoreBadge
│   │   ├── AccountList.tsx      # Sortable/filterable account table
│   │   ├── AccountDetail.tsx    # Detail panel with tabs
│   │   ├── DecisionTimeline.tsx # Visual timeline component
│   │   ├── DecisionForm.tsx     # New decision entry form
│   │   ├── DashboardStats.tsx   # Summary stat cards
│   │   ├── ManagerDashboard.tsx # Top-down manager view
│   │   └── EditableStaticContext.tsx # Editable context fields
│   ├── lib/
│   │   └── storage.ts           # localStorage utilities
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── data/
│       └── sampleData.ts        # Sample accounts and CAMs
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── claudecontext.md             # This file
```

---

## Data Model (TypeScript Types)

```typescript
type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

type AccountStatus = 'active' | 'on_hold' | 'payment_plan' | 'legal' | 'collections' | 'write_off' | 'closed';

type DecisionCategory = 'status' | 'action_plan' | 'risk_urgency' | 'special_arrangement';

type ReviewStatus = 'pending' | 'pass' | 'fail';

interface Decision {
  id: string;
  date: string;
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

interface StaticContext {
  background: string;
  paymentPatterns: string;
  relationshipNotes: string;
  keyContacts: string;
}

interface Account {
  id: string;
  name: string;
  parentId?: string;
  isParent: boolean;
  facilities?: Facility[];
  arBalance: number;
  daysPastDue: number;
  creditLimit?: number;
  status: AccountStatus;
  riskLevel: RiskLevel;
  camOwner: string;
  staticContext: StaticContext;
  decisions: Decision[];
  healthScores: HealthScore[];
  createdAt: string;
  updatedAt: string;
}
```

---

## Sample Data

6 accounts included for testing:

| Account | Risk | Status | AR Balance | CAM |
|---------|------|--------|------------|-----|
| Sunrise Healthcare Group | High | Active | $255K | Sarah Johnson |
| Meadowbrook Senior Living | Low | Active | $42K | Mike Chen |
| Metro Hospital Network | Critical | Collections | $575K | Sarah Johnson |
| Valley Care Associates | Medium | Payment Plan | $43K | Emily Rodriguez |
| Coastal Rehabilitation Center | High | On Hold | $156K | Mike Chen |
| Heritage Nursing Facilities | Low | Active | $32.5K | Emily Rodriguez |

---

## Running the App

```bash
cd account-dash
npm run dev
# Open http://localhost:3000
```

---

## Future Enhancements (Not Yet Built)

### High Priority
- [ ] CSV import from existing Google Sheets
- [ ] Outcome tracking on decisions (did the action work?)
- [ ] Account health score calculation (currently manual in sample data)
- [ ] Edit existing decisions (currently can only add new)
- [ ] Delete accounts/decisions

### Medium Priority
- [ ] Parent-to-facility drill-down view
- [ ] Week-over-week diff highlighting
- [ ] Decision templates (common actions)
- [ ] Bulk actions on multiple accounts
- [ ] Print/PDF export for account summaries

### Lower Priority (V2+)
- [ ] Authentication and role-based access
- [ ] Real database backend (currently localStorage)
- [ ] Salesforce/Metabase integrations
- [ ] Mobile responsive design
- [ ] Email notifications for deadlines
- [ ] Team/Pod-level views and reporting
- [ ] Historical metrics charting (AR over time, etc.)

---

## Technical Notes

- **State Management**: React useState/useEffect (no Redux needed for v1)
- **Data Flow**: All data stored in localStorage, loaded on app mount
- **Styling**: Tailwind CSS v4 with `@import "tailwindcss"` syntax
- **CSS Variables**: Custom colors defined in globals.css (--primary, --border, etc.)

---

*Last updated: January 2025 - V1 complete with Manager View, editable context, TL reviews, and weekly prompts*
