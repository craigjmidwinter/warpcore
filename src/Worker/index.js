import BeanstalkdWorker from 'beanstalkd-worker';
import config from 'config';
import { QUEUES } from '#root/Dispatcher/const';
import { PRE_EXECUTION_RESULTS } from '#tasks/const';
import getTask from '#tasks/taskMap';
import getLogger from '#services/LoggingService';

const logger = getLogger();

const host = config.get('providers.beanstalkd.host');
const port = config.get('providers.beanstalkd.port');
const beanstalkd = new BeanstalkdWorker(host, port);

const jobHandler = async payload => {
  const { taskName, taskData } = payload;
  const Task = getTask(taskName);

  try {
    const task = new Task({ data: taskData });
    const preExecResult = await task.preExecution();
    logger.debug('processing task');
    logger.debug(payload);

    switch (preExecResult) {
      case PRE_EXECUTION_RESULTS.EXECUTE:
        try {
          task.execute();
          return Promise.resolve();
        } catch (e) {
          logger.info(e);
          return Promise.reject();
        }
      case PRE_EXECUTION_RESULTS.REQUEUE:
        return this.delay(task.requeueTime);
      case PRE_EXECUTION_RESULTS.DISMISS:
        return Promise.resolve();
      default:
        return Promise.reject();
    }
  } catch (e) {
    logger.error(e);
  }
  return true;
};

export default async function consumeQueue() {
  try {
    beanstalkd.handle(QUEUES.DEFAULT, jobHandler, {
      tries: 3,
      backoff: {
        initial: 60 * 1000, // ms
        exponential: 1.5, // multiple backoff by N each try
      },
    });

    logger.info('starting worker', QUEUES.DEFAULT);
    beanstalkd.start();
  } catch (e) {
    logger.error(e);
  }
}
