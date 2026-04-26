import { api, unwrap } from '@core/api/client';

export const timetableService = {
  byClassGroup: (classGroupId) => api.get(`/api/timetable/class-group/${classGroupId}`).then(unwrap),
  byTeacher: (userId) => api.get(`/api/timetable/teacher/${userId}`).then(unwrap),
  byId: (id) => api.get(`/api/timetable/${id}`).then(unwrap),
  create: (payload) => api.post('/api/timetable', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/timetable/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/timetable/${id}`).then(unwrap),
};

export const attendanceService = {
  byClassGroupAndDate: (classGroupId, date) =>
    api.get(`/api/attendance/class-group/${classGroupId}/date/${date}`).then(unwrap),
  byStudent: (userId, params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    ).toString();
    return api.get(`/api/attendance/student/${userId}${query ? `?${query}` : ''}`).then(unwrap);
  },
  markBulk: (payload) => api.post('/api/attendance/bulk', payload).then(unwrap),
  remove: (id) => api.delete(`/api/attendance/${id}`).then(unwrap),
};
