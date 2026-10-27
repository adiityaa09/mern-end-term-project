export const STAGES = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  ONLINE_ASSESSMENT: 'Online Assessment',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn'
};

export const STAGE_LIST = [
  STAGES.WISHLIST,
  STAGES.APPLIED,
  STAGES.ONLINE_ASSESSMENT,
  STAGES.INTERVIEW,
  STAGES.OFFER,
  STAGES.REJECTED,
  STAGES.WITHDRAWN
];

export const STAGE_META = {
  [STAGES.WISHLIST]: {
    color: 'slate',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    headerClass: 'border-slate-300 bg-slate-50 text-slate-700',
    dotClass: 'bg-slate-400'
  },
  [STAGES.APPLIED]: {
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    headerClass: 'border-blue-300 bg-blue-50 text-blue-700',
    dotClass: 'bg-blue-500'
  },
  [STAGES.ONLINE_ASSESSMENT]: {
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    headerClass: 'border-amber-300 bg-amber-50 text-amber-700',
    dotClass: 'bg-amber-500'
  },
  [STAGES.INTERVIEW]: {
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    headerClass: 'border-purple-300 bg-purple-50 text-purple-700',
    dotClass: 'bg-purple-500'
  },
  [STAGES.OFFER]: {
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    headerClass: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    dotClass: 'bg-emerald-500'
  },
  [STAGES.REJECTED]: {
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    headerClass: 'border-rose-300 bg-rose-50 text-rose-700',
    dotClass: 'bg-rose-500'
  },
  [STAGES.WITHDRAWN]: {
    color: 'gray',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    headerClass: 'border-gray-300 bg-gray-50 text-gray-700',
    dotClass: 'bg-gray-400'
  }
};

export const APPLICATION_SOURCES = [
  'LinkedIn',
  'Indeed',
  'Handshake',
  'Career Portal',
  'Referral',
  'Campus Placement',
  'Other'
];

export const VALID_TRANSITIONS = {
  [STAGES.WISHLIST]: [STAGES.APPLIED, STAGES.WITHDRAWN],
  [STAGES.APPLIED]: [
    STAGES.ONLINE_ASSESSMENT,
    STAGES.INTERVIEW,
    STAGES.REJECTED,
    STAGES.WITHDRAWN
  ],
  [STAGES.ONLINE_ASSESSMENT]: [
    STAGES.INTERVIEW,
    STAGES.REJECTED,
    STAGES.WITHDRAWN
  ],
  [STAGES.INTERVIEW]: [
    STAGES.OFFER,
    STAGES.REJECTED,
    STAGES.WITHDRAWN
  ],
  [STAGES.OFFER]: [STAGES.WITHDRAWN],
  [STAGES.REJECTED]: [STAGES.WISHLIST],
  [STAGES.WITHDRAWN]: [STAGES.WISHLIST]
};

export const isValidTransition = (from, to) => {
  if (from === to) return true;
  const allowed = VALID_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
};
