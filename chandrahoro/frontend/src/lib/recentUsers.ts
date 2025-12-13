/**
 * Recent Users Manager
 * Stores up to 4 recent birth details in localStorage for quick access
 * Deduplicates by name + birth date combination
 */

const STORAGE_KEY = 'chandrahoro_recent_users';
const MAX_RECENT_USERS = 4;

export interface RecentUser {
  id: string;
  name: string;
  date: string;
  time: string;
  time_unknown: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  location_name: string;
  savedAt: number;
}

/**
 * Generate a unique ID based on name and birth date
 */
function generateId(name: string, date: string): string {
  const normalized = `${name.toLowerCase().trim()}_${date}`;
  return btoa(normalized).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

/**
 * Get all recent users from localStorage
 */
export function getRecentUsers(): RecentUser[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const users: RecentUser[] = JSON.parse(stored);
    // Sort by savedAt descending (most recent first)
    return users.sort((a, b) => b.savedAt - a.savedAt);
  } catch (error) {
    console.error('Failed to load recent users:', error);
    return [];
  }
}

/**
 * Save a user to recent users list
 * Deduplicates by name+date and keeps only MAX_RECENT_USERS
 */
export function saveRecentUser(userData: Omit<RecentUser, 'id' | 'savedAt'>): void {
  if (typeof window === 'undefined') return;

  try {
    const users = getRecentUsers();
    const id = generateId(userData.name, userData.date);

    // Remove existing entry with same ID (update scenario)
    const filtered = users.filter(u => u.id !== id);

    // Add new entry at the beginning
    const newUser: RecentUser = {
      ...userData,
      id,
      savedAt: Date.now()
    };

    filtered.unshift(newUser);

    // Keep only MAX_RECENT_USERS
    const trimmed = filtered.slice(0, MAX_RECENT_USERS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save recent user:', error);
  }
}

/**
 * Remove a user from recent users list
 */
export function removeRecentUser(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const users = getRecentUsers();
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove recent user:', error);
  }
}

/**
 * Clear all recent users
 */
export function clearRecentUsers(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear recent users:', error);
  }
}
