import HomeAssistantService from '#services/HomeAssistant';
import handleHomeAssistantEvent from '#root/Dispatcher';

console.log('starting automation engine');

const HassService = HomeAssistantService;
HassService.setEventCallback(handleHomeAssistantEvent);
