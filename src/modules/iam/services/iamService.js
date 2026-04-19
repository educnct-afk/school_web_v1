import { api, unwrap } from '@core/api/client';

const qs = (params) => {
  const entries = Object.entries(params || {}).filter(([, v]) => v != null && v !== '');
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
};

export const userService = {
  list: () => api.get('/api/users').then(unwrap),
  byId: (id) => api.get(`/api/users/${id}`).then(unwrap),
  byOrg: (orgId, params) => api.get(`/api/users/org/${orgId}${qs(params)}`).then(unwrap),
  create: (payload) => api.post('/api/users', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/users/${id}`, payload).then(unwrap),
  changeRole: (id, roleId) => api.put(`/api/users/${id}/role`, { roleId }).then(unwrap),
  remove: (id) => api.delete(`/api/users/${id}`).then(unwrap),
};

export const roleService = {
  byOrg: (orgId) => api.get(`/api/roles/org/${orgId}`).then(unwrap),
  byId: (id) => api.get(`/api/roles/${id}`).then(unwrap),
  create: (payload) => api.post('/api/roles', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/roles/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/roles/${id}`).then(unwrap),
  permissions: (roleId) => api.get(`/api/roles/${roleId}/permissions`).then(unwrap),
  grant: (roleId, permissionId) => api.post(`/api/roles/${roleId}/permissions`, { permissionId }).then(unwrap),
  revoke: (roleId, permissionId) => api.delete(`/api/roles/${roleId}/permissions/${permissionId}`).then(unwrap),
};

export const permissionService = {
  list: () => api.get('/api/permissions').then(unwrap),
  byModule: (module) => api.get(`/api/permissions/module/${module}`).then(unwrap),
  create: (payload) => api.post('/api/permissions', payload).then(unwrap),
  remove: (id) => api.delete(`/api/permissions/${id}`).then(unwrap),
};

export const organizationService = {
  list: () => api.get('/api/organizations').then(unwrap),
  active: () => api.get('/api/organizations/active').then(unwrap),
  byId: (id) => api.get(`/api/organizations/${id}`).then(unwrap),
  create: (payload) => api.post('/api/organizations', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/organizations/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/organizations/${id}`).then(unwrap),
};

export const auditLogService = {
  byOrg: (orgId, params) => api.get(`/api/audit-logs/org/${orgId}${qs(params)}`).then(unwrap),
  byUser: (userId) => api.get(`/api/audit-logs/user/${userId}`).then(unwrap),
};

export const userProfileService = {
  get: (userId) => api.get(`/api/users/${userId}/profile`).then(unwrap),
  upsert: (userId, payload) => api.put(`/api/users/${userId}/profile`, payload).then(unwrap),
};
