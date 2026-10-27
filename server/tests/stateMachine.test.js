const stateMachineService = require('../src/services/stateMachine.service');
const { STAGES, isValidTransition } = require('../src/constants/stages');
const ApiError = require('../src/utils/ApiError');

describe('Finite State Machine Transition Rules', () => {
  describe('isValidTransition helper', () => {
    it('allows valid transitions from Wishlist', () => {
      expect(isValidTransition(STAGES.WISHLIST, STAGES.APPLIED)).toBe(true);
      expect(isValidTransition(STAGES.WISHLIST, STAGES.WITHDRAWN)).toBe(true);
    });

    it('blocks illegal forward jumps from Wishlist to Offer or Interview', () => {
      expect(isValidTransition(STAGES.WISHLIST, STAGES.OFFER)).toBe(false);
      expect(isValidTransition(STAGES.WISHLIST, STAGES.INTERVIEW)).toBe(false);
      expect(isValidTransition(STAGES.WISHLIST, STAGES.ONLINE_ASSESSMENT)).toBe(false);
    });

    it('allows valid progression from Applied stage', () => {
      expect(isValidTransition(STAGES.APPLIED, STAGES.ONLINE_ASSESSMENT)).toBe(true);
      expect(isValidTransition(STAGES.APPLIED, STAGES.INTERVIEW)).toBe(true);
      expect(isValidTransition(STAGES.APPLIED, STAGES.REJECTED)).toBe(true);
      expect(isValidTransition(STAGES.APPLIED, STAGES.WITHDRAWN)).toBe(true);
    });

    it('blocks illegal jump from Applied directly to Offer', () => {
      expect(isValidTransition(STAGES.APPLIED, STAGES.OFFER)).toBe(false);
    });

    it('allows Interview to progress to Offer, Rejected, or Withdrawn', () => {
      expect(isValidTransition(STAGES.INTERVIEW, STAGES.OFFER)).toBe(true);
      expect(isValidTransition(STAGES.INTERVIEW, STAGES.REJECTED)).toBe(true);
      expect(isValidTransition(STAGES.INTERVIEW, STAGES.WITHDRAWN)).toBe(true);
    });

    it('blocks illegal reverse jumps (e.g. Interview back to Online Assessment)', () => {
      expect(isValidTransition(STAGES.INTERVIEW, STAGES.ONLINE_ASSESSMENT)).toBe(false);
      expect(isValidTransition(STAGES.INTERVIEW, STAGES.APPLIED)).toBe(false);
    });

    it('allows idempotent transition to the exact same stage', () => {
      expect(isValidTransition(STAGES.APPLIED, STAGES.APPLIED)).toBe(true);
      expect(isValidTransition(STAGES.INTERVIEW, STAGES.INTERVIEW)).toBe(true);
    });
  });

  describe('stateMachineService.validateTransition', () => {
    it('returns true for an authorized transition', () => {
      expect(
        stateMachineService.validateTransition(STAGES.WISHLIST, STAGES.APPLIED)
      ).toBe(true);
    });

    it('throws ApiError with status 422 and actionable message for invalid transition', () => {
      expect(() => {
        stateMachineService.validateTransition(STAGES.WISHLIST, STAGES.OFFER);
      }).toThrow(ApiError);

      try {
        stateMachineService.validateTransition(STAGES.WISHLIST, STAGES.OFFER);
      } catch (err) {
        expect(err.statusCode).toBe(422);
        expect(err.message).toContain("Invalid stage transition from 'Wishlist' to 'Offer'");
        expect(err.message).toContain("Permissible next stages: 'Applied', 'Withdrawn'");
      }
    });
  });
});
