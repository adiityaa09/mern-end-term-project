/**
 * Application Lifecycle Stages and Finite State Machine definitions
 */
const STAGES = Object.freeze({
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  ONLINE_ASSESSMENT: 'Online Assessment',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn'
});

/**
 * Valid stage transition mapping graph.
 * Enforces business domain logic on stage movements.
 */
const VALID_TRANSITIONS = Object.freeze({
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
  [STAGES.REJECTED]: [STAGES.WISHLIST], // Re-application cycle permitted
  [STAGES.WITHDRAWN]: [STAGES.WISHLIST] // Re-opening permitted
});

/**
 * Verify whether a stage transition is permissible
 */
const isValidTransition = (currentStage, targetStage) => {
  if (currentStage === targetStage) return true; // Idempotent no-op
  const allowed = VALID_TRANSITIONS[currentStage];
  return Array.isArray(allowed) && allowed.includes(targetStage);
};

const APPLICATION_SOURCES = Object.freeze([
  'LinkedIn',
  'Indeed',
  'Handshake',
  'Career Portal',
  'Referral',
  'Campus Placement',
  'Other'
]);

module.exports = {
  STAGES,
  VALID_TRANSITIONS,
  isValidTransition,
  APPLICATION_SOURCES
};
