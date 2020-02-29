import BeanstalkdWorker from 'beanstalkd-worker';
import { QUEUES } from '#root/Dispatcher/const';
import { PRE_EXECUTION_RESULTS } from '#tasks/const';
import getLogger from '#services/LoggingService';

const logger = getLogger();

async function jobHandler(payload, Task) {
  const { taskData } = payload;
  logger.debug(this);
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
}

class Worker {
  beanstalkd;

  taskMap = [];

  constructor({ beanstalkd, tasks }) {
    const { host, port } = beanstalkd;
    this.taskMap = tasks;
    this.beanstalkd = new BeanstalkdWorker(host, port);
  }

  getTask = task => {
    // The Task Map should be an associative array of TASK_NAME: TaskClass pairs.
    return this.taskMap[task];
  };

  consumeQueue = async () => {
    try {
      const self = this;
      this.beanstalkd.handle(
        QUEUES.DEFAULT,
        // eslint-disable-next-line func-names
        function(payload) {
          const Task = self.getTask(payload.taskName); // This should return the uninstantiated class;
          // The beanstalkd library binds some additional functions to the function that is passed in as the handle callback.
          // We bind our jobHandler function to the same context so that we can use this.delay();
          jobHandler.bind(this);
          jobHandler(payload, Task);
        },
        {
          tries: 3,
          backoff: {
            initial: 60 * 1000, // ms
            exponential: 1.5, // multiple backoff by N each try
          },
        }
      );

      logger.info('starting worker', QUEUES.DEFAULT);
      this.beanstalkd.start();
    } catch (e) {
      logger.error(e);
    }
  };
}
export default Worker;
