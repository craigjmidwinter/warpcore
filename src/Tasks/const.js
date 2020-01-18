import TurnOffBloom from '#tasks/TurnOffBloom';

export const TASK_TURN_OFF_BLOOM = 'TurnOffBloom';
export const PRE_EXECUTION_RESULTS = {
  EXECUTE: 0,
  REQUEUE: 1,
  DISMISS: 2,
};

export const TASK_MAP = { [TASK_TURN_OFF_BLOOM]: TurnOffBloom };