const GLOBAL_PREFIX = 'tour';

const buildNamespacedKey = (baseKey: string): string => {
  if (typeof window === 'undefined') return baseKey;

  const userId = (typeof localStorage !== 'undefined' && localStorage.getItem('userId')) || 'anon';
  const role = (typeof localStorage !== 'undefined' && localStorage.getItem('role')) || 'guest';
  return `${GLOBAL_PREFIX}:${baseKey}:${role}:${userId}`;
};

export const hasTourBeenSeen = (baseKey: string): boolean => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
  const namespacedKey = buildNamespacedKey(baseKey);
  return localStorage.getItem(namespacedKey) === 'true';
};

export const markTourSeen = (baseKey: string): void => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  const namespacedKey = buildNamespacedKey(baseKey);
  localStorage.setItem(namespacedKey, 'true');
};

export const clearTourSeen = (baseKey: string): void => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  const namespacedKey = buildNamespacedKey(baseKey);
  localStorage.removeItem(namespacedKey);
};
