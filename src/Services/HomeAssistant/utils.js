import { EVENT_TYPE_STATE_CHANGED, STATE_ON, STATE_OFF } from './const';

export function isStateChangedEvent({ hassData }) {
  return (
    hassData.event_type && hassData.event_type === EVENT_TYPE_STATE_CHANGED
  );
}

export function entityWentOff({ hassData, entityId = false }) {
  if (
    isStateChangedEvent({ hassData }) &&
    hassData.data.new_state.state === STATE_OFF &&
    hassData.data.old_state.state !== STATE_OFF
  ) {
    if (!entityId || hassData.data.entity_id === entityId) {
      return true;
    }
  }
  return false;
}
export function entityWentOn({ hassData, entityId = false }) {
  if (
    isStateChangedEvent({ hassData }) &&
    hassData.data.new_state.state === STATE_ON &&
    hassData.data.old_state.state !== STATE_ON
  ) {
    if (!entityId || hassData.data.entity_id === entityId) {
      return true;
    }
  }
  return false;
}
