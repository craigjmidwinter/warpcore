import getLogger from '#services/LoggingService';

const logger = getLogger();

export default class BaseEvent {
  constructor(dispatcher) {
    this.dispatchTask = dispatcher.dispatchTask;
  }

  dispatchTask = opt => {
    logger.error('dispatchTask called but no dispatcher.');
    logger.error(JSON.stringify(opt, null, 2));
  };

  meetsCondition = () => {
    logger.info('BaseEvent condition always returns true');
    return true;
  };

  action = () => {
    logger.info('Dispatched BaseEvent');
  };
}
