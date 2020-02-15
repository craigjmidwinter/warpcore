import { handleTimeEvent } from '#root/Dispatcher';
import getLogger from '#services/LoggingService';

const logger = getLogger();

export default function startTimer() {
  setInterval(() => {
    logger.debug('tick');
    handleTimeEvent();
  }, 60000);
}
