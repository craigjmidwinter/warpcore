import BaseEvent from '#root/Events/BaseEvent';
import { dispatchTask } from '#root/Dispatcher';
import { TASK_ARM_HOME } from '#tasks/const';

export default class ArmHomeNightly extends BaseEvent {
  static meetsCondition() {
    const date = new Date();
    return date.getHours() === 22 && date.getMinutes() === 0;
  }

  static async action(data) {
    console.log('Dispatching task arm home');

    dispatchTask({
      taskName: TASK_ARM_HOME,
      taskData: {},
    });
  }
}
