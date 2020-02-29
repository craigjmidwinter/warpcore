import getLogger from '#services/LoggingService';

const logger = getLogger();

class EventHandler {
  constructor(events = [], dispatcher) {
    this.events = events;
    this.dispatcher = dispatcher;
  }

  handle = data => {
    logger.info('event has fired');

    // We rip through all the events in the directory.
    // This used to be a for...of loop, but AirBnb's eslint rules say not to use that
    // ¯\_(ツ)_/¯
    Object.values(this.events).forEach(Event => {
      const event = new Event(this.dispatcher);
      if (event.meetsCondition(data)) {
        logger.info('event meets condition', event, data);
        event.action(data);
      }
    });
  };
}
export default EventHandler;
