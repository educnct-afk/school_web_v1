import { useAuthStore } from '@core/stores/authStore';
import Card, { CardHeader } from '@core/ui/Card';
import Badge from '@core/ui/Badge';
import {
  Users, Shield, Key, Building2, ClipboardList, UserCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { isFeatureEnabled, FEATURES } from '@core/features/featureFlags';
import { hasAny } from '@core/auth/hasPermission';

const TILES = [
  { to: '/users', title: 'Users', icon: Users, feature: FEATURES.IAM.USERS, perms: ['iam:users:read'] },
  { to: '/roles', title: 'Roles', icon: Shield, feature: FEATURES.IAM.ROLES, perms: ['iam:roles:read'] },
  { to: '/permissions', title: 'Permissions', icon: Key, feature: FEATURES.IAM.PERMISSIONS, perms: ['iam:permissions:read'] },
  { to: '/organizations', title: 'Organizations', icon: Building2, feature: FEATURES.IAM.ORGANIZATIONS, perms: ['iam:organizations:read'] },
  { to: '/audit-log', title: 'Audit log', icon: ClipboardList, feature: FEATURES.IAM.AUDIT_LOG, perms: ['iam:audit-log:read'] },
  { to: '/profile', title: 'Profile', icon: UserCircle, feature: FEATURES.IAM.PROFILE, perms: [] },
];

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  const organization = useAuthStore((s) => s.organization);

  const visible = TILES.filter((t) =>
    isFeatureEnabled('IAM', t.feature) && (!t.perms.length || hasAny(permissions, t.perms))
  );

  const greeting = greetingFor(user);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-sm text-ink-500">{organization?.name}</div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            {greeting}, {user?.firstName || 'there'} 👋
          </h1>
          <p className="text-ink-500 mt-1">Here's your workspace.</p>
        </div>
        <Badge tone="brand">
          {user?.role?.icon ? <span className="mr-1">{user.role.icon}</span> : null}
          {user?.role?.displayName || user?.role?.name || 'Member'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {visible.map((tile) => (
          <Link key={tile.to} to={tile.to} className="card p-5 hover:shadow-pop transition">
            <tile.icon className="text-brand-600 dark:text-brand-300" size={22} />
            <div className="mt-3 font-medium">{tile.title}</div>
            <div className="text-xs text-ink-500 mt-0.5">Open →</div>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader title="Your permissions" subtitle="Effective permissions resolved from your role" />
        {permissions?.length ? (
          <div className="flex flex-wrap gap-2">
            {permissions.map((p) => <Badge key={p} tone="neutral">{p}</Badge>)}
          </div>
        ) : (
          <p className="text-sm text-ink-500">No permissions assigned.</p>
        )}
      </Card>
    </div>
  );
}

function greetingFor() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
