import * as HassEvents from '#events/HassEvents';

export default function handleHomeAssistantEvent(hassData) {
  const data = { hassData };

  // We rip through all the events in the directory.
  // This used to be a for...of loop, but AirBnb's eslint rules say not to use that
  // ¯\_(ツ)_/¯
  Object.values(HassEvents).forEach(event => {
    if (event.meetsCondition(data)) {
      console.log('event meets condition', event, data);
      event.dispatch(data);
    }
  });
}
