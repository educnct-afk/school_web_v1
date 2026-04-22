import { FEATURES } from '@core/features/featureFlags';

export const MODULES = Object.keys(FEATURES).map((key) => ({
  value: key.toLowerCase(),
  label: key,
}));

export function getResources(moduleValue) {
  const group = FEATURES[moduleValue?.toUpperCase()];
  if (!group) return [];
  return Object.values(group).map((v) => ({ value: v, label: v }));
}

export const ACTIONS = [
  { value: 'create', label: 'create' },
  { value: 'read',   label: 'read' },
  { value: 'update', label: 'update' },
  { value: 'delete', label: 'delete' },
  { value: 'grant',  label: 'grant' },
  { value: 'revoke', label: 'revoke' },
];
