import getLogger from '#services/LoggingService';
import EventHandler from '#root/EventHandler';

const logger = getLogger();

export default class WarpcoreServiceContainer {
  services = [];

  addService(svcCfgEntry, dispatcher) {
    const handler = new EventHandler({
      events: svcCfgEntry.Events,
      dispatcher,
    });
    this.services[svcCfgEntry.Service.constructor] = new svcCfgEntry.Service(
      handler.handle,
      logger,
      svcCfgEntry.ServiceOptions
    );
  }

  getService = Service => {
    const svcKey = Service.constructor;
    return this.services[svcKey];
  };
}
