import { api, unwrap } from '@core/api/client';

export const authService = {
  async login({ email, password, organizationId }) {
    const res = await api.post('/api/auth/login', { email, password, organizationId });
    return unwrap(res); // { token, user, organization }
  },
  async logout() {
    const res = await api.post('/api/auth/logout');
    return unwrap(res);
  },
  async me() {
    const res = await api.get('/api/auth/me');
    return unwrap(res); // { id, email, firstName, lastName, role, organization, permissions }
  },
  async requestPasswordReset({ userId, tokenHash, expiresAt }) {
    const res = await api.post('/api/password-resets', { userId, tokenHash, expiresAt });
    return unwrap(res);
  },
  async consumePasswordReset({ tokenHash }) {
    const res = await api.post('/api/password-resets/consume', { tokenHash });
    return unwrap(res);
  },
};

export const sessionService = {
  async listMine(userId) {
    const res = await api.get(`/api/sessions/user/${userId}`);
    return unwrap(res);
  },
  async revoke(id) {
    const res = await api.delete(`/api/sessions/${id}`);
    return unwrap(res);
  },
  async revokeAll(userId) {
    const res = await api.delete(`/api/sessions/user/${userId}`);
    return unwrap(res);
  },
};
