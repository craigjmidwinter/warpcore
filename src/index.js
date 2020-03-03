/* eslint-disable no-restricted-syntax */
import getLogger from '#services/LoggingService';
import BaseEvent from '#root/Events/BaseEvent';
import BaseTask from '#root/Tasks/BaseTask';
import Worker from '#root/Worker';
import Dispatcher from '#root/Dispatcher';
import ServiceContainer from '#root/ServiceContainer';

const logger = getLogger();

logger.info('starting automation engine');

const serviceContainer = new ServiceContainer();

class Warpcore {
  services = [];

  worker;

  dispatcher;

  constructor(
    opts = {
      services: [],
    }
  ) {
    const { queue, tasks, services } = opts;
    const dispatcher = new Dispatcher({ beanstalkd: queue.beanstalkd });

    for (const svcCfgEntry of services) {
      serviceContainer.addService(svcCfgEntry, dispatcher);
    }

    this.worker = new Worker({
      beanstalkd: queue.beanstalkd,
      tasks,
    });
  }

  start = () => {
    this.worker.consumeQueue();
  };
}

export default Warpcore;
export { BaseEvent, BaseTask, serviceContainer };
