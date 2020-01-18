import { PRE_EXECUTION_RESULTS } from '../const';

export default class BaseTask {
  constructor({ data }) {
    this.taskData = data;
    this.requeueDelay = 60 * 1000;
  }

  // return true to execute, false to requeue
  async preExecution() {
    return PRE_EXECUTION_RESULTS.EXECUTE;
  }

  async execute() {}
}
