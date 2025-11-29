import { describe, it, expect, vi } from 'vitest';
import { registerPerson } from '../Api/Services/Register';

vi.mock('../Api/Config/Config', () => ({
  default: { post: vi.fn().mockResolvedValue({ data: { success: true, id: 1 } }) }
}));

describe('registerPerson', () => {
  it('should call API and return data', async () => {
    const payload = { name: 'Test', email: 'test@example.com' };
    const result = await registerPerson(payload);
    expect(result).toEqual({ success: true, id: 1 });
  });
});
