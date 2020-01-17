import Beanstalkd from 'beanstalkd-worker';
import config from 'config';
import * as HassEvents from '#events/HassEvents';

export function handleHomeAssistantEvent(hassData) {
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

export async function dispatchTask({
  taskName,
  taskData,
  delay = 0,
  priority = '0',
  ttr = 60,
  tube = 'default',
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
  console.log('task scheduled', job.id);
}
