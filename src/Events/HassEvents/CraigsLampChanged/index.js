import BaseEvent from '#root/Events/BaseEvent';
import { entityWentOn } from '#services/HomeAssistant/utils';

export default class CraigsLampChanged extends BaseEvent {
  static meetsCondition(data) {
    const { hassData } = data;
    return entityWentOn({ hassData, entityId: 'light.craigs_bedroom_lamp' });
  }
}
