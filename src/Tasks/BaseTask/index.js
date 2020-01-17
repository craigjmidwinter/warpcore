import { PRE_EXECUTION_RESULTS } from '../const';

export default class BaseTask {
  constructor({ data }) {
    this.taskData = data;
    this.requeueDelay = 60;
  }

  // return true to execute, false to requeue
  async preExecution() {
    return PRE_EXECUTION_RESULTS.EXECUTE;
  }

  async process() {
    const preExecResult = await this.preExecution();
    switch (preExecResult) {
      case PRE_EXECUTION_RESULTS.EXECUTE:
        this.execute();
        break;
      case PRE_EXECUTION_RESULTS.REQUEUE:
        this.requeue();
        break;
      case PRE_EXECUTION_RESULTS.DISMISS:
        break;
      default:
        throw new error('Invalid preExecution result');
        break;
        return;
    }
  }

  async requeue() {}

  async execute() {}
}
