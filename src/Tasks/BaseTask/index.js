import { PRE_EXECUTION_RESULTS } from '../const';

export default class BaseTask {
  static Constants = { PRE_EXECUTION_RESULTS };

  constructor({ data }) {
    this.taskData = data;
    this.requeueDelay = 60 * 1000;
  }

  // return true to execute, false to requeue
  preExecution = async () => {
    return PRE_EXECUTION_RESULTS.EXECUTE;
  };

  execute = () => {};
}
