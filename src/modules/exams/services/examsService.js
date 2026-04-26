import { api, unwrap } from '@core/api/client';

export const examScheduleService = {
  byOrg: (orgId) => api.get(`/api/exam-schedules/org/${orgId}`).then(unwrap),
  byId: (id) => api.get(`/api/exam-schedules/${id}`).then(unwrap),
  create: (payload) => api.post('/api/exam-schedules', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/exam-schedules/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/exam-schedules/${id}`).then(unwrap),
};

export const gradeService = {
  byOrg: (orgId) => api.get(`/api/grades/org/${orgId}`).then(unwrap),
  byStudent: (userId) => api.get(`/api/grades/student/${userId}`).then(unwrap),
  byId: (id) => api.get(`/api/grades/${id}`).then(unwrap),
  create: (payload) => api.post('/api/grades', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/grades/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/grades/${id}`).then(unwrap),
};

export const reportCardService = {
  byOrg: (orgId) => api.get(`/api/report-cards/org/${orgId}`).then(unwrap),
  byStudent: (userId) => api.get(`/api/report-cards/student/${userId}`).then(unwrap),
  byId: (id) => api.get(`/api/report-cards/${id}`).then(unwrap),
  create: (payload) => api.post('/api/report-cards', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/report-cards/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/report-cards/${id}`).then(unwrap),
};
