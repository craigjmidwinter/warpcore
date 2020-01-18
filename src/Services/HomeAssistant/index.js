import config from 'config';
import { callService as callHassService } from 'home-assistant-js-websocket';
import Hass from './lib/HassConnector';

const opts = {
  hassUrl: config.get('services.home_assistant.hass_url'),
  access_token: config.get('services.home_assistant.hass_access_token'),
};

/*
 * This class singleton should provide functions that interact with Home Assistant
 */

class HomeAssistantService {
  constructor({ eventCallback }) {
    this.hass = new Hass(opts);
    this.connected = false;
    this.eventCallback =
      typeof eventCallback === 'function' ? eventCallback : false;
    this.init();
  }

  async connect() {
    try {
      console.log('Connecting to Home Assistant');
      await this.hass.connect();
      this.connected = true;
      console.log('Connected to Home Assistant');
    } catch (e) {
      console.log('There was an error connecting to Home Assistant', e);
      this.connected = false;
    }
  }

  init = async () => {
    try {
      await this.connect();
    } catch (e) {
      console.log(e);
    }
    // eventually do stuff now with hass like hass.subscribeEntities(handler)
    // but for now like this
    this.hass.conn.subscribeEvents(e => {
      if (typeof this.eventCallback === 'function') {
        this.eventCallback(e);
      }
    });
  };

  setEventCallback(cb) {
    this.eventCallback = cb;
  }

  callService = async ({ domain, service, serviceData }) => {
    console.log('calling service', domain, service, serviceData);
    try {
      callHassService(this.hass.conn, domain, service, serviceData);
    } catch (e) {
      console.log(e);
    }
  };
}

export default new HomeAssistantService({});
