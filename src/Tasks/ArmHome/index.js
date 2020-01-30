import BaseTask from '#root/Tasks/BaseTask';
import HomeAssistantService from '#services/HomeAssistant';
import { PRE_EXECUTION_RESULTS } from '#tasks/const';
import getLogger from '#services/LoggingService';

const logger = getLogger();

export default class ArmHome extends BaseTask {
  preExecution = async () => {
    return PRE_EXECUTION_RESULTS.EXECUTE;
  };

  execute = async () => {
    logger.info('Arming Home');
    try {
      await HomeAssistantService.callService({
        domain: 'alarm_control_panel',
        service: 'alarm_arm_home',
      });
    } catch (e) {
      logger.error(e);
    }
  };
}
