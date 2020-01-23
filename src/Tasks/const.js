import TurnOffBloom from '#tasks/TurnOffBloom';
import ArmHome from '#tasks/ArmHome';

export const PRE_EXECUTION_RESULTS = {
  EXECUTE: 0,
  REQUEUE: 1,
  DISMISS: 2,
};

export const TASK_TURN_OFF_BLOOM = 'TurnOffBloom';
export const TASK_ARM_HOME = 'ArmHome';

export const TASK_MAP = {
  [TASK_TURN_OFF_BLOOM]: TurnOffBloom,
  [TASK_ARM_HOME]: ArmHome,
};
