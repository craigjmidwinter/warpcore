import BeanstalkdWorker from 'beanstalkd-worker';
import config from 'config';
import { QUEUES } from '#root/Dispatcher/const';
import { TASK_MAP, PRE_EXECUTION_RESULTS } from '#tasks/const';

const host = config.get('providers.beanstalkd.host');
const port = config.get('providers.beanstalkd.port');
const beanstalkd = new BeanstalkdWorker(host, port);

const jobHandler = async function(payload) {
  const { taskName, taskData } = payload;
  const Task = TASK_MAP[taskName];

  try {
    const task = new Task({ data: taskData });
    const preExecResult = await task.preExecution();
    console.log('processing');
    console.log(payload);

    switch (preExecResult) {
      case PRE_EXECUTION_RESULTS.EXECUTE:
        try {
          task.execute();
          return Promise.resolve();
        } catch (e) {
          console.log(e);
          return Promise.reject();
        }
      case PRE_EXECUTION_RESULTS.REQUEUE:
        return this.delay(task.requeueTime);
        break;
      case PRE_EXECUTION_RESULTS.DISMISS:
        return Promise.resolve();
        break;
      default:
        return Promise.reject();
    }
  } catch (e) {
    console.log(e);
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

    console.log('starting worker', QUEUES.DEFAULT);
    beanstalkd.start();
  } catch (e) {
    console.log(e);
  }
}
