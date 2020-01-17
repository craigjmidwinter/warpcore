import BaseEvent from '#root/Events/BaseEvent';
import { dispatchTask } from '#root/Dispatcher';

export default class BloomLampChanged extends BaseEvent {
  static meetsCondition(data) {
    const { hassData } = data;
    return entityWentOn({ hassData, entityId: 'light.bloom' });
  }

  static action(data) {}
}
