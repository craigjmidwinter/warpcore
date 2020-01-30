import TurnOffBloom from '#tasks/TurnOffBloom';
import ArmHome from '#tasks/ArmHome';
import { TASK_TURN_OFF_BLOOM, TASK_ARM_HOME } from './const';

const TASK_MAP = {
  [TASK_TURN_OFF_BLOOM]: TurnOffBloom,
  [TASK_ARM_HOME]: ArmHome,
};

export default function getTask(task) {
  return TASK_MAP[task];
}
