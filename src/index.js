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
    const dispatcher = new Dispatcher({ beanstalkd: queue.beanstalkd });

    for (const svcCfgEntry of services) {
      const handler = new EventHandler({
        events: svcCfgEntry.Events,
        dispatcher,
        warpcore: this,
      });
      this.services[svcCfgEntry.Service.constructor] = new svcCfgEntry.Service(
        handler.handle,
        logger,
        svcCfgEntry.ServiceOptions
      );
    }

    this.worker = new Worker({
      beanstalkd: queue.beanstalkd,
      tasks,
      warpcore: this,
    });
  }

  getService = Service => {
    const svcKey = Service.constructor;
    return this.services[svcKey];
  };

  start = () => {
    this.worker.consumeQueue();
  };
}

export default Warpcore;
export { BaseEvent, BaseTask };
