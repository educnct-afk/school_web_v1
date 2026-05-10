import { useAuthStore } from '@core/stores/authStore';
import StudentWorkspacePage from './StudentWorkspacePage';
import TeacherWorkspacePage from './TeacherWorkspacePage';

/**
 * /workspace dispatch by archetype. Roles in the IAM module are tagged with one of
 * STUDENT | STAFF | GUARDIAN; the page they see depends on that tag.
 *
 * Roles without an archetype (e.g. system roles like SUPER_ADMIN) fall through to
 * the student page — they almost certainly won't have a StudentProfile so they'll
 * see the empty state, which is the least-confusing default.
 */
export default function WorkspaceRouter() {
  const archetype = useAuthStore((s) => s.user?.role?.archetype);
  if (archetype === 'STAFF') return <TeacherWorkspacePage />;
  return <StudentWorkspacePage />;
}
