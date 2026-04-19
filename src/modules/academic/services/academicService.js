import { api, unwrap } from '@core/api/client';

const qs = (params) => {
  const entries = Object.entries(params || {}).filter(([, v]) => v != null && v !== '');
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
};

export const departmentService = {
  byOrg: (orgId) => api.get(`/api/departments/org/${orgId}`).then(unwrap),
  byId: (id) => api.get(`/api/departments/${id}`).then(unwrap),
  create: (payload) => api.post('/api/departments', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/departments/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/departments/${id}`).then(unwrap),
};

export const academicYearService = {
  byOrg: (orgId) => api.get(`/api/academic-years/org/${orgId}`).then(unwrap),
  current: (orgId) => api.get(`/api/academic-years/org/${orgId}/current`).then(unwrap),
  byId: (id) => api.get(`/api/academic-years/${id}`).then(unwrap),
  create: (payload) => api.post('/api/academic-years', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/academic-years/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/academic-years/${id}`).then(unwrap),
};

export const termService = {
  byAcademicYear: (academicYearId) => api.get(`/api/terms/academic-year/${academicYearId}`).then(unwrap),
  byId: (id) => api.get(`/api/terms/${id}`).then(unwrap),
  create: (payload) => api.post('/api/terms', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/terms/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/terms/${id}`).then(unwrap),
};

export const classGroupService = {
  byOrg: (orgId) => api.get(`/api/class-groups/org/${orgId}`).then(unwrap),
  byAcademicYear: (academicYearId) => api.get(`/api/class-groups/academic-year/${academicYearId}`).then(unwrap),
  byId: (id) => api.get(`/api/class-groups/${id}`).then(unwrap),
  create: (payload) => api.post('/api/class-groups', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/class-groups/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/class-groups/${id}`).then(unwrap),
};

export const subjectService = {
  byOrg: (orgId) => api.get(`/api/subjects/org/${orgId}`).then(unwrap),
  byId: (id) => api.get(`/api/subjects/${id}`).then(unwrap),
  create: (payload) => api.post('/api/subjects', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/subjects/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/subjects/${id}`).then(unwrap),
};

export const classroomService = {
  byOrg: (orgId) => api.get(`/api/classrooms/org/${orgId}`).then(unwrap),
  byId: (id) => api.get(`/api/classrooms/${id}`).then(unwrap),
  create: (payload) => api.post('/api/classrooms', payload).then(unwrap),
  update: (id, payload) => api.put(`/api/classrooms/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/classrooms/${id}`).then(unwrap),
};

export const studentService = {
  byOrg: (orgId) => api.get(`/api/students/org/${orgId}`).then(unwrap),
  byClassGroup: (classGroupId) => api.get(`/api/students/class-group/${classGroupId}`).then(unwrap),
  byId: (userId) => api.get(`/api/students/${userId}`).then(unwrap),
  create: (payload) => api.post('/api/students', payload).then(unwrap),
  update: (userId, payload) => api.put(`/api/students/${userId}`, payload).then(unwrap),
  remove: (userId) => api.delete(`/api/students/${userId}`).then(unwrap),
};

export const staffService = {
  byOrg: (orgId) => api.get(`/api/staff/org/${orgId}`).then(unwrap),
  byId: (userId) => api.get(`/api/staff/${userId}`).then(unwrap),
  assignments: (userId) => api.get(`/api/staff/${userId}/assignments`).then(unwrap),
  create: (payload) => api.post('/api/staff', payload).then(unwrap),
  update: (userId, payload) => api.put(`/api/staff/${userId}`, payload).then(unwrap),
  addAssignment: (userId, payload) => api.post(`/api/staff/${userId}/assignments`, payload).then(unwrap),
  removeAssignment: (userId, assignmentId) => api.delete(`/api/staff/${userId}/assignments/${assignmentId}`).then(unwrap),
  remove: (userId) => api.delete(`/api/staff/${userId}`).then(unwrap),
};

export const guardianService = {
  byOrg: (orgId) => api.get(`/api/guardians/org/${orgId}`).then(unwrap),
  byId: (userId) => api.get(`/api/guardians/${userId}`).then(unwrap),
  students: (userId) => api.get(`/api/guardians/${userId}/students`).then(unwrap),
  create: (payload) => api.post('/api/guardians', payload).then(unwrap),
  linkStudent: (userId, payload) => api.post(`/api/guardians/${userId}/students`, payload).then(unwrap),
  unlinkStudent: (userId, studentUserId) => api.delete(`/api/guardians/${userId}/students/${studentUserId}`).then(unwrap),
  remove: (userId) => api.delete(`/api/guardians/${userId}`).then(unwrap),
};
