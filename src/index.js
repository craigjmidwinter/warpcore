/* eslint-disable no-restricted-syntax */
import getLogger from '#services/LoggingService';
import EventHandler from '#root/EventHandler';
import BaseEvent from '#root/Events/BaseEvent';
import BaseTask from '#root/Tasks/BaseTask';
import Worker from '#root/Worker';
import Dispatcher from '#root/Dispatcher';

const logger = getLogger();

logger.info('starting automation engine');

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
    this.worker = new Worker({ beanstalkd: queue.beanstalkd, tasks });
    const dispatcher = new Dispatcher({ beanstalkd: queue.beanstalkd });

    for (const service of services) {
      const handler = new EventHandler(service.Events, dispatcher);
      this.services = [
        ...this.services,
        new service.Service(handler.handle, logger, service.ServiceOptions),
      ];
    }
  }

  start = () => {
    this.worker.consumeQueue();
  };
}

export default Warpcore;
export { BaseEvent, BaseTask };
