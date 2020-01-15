/*
 *  HomeAssistant WebSocket connector
 *  author: dkebler
 *  source: https://gist.github.com/dkebler/fe872178e0de4a5874d6a6157b9f3537
 *
 */
import to from 'await-to-js';
import ha from 'home-assistant-js-websocket';
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import ndb from 'debug';

const debug = ndb('home-assistant:ws');

const MSG_TYPE_AUTH_REQUIRED = 'auth_required';
const MSG_TYPE_AUTH_INVALID = 'auth_invalid';
const MSG_TYPE_AUTH_OK = 'auth_ok';

class HomeAssistant extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    debug('config passed to websocket constructor', this.config);
    this.socket = {}; // node websocket if access needed
    this.conn = {}; // the connection object needed for api calls
    debug('constructor\n', this.config);
  }

  async connect() {
    const [errws, ws] = await to(createSocket(this.config));
    if (errws) {
      debug('socket create error', errws);
      throw errws;
    }
    debug('websocket ready at', ws.url);

    const [err, conn] = await to(
      ha.createConnection({
        createSocket: () => {
          return ws;
        },
      })
    );
    if (err) {
      debug('error in connection', err);
      throw err;
    }
    this.conn = conn;
    this.api = ha; // to be replaced with merged api calls
    debug('Connected to Home Assistant');
    return 'success';

    function createSocket(opts) {
      return new Promise((resolve, reject) => {
        if (!opts.hassUrl) {
          throw ha.ERR_HASS_HOST_REQUIRED;
        }

        const auth = JSON.stringify({
          type: 'auth',
          access_token: opts.access_token,
        });

        const url = `${opts.hassUrl}/${opts.wssPath || 'api/websocket'}`;

        debug('[Auth Phase] Initializing', url);

        setTimeout(
          () => reject(new Error('Unable to Authorize in 5 seconds')),
          5000
        );

        const ws = new WebSocket(url, opts);

        ws.on('error', error.bind(ws));
        function error(err) {
          this.removeAllListeners('message', authorize);
          this.removeAllListeners('error', error);
          reject(err);
        }

        ws.on('message', authorize.bind(ws));
        function authorize(event) {
          const message = JSON.parse(event);
          debug('[Auth Phase] Message Received', message);

          switch (message.type) {
            case MSG_TYPE_AUTH_REQUIRED:
              try {
                debug('[Auth Phase] sending authorization\n', auth);
                this.send(auth);
              } catch (err) {
                debug('sending auth error');
                this.close();
                reject(new Error('unable to send authorization'));
              }
              break;
            case MSG_TYPE_AUTH_OK:
              this.removeAllListeners('message', authorize);
              this.removeAllListeners('error', error);
              resolve(this);
              break;
            case MSG_TYPE_AUTH_INVALID:
              this.close();
              reject(new Error(MSG_TYPE_AUTH_INVALID));
              break;
            default:
              debug('[Auth Phase] Unhandled message', message);
              this.close();
              reject(new Error(`unhandled authorization error, ${message}`));
          }
        } // end authorize
      });
    } // end createSocket
  }
} // end class

export default HomeAssistant;
