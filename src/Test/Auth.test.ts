import { describe, it, expect, vi } from 'vitest';
import { login, saveToken, getToken } from '../Api/Services/Auth';

global.localStorage = {
  store: {},
  getItem(key: string) { return this.store[key] || null; },
  setItem(key: string, value: string) { this.store[key] = value; },
  removeItem(key: string) { delete this.store[key]; },
  clear() { this.store = {}; },
  get length() { return Object.keys(this.store).length; },
  key(index: number) { return Object.keys(this.store)[index] || null; }
} as Storage;

describe('Auth Service', () => {
  it('should save and get token correctly', () => {
    saveToken('test-token', 1);
    const token = getToken();
    expect(token).toBe('test-token');
  });

  it('should remove expired token', () => {
    saveToken('expired-token', -1); // Expired
    const token = getToken();
    expect(token).toBeNull();
  });

  it('should handle raw token string', () => {
    localStorage.setItem('token', 'raw-token');
    const token = getToken();
    expect(token).toBe('raw-token');
  });
});
