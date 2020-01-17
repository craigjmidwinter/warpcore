import BaseEvent from '#root/Events/BaseEvent';
import { entityWentOn } from '#services/HomeAssistant/utils';
import { dispatchTask } from '#root/Dispatcher';
import { TASK_TURN_OFF_BLOOM } from '#tasks/TurnOffBloom';

export default class CraigsLampChanged extends BaseEvent {
  static meetsCondition(data) {
    const { hassData } = data;
    return entityWentOn({ hassData, entityId: 'light.craigs_bedroom_lamp' });
  }

  static async dispatch(data) {
    console.log('turning off bloom');

    dispatchTask({
      taskName: TASK_TURN_OFF_BLOOM,
      taskData: data,
    });
  }
}
