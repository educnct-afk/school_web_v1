import { api, unwrap } from '@core/api/client';

export const subjectOfferingService = {
  byClassGroup: (classGroupId) => api.get(`/api/subject-offerings/class-group/${classGroupId}`).then(unwrap),
  byStudent: (studentUserId) => api.get(`/api/subject-offerings/student/${studentUserId}`).then(unwrap),
  create: (payload) => api.post('/api/subject-offerings', payload).then(unwrap),
  remove: (id) => api.delete(`/api/subject-offerings/${id}`).then(unwrap),
};

export const assignmentService = {
  byOffering: (offeringId) => api.get(`/api/assignments/offering/${offeringId}`).then(unwrap),
  byTeacher: (teacherUserId, kind) => {
    const q = kind ? `?kind=${encodeURIComponent(kind)}` : '';
    return api.get(`/api/assignments/teacher/${teacherUserId}${q}`).then(unwrap);
  },
  create: (payload) => api.post('/api/assignments', payload).then(unwrap),
  submissions: (id) => api.get(`/api/assignments/${id}/submissions`).then(unwrap),
  submit: (id, payload) => api.post(`/api/assignments/${id}/submit`, payload).then(unwrap),
  remove: (id) => api.delete(`/api/assignments/${id}`).then(unwrap),
};

export const studyMaterialService = {
  byOffering: (offeringId) => api.get(`/api/study-materials/offering/${offeringId}`).then(unwrap),
  create: (payload) => api.post('/api/study-materials', payload).then(unwrap),
  remove: (id) => api.delete(`/api/study-materials/${id}`).then(unwrap),
};

export const diaryService = {
  byOffering: (offeringId) => api.get(`/api/diary/offering/${offeringId}`).then(unwrap),
  create: (payload) => api.post('/api/diary', payload).then(unwrap),
  remove: (id) => api.delete(`/api/diary/${id}`).then(unwrap),
};

export const noteService = {
  byOfferingAndStudent: (offeringId, studentUserId) =>
    api.get(`/api/notes/offering/${offeringId}/student/${studentUserId}`).then(unwrap),
  upsert: (offeringId, payload) => api.put(`/api/notes/offering/${offeringId}`, payload).then(unwrap),
};

export const mockTestService = {
  byOfferingAndStudent: (studentUserId, offeringId) =>
    api.get(`/api/mock-tests/student/${studentUserId}/offering/${offeringId}`).then(unwrap),
  byId: (id) => api.get(`/api/mock-tests/${id}`).then(unwrap),
  generate: (payload) => api.post('/api/mock-tests/generate', payload).then(unwrap),
  submitAttempt: (mockTestId, payload) =>
    api.post(`/api/mock-tests/${mockTestId}/attempt`, payload).then(unwrap),
};
