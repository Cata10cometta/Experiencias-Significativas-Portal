import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePassword } from '../Api/Services/ChangePassword';

vi.mock('../Api/Config/Config', () => ({
  default: { put: vi.fn().mockResolvedValue({ data: { success: true } }) }
}));

describe('updatePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call API and return data', async () => {
    const payload = {
      userId: 1,
      currentPassword: 'oldpass',
      newPassword: 'newpass',
      confirmPassword: 'newpass'
    };
    const result = await updatePassword(payload);
    expect(result).toEqual({ success: true });
  });
});
