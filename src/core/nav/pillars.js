import {
  Home, Users, Shield, Key, Building2, ClipboardList,
  GraduationCap, BookOpen, LayoutGrid, DoorOpen,
  CalendarDays, Building, UserCheck, UsersRound,
  CalendarRange, ClipboardCheck,
  ScrollText, CalendarClock, Award, FileText,
} from 'lucide-react';
import { FEATURES, isFeatureEnabled } from '@core/features/featureFlags';
import { hasAny } from '@core/auth/hasPermission';

export const PILLARS = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    standalone: true,
    to: '/',
  },
  {
    id: 'directory',
    label: 'Directory',
    icon: UsersRound,
    items: [
      { to: '/users',    label: 'Users',    icon: Users,         module: 'IAM',      feature: FEATURES.IAM.USERS,         perms: ['iam:users:read'] },
      { to: '/students', label: 'Students', icon: GraduationCap, module: 'ACADEMIC', feature: FEATURES.ACADEMIC.STUDENTS, perms: ['academic:students:read'] },
      { to: '/staff',    label: 'Staff',    icon: UserCheck,     module: 'ACADEMIC', feature: FEATURES.ACADEMIC.STAFF,    perms: ['academic:staff:read'] },
    ],
  },
  {
    id: 'academic',
    label: 'Academic',
    icon: GraduationCap,
    items: [
      { to: '/class-groups',   label: 'Classes',        icon: LayoutGrid,   module: 'ACADEMIC', feature: FEATURES.ACADEMIC.CLASS_GROUPS,   perms: ['academic:class-groups:read'] },
      { to: '/subjects',       label: 'Subjects',       icon: BookOpen,     module: 'ACADEMIC', feature: FEATURES.ACADEMIC.SUBJECTS,       perms: ['academic:subjects:read'] },
      { to: '/departments',    label: 'Departments',    icon: Building,     module: 'ACADEMIC', feature: FEATURES.ACADEMIC.DEPARTMENTS,    perms: ['academic:departments:read'] },
      { to: '/academic-years', label: 'Academic Years', icon: CalendarDays, module: 'ACADEMIC', feature: FEATURES.ACADEMIC.ACADEMIC_YEARS, perms: ['academic:academic-years:read'] },
      { to: '/classrooms',     label: 'Classrooms',     icon: DoorOpen,     module: 'ACADEMIC', feature: FEATURES.ACADEMIC.CLASSROOMS,     perms: ['academic:classrooms:read'] },
    ],
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: CalendarRange,
    items: [
      { to: '/timetable',  label: 'Timetable',  icon: CalendarRange,   module: 'SCHEDULE', feature: FEATURES.SCHEDULE.TIMETABLE,  perms: ['schedule:timetable:read'] },
      { to: '/attendance', label: 'Attendance', icon: ClipboardCheck,  module: 'SCHEDULE', feature: FEATURES.SCHEDULE.ATTENDANCE, perms: ['schedule:attendance:read'] },
    ],
  },
  {
    id: 'exams',
    label: 'Exams',
    icon: ScrollText,
    items: [
      { to: '/exam-schedules', label: 'Exam schedules', icon: CalendarClock, module: 'EXAMS', feature: FEATURES.EXAMS.EXAM_SCHEDULES, perms: ['exams:exam-schedules:read'] },
      { to: '/grades',         label: 'Grades',         icon: Award,         module: 'EXAMS', feature: FEATURES.EXAMS.GRADES,         perms: ['exams:grades:read'] },
      { to: '/report-cards',   label: 'Report cards',   icon: FileText,      module: 'EXAMS', feature: FEATURES.EXAMS.REPORT_CARDS,   perms: ['exams:report-cards:read'] },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    items: [
      { to: '/roles',         label: 'Roles',         icon: Shield,        module: 'IAM', feature: FEATURES.IAM.ROLES,         perms: ['iam:roles:read'] },
      { to: '/permissions',   label: 'Permissions',   icon: Key,           module: 'IAM', feature: FEATURES.IAM.PERMISSIONS,   perms: ['iam:permissions:read'] },
      { to: '/organizations', label: 'Organizations', icon: Building2,     module: 'IAM', feature: FEATURES.IAM.ORGANIZATIONS, perms: ['iam:organizations:read'] },
      { to: '/audit-log',     label: 'Audit log',     icon: ClipboardList, module: 'IAM', feature: FEATURES.IAM.AUDIT_LOG,     perms: ['iam:audit-log:read'] },
    ],
  },
];

function itemVisible(item, permissions) {
  if (item.module && item.feature && !isFeatureEnabled(item.module, item.feature)) return false;
  if (item.perms?.length && !hasAny(permissions, item.perms)) return false;
  return true;
}

export function getVisiblePillars(permissions) {
  return PILLARS
    .map((p) => p.standalone ? p : { ...p, items: p.items.filter((i) => itemVisible(i, permissions)) })
    .filter((p) => p.standalone || p.items.length > 0);
}

export function getActivePillar(pathname, pillars) {
  if (pathname === '/') return pillars.find((p) => p.id === 'home') ?? pillars[0];
  for (const p of pillars) {
    if (p.standalone) continue;
    if (p.items.some((i) => pathname === i.to || pathname.startsWith(i.to + '/'))) return p;
  }
  return pillars[0];
}

export function findItemByPath(pathname, pillars) {
  for (const p of pillars) {
    if (p.standalone) continue;
    const hit = p.items.find((i) => pathname === i.to || pathname.startsWith(i.to + '/'));
    if (hit) return { pillar: p, item: hit };
  }
  return null;
}
