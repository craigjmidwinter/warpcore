import BaseTask from '#root/Tasks/BaseTask';
import HomeAssistantService from '#services/HomeAssistant';
import { PRE_EXECUTION_RESULTS } from '#tasks/const';
import getLogger from '#services/LoggingService';

const logger = getLogger();

export default class TurnOffBloom extends BaseTask {
  async preExecution() {
    return PRE_EXECUTION_RESULTS.EXECUTE;
  }

  async execute() {
    logger.info('execute turn off bloom');
    try {
      await HomeAssistantService.callService({
        domain: 'homeassistant',
        service: 'turn_off',
        serviceData: {
          entity_id: 'light.bloom',
        },
      });
    } catch (e) {
      logger.error(e);
    }
  }
}
