// localStorage utilities for data persistence

import { Account, CAM, WeeklyReview } from '@/types';

const STORAGE_KEYS = {
  ACCOUNTS: 'accountDash_accounts',
  CAMS: 'accountDash_cams',
  WEEKLY_REVIEWS: 'accountDash_weeklyReviews',
} as const;

// Generic storage helpers
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// Account operations
export function getAccounts(): Account[] {
  return getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
}

export function saveAccounts(accounts: Account[]): void {
  setItem(STORAGE_KEYS.ACCOUNTS, accounts);
}

export function getAccount(id: string): Account | undefined {
  const accounts = getAccounts();
  return accounts.find(a => a.id === id);
}

export function saveAccount(account: Account): void {
  const accounts = getAccounts();
  const index = accounts.findIndex(a => a.id === account.id);
  if (index >= 0) {
    accounts[index] = { ...account, updatedAt: new Date().toISOString() };
  } else {
    accounts.push({
      ...account,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  saveAccounts(accounts);
}

export function deleteAccount(id: string): void {
  const accounts = getAccounts();
  saveAccounts(accounts.filter(a => a.id !== id));
}

// CAM operations
export function getCAMs(): CAM[] {
  return getItem<CAM[]>(STORAGE_KEYS.CAMS, []);
}

export function saveCAMs(cams: CAM[]): void {
  setItem(STORAGE_KEYS.CAMS, cams);
}

// Weekly review operations
export function getWeeklyReviews(): WeeklyReview[] {
  return getItem<WeeklyReview[]>(STORAGE_KEYS.WEEKLY_REVIEWS, []);
}

export function saveWeeklyReview(review: WeeklyReview): void {
  const reviews = getWeeklyReviews();
  const index = reviews.findIndex(r => r.id === review.id);
  if (index >= 0) {
    reviews[index] = review;
  } else {
    reviews.push(review);
  }
  setItem(STORAGE_KEYS.WEEKLY_REVIEWS, reviews);
}

export function getWeeklyReviewsForAccount(accountId: string): WeeklyReview[] {
  const reviews = getWeeklyReviews();
  return reviews.filter(r => r.accountId === accountId);
}

// Utility: Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Export all data (for backup)
export function exportAllData(): string {
  const data = {
    accounts: getAccounts(),
    cams: getCAMs(),
    weeklyReviews: getWeeklyReviews(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

// Import data (from backup)
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.accounts) saveAccounts(data.accounts);
    if (data.cams) saveCAMs(data.cams);
    if (data.weeklyReviews) setItem(STORAGE_KEYS.WEEKLY_REVIEWS, data.weeklyReviews);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
