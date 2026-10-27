const { isValidTransition, VALID_TRANSITIONS } = require('../constants/stages');
const ApiError = require('../utils/ApiError');

class StateMachineService {
  /**
   * Validate whether transitioning from currentStage to targetStage is allowed
   * @throws {ApiError} 422 Unprocessable Entity if transition is invalid
   */
  validateTransition(currentStage, targetStage) {
    if (!isValidTransition(currentStage, targetStage)) {
      const allowedNextStages = VALID_TRANSITIONS[currentStage] || [];
      const allowedStr = allowedNextStages.length
        ? allowedNextStages.map((s) => `'${s}'`).join(', ')
        : 'None (terminal stage)';

      throw ApiError.unprocessable(
        `Invalid stage transition from '${currentStage}' to '${targetStage}'. Permissible next stages: ${allowedStr}.`
      );
    }
    return true;
  }
}

module.exports = new StateMachineService();
