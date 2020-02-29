/* eslint-disable import/prefer-default-export */
import Beanstalkd from 'beanstalkd-worker';
import { QUEUES } from '#root/Dispatcher/const';
import getLogger from '#services/LoggingService';

const logger = getLogger();

export default class Dispatcher {
  beanstalkd;

  constructor({ host, port }) {
    this.beanstalkd = new Beanstalkd(host, port);
  }

  dispatchTask = async ({
    taskName,
    taskData,
    delay = 0,
    priority = '0',
    ttr = 60,
    tube = QUEUES.DEFAULT,
  }) => {
    const payload = {
      taskName,
      taskData,
    };

    const timeout = ttr * 1000;

    const job = await this.beanstalkd.spawn(tube, payload, {
      delay,
      priority,
      timeout, // ms
    });
    logger.info('task scheduled', job.id);
  };
}
