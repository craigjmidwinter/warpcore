import BaseEvent from '#root/Events/BaseEvent';
import { dispatchTask } from '#root/Dispatcher';
import { TASK_ARM_HOME } from '#tasks/const';
import getLogger from '#services/LoggingService';

const logger = getLogger();

export default class ArmHomeNightly extends BaseEvent {
  static meetsCondition() {
    const date = new Date();
    return date.getHours() === 22 && date.getMinutes() === 0;
  }

  static async action(data) {
    logger.info('Dispatching task arm home');

    dispatchTask({
      taskName: TASK_ARM_HOME,
      taskData: {},
    });
  }
}
