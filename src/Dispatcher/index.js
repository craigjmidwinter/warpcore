import Beanstalkd from 'beanstalkd-worker';
import config from 'config';
import { QUEUES } from '#root/Dispatcher/const';
import * as HassEvents from '#events/HassEvents';
import * as TimeEvents from '#events/TimeEvents';
import getLogger from '#services/LoggingService';

const logger = getLogger();

export function handleHomeAssistantEvent(hassData) {
  const data = { hassData };
  logger.info('hass event fired');
  logger.debug(JSON.stringify(data, null, 2));

  // We rip through all the events in the directory.
  // This used to be a for...of loop, but AirBnb's eslint rules say not to use that
  // ¯\_(ツ)_/¯
  Object.values(HassEvents).forEach(event => {
    if (event.meetsCondition(data)) {
      logger.info('event meets condition', event, data);
      event.action(data);
    }
  });
}
export function handleTimeEvent() {
  // We rip through all the events in the directory.
  // This used to be a for...of loop, but AirBnb's eslint rules say not to use that
  // ¯\_(ツ)_/¯
  Object.values(TimeEvents).forEach(event => {
    if (event.meetsCondition()) {
      logger.info('event meets condition', event);
      event.action();
    }
  });
}

export async function dispatchTask({
  taskName,
  taskData,
  delay = 0,
  priority = '0',
  ttr = 60,
  tube = QUEUES.DEFAULT,
}) {
  const payload = {
    taskName,
    taskData,
  };

  const host = config.get('providers.beanstalkd.host');
  const port = config.get('providers.beanstalkd.port');
  const timeout = ttr * 1000;

  const beanstalkd = new Beanstalkd(host, port);
  const job = await beanstalkd.spawn(tube, payload, {
    delay,
    priority,
    timeout, // ms
  });
  logger.info('task scheduled', job.id);
}
