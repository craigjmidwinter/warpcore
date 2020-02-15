import getLogger from '#services/LoggingService';
const logger = getLogger();

export default class BaseEvent {
  static meetsCondition() {
    logger.info('BaseEvent condition always returns true');
    return true;
  }

  static action() {
    logger.info('Dispatched BaseEvent');
  }
}
