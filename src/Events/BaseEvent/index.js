export default class BaseEvent {
  static meetsCondition() {
    console.log('BaseEvent condition always returns true');
    return true;
  }

  static dispatch() {
    console.log('Dispatched BaseEvent');
  }
}
