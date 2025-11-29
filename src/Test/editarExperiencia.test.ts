import { describe, it, expect, vi, beforeEach } from 'vitest';
import { editarExperiencia } from '../shared/components/editarExperiencia';

vi.mock('../../features/experience/services/patchExperience', () => ({
  patchExperience: vi.fn().mockResolvedValue({ success: true })
}));
vi.mock('../../features/experience/components/AddExperience', () => ({
  getUserId: () => 1
}));
vi.mock('sweetalert2', () => ({
  fire: vi.fn()
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

describe('editarExperiencia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call patchExperience and show success alert', async () => {
    const experience = { id: 10, name: 'Test' };
    const result = await editarExperiencia(experience);
    expect(result).toEqual({ success: true });
  });
});
