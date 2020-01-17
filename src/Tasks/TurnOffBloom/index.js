import BaseTask from '#root/Tasks/BaseTask';
import HomeAssistantService from '#services/HomeAssistant';

export const TASK_TURN_OFF_BLOOM = 'TurnOffBloom';

export default class TurnOffBloom extends BaseTask {
  async preExecution() {
    return PRE_EXECUTION_RESULTS.EXECUTE;
  }

  async execute() {
    try {
      await HomeAssistantService.callService({
        domain: 'homeassistant',
        service: 'turn_off',
        serviceData: {
          entity_id: 'light.bloom',
        },
      });
    } catch (e) {
      console.log(e);
    }
  }
}
