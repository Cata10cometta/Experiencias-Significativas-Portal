import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createExperience } from '../Api/Services/createExperience';

vi.mock('axios', () => ({
  default: { post: vi.fn().mockResolvedValue({ data: { success: true, experienceId: 123 } }) }
}));

global.localStorage = {
  store: { token: 'mock-token' },
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value; },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; },
  get length() { return Object.keys(this.store).length; },
  key(index) { return Object.keys(this.store)[index] || null; }
} as Storage;

describe('createExperience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call API with token and return data', async () => {
    const payload = { name: 'Nueva Experiencia', description: 'Descripción' };
    const result = await createExperience(payload);
    expect(result).toEqual({ success: true, experienceId: 123 });
  });
});
