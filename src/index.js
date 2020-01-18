import HomeAssistantService from '#services/HomeAssistant';
import { handleHomeAssistantEvent } from '#root/Dispatcher';
import consumeQueue from '#root/Worker';

console.log('starting automation engine');

const HassService = HomeAssistantService;
HassService.setEventCallback(handleHomeAssistantEvent);
consumeQueue();
