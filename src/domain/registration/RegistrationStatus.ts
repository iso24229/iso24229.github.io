export type RegistrationStatus =
  | 'proposed'
  | 'accepted'
  | 'notAccepted'
  | 'withdrawn'
  | 'superseded'
  | 'retired';

interface StatusMeta {
  label: string;
  description: string;
  badgeClass: string;
  sortOrder: number;
}

export const REGISTRATION_STATUS_META: Record<RegistrationStatus, StatusMeta> = {
  accepted: {
    label: 'Accepted',
    description: 'Approved by the Advisory Group and published in the register.',
    badgeClass: 'badge-accepted',
    sortOrder: 0,
  },
  proposed: {
    label: 'Proposed',
    description: 'Submitted for AG review; not yet approved.',
    badgeClass: 'badge-proposed',
    sortOrder: 1,
  },
  superseded: {
    label: 'Superseded',
    description: 'Replaced by a newer registration; reserved for backwards compatibility.',
    badgeClass: 'badge-superseded',
    sortOrder: 2,
  },
  retired: {
    label: 'Retired',
    description: 'No longer active; reserved for backwards compatibility.',
    badgeClass: 'badge-retired',
    sortOrder: 3,
  },
  withdrawn: {
    label: 'Withdrawn',
    description: 'Rescinded by the submitter before approval.',
    badgeClass: 'badge-withdrawn',
    sortOrder: 4,
  },
  notAccepted: {
    label: 'Not accepted',
    description: 'Rejected by the AG; not part of the register.',
    badgeClass: 'badge-not-accepted',
    sortOrder: 5,
  },
};

export const REGISTRATION_STATUS_ORDER: RegistrationStatus[] = (
  Object.entries(REGISTRATION_STATUS_META) as [RegistrationStatus, StatusMeta][]
)
  .sort((a, b) => a[1].sortOrder - b[1].sortOrder)
  .map(([k]) => k);

export function isRegistrationStatus(s: unknown): s is RegistrationStatus {
  return typeof s === 'string' && s in REGISTRATION_STATUS_META;
}

export function statusLabel(s: unknown): string {
  if (!isRegistrationStatus(s)) return 'Unknown';
  return REGISTRATION_STATUS_META[s].label;
}

export function statusDescription(s: unknown): string {
  if (!isRegistrationStatus(s)) return '';
  return REGISTRATION_STATUS_META[s].description;
}

export function statusBadgeClass(s: unknown): string {
  if (!isRegistrationStatus(s)) return 'badge';
  return REGISTRATION_STATUS_META[s].badgeClass;
}
