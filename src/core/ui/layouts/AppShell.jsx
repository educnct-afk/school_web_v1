import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Users, Shield, Key, Building2, ClipboardList, UserCircle,
  LogOut, Menu, GraduationCap, BookOpen, LayoutGrid, DoorOpen,
  CalendarDays, Building, UserCheck
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useAuthStore } from '@core/stores/authStore';
import { isFeatureEnabled, FEATURES } from '@core/features/featureFlags';
import { hasAny } from '@core/auth/hasPermission';
import Avatar from '@core/ui/Avatar';
import toast from 'react-hot-toast';
import { api } from '@core/api/client';

const NAV = [
  { to: '/', label: 'Home', icon: Home, module: null, feature: null, perms: [], section: null },
  { to: '/users', label: 'Users', icon: Users, module: 'IAM', feature: FEATURES.IAM.USERS, perms: ['iam:users:read'], section: 'IAM' },
  { to: '/roles', label: 'Roles', icon: Shield, module: 'IAM', feature: FEATURES.IAM.ROLES, perms: ['iam:roles:read'], section: 'IAM' },
  { to: '/permissions', label: 'Permissions', icon: Key, module: 'IAM', feature: FEATURES.IAM.PERMISSIONS, perms: ['iam:permissions:read'], section: 'IAM' },
  { to: '/organizations', label: 'Organizations', icon: Building2, module: 'IAM', feature: FEATURES.IAM.ORGANIZATIONS, perms: ['iam:organizations:read'], section: 'IAM' },
  { to: '/audit-log', label: 'Audit log', icon: ClipboardList, module: 'IAM', feature: FEATURES.IAM.AUDIT_LOG, perms: ['iam:audit-log:read'], section: 'IAM' },
  { to: '/profile', label: 'Profile', icon: UserCircle, module: 'IAM', feature: FEATURES.IAM.PROFILE, perms: [], section: 'IAM' },
  { to: '/students', label: 'Students', icon: GraduationCap, module: 'ACADEMIC', feature: FEATURES.ACADEMIC.STUDENTS, perms: ['academic:students:read'], section: 'Academic' },
  { to: '/staff', label: 'Staff', icon: UserCheck, module: 'ACADEMIC', feature: FEATURES.ACADEMIC.STAFF, perms: ['academic:staff:read'], section: 'Academic' },
  { to: '/class-groups', label: 'Classes', icon: LayoutGrid, module: 'ACADEMIC', feature: FEATURES.ACADEMIC.CLASS_GROUPS, perms: ['academic:class-groups:read'], section: 'Academic' },
  { to: '/subjects', label: 'Subjects', icon: BookOpen, module: 'ACADEMIC', feature: FEATURES.ACADEMIC.SUBJECTS, perms: ['academic:subjects:read'], section: 'Academic' },
  { to: '/departments', label: 'Departments', icon: Building, module: 'ACADEMIC', feature: FEATURES.ACADEMIC.DEPARTMENTS, perms: ['academic:departments:read'], section: 'Academic' },
  { to: '/academic-years', label: 'Academic Years', icon: CalendarDays, module: 'ACADEMIC', feature: FEATURES.ACADEMIC.ACADEMIC_YEARS, perms: ['academic:academic-years:read'], section: 'Academic' },
  { to: '/classrooms', label: 'Classrooms', icon: DoorOpen, module: 'ACADEMIC', feature: FEATURES.ACADEMIC.CLASSROOMS, perms: ['academic:classrooms:read'], section: 'Academic' },
];

function filterNav(permissions) {
  return NAV.filter((item) => {
    if (item.module && item.feature && !isFeatureEnabled(item.module, item.feature)) return false;
    if (item.perms.length && !hasAny(permissions, item.perms)) return false;
    return true;
  });
}

/** Group visible nav items: null-section items first (Home), then named sections. */
function groupNav(items) {
  const groups = [];
  const sectionMap = new Map();

  for (const item of items) {
    if (!item.section) {
      groups.push({ section: null, items: [item] });
    } else {
      if (!sectionMap.has(item.section)) {
        const g = { section: item.section, items: [] };
        sectionMap.set(item.section, g);
        groups.push(g);
      }
      sectionMap.get(item.section).items.push(item);
    }
  }
  return groups;
}

export default function AppShell() {
  const [openMobile, setOpenMobile] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  const logoutLocal = useAuthStore((s) => s.logoutLocal);
  const visible = filterNav(permissions);
  const groups = groupNav(visible);

  async function handleLogout() {
    try { await api.post('/api/auth/logout'); } catch { /* idempotent */ }
    logoutLocal();
    toast.success('Logged out');
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col border-r border-ink-100 dark:border-white/5 bg-white dark:bg-ink-800">
        <div className="p-5 flex items-center gap-2 border-b border-ink-100 dark:border-white/5">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white grid place-items-center">
            <GraduationCap size={20} />
          </div>
          <span className="font-semibold text-lg">School</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {groups.map((g) => (
            <div key={g.section ?? '__root'}>
              {g.section && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-500">
                  {g.section}
                </p>
              )}
              <div className="space-y-0.5">
                {g.items.map((item) => <NavItem key={item.to} item={item} />)}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-ink-100 dark:border-white/5">
          <UserCard user={user} onLogout={handleLogout} />
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-col min-w-0">
        {/* Top bar (mobile only) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-ink-800 border-b border-ink-100 dark:border-white/5 sticky top-0 z-30">
          <button onClick={() => setOpenMobile(true)} className="btn-ghost !p-2" aria-label="Menu">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white grid place-items-center">
              <GraduationCap size={16} />
            </div>
            <span className="font-semibold">School</span>
          </div>
          <Avatar name={user ? `${user.firstName} ${user.lastName}` : ''} size="sm" src={user?.avatarUrl} />
        </header>

        <main className="flex-1 min-w-0 p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Bottom tab bar (mobile) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-ink-800/95 backdrop-blur border-t border-ink-100 dark:border-white/5 z-30">
          <ul className="flex">
            {visible.slice(0, 5).map((item) => (
              <li key={item.to} className="flex-1">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => clsx(
                    'flex flex-col items-center gap-0.5 py-2.5 text-[11px]',
                    isActive ? 'text-brand-700 dark:text-brand-300' : 'text-ink-500'
                  )}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile drawer */}
        {openMobile && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={() => setOpenMobile(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-ink-800 p-4 overflow-y-auto animate-fadeIn">
              <div className="flex items-center gap-2 p-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white grid place-items-center">
                  <GraduationCap size={20} />
                </div>
                <span className="font-semibold text-lg">School</span>
              </div>
              <nav className="space-y-4">
                {groups.map((g) => (
                  <div key={g.section ?? '__root'}>
                    {g.section && (
                      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-500">
                        {g.section}
                      </p>
                    )}
                    <div className="space-y-0.5">
                      {g.items.map((item) => (
                        <NavItem key={item.to} item={item} onNavigate={() => setOpenMobile(false)} />
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-ink-100 dark:border-white/5">
                <UserCard user={user} onLogout={handleLogout} />
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      className={({ isActive }) => clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition',
        isActive
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 font-medium'
          : 'text-ink-700 dark:text-ink-100 hover:bg-ink-100/60 dark:hover:bg-white/5'
      )}
    >
      <item.icon size={18} />
      <span>{item.label}</span>
    </NavLink>
  );
}

function UserCard({ user, onLogout }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={user ? `${user.firstName} ${user.lastName}` : ''} src={user?.avatarUrl} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Guest'}
        </div>
        <div className="text-xs text-ink-500 truncate">{user?.role?.displayName || user?.role?.name}</div>
      </div>
      <button className="btn-ghost !p-2" aria-label="Log out" onClick={onLogout}>
        <LogOut size={16} />
      </button>
    </div>
  );
}
