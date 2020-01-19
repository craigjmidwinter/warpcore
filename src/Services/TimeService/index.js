import { handleTimeEvent } from '#root/Dispatcher';

export default function startTimer() {
  setInterval(() => {
    console.log('tick');
    handleTimeEvent();
  }, 60000);
}
