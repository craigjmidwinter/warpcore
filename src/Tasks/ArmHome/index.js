import BaseTask from '#root/Tasks/BaseTask';
import HomeAssistantService from '#services/HomeAssistant';
import { PRE_EXECUTION_RESULTS } from '#tasks/const';

export default class ArmHome extends BaseTask {
  preExecution = async () => {
    return PRE_EXECUTION_RESULTS.EXECUTE;
  };

  execute = async () => {
    console.log('arming home');
    try {
      await HomeAssistantService.callService({
        domain: 'alarm_control_panel',
        service: 'alarm_arm_home',
      });
    } catch (e) {
      console.log(e);
    }
  };
}
